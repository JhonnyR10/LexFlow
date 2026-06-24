export const IPC_CHANNELS = {
  APP_GET_VERSION: 'app:getVersion',
  CONFIG_LIST_PHASES: 'config:listPhases',
  CONFIG_LIST_TRANSITIONS: 'config:listTransitions'
} as const

export type AppGetVersionResponse = string

export interface PhaseListItem {
  id: number
  key: string
  displayName: string
  category: string
  order: number
  isInitial: boolean
  isFinal: boolean
  isActive: boolean
}

export type ConfigListPhasesResponse = PhaseListItem[]

export interface TransitionListItem {
  id: number
  fromPhaseId: number
  fromPhaseKey: string
  toPhaseId: number | null
  toPhaseKey: string | null
  buttonLabel: string
  order: number
  isActive: boolean
  isRepeatable: boolean
  isAutomatic: boolean
  isResume: boolean
}

export type ConfigListTransitionsResponse = TransitionListItem[]

export interface LexFlowApi {
  app: {
    getVersion(): Promise<AppGetVersionResponse>
  }
  config: {
    listPhases(): Promise<ConfigListPhasesResponse>
    listTransitions(): Promise<ConfigListTransitionsResponse>
  }
}
