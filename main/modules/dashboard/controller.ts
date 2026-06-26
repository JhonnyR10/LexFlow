import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  DashboardAlertsResponse,
  DashboardPhaseCountsResponse,
} from '../../../shared/ipc'
import { getDashboardAlerts, getDashboardPhaseCounts } from './service'
import { logger } from '../../utils/logger'

export function registerDashboardHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_PHASE_COUNTS,
    (): DashboardPhaseCountsResponse => {
      logger.debug('IPC', IPC_CHANNELS.DASHBOARD_PHASE_COUNTS)
      return getDashboardPhaseCounts()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_ALERTS,
    (): DashboardAlertsResponse => {
      logger.debug('IPC', IPC_CHANNELS.DASHBOARD_ALERTS)
      return getDashboardAlerts()
    }
  )
}
