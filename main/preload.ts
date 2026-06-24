import { contextBridge, ipcRenderer } from 'electron'
import type { LexFlowApi } from '../shared/ipc'

const api: LexFlowApi = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion')
  },
  config: {
    listPhases: () => ipcRenderer.invoke('config:listPhases'),
    listAllPhases: () => ipcRenderer.invoke('config:listAllPhases'),
    listTransitions: () => ipcRenderer.invoke('config:listTransitions'),
    createPhase: (input) => ipcRenderer.invoke('config:createPhase', input),
    updatePhase: (input) => ipcRenderer.invoke('config:updatePhase', input),
    setPhaseActive: (input) => ipcRenderer.invoke('config:setPhaseActive', input),
    reorderPhases: (input) => ipcRenderer.invoke('config:reorderPhases', input)
  }
}

contextBridge.exposeInMainWorld('api', api)
