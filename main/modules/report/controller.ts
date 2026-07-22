import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { ReportSummaryResponse } from '../../../shared/ipc'
import { getReportSummary } from './service'
import { logger } from '../../utils/logger'

export function registerReportHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.REPORT_SUMMARY, (): ReportSummaryResponse => {
    logger.debug('IPC', IPC_CHANNELS.REPORT_SUMMARY)
    return getReportSummary()
  })
}
