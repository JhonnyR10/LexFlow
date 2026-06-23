import { contextBridge, ipcRenderer } from 'electron'
import type { LexFlowApi } from '../shared/ipc'

const api: LexFlowApi = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion')
  },
  config: {
    listPhases: () => ipcRenderer.invoke('config:listPhases')
  }
}

contextBridge.exposeInMainWorld('api', api)
