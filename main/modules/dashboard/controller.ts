import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { DashboardPhaseCountsResponse } from '../../../shared/ipc'
import { getDashboardPhaseCounts } from './service'
import { logger } from '../../utils/logger'

export function registerDashboardHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_PHASE_COUNTS,
    (): DashboardPhaseCountsResponse => {
      logger.debug('IPC', IPC_CHANNELS.DASHBOARD_PHASE_COUNTS)
      return getDashboardPhaseCounts()
    }
  )
}
