import { dialog, shell, BrowserWindow } from 'electron'
import { join, extname, basename } from 'path'
import { mkdirSync, copyFileSync, statSync, unlinkSync, rmSync } from 'fs'
import type {
  DocumentKind,
  DocumentItem,
  ListDocumentsInput,
  ListDocumentsResponse,
  UploadDocumentInput,
  UploadDocumentResponse,
  DeleteDocumentInput,
  DeleteDocumentResponse,
  OpenDocumentInput,
  OpenDocumentResponse,
} from '../../../shared/ipc'
import {
  findPracticeRefForDocs,
  insertDocument,
  findDocumentsByPractice,
  findDocumentByKind,
  findDocumentById,
  deleteDocumentRow,
  insertHistoryEvent,
} from './repository'
import type { DocumentRow } from '../../database/schema'
import { getDb } from '../../database/connection'
import { ValidationError, NotFoundError } from '../../errors/AppError'
import { logger } from '../../utils/logger'
import { getDataPath } from '../../config/dataPath'

// Radice dei documenti. Coerente con dove risiede il DB (connection.ts): entrambi
// sotto il percorso dati risolto dal puntatore di bootstrap (config/dataPath.ts).
// `filePath` in DB è relativo a questa radice → portabile per backup/ripristino.
// Esportata come unica fonte del path documenti (riusata dal modulo backup, S11.3).
export function getDocumentsRoot(): string {
  return join(getDataPath(), 'documenti')
}

function resolveDocumentPath(relPath: string): string {
  return join(getDocumentsRoot(), relPath)
}

// Rimuove l'intera cartella documenti di una pratica (cancellazione definitiva,
// S10.3). Best-effort: chiamata DOPO il commit della transazione DB, gli errori
// sono loggati ma non propagati (un file orfano è preferibile a una pratica
// non cancellabile). Esposta qui perché la logica del path documenti vive in
// questo modulo (unica fonte; quando E11.2 introdurrà il percorso dati
// configurabile basterà cambiare getDocumentsRoot).
export function removePracticeDocumentsDir(codiceIstanza: string): void {
  try {
    rmSync(resolveDocumentPath(codiceIstanza), { recursive: true, force: true })
  } catch (err) {
    logger.warn('DOC_RMDIR_FAILED', `${codiceIstanza}: ${String(err)}`)
  }
}

// Etichette per i titoli di storico (concordanza di genere it).
const KIND_LABELS: Record<DocumentKind, { noun: string; uploaded: string; replaced: string; removed: string }> = {
  decreto: { noun: 'Decreto', uploaded: 'caricato', replaced: 'sostituito', removed: 'eliminato' },
  fattura: { noun: 'Fattura', uploaded: 'caricata', replaced: 'sostituita', removed: 'eliminata' },
}

function parseSize(metadata: string): number | null {
  try {
    const parsed: unknown = JSON.parse(metadata)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const size = (parsed as Record<string, unknown>).size
      if (typeof size === 'number' && Number.isFinite(size)) return size
    }
  } catch {
    // metadata non valido: dimensione sconosciuta
  }
  return null
}

function toItem(row: DocumentRow): DocumentItem {
  return {
    id:           row.id,
    practiceId:   row.practiceId,
    kind:         row.kind as DocumentKind,
    originalName: row.originalName,
    size:         parseSize(row.metadata),
    createdAt:    row.createdAt,
  }
}

export function listDocuments(input: ListDocumentsInput): ListDocumentsResponse {
  return findDocumentsByPractice(input.practiceId).map(toItem)
}

// Upload via file dialog nativo (nessun byte sul bridge). Semantica di
// sostituzione: ricaricare un kind già presente rimpiazza il documento esistente.
// Ordine: copia il nuovo file → transazione DB (delete vecchia riga + insert +
// HistoryEvent) → unlink best-effort del vecchio file FISICO dopo il commit
// (un errore DB non deve perdere il file precedente).
export async function uploadDocument(
  input: UploadDocumentInput,
  win: BrowserWindow | null
): Promise<UploadDocumentResponse> {
  const practice = findPracticeRefForDocs(input.practiceId)
  if (!practice) {
    throw new NotFoundError('Pratica non trovata')
  }
  if (practice.isTrashed) {
    throw new ValidationError('Impossibile caricare documenti su una pratica nel cestino')
  }

  const labels = KIND_LABELS[input.kind]
  const dialogOptions = {
    title: `Seleziona il file (${labels.noun.toLowerCase()})`,
    properties: ['openFile' as const],
    filters: [
      { name: 'Documenti', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'doc', 'docx'] },
      { name: 'Tutti i file', extensions: ['*'] },
    ],
  }
  const picked = win
    ? await dialog.showOpenDialog(win, dialogOptions)
    : await dialog.showOpenDialog(dialogOptions)

  if (picked.canceled || picked.filePaths.length === 0) {
    return { canceled: true }
  }

  const sourcePath = picked.filePaths[0]
  const originalName = basename(sourcePath)
  const ext = extname(sourcePath)

  // Copia nel filesystem documenti. Il nome è derivato dal kind (enum) + timestamp:
  // nessun input utente grezzo nel path. La cartella prende il codice istanza
  // (generato, sicuro).
  const relPath = join(practice.codiceIstanza, `${input.kind}_${Date.now()}${ext}`)
  const destPath = resolveDocumentPath(relPath)
  mkdirSync(resolveDocumentPath(practice.codiceIstanza), { recursive: true })
  copyFileSync(sourcePath, destPath)

  let size: number | null = null
  try {
    size = statSync(destPath).size
  } catch {
    size = null
  }

  const now = new Date().toISOString()
  const existing = findDocumentByKind(input.practiceId, input.kind)

  let newId = 0
  getDb().transaction(() => {
    if (existing) deleteDocumentRow(existing.id)
    newId = insertDocument({
      practiceId:         input.practiceId,
      transitionRecordId: null,
      kind:               input.kind,
      filePath:           relPath,
      originalName,
      metadata:           JSON.stringify({ size, ext }),
      createdAt:          now,
    })
    insertHistoryEvent({
      practiceId:  input.practiceId,
      timestamp:   now,
      type:        existing ? 'document_replaced' : 'document_added',
      title:       `${labels.noun} ${existing ? labels.replaced : labels.uploaded}`,
      fromPhaseId: null,
      toPhaseId:   null,
      note:        originalName,
      payload:     JSON.stringify({ documentId: newId, kind: input.kind }),
    })
  })

  // Unlink del vecchio file fisico DOPO il commit (best-effort).
  if (existing) {
    try {
      unlinkSync(resolveDocumentPath(existing.filePath))
    } catch (err) {
      logger.warn('DOC_UNLINK_OLD_FAILED', `${existing.filePath}: ${String(err)}`)
    }
  }

  return {
    canceled: false,
    document: {
      id:           newId,
      practiceId:   input.practiceId,
      kind:         input.kind,
      originalName,
      size,
      createdAt:    now,
    },
  }
}

export function deleteDocument(input: DeleteDocumentInput): DeleteDocumentResponse {
  const doc = findDocumentById(input.id)
  if (!doc) {
    throw new NotFoundError('Documento non trovato')
  }
  const practice = findPracticeRefForDocs(doc.practiceId)
  if (practice?.isTrashed) {
    throw new ValidationError('Impossibile eliminare documenti di una pratica nel cestino')
  }

  const kind = (doc.kind as DocumentKind)
  const labels = KIND_LABELS[kind] ?? KIND_LABELS.decreto
  const now = new Date().toISOString()

  getDb().transaction(() => {
    deleteDocumentRow(doc.id)
    insertHistoryEvent({
      practiceId:  doc.practiceId,
      timestamp:   now,
      type:        'document_removed',
      title:       `${labels.noun} ${labels.removed}`,
      fromPhaseId: null,
      toPhaseId:   null,
      note:        doc.originalName,
      payload:     JSON.stringify({ documentId: doc.id, kind: doc.kind }),
    })
  })

  try {
    unlinkSync(resolveDocumentPath(doc.filePath))
  } catch (err) {
    logger.warn('DOC_UNLINK_FAILED', `${doc.filePath}: ${String(err)}`)
  }

  return { id: doc.id }
}

// Apre il file con l'applicazione di sistema. shell.openPath ritorna '' su
// successo, una stringa d'errore altrimenti.
export async function openDocument(input: OpenDocumentInput): Promise<OpenDocumentResponse> {
  const doc = findDocumentById(input.id)
  if (!doc) {
    throw new NotFoundError('Documento non trovato')
  }
  const err = await shell.openPath(resolveDocumentPath(doc.filePath))
  if (err) {
    logger.warn('DOC_OPEN_FAILED', `${doc.filePath}: ${err}`)
  }
  return { opened: err === '' }
}
