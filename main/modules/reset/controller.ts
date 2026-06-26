import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { ResetArchiveResponse } from '../../../shared/ipc'
import { resetArchive } from './service'
import { logger } from '../../utils/logger'

export function registerResetHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.RESET_ARCHIVE, (): ResetArchiveResponse => {
    logger.debug('IPC', IPC_CHANNELS.RESET_ARCHIVE)
    return resetArchive()
  })
}
