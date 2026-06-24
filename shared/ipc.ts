export const PHASE_CATEGORIES = [
  'deposited',
  'awaiting_decree',
  'awaiting_integration',
  'decree_received',
  'awaiting_correction',
  'awaiting_appeal',
  'awaiting_liquidation',
  'awaiting_integration_scp',
  'liquidated',
  'closed',
  'refused',
  'suspended',
  'annulled',
  'custom'
] as const

export type PhaseCategory = (typeof PHASE_CATEGORIES)[number]

export const IPC_CHANNELS = {
  APP_GET_VERSION: 'app:getVersion',
  CONFIG_LIST_PHASES: 'config:listPhases',
  CONFIG_LIST_ALL_PHASES: 'config:listAllPhases',
  CONFIG_LIST_TRANSITIONS: 'config:listTransitions',
  CONFIG_CREATE_PHASE: 'config:createPhase',
  CONFIG_UPDATE_PHASE: 'config:updatePhase',
  CONFIG_SET_PHASE_ACTIVE: 'config:setPhaseActive',
  CONFIG_REORDER_PHASES: 'config:reorderPhases',
  CONFIG_CREATE_TRANSITION: 'config:createTransition',
  CONFIG_UPDATE_TRANSITION: 'config:updateTransition',
  CONFIG_SET_TRANSITION_ACTIVE: 'config:setTransitionActive',
  CONFIG_REORDER_TRANSITIONS: 'config:reorderTransitions'
} as const

export type AppGetVersionResponse = string

export interface PhaseListItem {
  id: number
  key: string
  displayName: string
  category: PhaseCategory
  order: number
  isInitial: boolean
  isFinal: boolean
  isActive: boolean
}

export type ConfigListPhasesResponse = PhaseListItem[]
export type ConfigListAllPhasesResponse = PhaseListItem[]

export interface TransitionListItem {
  id: number
  fromPhaseId: number
  fromPhaseKey: string
  fromPhaseDisplayName: string
  fromPhaseOrder: number
  toPhaseId: number | null
  toPhaseKey: string | null
  toPhaseDisplayName: string | null
  buttonLabel: string
  order: number
  isActive: boolean
  isRepeatable: boolean
  isAutomatic: boolean
  isResume: boolean
}

export type ConfigListTransitionsResponse = TransitionListItem[]

export interface CreateTransitionInput {
  fromPhaseId: number
  toPhaseId: number | null
  buttonLabel: string
  isRepeatable: boolean
  isAutomatic: boolean
  isResume: boolean
  isActive: boolean
}

export interface UpdateTransitionInput {
  id: number
  fromPhaseId: number
  toPhaseId: number | null
  buttonLabel: string
  isRepeatable: boolean
  isAutomatic: boolean
  isResume: boolean
  isActive: boolean
}

export interface SetTransitionActiveInput {
  id: number
  isActive: boolean
}

export type ReorderTransitionsInput = { id: number; order: number }[]

export type ConfigCreateTransitionResponse = TransitionListItem
export type ConfigUpdateTransitionResponse = TransitionListItem
export type ConfigSetTransitionActiveResponse = { success: true }
export type ConfigReorderTransitionsResponse = { success: true }

export interface CreatePhaseInput {
  displayName: string
  category: PhaseCategory
  isInitial: boolean
  isFinal: boolean
  isActive: boolean
}

export interface UpdatePhaseInput {
  id: number
  displayName: string
  category: PhaseCategory
  isInitial: boolean
  isFinal: boolean
  isActive: boolean
}

export interface SetPhaseActiveInput {
  id: number
  isActive: boolean
}

export type ReorderPhasesInput = { id: number; order: number }[]

export type ConfigCreatePhaseResponse = PhaseListItem
export type ConfigUpdatePhaseResponse = PhaseListItem
export type ConfigSetPhaseActiveResponse = { success: true }
export type ConfigReorderPhasesResponse = { success: true }

export interface LexFlowApi {
  app: {
    getVersion(): Promise<AppGetVersionResponse>
  }
  config: {
    listPhases(): Promise<ConfigListPhasesResponse>
    listAllPhases(): Promise<ConfigListAllPhasesResponse>
    listTransitions(): Promise<ConfigListTransitionsResponse>
    createPhase(input: CreatePhaseInput): Promise<ConfigCreatePhaseResponse>
    updatePhase(input: UpdatePhaseInput): Promise<ConfigUpdatePhaseResponse>
    setPhaseActive(input: SetPhaseActiveInput): Promise<ConfigSetPhaseActiveResponse>
    reorderPhases(input: ReorderPhasesInput): Promise<ConfigReorderPhasesResponse>
    createTransition(input: CreateTransitionInput): Promise<ConfigCreateTransitionResponse>
    updateTransition(input: UpdateTransitionInput): Promise<ConfigUpdateTransitionResponse>
    setTransitionActive(input: SetTransitionActiveInput): Promise<ConfigSetTransitionActiveResponse>
    reorderTransitions(input: ReorderTransitionsInput): Promise<ConfigReorderTransitionsResponse>
  }
}
