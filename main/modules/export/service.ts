import { app, dialog, type BrowserWindow } from 'electron'
import { writeFileSync } from 'fs'
import { join } from 'path'
import type { ExportCsvInput, ExportCsvResponse } from '../../../shared/ipc'
import { logger } from '../../utils/logger'

// BOM UTF-8: fa riconoscere la codifica a Excel (accenti corretti).
const BOM = '﻿'

// Salva un CSV già pronto (costruito nel renderer) via dialog nativo. Nessun dato
// di dominio viene ricalcolato qui: il main si occupa solo di dialog + scrittura.
export async function exportCsv(
  win: BrowserWindow | null,
  input: ExportCsvInput
): Promise<ExportCsvResponse> {
  const defaultPath = join(app.getPath('documents'), input.suggestedName)
  const options: Electron.SaveDialogOptions = {
    title: 'Esporta CSV',
    defaultPath,
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  }
  const picked = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
  if (picked.canceled || !picked.filePath) {
    return { canceled: true }
  }

  writeFileSync(picked.filePath, BOM + input.content, 'utf-8')
  logger.info('EXPORT_CSV', picked.filePath)
  return { canceled: false, path: picked.filePath }
}
