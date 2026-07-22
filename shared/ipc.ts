import type { ThemeKey } from './themes'

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
  APP_GET_INFO: 'app:getInfo',
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
  CONFIG_DELETE_PHASE: 'config:deletePhase',
  CONFIG_DELETE_TRANSITION: 'config:deleteTransition',
  CONFIG_DELETE_FIELD: 'config:deleteField',
  CONFIG_DELETE_MENU_SET: 'config:deleteMenuSet',
  CONFIG_DELETE_MENU_OPTION: 'config:deleteMenuOption',
  ANAGRAFICHE_LIST_PROFESSIONISTI: 'anagrafiche:listProfessionisti',
  ANAGRAFICHE_CREATE_PROFESSIONISTA: 'anagrafiche:createProfessionista',
  ANAGRAFICHE_UPDATE_PROFESSIONISTA: 'anagrafiche:updateProfessionista',
  ANAGRAFICHE_SET_PROFESSIONISTA_ACTIVE: 'anagrafiche:setProfessionistaActive',
  ANAGRAFICHE_DELETE_PROFESSIONISTA: 'anagrafiche:deleteProfessionista',
  ANAGRAFICHE_LIST_COLLABORATORI: 'anagrafiche:listCollaboratori',
  ANAGRAFICHE_CREATE_COLLABORATORE: 'anagrafiche:createCollaboratore',
  ANAGRAFICHE_UPDATE_COLLABORATORE: 'anagrafiche:updateCollaboratore',
  ANAGRAFICHE_SET_COLLABORATORE_ACTIVE: 'anagrafiche:setCollaboratoreActive',
  ANAGRAFICHE_DELETE_COLLABORATORE: 'anagrafiche:deleteCollaboratore',
  PRACTICES_GENERATE_CODICE: 'practices:generateCodiceIstanza',
  PRACTICES_CREATE: 'practices:createPractice',
  PRACTICES_LIST: 'practices:listPractices',
  PRACTICES_GET: 'practices:getPractice',
  PRACTICES_LIST_AVAILABLE_TRANSITIONS: 'practices:listAvailableTransitions',
  PRACTICES_EXECUTE_TRANSITION: 'practices:executeTransition',
  PRACTICES_UPDATE: 'practices:updatePractice',
  PRACTICES_MOVE_TO_TRASH: 'practices:moveToTrash',
  PRACTICES_RESTORE: 'practices:restore',
  PRACTICES_PERMANENT_DELETE: 'practices:permanentDelete',
  PRACTICES_LIST_TRASHED: 'practices:listTrashed',
  PRACTICES_EXPORT_PDF: 'practices:exportPdf',
  SCADENZE_LIST: 'scadenze:listByPractice',
  SCADENZE_CREATE: 'scadenze:create',
  SCADENZE_UPDATE: 'scadenze:update',
  SCADENZE_DELETE: 'scadenze:delete',
  DOCUMENTS_LIST: 'documents:listByPractice',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_OPEN: 'documents:open',
  DASHBOARD_PHASE_COUNTS: 'dashboard:phaseCounts',
  DASHBOARD_ALERTS: 'dashboard:alerts',
  DASHBOARD_AGING: 'dashboard:aging',
  DASHBOARD_MISSING_DOCUMENTS: 'dashboard:missingDocuments',
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE_THEME: 'settings:updateTheme',
  SETTINGS_OPEN_DATA_FOLDER: 'settings:openDataFolder',
  SETTINGS_GET_ALERT_CONFIG: 'settings:getAlertConfig',
  SETTINGS_UPDATE_ALERT_CONFIG: 'settings:updateAlertConfig',
  SETTINGS_CHANGE_DATA_PATH: 'settings:changeDataPath',
  BACKUP_EXPORT: 'backup:export',
  BACKUP_RESTORE: 'backup:restore',
  BACKUP_GET_CONFIG: 'backup:getConfig',
  BACKUP_UPDATE_CONFIG: 'backup:updateConfig',
  BACKUP_CHANGE_FOLDER: 'backup:changeFolder',
  BACKUP_OPEN_FOLDER: 'backup:openFolder',
  RESET_ARCHIVE: 'reset:archive',
  EXPORT_CSV: 'export:csv',
  REPORT_SUMMARY: 'report:summary',
  SECURITY_GET_STATE: 'security:getState',
  SECURITY_GET_CONFIG: 'security:getConfig',
  SECURITY_UNLOCK: 'security:unlock',
  SECURITY_SET_PASSWORD: 'security:setPassword',
  SECURITY_CHANGE_PASSWORD: 'security:changePassword',
  SECURITY_DISABLE_LOCK: 'security:disableLock',
  SECURITY_ENABLE_ENCRYPTION: 'security:enableEncryption',
  SECURITY_DISABLE_ENCRYPTION: 'security:disableEncryption'
} as const

export type AppGetVersionResponse = string

// Info app / stato sistema (S11.6). Sola lettura, composto nel main da
// app.getVersion()/process.versions/process.platform + percorsi dati e backup.
export interface AppInfoResponse {
  appVersion: string
  electron: string
  chrome: string
  node: string
  v8: string
  platform: string
  arch: string
  dataPath: string
  backupPath: string
}

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
// `warning` valorizzato solo alla disattivazione: nota non bloccante mostrata dal renderer
// (la disattivazione procede; i valori già salvati nelle pratiche restano invariati).
export type ConfigSetMenuOptionActiveResponse = { success: true; warning?: string }
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

// Contesto assegnato ai destinatari PEC (pec_recipients.contesto). Configurabile
// sul campo `pec` (scope transizione); null = «Automatico» → derivato dalla fase.
export type PecContext = 'deposito' | 'scp' | 'altro'
export const PEC_CONTEXTS: readonly PecContext[] = ['deposito', 'scp', 'altro']

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
  pecContext: PecContext | null
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
  pecContext: PecContext | null
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
  pecContext: PecContext | null
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
// `warning` valorizzato solo alla disattivazione: nota non bloccante mostrata dal renderer
// (la disattivazione procede; i valori già salvati nelle pratiche restano invariati).
export type ConfigSetFieldActiveResponse = { success: true; warning?: string }
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
  importoConcesso: number | null
  importoFatturato: number | null
  importoLiquidato: number | null
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

// Export PDF scheda pratica (E16). `canceled=true` se l'utente annulla il dialog.
export interface ExportPracticePdfInput {
  practiceId: number
}
export interface ExportPracticePdfResponse {
  canceled: boolean
  path?: string
}

// --- Scadenze / termini (E15/S15.1) ---
export interface ScadenzaItem {
  id: number
  practiceId: number
  descrizione: string
  dataScadenza: string // YYYY-MM-DD
  completata: boolean
  completataAt: string | null
  createdAt: string
}
export interface ListScadenzeInput {
  practiceId: number
}
export type ListScadenzeResponse = ScadenzaItem[]
export interface CreateScadenzaInput {
  practiceId: number
  descrizione: string
  dataScadenza: string
}
export interface UpdateScadenzaInput {
  id: number
  descrizione: string
  dataScadenza: string
  completata: boolean
}
export interface DeleteScadenzaInput {
  id: number
}
export interface DeleteScadenzaResponse {
  deleted: boolean
}

// --- Sposta nel cestino (soft delete) — S10.1 ---
// Cestina N pratiche con un motivo condiviso. Usato sia dal dettaglio (un id)
// sia dalla toolbar di selezione dell'elenco (più id). Idempotente: le pratiche
// già cestinate vengono saltate, `trashedCount` riflette quelle spostate ora.
export interface MoveToTrashInput {
  ids: number[]
  reason: string
}

export interface MoveToTrashResponse {
  trashedCount: number
}

// --- Ripristino dal cestino (soft delete inverso) — S10.2 ---
// Ripristina N pratiche cestinate (isTrashed=false, trashedAt/trashReason
// azzerati). Usato dal Cestino (un id per riga o più via selezione) e dal
// dettaglio di una pratica cestinata (un id). Idempotente: le pratiche non
// cestinate vengono saltate, `restoredCount` riflette quelle ripristinate ora.
export interface RestoreFromTrashInput {
  ids: number[]
}

export interface RestoreFromTrashResponse {
  restoredCount: number
}

// --- Cancellazione definitiva (hard delete irreversibile) — S10.3 ---
// Elimina fisicamente N pratiche CESTINATE e tutti i loro figli (documents,
// pec_recipients, history_events, transition_records) + la cartella documenti.
// Solo da pagina Cestino. Idempotente: pratiche assenti o NON cestinate vengono
// saltate, `deletedCount` riflette solo quelle effettivamente rimosse ora.
export interface PermanentDeleteInput {
  ids: number[]
}

export interface PermanentDeleteResponse {
  deletedCount: number
}

// Riga della tabella Cestino (sola lettura in S10.1): pratica cestinata con data
// e motivo della cestinazione.
export interface TrashedPracticeItem {
  id: number
  codiceIstanza: string
  nomeIstanza: string
  currentPhaseDisplayName: string | null
  trashedAt: string | null
  trashReason: string | null
}

export type PracticesListTrashedResponse = TrashedPracticeItem[]

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

// --- E8 Dashboard ---

// Conteggio pratiche attive (non cestinate) per fase. Solo le fasi con almeno
// una pratica attiva sono presenti (card dinamiche, S8.1).
export interface DashboardPhaseCount {
  phaseId: number
  phaseKey: string
  displayName: string
  category: string
  count: number
}
export type DashboardPhaseCountsResponse = DashboardPhaseCount[]

// Alert aggregato per pratica (S8.2). Severità dalle soglie 30/60/90 giorni dalla
// data deposito; colori semantici fissi (giallo/arancione/rosso). Più motivazioni
// nello stesso box. Esclude cestino e fasi finali. dataDeposito assente → la
// pratica non genera alert in S8.2 (display "Data deposito non presente" è S8.3).
export type AlertSeverity = 'yellow' | 'orange' | 'red'

export interface DashboardAlert {
  practiceId: number
  codiceIstanza: string
  nomeIstanza: string
  currentPhaseDisplayName: string | null
  severity: AlertSeverity
  daysSinceDeposit: number
  reasons: string[]
}
export type DashboardAlertsResponse = DashboardAlert[]

// Anzianità (S8.4): le pratiche aperte più vecchie per giorni dalla data deposito,
// senza soglia. Esclude cestino, fasi finali e pratiche senza data deposito.
export interface DashboardAgingItem {
  practiceId: number
  codiceIstanza: string
  nomeIstanza: string
  currentPhaseDisplayName: string | null
  daysSinceDeposit: number
}
export type DashboardAgingResponse = DashboardAgingItem[]

// Documenti mancanti (S8.5): pratiche attive non finali cui manca un documento
// atteso per la fase raggiunta. L'attesa ragiona per category canonica (come
// S8.2): decreto da `decree_received` in poi; fattura da `awaiting_liquidation`
// in poi. `missing` elenca i kind ancora assenti (mai vuoto: le pratiche senza
// mancanze non entrano nella risposta). Esclude cestino e fasi finali.
export interface DashboardMissingDocItem {
  practiceId: number
  codiceIstanza: string
  nomeIstanza: string
  currentPhaseDisplayName: string | null
  missing: DocumentKind[]
}
export type DashboardMissingDocumentsResponse = DashboardMissingDocItem[]

// --- Report aggregati (S9.2) ---
// Fotografia aggregata delle pratiche ATTIVE (cestino escluso). Aggregazione
// nel backend (modulo report); il renderer si limita a mostrare. Importi con
// `sum()`: null quando non c'è alcun valore (renderer → «Non presente»).
export interface ReportTotals {
  practicesCount: number
  importoRichiesto: number | null
  importoConcesso: number | null
  importoFatturato: number | null
  importoLiquidato: number | null
}
export interface ReportByPhaseItem {
  phaseId: number
  displayName: string
  category: string
  count: number
}
// Aggregato per collaboratore/professionista. `id=null` = bucket «Non assegnato».
export interface ReportByEntityItem {
  id: number | null
  denominazione: string
  count: number
  importoConcesso: number | null
  importoLiquidato: number | null
}
export interface ReportDocumentsCoverage {
  practicesCount: number
  withDecreto: number
  withoutDecreto: number
  withFattura: number
  withoutFattura: number
}
export interface ReportSummaryResponse {
  totals: ReportTotals
  byPhase: ReportByPhaseItem[]
  byCollaboratore: ReportByEntityItem[]
  byProfessionista: ReportByEntityItem[]
  documents: ReportDocumentsCoverage
}

// --- Settings (E11) ---
// Vista esposta all'MVP: tema (S11.1) e percorso dati corrente (S11.2, sola
// lettura — risolto dal puntatore di bootstrap, non dalla colonna DB). Backup,
// security… entrano con le storie successive.
export interface AppSettingsView {
  theme: ThemeKey
  dataPath: string
}
export type SettingsGetResponse = AppSettingsView
export interface UpdateThemeInput {
  theme: ThemeKey
}
export type SettingsUpdateThemeResponse = AppSettingsView
export interface SettingsOpenDataFolderResponse {
  success: boolean
}

// Configurazione degli avvisi Dashboard (S11.5). Un livello per severità, con
// abilitazione e soglia in giorni. Persistita in `app_settings.alertsEnabled`
// (bool per livello) + `alertThresholds` (giorni per livello). Le chiavi usano
// la stessa nomenclatura EN di `AlertSeverity`.
export interface AlertLevelConfig {
  enabled: boolean
  thresholdDays: number
}
export interface AlertConfig {
  yellow: AlertLevelConfig
  orange: AlertLevelConfig
  red: AlertLevelConfig
}
export type SettingsGetAlertConfigResponse = AlertConfig
export type UpdateAlertConfigInput = AlertConfig
export type SettingsUpdateAlertConfigResponse = AlertConfig

// Spostamento percorso dati (S11.2b). `willRestart=true` quando lo spostamento è
// stato programmato e l'app si sta riavviando (lo swap avviene a freddo al boot).
export interface SettingsChangeDataPathResponse {
  canceled: boolean
  willRestart?: boolean
}

// --- Sicurezza / lock all'avvio (S14.1) ---
// Stato usato dal cancello di boot del renderer: `locked=true` → mostra la
// schermata di sblocco. Lo stato vive nel marker esterno `security.json`
// (fuori dal DB), non in `app_settings`.
export interface SecurityStateResponse {
  locked: boolean
}
// Config mostrata nelle Impostazioni (sola lettura del marker, nessun DB).
// `encrypted` (S14.2) è significativo solo con `lockEnabled=true`.
export interface SecurityConfigResponse {
  lockEnabled: boolean
  encrypted: boolean
}
export interface SecurityUnlockInput {
  password: string
}
// `success=false` = password errata (non un errore tecnico). Gli errori reali
// (es. apertura DB fallita) vengono lanciati come AppError.
export interface SecurityUnlockResponse {
  success: boolean
}
export interface SecuritySetPasswordInput {
  password: string
}
export interface SecurityChangePasswordInput {
  currentPassword: string
  newPassword: string
}
export interface SecurityDisableLockInput {
  currentPassword: string
}
// Esito delle mutation su password/lock: nuovo stato del lock.
export interface SecurityMutationResponse {
  lockEnabled: boolean
}
// Cifratura a riposo (S14.2): richiedono la re-immissione della password (la
// chiave è derivata da essa; non è conservata in chiaro).
export interface SecurityEnableEncryptionInput {
  password: string
}
export interface SecurityDisableEncryptionInput {
  password: string
}
export interface SecurityEncryptionResponse {
  encrypted: boolean
  // Percorso del backup di sicurezza creato prima dell'operazione.
  safetyBackupPath: string
}

// --- Backup / ripristino (S11.3) ---
export interface BackupExportResponse {
  canceled: boolean
  path?: string
}
export interface BackupRestoreResponse {
  canceled: boolean
  // true quando il ripristino è stato preparato e l'app si sta riavviando.
  willRestart?: boolean
}

// --- Backup automatico (S11.7) ---
export type BackupTrigger = 'onClose' | 'interval' | 'both'
export interface BackupConfig {
  autoEnabled: boolean
  trigger: BackupTrigger
  intervalHours: number
  retentionCount: number
  backupPath: string
  lastBackupAt: string | null
}
export interface UpdateBackupConfigInput {
  autoEnabled: boolean
  trigger: BackupTrigger
  intervalHours: number
  retentionCount: number
}
export interface BackupChangeFolderResponse {
  canceled: boolean
  config?: BackupConfig
}
export interface BackupOpenFolderResponse {
  success: boolean
}

// --- Reset archivio (S11.4) ---
export interface ResetArchiveResponse {
  backupPath: string
  practicesDeleted: number
  professionistiDeleted: number
  collaboratoriDeleted: number
}

// --- Export CSV (S9.1) ---
export interface ExportCsvInput {
  content: string
  suggestedName: string
}
export interface ExportCsvResponse {
  canceled: boolean
  path?: string
}

// --- Eliminazione fisica config/anagrafiche (C-002) ---
export interface DeleteByIdInput {
  id: number
}
export interface DeleteResponse {
  success: true
  // Numero di figli rimossi in cascata (menu set→opzioni, transizione→campi).
  deletedChildren?: number
}

export interface LexFlowApi {
  app: {
    getVersion(): Promise<AppGetVersionResponse>
    getInfo(): Promise<AppInfoResponse>
  }
  settings: {
    get(): Promise<SettingsGetResponse>
    updateTheme(input: UpdateThemeInput): Promise<SettingsUpdateThemeResponse>
    openDataFolder(): Promise<SettingsOpenDataFolderResponse>
    getAlertConfig(): Promise<SettingsGetAlertConfigResponse>
    updateAlertConfig(input: UpdateAlertConfigInput): Promise<SettingsUpdateAlertConfigResponse>
    changeDataPath(): Promise<SettingsChangeDataPathResponse>
  }
  backup: {
    export(): Promise<BackupExportResponse>
    restore(): Promise<BackupRestoreResponse>
    getConfig(): Promise<BackupConfig>
    updateConfig(input: UpdateBackupConfigInput): Promise<BackupConfig>
    changeFolder(): Promise<BackupChangeFolderResponse>
    openFolder(): Promise<BackupOpenFolderResponse>
  }
  reset: {
    archive(): Promise<ResetArchiveResponse>
  }
  export: {
    csv(input: ExportCsvInput): Promise<ExportCsvResponse>
  }
  report: {
    summary(): Promise<ReportSummaryResponse>
  }
  security: {
    getState(): Promise<SecurityStateResponse>
    getConfig(): Promise<SecurityConfigResponse>
    unlock(input: SecurityUnlockInput): Promise<SecurityUnlockResponse>
    setPassword(input: SecuritySetPasswordInput): Promise<SecurityMutationResponse>
    changePassword(input: SecurityChangePasswordInput): Promise<SecurityMutationResponse>
    disableLock(input: SecurityDisableLockInput): Promise<SecurityMutationResponse>
    enableEncryption(input: SecurityEnableEncryptionInput): Promise<SecurityEncryptionResponse>
    disableEncryption(input: SecurityDisableEncryptionInput): Promise<SecurityEncryptionResponse>
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
    deletePhase(input: DeleteByIdInput): Promise<DeleteResponse>
    deleteTransition(input: DeleteByIdInput): Promise<DeleteResponse>
    deleteField(input: DeleteByIdInput): Promise<DeleteResponse>
    deleteMenuSet(input: DeleteByIdInput): Promise<DeleteResponse>
    deleteMenuOption(input: DeleteByIdInput): Promise<DeleteResponse>
  }
  practices: {
    generateCodiceIstanza(input: GenerateCodiceIstanzaInput): Promise<GenerateCodiceIstanzaResponse>
    createPractice(input: CreatePracticeInput): Promise<CreatePracticeResponse>
    updatePractice(input: UpdatePracticeInput): Promise<UpdatePracticeResponse>
    listPractices(): Promise<PracticesListResponse>
    getPractice(input: GetPracticeInput): Promise<GetPracticeResponse>
    listAvailableTransitions(input: ListAvailableTransitionsInput): Promise<PracticesListAvailableTransitionsResponse>
    executeTransition(input: ExecuteTransitionInput): Promise<ExecuteTransitionResponse>
    moveToTrash(input: MoveToTrashInput): Promise<MoveToTrashResponse>
    restore(input: RestoreFromTrashInput): Promise<RestoreFromTrashResponse>
    permanentDelete(input: PermanentDeleteInput): Promise<PermanentDeleteResponse>
    listTrashed(): Promise<PracticesListTrashedResponse>
    exportPdf(input: ExportPracticePdfInput): Promise<ExportPracticePdfResponse>
  }
  scadenze: {
    listByPractice(input: ListScadenzeInput): Promise<ListScadenzeResponse>
    create(input: CreateScadenzaInput): Promise<ScadenzaItem>
    update(input: UpdateScadenzaInput): Promise<ScadenzaItem>
    delete(input: DeleteScadenzaInput): Promise<DeleteScadenzaResponse>
  }
  documents: {
    listByPractice(input: ListDocumentsInput): Promise<ListDocumentsResponse>
    upload(input: UploadDocumentInput): Promise<UploadDocumentResponse>
    delete(input: DeleteDocumentInput): Promise<DeleteDocumentResponse>
    open(input: OpenDocumentInput): Promise<OpenDocumentResponse>
  }
  dashboard: {
    phaseCounts(): Promise<DashboardPhaseCountsResponse>
    alerts(): Promise<DashboardAlertsResponse>
    aging(): Promise<DashboardAgingResponse>
    missingDocuments(): Promise<DashboardMissingDocumentsResponse>
  }
  anagrafiche: {
    listProfessionisti(): Promise<AnagraficheListProfessionistiResponse>
    createProfessionista(input: CreateProfessionistaInput): Promise<AnagraficheCreateProfessionistaResponse>
    updateProfessionista(input: UpdateProfessionistaInput): Promise<AnagraficheUpdateProfessionistaResponse>
    setProfessionistaActive(input: SetProfessionistaActiveInput): Promise<AnagraficheSetProfessionistaActiveResponse>
    deleteProfessionista(input: DeleteByIdInput): Promise<DeleteResponse>
    listCollaboratori(): Promise<AnagraficheListCollaboratoriResponse>
    createCollaboratore(input: CreateCollaboratoreInput): Promise<AnagraficheCreateCollaboratoreResponse>
    updateCollaboratore(input: UpdateCollaboratoreInput): Promise<AnagraficheUpdateCollaboratoreResponse>
    setCollaboratoreActive(input: SetCollaboratoreActiveInput): Promise<AnagraficheSetCollaboratoreActiveResponse>
    deleteCollaboratore(input: DeleteByIdInput): Promise<DeleteResponse>
  }
}
