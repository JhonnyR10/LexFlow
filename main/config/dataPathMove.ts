import { app } from 'electron'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { logger } from '../utils/logger'
import { readStoredDataPath, writeStoredDataPath } from './dataPath'

// Spostamento del percorso dati a freddo (S11.2b). Analogo al ripristino
// (restoreBootstrap): un marker in userData innesca, al boot successivo e PRIMA
// dell'apertura del DB, la relocazione dei file dati e l'aggiornamento del
// puntatore config.json. Deve girare PRIMA di validateStartupConfig, che
// risolve/cacha il percorso.

export const PENDING_MOVE_MARKER = 'pending-move.json'

const markerSchema = z.object({
  targetPath: z.string().min(1),
  createdAt: z.string().min(1),
})

function markerPath(): string {
  return join(app.getPath('userData'), PENDING_MOVE_MARKER)
}

// Programma lo spostamento (chiamato live, prima del relaunch).
export function writePendingMove(targetPath: string): void {
  writeFileSync(
    markerPath(),
    JSON.stringify({ targetPath, createdAt: new Date().toISOString() }, null, 2),
    'utf-8'
  )
}

function copyIfExists(src: string, dest: string): void {
  if (existsSync(src)) cpSync(src, dest, { recursive: true })
}
function removeIfExists(p: string): void {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true })
}

// Nomi dei soli file DATI da spostare. I file di bootstrap (config.json,
// security.json) restano ancorati a userData e NON vengono toccati.
const DB_FILE = 'lexflow.db'
const DOCS_DIR = 'documenti'

// Eseguito a BOOT, prima del DB e di validateStartupConfig. Robusto: ogni errore
// è loggato e il marker rimosso (niente boot-loop); se fallisce prima del repoint
// il vecchio percorso resta autorevole.
export function applyPendingMove(): void {
  const marker = markerPath()
  if (!existsSync(marker)) return

  try {
    const parsed = markerSchema.safeParse(JSON.parse(readFileSync(marker, 'utf-8')))
    if (!parsed.success) {
      logger.warn('MOVE_MARKER_INVALID', 'pending-move.json non valido, ignoro')
      removeIfExists(marker)
      return
    }

    const target = parsed.data.targetPath
    const old = readStoredDataPath()
    if (old === target) {
      removeIfExists(marker)
      return
    }

    const oldDb = join(old, DB_FILE)
    const targetDb = join(target, DB_FILE)

    // 1. Copia dei file dati vecchio → nuovo.
    mkdirSync(target, { recursive: true })
    copyIfExists(oldDb, targetDb)
    copyIfExists(`${oldDb}-wal`, `${targetDb}-wal`)
    copyIfExists(`${oldDb}-shm`, `${targetDb}-shm`)
    copyIfExists(join(old, DOCS_DIR), join(target, DOCS_DIR))

    // 2. Verifica: il DB dev'essere presente nel nuovo percorso.
    if (existsSync(oldDb) && !existsSync(targetDb)) {
      logger.error('MOVE_COPY_FAILED', `lexflow.db non copiato in ${target}`)
      removeIfExists(marker)
      return // vecchio percorso ancora autorevole (puntatore non toccato)
    }

    // 3. Repoint del puntatore al nuovo percorso.
    writeStoredDataPath(target)

    // 4. Rimozione dei soli file dati dal vecchio percorso (best-effort). Mai
    //    config.json/security.json (ancorati a userData).
    removeIfExists(oldDb)
    removeIfExists(`${oldDb}-wal`)
    removeIfExists(`${oldDb}-shm`)
    removeIfExists(join(old, DOCS_DIR))

    removeIfExists(marker)
    logger.info('MOVE_APPLIED', `${old} → ${target}`)
  } catch (err) {
    logger.error('MOVE_FAILED', err instanceof Error ? err.message : String(err))
    removeIfExists(marker)
  }
}
