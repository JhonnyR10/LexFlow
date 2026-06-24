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
  CONFIG_REORDER_TRANSITIONS: 'config:reorderTransitions',
  CONFIG_LIST_MENU_SETS: 'config:listMenuSets',
  CONFIG_CREATE_MENU_SET: 'config:createMenuSet',
  CONFIG_UPDATE_MENU_SET: 'config:updateMenuSet',
  CONFIG_CREATE_MENU_OPTION: 'config:createMenuOption',
  CONFIG_UPDATE_MENU_OPTION: 'config:updateMenuOption',
  CONFIG_REORDER_MENU_OPTIONS: 'config:reorderMenuOptions',
  CONFIG_SET_MENU_OPTION_ACTIVE: 'config:setMenuOptionActive',
  CONFIG_LIST_FIELDS: 'config:listFields',
  CONFIG_CREATE_FIELD: 'config:createField',
  CONFIG_UPDATE_FIELD: 'config:updateField',
  CONFIG_SET_FIELD_ACTIVE: 'config:setFieldActive',
  CONFIG_REORDER_FIELDS: 'config:reorderFields'
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

export interface MenuOptionListItem {
  id: number
  menuSetId: number
  label: string
  value: string
  order: number
  isActive: boolean
}

export interface MenuSetListItem {
  id: number
  key: string
  label: string
  options: MenuOptionListItem[]
}

export interface CreateMenuSetInput {
  label: string
}

export interface UpdateMenuSetInput {
  id: number
  label: string
}

export interface CreateMenuOptionInput {
  menuSetId: number
  label: string
  value: string
}

export interface UpdateMenuOptionInput {
  id: number
  label: string
}

export interface SetMenuOptionActiveInput {
  id: number
  isActive: boolean
}

export type ReorderMenuOptionsInput = { id: number; order: number }[]

export type ConfigListMenuSetsResponse = MenuSetListItem[]
export type ConfigCreateMenuSetResponse = MenuSetListItem
export type ConfigUpdateMenuSetResponse = MenuSetListItem
export type ConfigCreateMenuOptionResponse = MenuOptionListItem
export type ConfigUpdateMenuOptionResponse = MenuOptionListItem
export type ConfigSetMenuOptionActiveResponse = { success: true }
export type ConfigReorderMenuOptionsResponse = { success: true }

// ---------- FieldDef ----------

export type FieldType =
  | 'testo_breve'
  | 'testo_lungo'
  | 'numero'
  | 'importo'
  | 'data'
  | 'menu'
  | 'si_no'
  | 'note'
  | 'file'

export const FIELD_TYPES: readonly FieldType[] = [
  'testo_breve',
  'testo_lungo',
  'numero',
  'importo',
  'data',
  'menu',
  'si_no',
  'note',
  'file'
]

export interface FieldDefListItem {
  id: number
  scope: 'general' | 'transition'
  transitionId: number | null
  transitionLabel: string | null
  key: string
  label: string
  type: FieldType
  required: boolean
  visibleInTable: boolean
  usableInFilter: boolean
  includeInExport: boolean
  order: number
  isActive: boolean
  menuSetId: number | null
  menuSetLabel: string | null
}

export interface ListFieldsFilter {
  scope?: 'general' | 'transition'
  transitionId?: number
}

export interface CreateFieldInput {
  scope: 'general' | 'transition'
  transitionId: number | null
  label: string
  type: FieldType
  required: boolean
  visibleInTable: boolean
  usableInFilter: boolean
  includeInExport: boolean
  menuSetId: number | null
}

export interface UpdateFieldInput {
  id: number
  label: string
  type: FieldType
  required: boolean
  visibleInTable: boolean
  usableInFilter: boolean
  includeInExport: boolean
  menuSetId: number | null
}

export interface SetFieldActiveInput {
  id: number
  isActive: boolean
}

export type ReorderFieldsInput = { id: number; order: number }[]

export type ConfigListFieldsResponse = FieldDefListItem[]
export type ConfigCreateFieldResponse = FieldDefListItem
export type ConfigUpdateFieldResponse = FieldDefListItem
export type ConfigSetFieldActiveResponse = { success: true }
export type ConfigReorderFieldsResponse = { success: true }

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
    listMenuSets(): Promise<ConfigListMenuSetsResponse>
    createMenuSet(input: CreateMenuSetInput): Promise<ConfigCreateMenuSetResponse>
    updateMenuSet(input: UpdateMenuSetInput): Promise<ConfigUpdateMenuSetResponse>
    createMenuOption(input: CreateMenuOptionInput): Promise<ConfigCreateMenuOptionResponse>
    updateMenuOption(input: UpdateMenuOptionInput): Promise<ConfigUpdateMenuOptionResponse>
    reorderMenuOptions(input: ReorderMenuOptionsInput): Promise<ConfigReorderMenuOptionsResponse>
    setMenuOptionActive(input: SetMenuOptionActiveInput): Promise<ConfigSetMenuOptionActiveResponse>
    listFields(filter?: ListFieldsFilter): Promise<ConfigListFieldsResponse>
    createField(input: CreateFieldInput): Promise<ConfigCreateFieldResponse>
    updateField(input: UpdateFieldInput): Promise<ConfigUpdateFieldResponse>
    setFieldActive(input: SetFieldActiveInput): Promise<ConfigSetFieldActiveResponse>
    reorderFields(input: ReorderFieldsInput): Promise<ConfigReorderFieldsResponse>
  }
}
