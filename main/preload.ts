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
    reorderPhases: (input) => ipcRenderer.invoke('config:reorderPhases', input),
    createTransition: (input) => ipcRenderer.invoke('config:createTransition', input),
    updateTransition: (input) => ipcRenderer.invoke('config:updateTransition', input),
    setTransitionActive: (input) => ipcRenderer.invoke('config:setTransitionActive', input),
    reorderTransitions: (input) => ipcRenderer.invoke('config:reorderTransitions', input),
    listMenuSets: () => ipcRenderer.invoke('config:listMenuSets'),
    createMenuSet: (input) => ipcRenderer.invoke('config:createMenuSet', input),
    updateMenuSet: (input) => ipcRenderer.invoke('config:updateMenuSet', input),
    createMenuOption: (input) => ipcRenderer.invoke('config:createMenuOption', input),
    updateMenuOption: (input) => ipcRenderer.invoke('config:updateMenuOption', input),
    reorderMenuOptions: (input) => ipcRenderer.invoke('config:reorderMenuOptions', input),
    setMenuOptionActive: (input) => ipcRenderer.invoke('config:setMenuOptionActive', input)
  }
}

contextBridge.exposeInMainWorld('api', api)
