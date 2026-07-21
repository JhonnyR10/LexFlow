import { app, dialog, shell, type BrowserWindow } from 'electron'
import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import AdmZip from 'adm-zip'
import type {
  BackupChangeFolderResponse,
  BackupConfig,
  BackupExportResponse,
  BackupOpenFolderResponse,
  BackupRestoreResponse,
  UpdateBackupConfigInput,
} from '../../../shared/ipc'
import { ValidationError } from '../../errors/AppError'
import { checkpointDb, getDbFilePath } from '../../database/connection'
import { getDocumentsRoot } from '../documents/service'
import { logger } from '../../utils/logger'
import { backupTimestamp } from './naming'
import { PENDING_RESTORE_MARKER, RESTORE_STAGING_DIR } from './restoreBootstrap'
import {
  dumpAllTables,
  getBackupConfig,
  getBackupPath,
  tableNames,
  updateBackupConfig,
  updateBackupLastBackupAt,
  updateBackupPath,
} from './repository'

const BACKUP_FORMAT = 'lexflow-backup'
const BACKUP_FORMAT_VERSION = 1

// Prefisso dedicato agli auto-backup (S11.7): la rotazione opera SOLO su questi
// file, mai sui backup manuali (`lexflow-backup-`) né sui pre-reset (`pre-reset-`).
const AUTO_BACKUP_PREFIX = 'lexflow-autobackup-'
const AUTO_BACKUP_RE = /^lexflow-autobackup-.*\.zip$/

interface BackupManifest {
  format: string
  formatVersion: number
  appVersion: string
  createdAt: string
  tables: string[]
}

async function showSave(win: BrowserWindow | null, defaultPath: string): Promise<Electron.SaveDialogReturnValue> {
  const options: Electron.SaveDialogOptions = {
    title: 'Esporta backup',
    defaultPath,
    filters: [{ name: 'Archivio ZIP', extensions: ['zip'] }],
  }
  return win ? dialog.showSaveDialog(win, options) : dialog.showSaveDialog(options)
}

async function showOpen(win: BrowserWindow | null): Promise<Electron.OpenDialogReturnValue> {
  const options: Electron.OpenDialogOptions = {
    title: 'Ripristina da backup',
    properties: ['openFile'],
    filters: [{ name: 'Archivio ZIP', extensions: ['zip'] }],
  }
  return win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options)
}

// Costruisce e scrive l'archivio .zip in `destPath` (DB consistente + documenti +
// dump JSON di sicurezza + manifest). Senza dialog: riusato dall'export manuale
// (S11.3) e dal backup preventivo pre-reset (S11.4). Aggiorna `lastBackupAt`.
export function writeBackupZip(destPath: string): void {
  const now = new Date()

  // Copia DB consistente: svuota il WAL nel file principale, poi aggiungilo così com'è.
  checkpointDb()

  const zip = new AdmZip()
  zip.addLocalFile(getDbFilePath(), '', 'lexflow.db')

  const docsRoot = getDocumentsRoot()
  if (existsSync(docsRoot)) {
    zip.addLocalFolder(docsRoot, 'documenti')
  }

  zip.addFile('data.json', Buffer.from(JSON.stringify(dumpAllTables())))

  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: app.getVersion(),
    createdAt: now.toISOString(),
    tables: tableNames(),
  }
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)))

  zip.writeZip(destPath)
  updateBackupLastBackupAt(now.toISOString())
}

// Export manuale: chiede il percorso e delega a writeBackupZip (S11.3).
export async function exportBackup(win: BrowserWindow | null): Promise<BackupExportResponse> {
  const defaultPath = join(app.getPath('documents'), `lexflow-backup-${backupTimestamp()}.zip`)
  const picked = await showSave(win, defaultPath)
  if (picked.canceled || !picked.filePath) {
    return { canceled: true }
  }

  writeBackupZip(picked.filePath)
  logger.info('BACKUP_EXPORTED', picked.filePath)

  return { canceled: false, path: picked.filePath }
}

// Ripristino: valida l'archivio, lo estrae in staging, scrive il marker e riavvia
// l'app. Lo swap effettivo avviene a freddo al boot (restoreBootstrap), prima di
// aprire il DB (S11.3).
export async function restoreBackup(win: BrowserWindow | null): Promise<BackupRestoreResponse> {
  const picked = await showOpen(win)
  if (picked.canceled || picked.filePaths.length === 0) {
    return { canceled: true }
  }

  const archivePath = picked.filePaths[0]
  const zip = new AdmZip(archivePath)

  // Messaggio utente unico e semplice (C-004); il motivo tecnico resta nei log.
  const invalidArchive = (reason: string): ValidationError => {
    logger.warn('BACKUP_RESTORE_INVALID', reason)
    return new ValidationError('Archivio di backup non valido.')
  }

  const manifestEntry = zip.getEntry('manifest.json')
  if (!manifestEntry) {
    throw invalidArchive('manifest mancante')
  }
  let manifest: Partial<BackupManifest>
  try {
    manifest = JSON.parse(zip.readAsText(manifestEntry)) as Partial<BackupManifest>
  } catch {
    throw invalidArchive('manifest illeggibile')
  }
  if (manifest.format !== BACKUP_FORMAT) {
    throw invalidArchive('formato non riconosciuto')
  }
  if (!zip.getEntry('lexflow.db')) {
    throw invalidArchive('database mancante')
  }

  // Estrazione in staging (in userData, ripulito prima).
  const userData = app.getPath('userData')
  const stagingPath = join(userData, RESTORE_STAGING_DIR)
  if (existsSync(stagingPath)) {
    rmSync(stagingPath, { recursive: true, force: true })
  }
  mkdirSync(stagingPath, { recursive: true })
  zip.extractAllTo(stagingPath, true)

  if (!existsSync(join(stagingPath, 'lexflow.db'))) {
    rmSync(stagingPath, { recursive: true, force: true })
    throw invalidArchive('estrazione del database fallita')
  }

  // Marker letto a boot da applyPendingRestore().
  writeFileSync(
    join(userData, PENDING_RESTORE_MARKER),
    JSON.stringify({ stagingPath, createdAt: new Date().toISOString() }, null, 2),
    'utf-8'
  )
  logger.info('BACKUP_RESTORE_STAGED', archivePath)

  // Riavvio: lo swap a freddo avviene al prossimo boot, prima dell'apertura del DB.
  app.relaunch()
  app.exit(0)

  return { canceled: false, willRestart: true }
}

// --- Backup automatico (S11.7) ---

// Elimina gli auto-backup oltre le ultime `keep` copie. Tocca SOLO i file con il
// prefisso dedicato (mai i backup manuali o i pre-reset). Best-effort.
function rotateAutoBackups(dir: string, keep: number): void {
  if (!existsSync(dir)) return
  const files = readdirSync(dir)
    .filter((f) => AUTO_BACKUP_RE.test(f))
    .sort() // il timestamp nel nome ordina cronologicamente (ascendente)
  const excess = files.length - keep
  for (let i = 0; i < excess; i++) {
    try {
      unlinkSync(join(dir, files[i]))
    } catch (err) {
      logger.warn('AUTO_BACKUP_ROTATE_FAILED', `${files[i]}: ${String(err)}`)
    }
  }
}

// Esegue un auto-backup se la config lo prevede per il `reason` indicato. Non deve
// mai far crashare l'app: ogni errore è loggato e non propagato.
export function runAutoBackup(reason: 'onClose' | 'interval'): void {
  try {
    const cfg = getBackupConfig()
    if (!cfg.autoEnabled) return
    const triggered = cfg.trigger === 'both' || cfg.trigger === reason
    if (!triggered) return

    const dest = join(cfg.backupPath, `${AUTO_BACKUP_PREFIX}${backupTimestamp()}.zip`)
    writeBackupZip(dest)
    rotateAutoBackups(cfg.backupPath, cfg.retentionCount)
    logger.info('AUTO_BACKUP_DONE', `${reason}: ${dest}`)
  } catch (err) {
    logger.error('AUTO_BACKUP_FAILED', err instanceof Error ? err.message : String(err))
  }
}

// --- Config (S11.7) ---

export function readBackupConfig(): BackupConfig {
  return getBackupConfig()
}

export function saveBackupConfig(input: UpdateBackupConfigInput): BackupConfig {
  updateBackupConfig(input)
  return getBackupConfig()
}

export async function changeBackupFolder(win: BrowserWindow | null): Promise<BackupChangeFolderResponse> {
  const options: Electron.OpenDialogOptions = {
    title: 'Scegli la cartella dei backup',
    properties: ['openDirectory', 'createDirectory'],
  }
  const picked = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
  if (picked.canceled || picked.filePaths.length === 0) {
    return { canceled: true }
  }
  updateBackupPath(picked.filePaths[0])
  return { canceled: false, config: getBackupConfig() }
}

export async function openBackupFolder(): Promise<BackupOpenFolderResponse> {
  const dir = getBackupPath()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const errMsg = await shell.openPath(dir)
  if (errMsg) {
    logger.warn('BACKUP_OPEN_FOLDER_FAILED', `${dir}: ${errMsg}`)
    return { success: false }
  }
  return { success: true }
}
