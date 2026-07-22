import { ipcMain, app } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { AppInfoResponse } from '../../../shared/ipc'
import { getDataPath } from '../../config/dataPath'
import { getBackupPath } from '../backup/repository'

export function registerAppHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, (): string => app.getVersion())

  // Info app / stato sistema (S11.6): sola lettura, composta da API di sistema e
  // dai percorsi risolti. Handler «di sistema» senza service/repository dedicati,
  // coerente con app:getVersion. `getBackupPath()` legge `app_settings` (DB): ok
  // perché la sezione Info è raggiungibile solo ad app sbloccata (DB aperto).
  ipcMain.handle(IPC_CHANNELS.APP_GET_INFO, (): AppInfoResponse => {
    const v = process.versions
    return {
      appVersion: app.getVersion(),
      electron: v.electron ?? '—',
      chrome: v.chrome ?? '—',
      node: v.node ?? '—',
      v8: v.v8 ?? '—',
      platform: process.platform,
      arch: process.arch,
      dataPath: getDataPath(),
      backupPath: getBackupPath()
    }
  })
}
