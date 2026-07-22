import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  DashboardAgingResponse,
  DashboardAlertsResponse,
  DashboardMissingDocumentsResponse,
  DashboardPhaseCountsResponse,
  DashboardScadenzeAlertsResponse,
} from '../../../shared/ipc'
import {
  getDashboardAging,
  getDashboardAlerts,
  getDashboardMissingDocuments,
  getDashboardPhaseCounts,
  getDashboardScadenzeAlerts,
} from './service'
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

  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_AGING,
    (): DashboardAgingResponse => {
      logger.debug('IPC', IPC_CHANNELS.DASHBOARD_AGING)
      return getDashboardAging()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_MISSING_DOCUMENTS,
    (): DashboardMissingDocumentsResponse => {
      logger.debug('IPC', IPC_CHANNELS.DASHBOARD_MISSING_DOCUMENTS)
      return getDashboardMissingDocuments()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DASHBOARD_SCADENZE_ALERTS,
    (): DashboardScadenzeAlertsResponse => {
      logger.debug('IPC', IPC_CHANNELS.DASHBOARD_SCADENZE_ALERTS)
      return getDashboardScadenzeAlerts()
    }
  )
}
