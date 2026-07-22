import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { bootstrap } from './server'
import { validateStartupConfig } from './config/startup'
import { applyPendingRestore } from './modules/backup/restoreBootstrap'
import { runOnCloseBackup, startAutoBackupScheduler } from './modules/backup/scheduler'
import { isDbOpen } from './database/connection'
import { openAndInitDatabase } from './database/bootstrapDb'
import { getBootSecurityState } from './config/securityMarker'
import { logger } from './utils/logger'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('it.lexflow.app')

  logger.info('APP_START', `v${app.getVersion()}`)

  try {
    await validateStartupConfig()
    // Se è in sospeso un ripristino, fai lo swap a freddo PRIMA di aprire il DB (S11.3).
    applyPendingRestore()
  } catch (err) {
    logger.error('APP_INIT_FAILED', err instanceof Error ? err.message : String(err))
    app.quit()
    return
  }

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Gli handler IPC (incluso security:*) vanno registrati SEMPRE e per primi:
  // con lock attivo il renderer deve poter chiamare security:unlock prima che
  // il DB esista.
  bootstrap()

  if (getBootSecurityState().locked) {
    // Lock attivo (S14.1): NON aprire il DB né avviare lo scheduler. Il renderer
    // mostra la schermata di sblocco; l'apertura del DB è differita a
    // security:unlock (che poi avvia lo scheduler dei backup automatici).
    logger.info('APP_LOCKED', 'in attesa di sblocco password')
  } else {
    try {
      openAndInitDatabase()
    } catch (err) {
      logger.error('APP_INIT_FAILED', err instanceof Error ? err.message : String(err))
      app.quit()
      return
    }
    startAutoBackupScheduler()
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Backup automatico alla chiusura (S11.7): sincrono, una sola volta, con il DB
// ancora aperto. È best-effort (errori loggati dentro runAutoBackup).
let onCloseBackupDone = false
app.on('before-quit', () => {
  if (onCloseBackupDone) return
  onCloseBackupDone = true
  // Se l'app è stata chiusa mentre era ancora bloccata (DB non aperto), non c'è
  // nulla da salvare e leggere la config di backup lancerebbe (S14.1).
  if (!isDbOpen()) return
  runOnCloseBackup()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
  }
})
