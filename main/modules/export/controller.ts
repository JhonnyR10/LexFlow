import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { ExportCsvResponse } from '../../../shared/ipc'
import { exportCsv } from './service'
import { logger } from '../../utils/logger'

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Input non valido'
    throw new Error(msg)
  }
  return result.data
}

const exportCsvSchema = z.object({
  content: z.string(),
  suggestedName: z.string().min(1),
})

export function registerExportHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.EXPORT_CSV,
    (event: IpcMainInvokeEvent, input: unknown): Promise<ExportCsvResponse> => {
      logger.debug('IPC', IPC_CHANNELS.EXPORT_CSV)
      const parsed = parseOrThrow(exportCsvSchema, input)
      const win = BrowserWindow.fromWebContents(event.sender)
      return exportCsv(win, parsed)
    }
  )
}
