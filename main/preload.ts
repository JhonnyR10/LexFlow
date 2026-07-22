import { contextBridge, ipcRenderer } from 'electron'
import type { LexFlowApi } from '../shared/ipc'

const api: LexFlowApi = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
    getInfo: () => ipcRenderer.invoke('app:getInfo')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    updateTheme: (input) => ipcRenderer.invoke('settings:updateTheme', input),
    openDataFolder: () => ipcRenderer.invoke('settings:openDataFolder')
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    restore: () => ipcRenderer.invoke('backup:restore'),
    getConfig: () => ipcRenderer.invoke('backup:getConfig'),
    updateConfig: (input) => ipcRenderer.invoke('backup:updateConfig', input),
    changeFolder: () => ipcRenderer.invoke('backup:changeFolder'),
    openFolder: () => ipcRenderer.invoke('backup:openFolder')
  },
  reset: {
    archive: () => ipcRenderer.invoke('reset:archive')
  },
  export: {
    csv: (input) => ipcRenderer.invoke('export:csv', input)
  },
  report: {
    summary: () => ipcRenderer.invoke('report:summary')
  },
  security: {
    getState: () => ipcRenderer.invoke('security:getState'),
    getConfig: () => ipcRenderer.invoke('security:getConfig'),
    unlock: (input) => ipcRenderer.invoke('security:unlock', input),
    setPassword: (input) => ipcRenderer.invoke('security:setPassword', input),
    changePassword: (input) => ipcRenderer.invoke('security:changePassword', input),
    disableLock: (input) => ipcRenderer.invoke('security:disableLock', input),
    enableEncryption: (input) => ipcRenderer.invoke('security:enableEncryption', input),
    disableEncryption: (input) => ipcRenderer.invoke('security:disableEncryption', input)
  },
  practices: {
    generateCodiceIstanza: (input) =>
      ipcRenderer.invoke('practices:generateCodiceIstanza', input),
    createPractice: (input) =>
      ipcRenderer.invoke('practices:createPractice', input),
    updatePractice: (input) =>
      ipcRenderer.invoke('practices:updatePractice', input),
    listPractices: () =>
      ipcRenderer.invoke('practices:listPractices'),
    getPractice: (input) =>
      ipcRenderer.invoke('practices:getPractice', input),
    listAvailableTransitions: (input) =>
      ipcRenderer.invoke('practices:listAvailableTransitions', input),
    executeTransition: (input) =>
      ipcRenderer.invoke('practices:executeTransition', input),
    moveToTrash: (input) =>
      ipcRenderer.invoke('practices:moveToTrash', input),
    restore: (input) =>
      ipcRenderer.invoke('practices:restore', input),
    permanentDelete: (input) =>
      ipcRenderer.invoke('practices:permanentDelete', input),
    listTrashed: () =>
      ipcRenderer.invoke('practices:listTrashed')
  },
  documents: {
    listByPractice: (input) =>
      ipcRenderer.invoke('documents:listByPractice', input),
    upload: (input) =>
      ipcRenderer.invoke('documents:upload', input),
    delete: (input) =>
      ipcRenderer.invoke('documents:delete', input),
    open: (input) =>
      ipcRenderer.invoke('documents:open', input)
  },
  dashboard: {
    phaseCounts: () =>
      ipcRenderer.invoke('dashboard:phaseCounts'),
    alerts: () =>
      ipcRenderer.invoke('dashboard:alerts'),
    aging: () =>
      ipcRenderer.invoke('dashboard:aging'),
    missingDocuments: () =>
      ipcRenderer.invoke('dashboard:missingDocuments')
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
    setMenuOptionActive: (input) => ipcRenderer.invoke('config:setMenuOptionActive', input),
    listFields: (filter) => ipcRenderer.invoke('config:listFields', filter),
    createField: (input) => ipcRenderer.invoke('config:createField', input),
    updateField: (input) => ipcRenderer.invoke('config:updateField', input),
    setFieldActive: (input) => ipcRenderer.invoke('config:setFieldActive', input),
    reorderFields: (input) => ipcRenderer.invoke('config:reorderFields', input),
    deletePhase: (input) => ipcRenderer.invoke('config:deletePhase', input),
    deleteTransition: (input) => ipcRenderer.invoke('config:deleteTransition', input),
    deleteField: (input) => ipcRenderer.invoke('config:deleteField', input),
    deleteMenuSet: (input) => ipcRenderer.invoke('config:deleteMenuSet', input),
    deleteMenuOption: (input) => ipcRenderer.invoke('config:deleteMenuOption', input)
  },
  anagrafiche: {
    listProfessionisti: () =>
      ipcRenderer.invoke('anagrafiche:listProfessionisti'),
    createProfessionista: (input) =>
      ipcRenderer.invoke('anagrafiche:createProfessionista', input),
    updateProfessionista: (input) =>
      ipcRenderer.invoke('anagrafiche:updateProfessionista', input),
    setProfessionistaActive: (input) =>
      ipcRenderer.invoke('anagrafiche:setProfessionistaActive', input),
    deleteProfessionista: (input) =>
      ipcRenderer.invoke('anagrafiche:deleteProfessionista', input),
    listCollaboratori: () =>
      ipcRenderer.invoke('anagrafiche:listCollaboratori'),
    createCollaboratore: (input) =>
      ipcRenderer.invoke('anagrafiche:createCollaboratore', input),
    updateCollaboratore: (input) =>
      ipcRenderer.invoke('anagrafiche:updateCollaboratore', input),
    setCollaboratoreActive: (input) =>
      ipcRenderer.invoke('anagrafiche:setCollaboratoreActive', input),
    deleteCollaboratore: (input) =>
      ipcRenderer.invoke('anagrafiche:deleteCollaboratore', input)
  }
}

contextBridge.exposeInMainWorld('api', api)
