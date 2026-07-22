import { app, dialog, BrowserWindow } from 'electron'
import { writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import type { ExportPracticePdfInput, ExportPracticePdfResponse } from '../../../shared/ipc'
import { getPracticeDetail } from './service'
import { listDocuments } from '../documents/service'
import { findFieldsByFilter } from '../config/repository'
import { buildPracticeHtml } from './pdfTemplate'
import { logger } from '../../utils/logger'

// Export PDF della scheda pratica (E16). Dependency-free: HTML composto dai dati
// del dettaglio, reso in PDF da una BrowserWindow offscreen via printToPDF.
export async function exportPracticePdf(
  win: BrowserWindow | null,
  input: ExportPracticePdfInput
): Promise<ExportPracticePdfResponse> {
  const detail = getPracticeDetail({ id: input.practiceId })
  const documents = listDocuments({ practiceId: input.practiceId })

  // Mappa key→label dei campi generali (per i customValues).
  const fieldLabels: Record<string, string> = {}
  for (const f of findFieldsByFilter({ scope: 'general' })) {
    fieldLabels[f.key] = f.label
  }

  const html = buildPracticeHtml(detail, documents, fieldLabels)

  const defaultPath = join(app.getPath('documents'), `scheda-${detail.codiceIstanza}.pdf`)
  const options: Electron.SaveDialogOptions = {
    defaultPath,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  }
  const picked = win
    ? await dialog.showSaveDialog(win, options)
    : await dialog.showSaveDialog(options)
  if (picked.canceled || !picked.filePath) {
    return { canceled: true }
  }

  // File HTML temporaneo caricato in una finestra nascosta; poi printToPDF.
  const tmpHtml = join(app.getPath('userData'), `pdf-${Date.now()}.html`)
  writeFileSync(tmpHtml, html, 'utf-8')

  const pdfWin = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true, sandbox: true, contextIsolation: true },
  })

  try {
    await pdfWin.loadFile(tmpHtml)
    const buffer = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
    })
    writeFileSync(picked.filePath, buffer)
    logger.info('PRACTICE_PDF_EXPORTED', picked.filePath)
    return { canceled: false, path: picked.filePath }
  } finally {
    pdfWin.destroy()
    try {
      rmSync(tmpHtml, { force: true })
    } catch {
      /* best-effort */
    }
  }
}
