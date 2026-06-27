import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  BackupChangeFolderResponse,
  BackupConfig,
  BackupExportResponse,
  BackupOpenFolderResponse,
  BackupRestoreResponse,
} from '../../../shared/ipc'
import {
  changeBackupFolder,
  exportBackup,
  openBackupFolder,
  readBackupConfig,
  restoreBackup,
  saveBackupConfig,
} from './service'
import { restartAutoBackupScheduler } from './scheduler'
import { logger } from '../../utils/logger'

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Input non valido'
    throw new Error(msg)
  }
  return result.data
}

const updateConfigSchema = z.object({
  autoEnabled: z.boolean(),
  trigger: z.enum(['onClose', 'interval', 'both']),
  intervalHours: z.number().int().min(1),
  retentionCount: z.number().int().min(1),
})

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

  ipcMain.handle(IPC_CHANNELS.BACKUP_GET_CONFIG, (): BackupConfig => {
    logger.debug('IPC', IPC_CHANNELS.BACKUP_GET_CONFIG)
    return readBackupConfig()
  })

  ipcMain.handle(IPC_CHANNELS.BACKUP_UPDATE_CONFIG, (_event, input: unknown): BackupConfig => {
    logger.debug('IPC', IPC_CHANNELS.BACKUP_UPDATE_CONFIG)
    const parsed = parseOrThrow(updateConfigSchema, input)
    const config = saveBackupConfig(parsed)
    restartAutoBackupScheduler()
    return config
  })

  ipcMain.handle(
    IPC_CHANNELS.BACKUP_CHANGE_FOLDER,
    async (event: IpcMainInvokeEvent): Promise<BackupChangeFolderResponse> => {
      logger.debug('IPC', IPC_CHANNELS.BACKUP_CHANGE_FOLDER)
      const win = BrowserWindow.fromWebContents(event.sender)
      return changeBackupFolder(win)
    }
  )

  ipcMain.handle(IPC_CHANNELS.BACKUP_OPEN_FOLDER, (): Promise<BackupOpenFolderResponse> => {
    logger.debug('IPC', IPC_CHANNELS.BACKUP_OPEN_FOLDER)
    return openBackupFolder()
  })
}
