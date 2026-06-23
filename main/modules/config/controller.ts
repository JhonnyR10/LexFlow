import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { ConfigListPhasesResponse } from '../../../shared/ipc'
import { listActivePhases } from './service'
import { logger } from '../../utils/logger'

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG_LIST_PHASES, (): ConfigListPhasesResponse => {
    logger.debug('IPC', IPC_CHANNELS.CONFIG_LIST_PHASES)
    return listActivePhases()
  })
}
