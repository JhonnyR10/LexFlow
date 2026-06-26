import { existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import type { ResetArchiveResponse } from '../../../shared/ipc'
import { logger } from '../../utils/logger'
import { backupTimestamp } from '../backup/naming'
import { getBackupPath } from '../backup/repository'
import { writeBackupZip } from '../backup/service'
import { getDocumentsRoot } from '../documents/service'
import { resetArchive as resetArchiveRows } from './repository'

// Reset archivio (S11.4): backup preventivo OBBLIGATORIO, poi svuota pratiche +
// anagrafiche e la cartella documenti. Se il backup fallisce, il reset NON viene
// eseguito (l'errore si propaga). Mantiene workflow e impostazioni app.
export function resetArchive(): ResetArchiveResponse {
  // 1. Backup preventivo automatico (rete di sicurezza obbligatoria).
  const backupPath = join(getBackupPath(), `pre-reset-${backupTimestamp()}.zip`)
  writeBackupZip(backupPath)
  logger.info('RESET_PRE_BACKUP', backupPath)

  // 2. Svuota le tabelle del dominio (transazione, ordine FK-safe).
  const counts = resetArchiveRows()

  // 3. Svuota la cartella documenti (dopo i delete DB, best-effort come E7/S10.3).
  const docsRoot = getDocumentsRoot()
  try {
    rmSync(docsRoot, { recursive: true, force: true })
  } catch (err) {
    logger.warn('RESET_DOCS_RMDIR_FAILED', String(err))
  }
  if (!existsSync(docsRoot)) {
    mkdirSync(docsRoot, { recursive: true })
  }

  logger.info(
    'RESET_ARCHIVE',
    `pratiche=${counts.practicesDeleted} professionisti=${counts.professionistiDeleted} collaboratori=${counts.collaboratoriDeleted}`
  )

  return { backupPath, ...counts }
}
