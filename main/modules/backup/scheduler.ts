import { logger } from '../../utils/logger'
import { getBackupConfig } from './repository'
import { runAutoBackup } from './service'

// Scheduler del backup automatico a intervallo (S11.7). Il trigger `onClose` è
// gestito in app.ts (before-quit); qui vive solo il timer dell'intervallo.

let timer: ReturnType<typeof setInterval> | null = null

function stop(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// (Ri)avvia il timer leggendo la config corrente. Attivo solo se il backup è
// abilitato e il trigger include l'intervallo. Da richiamare al boot e a ogni
// modifica della config.
export function restartAutoBackupScheduler(): void {
  stop()
  const cfg = getBackupConfig()
  if (!cfg.autoEnabled || (cfg.trigger !== 'interval' && cfg.trigger !== 'both')) return

  const ms = cfg.intervalHours * 60 * 60 * 1000
  timer = setInterval(() => runAutoBackup('interval'), ms)
  logger.info('AUTO_BACKUP_SCHEDULER', `intervallo ${cfg.intervalHours}h`)
}

export function startAutoBackupScheduler(): void {
  restartAutoBackupScheduler()
}

// Backup automatico alla chiusura (chiamato da before-quit in app.ts).
export function runOnCloseBackup(): void {
  runAutoBackup('onClose')
}
