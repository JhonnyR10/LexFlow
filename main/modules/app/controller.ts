import { ipcMain, app } from 'electron'
import { IPC_CHANNELS } from '../../../shared/ipc'

export function registerAppHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, (): string => app.getVersion())
}
