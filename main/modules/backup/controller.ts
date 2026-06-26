import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { BackupExportResponse, BackupRestoreResponse } from '../../../shared/ipc'
import { exportBackup, restoreBackup } from './service'
import { logger } from '../../utils/logger'

export function registerBackupHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.BACKUP_EXPORT,
    (event: IpcMainInvokeEvent): Promise<BackupExportResponse> => {
      logger.debug('IPC', IPC_CHANNELS.BACKUP_EXPORT)
      const win = BrowserWindow.fromWebContents(event.sender)
      return exportBackup(win)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.BACKUP_RESTORE,
    (event: IpcMainInvokeEvent): Promise<BackupRestoreResponse> => {
      logger.debug('IPC', IPC_CHANNELS.BACKUP_RESTORE)
      const win = BrowserWindow.fromWebContents(event.sender)
      return restoreBackup(win)
    }
  )
}
