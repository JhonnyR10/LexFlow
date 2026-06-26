import { app } from 'electron'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { getDataPath } from '../../config/dataPath'
import { logger } from '../../utils/logger'
import { backupTimestamp } from './naming'

// Nomi fissi (in userData) del flusso di ripristino a freddo (S11.3).
export const RESTORE_STAGING_DIR = 'restore-staging'
export const PENDING_RESTORE_MARKER = 'pending-restore.json'

const markerSchema = z.object({
  stagingPath: z.string().min(1),
  createdAt: z.string().min(1),
})

function markerPath(): string {
  return join(app.getPath('userData'), PENDING_RESTORE_MARKER)
}

// Copia un file se esiste (best-effort), incluso lo skip silenzioso se assente.
function copyIfExists(src: string, dest: string): void {
  if (existsSync(src)) cpSync(src, dest, { recursive: true })
}

function removeIfExists(p: string): void {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true })
}

// Eseguito a BOOT, PRIMA di aprire il DB (solo filesystem). Se è in sospeso un
// ripristino (marker presente), fa una copia di sicurezza dei dati correnti e poi
// sostituisce DB + documenti con quelli estratti dall'archivio. Robusto: ogni
// errore è loggato e il marker viene rimosso per evitare boot-loop; la copia di
// sicurezza resta la rete di recupero.
export function applyPendingRestore(): void {
  const marker = markerPath()
  if (!existsSync(marker)) return

  try {
    const parsed = markerSchema.safeParse(JSON.parse(readFileSync(marker, 'utf-8')))
    if (!parsed.success) {
      logger.warn('RESTORE_MARKER_INVALID', 'pending-restore.json non valido, ignoro')
      removeIfExists(marker)
      return
    }

    const { stagingPath } = parsed.data
    const stagingDb = join(stagingPath, 'lexflow.db')
    const stagingDocs = join(stagingPath, 'documenti')
    if (!existsSync(stagingDb)) {
      logger.error('RESTORE_STAGING_MISSING', `lexflow.db assente in ${stagingPath}`)
      removeIfExists(stagingPath)
      removeIfExists(marker)
      return
    }

    const dataPath = getDataPath()
    const liveDb = join(dataPath, 'lexflow.db')
    const liveDocs = join(dataPath, 'documenti')

    // 1. Copia di sicurezza dei dati correnti.
    const safetyDir = join(app.getPath('userData'), `pre-restore-${backupTimestamp()}`)
    mkdirSync(safetyDir, { recursive: true })
    copyIfExists(liveDb, join(safetyDir, 'lexflow.db'))
    copyIfExists(`${liveDb}-wal`, join(safetyDir, 'lexflow.db-wal'))
    copyIfExists(`${liveDb}-shm`, join(safetyDir, 'lexflow.db-shm'))
    copyIfExists(liveDocs, join(safetyDir, 'documenti'))
    logger.info('RESTORE_SAFETY_BACKUP', safetyDir)

    // 2. Swap: rimuovi DB corrente (+ WAL/SHM) e documenti, poi metti gli estratti.
    removeIfExists(liveDb)
    removeIfExists(`${liveDb}-wal`)
    removeIfExists(`${liveDb}-shm`)
    removeIfExists(liveDocs)

    cpSync(stagingDb, liveDb)
    if (existsSync(stagingDocs)) {
      cpSync(stagingDocs, liveDocs, { recursive: true })
    } else {
      mkdirSync(liveDocs, { recursive: true })
    }

    // 3. Pulizia.
    removeIfExists(stagingPath)
    removeIfExists(marker)
    logger.info('RESTORE_APPLIED', dataPath)
  } catch (err) {
    logger.error('RESTORE_FAILED', err instanceof Error ? err.message : String(err))
    // Evita boot-loop: rimuovi il marker. I dati correnti sono nel safety backup.
    removeIfExists(marker)
  }
}
