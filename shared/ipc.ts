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
  CONFIG_REORDER_FIELDS: 'config:reorderFields',
  ANAGRAFICHE_LIST_PROFESSIONISTI: 'anagrafiche:listProfessionisti',
  ANAGRAFICHE_CREATE_PROFESSIONISTA: 'anagrafiche:createProfessionista',
  ANAGRAFICHE_UPDATE_PROFESSIONISTA: 'anagrafiche:updateProfessionista',
  ANAGRAFICHE_SET_PROFESSIONISTA_ACTIVE: 'anagrafiche:setProfessionistaActive',
  ANAGRAFICHE_LIST_COLLABORATORI: 'anagrafiche:listCollaboratori',
  ANAGRAFICHE_CREATE_COLLABORATORE: 'anagrafiche:createCollaboratore',
  ANAGRAFICHE_UPDATE_COLLABORATORE: 'anagrafiche:updateCollaboratore',
  ANAGRAFICHE_SET_COLLABORATORE_ACTIVE: 'anagrafiche:setCollaboratoreActive',
  PRACTICES_GENERATE_CODICE: 'practices:generateCodiceIstanza',
  PRACTICES_CREATE: 'practices:createPractice',
  PRACTICES_LIST: 'practices:listPractices',
  PRACTICES_GET: 'practices:getPractice',
  PRACTICES_LIST_AVAILABLE_TRANSITIONS: 'practices:listAvailableTransitions',
  PRACTICES_EXECUTE_TRANSITION: 'practices:executeTransition',
  PRACTICES_UPDATE: 'practices:updatePractice',
  DOCUMENTS_LIST: 'documents:listByPractice',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_OPEN: 'documents:open'
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
  | 'pec'

export const FIELD_TYPES: readonly FieldType[] = [
  'testo_breve',
  'testo_lungo',
  'numero',
  'importo',
  'data',
  'menu',
  'si_no',
  'note',
  'file',
  'pec'
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
  conditionalOnFieldId: number | null
  conditionalValue: string | null
  conditionalOnFieldLabel: string | null
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
  conditionalOnFieldId: number | null
  conditionalValue: string | null
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
  conditionalOnFieldId: number | null
  conditionalValue: string | null
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

// ---------- Anagrafiche — Professionisti ----------

export interface ProfessionistaListItem {
  id: number
  nome: string
  cognome: string
  denominazione: string
  codiceFiscale: string | null
  email: string | null
  pec: string | null
  telefono: string | null
  ruolo: string | null
  note: string | null
  isActive: boolean
}

export interface CreateProfessionistaInput {
  nome: string
  cognome: string
  denominazione: string | null
  codiceFiscale: string | null
  email: string | null
  pec: string | null
  telefono: string | null
  ruolo: string | null
  note: string | null
}

export interface UpdateProfessionistaInput {
  id: number
  nome: string
  cognome: string
  denominazione: string | null
  codiceFiscale: string | null
  email: string | null
  pec: string | null
  telefono: string | null
  ruolo: string | null
  note: string | null
  isActive: boolean
}

export interface SetProfessionistaActiveInput {
  id: number
  isActive: boolean
}

export type AnagraficheListProfessionistiResponse = ProfessionistaListItem[]
export type AnagraficheCreateProfessionistaResponse = ProfessionistaListItem
export type AnagraficheUpdateProfessionistaResponse = ProfessionistaListItem
export type AnagraficheSetProfessionistaActiveResponse = { success: true }

// ---------- Anagrafiche — Collaboratori ----------

export interface CollaboratoreListItem {
  id: number
  nome: string
  cognome: string
  denominazione: string
  codiceInterno: string | null
  note: string | null
  isActive: boolean
}

export interface CreateCollaboratoreInput {
  nome: string
  cognome: string
  denominazione: string | null
  codiceInterno: string | null
  note: string | null
}

export interface UpdateCollaboratoreInput {
  id: number
  nome: string
  cognome: string
  denominazione: string | null
  codiceInterno: string | null
  note: string | null
  isActive: boolean
}

export interface SetCollaboratoreActiveInput {
  id: number
  isActive: boolean
}

export type AnagraficheListCollaboratoriResponse = CollaboratoreListItem[]
export type AnagraficheCreateCollaboratoreResponse = CollaboratoreListItem
export type AnagraficheUpdateCollaboratoreResponse = CollaboratoreListItem
export type AnagraficheSetCollaboratoreActiveResponse = { success: true }

// ---------- Practices ----------

export interface GenerateCodiceIstanzaInput {
  dataUdienza: string  // ISO YYYY-MM-DD, obbligatoria
}

export interface GenerateCodiceIstanzaResponse {
  codice: string  // formato AAAAMMGG_SIGLA_NNN — pre-riempimento UI; il codice definitivo è generato/verificato inside la transazione di insert in S4.2
}

export interface CreatePracticeInput {
  codiceIstanza?: string                  // se assente viene rigenerato server-side inside la tx
  nomeIstanza?: string                    // se assente viene auto-generato YYYYMMDD_NOTA_SPESE
  collaboratoreId?: number | null
  professionistaId?: number | null
  tipologiaAttivita?: string
  dataUdienza: string                     // ISO YYYY-MM-DD — obbligatoria
  competenza?: string
  autoritaGiudiziaria?: string
  dataDeposito?: string
  modalitaDeposito?: string
  importoRichiesto?: number | null
  note?: string
  customValues?: Record<string, unknown>
  pecDestinatari?: string[]               // indirizzi email; usati solo se modalitaDeposito='pec'
}

export interface CreatePracticeResponse {
  id: number
  codiceIstanza: string
  currentPhaseId: number
}

// --- Modifica pratica (S4.3) ---
// Modifica i soli dati generali editabili. `codiceIstanza` (identità) e la fase
// corrente NON sono modificabili da qui: la fase si muove solo via transizioni (E5).
// `dataUdienza` resta obbligatoria; modificarla non rigenera il codice istanza.
export interface UpdatePracticeInput {
  id: number
  nomeIstanza?: string
  collaboratoreId?: number | null
  professionistaId?: number | null
  tipologiaAttivita?: string
  dataUdienza: string                     // ISO YYYY-MM-DD — obbligatoria
  competenza?: string
  autoritaGiudiziaria?: string
  dataDeposito?: string
  modalitaDeposito?: string
  importoRichiesto?: number | null
  note?: string
  customValues?: Record<string, unknown>
  pecDestinatari?: string[]               // destinatari PEC deposito; usati solo se modalitaDeposito='pec'
}

export interface UpdatePracticeResponse {
  id: number
  changed: boolean                        // true se almeno un campo è cambiato (→ HistoryEvent scritto)
}

export interface PracticeListItem {
  id: number
  codiceIstanza: string
  nomeIstanza: string
  dataUdienza: string | null
  dataDeposito: string | null
  autoritaGiudiziaria: string | null
  note: string | null
  currentPhaseId: number
  currentPhaseKey: string | null
  currentPhaseDisplayName: string | null
  currentPhaseCategory: string | null
  collaboratoreId: number | null
  collaboratoreDenominazione: string | null
  professionistaId: number | null
  professionistaDenominazione: string | null
  importoRichiesto: number | null
  createdAt: string
}

export type PracticesListResponse = PracticeListItem[]

export interface GetPracticeInput {
  id: number
}

export interface PracticeDetailHistoryItem {
  id: number
  timestamp: string
  type: string
  title: string
  fromPhaseDisplayName: string | null
  toPhaseDisplayName: string | null
  note: string | null
}

export interface PracticeDetailPhase {
  id: number
  key: string | null
  displayName: string | null
  category: string | null
  isFinal: boolean
}

export interface PracticeDetail {
  id: number
  codiceIstanza: string
  nomeIstanza: string
  tipologiaAttivita: string | null
  dataUdienza: string | null
  competenza: string | null
  autoritaGiudiziaria: string | null
  dataDeposito: string | null
  modalitaDeposito: string | null
  importoRichiesto: number | null
  importoConcesso: number | null
  importoFatturato: number | null
  importoLiquidato: number | null
  note: string | null
  customValues: Record<string, unknown>
  currentPhase: PracticeDetailPhase
  previousPhaseDisplayName: string | null
  collaboratoreId: number | null
  collaboratoreDenominazione: string | null
  professionistaId: number | null
  professionistaDenominazione: string | null
  pecDepositoDestinatari: string[]
  history: PracticeDetailHistoryItem[]
  isTrashed: boolean
  createdAt: string
  updatedAt: string
}

export type GetPracticeResponse = PracticeDetail

// --- Transizioni disponibili dalla fase corrente (S5.2) ---
// Pulsanti di avanzamento generati dalla configurazione: solo transizioni
// attive e non automatiche dalla fase corrente della pratica. Il form e il
// salvataggio sono gestiti in S5.3.
export interface ListAvailableTransitionsInput {
  practiceId: number
}

export interface AvailableTransition {
  id: number
  buttonLabel: string
  toPhaseId: number | null
  toPhaseDisplayName: string | null
  isRepeatable: boolean
  isResume: boolean
}

export type PracticesListAvailableTransitionsResponse = AvailableTransition[]

// --- Esecuzione di una transizione (S5.3) ---
// `values` è keyed by fieldKey: contiene i valori del form dinamico della
// transizione (compresi gli array di indirizzi per i campi di tipo `pec`).
export interface ExecuteTransitionInput {
  practiceId: number
  transitionId: number
  values: Record<string, unknown>
  note?: string | null
}

export interface ExecuteTransitionResponse {
  transitionRecordId: number
  currentPhaseId: number
  phaseChanged: boolean
}

// --- Documenti (S7.1) ---
// Decreto e fattura caricati su una pratica. Nell'MVP un solo documento per
// `kind` (l'upload sostituisce). I file vivono su filesystem; in DB resta solo
// il riferimento. L'upload usa un file dialog nativo nel main (nessun byte sul
// bridge): se l'utente annulla il dialog la risposta è `{ canceled: true }`.
export type DocumentKind = 'decreto' | 'fattura'
export const DOCUMENT_KINDS: readonly DocumentKind[] = ['decreto', 'fattura'] as const

export interface DocumentItem {
  id: number
  practiceId: number
  kind: DocumentKind
  originalName: string
  size: number | null
  createdAt: string
}

export interface ListDocumentsInput {
  practiceId: number
}
export type ListDocumentsResponse = DocumentItem[]

export interface UploadDocumentInput {
  practiceId: number
  kind: DocumentKind
}
export type UploadDocumentResponse =
  | { canceled: true }
  | { canceled: false; document: DocumentItem }

export interface DeleteDocumentInput {
  id: number
}
export interface DeleteDocumentResponse {
  id: number
}

export interface OpenDocumentInput {
  id: number
}
export interface OpenDocumentResponse {
  opened: boolean
}

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
  practices: {
    generateCodiceIstanza(input: GenerateCodiceIstanzaInput): Promise<GenerateCodiceIstanzaResponse>
    createPractice(input: CreatePracticeInput): Promise<CreatePracticeResponse>
    updatePractice(input: UpdatePracticeInput): Promise<UpdatePracticeResponse>
    listPractices(): Promise<PracticesListResponse>
    getPractice(input: GetPracticeInput): Promise<GetPracticeResponse>
    listAvailableTransitions(input: ListAvailableTransitionsInput): Promise<PracticesListAvailableTransitionsResponse>
    executeTransition(input: ExecuteTransitionInput): Promise<ExecuteTransitionResponse>
  }
  documents: {
    listByPractice(input: ListDocumentsInput): Promise<ListDocumentsResponse>
    upload(input: UploadDocumentInput): Promise<UploadDocumentResponse>
    delete(input: DeleteDocumentInput): Promise<DeleteDocumentResponse>
    open(input: OpenDocumentInput): Promise<OpenDocumentResponse>
  }
  anagrafiche: {
    listProfessionisti(): Promise<AnagraficheListProfessionistiResponse>
    createProfessionista(input: CreateProfessionistaInput): Promise<AnagraficheCreateProfessionistaResponse>
    updateProfessionista(input: UpdateProfessionistaInput): Promise<AnagraficheUpdateProfessionistaResponse>
    setProfessionistaActive(input: SetProfessionistaActiveInput): Promise<AnagraficheSetProfessionistaActiveResponse>
    listCollaboratori(): Promise<AnagraficheListCollaboratoriResponse>
    createCollaboratore(input: CreateCollaboratoreInput): Promise<AnagraficheCreateCollaboratoreResponse>
    updateCollaboratore(input: UpdateCollaboratoreInput): Promise<AnagraficheUpdateCollaboratoreResponse>
    setCollaboratoreActive(input: SetCollaboratoreActiveInput): Promise<AnagraficheSetCollaboratoreActiveResponse>
  }
}
