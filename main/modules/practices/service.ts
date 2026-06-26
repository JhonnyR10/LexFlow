import type {
  GenerateCodiceIstanzaInput,
  GenerateCodiceIstanzaResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
  PracticesListResponse,
  GetPracticeInput,
  GetPracticeResponse,
  PracticeDetailHistoryItem,
  ListAvailableTransitionsInput,
  PracticesListAvailableTransitionsResponse,
  ExecuteTransitionInput,
  ExecuteTransitionResponse,
  UpdatePracticeInput,
  UpdatePracticeResponse,
  MoveToTrashInput,
  MoveToTrashResponse,
  PracticesListTrashedResponse,
} from '../../../shared/ipc'
import {
  countPracticesByYear,
  existsCodiceIstanza,
  getSiglaCodice,
  findInitialPhase,
  findAutomaticTransitionFromPhase,
  insertPractice,
  updatePracticeCurrentPhase,
  insertHistoryEvent,
  insertPecRecipients,
  insertPecRecipientsForTransition,
  findAllActivePractices,
  findAvailableTransitionsFromPhase,
  findPracticeDetailById,
  findPracticeCoreById,
  findPhaseNameMap,
  findHistoryEventsByPractice,
  findPecDepositoAddresses,
  findTransitionForExecution,
  findActiveTransitionFields,
  findActiveMenuOptionValues,
  insertTransitionRecord,
  advancePractice,
  findReachedPhaseCategories,
  findPracticeForEdit,
  updatePracticeFields,
  updatePracticeImporti,
  deletePecDepositoRecipients,
  moveToTrash as moveToTrashRow,
  findTrashedPractices,
  type TransitionFieldRow,
  type ImportiUpdate,
} from './repository'
import { getDb } from '../../database/connection'
import { ValidationError, NotFoundError } from '../../errors/AppError'

// Genera il prossimo codice istanza disponibile.
// Formato: AAAAMMGG_SIGLA_NNN (es. 20260624_NP_001).
// Usata per pre-riempire il campo nel form (S4.2).
// IMPORTANTE: il codice definitivo deve essere rigenerato/verificato dentro la
// transazione di insert della pratica in S4.2, per evitare race condition tra
// la preview e il salvataggio (anche se in mono-utente il rischio è minimo).
export function generateCodiceIstanza(
  input: GenerateCodiceIstanzaInput
): GenerateCodiceIstanzaResponse {
  const { dataUdienza } = input

  const year = parseInt(dataUdienza.slice(0, 4), 10)
  if (isNaN(year)) throw new ValidationError('dataUdienza non valida')

  const dateStr = dataUdienza.replace(/-/g, '')  // YYYYMMDD
  const sigla = getSiglaCodice()
  const existing = countPracticesByYear(year)

  let n = existing + 1
  let candidate = buildCode(dateStr, sigla, n)

  // Loop di sicurezza: in mono-utente sincrono non si verifica mai,
  // ma garantisce unicità assoluta anche in caso di codici già presenti per altri motivi.
  while (existsCodiceIstanza(candidate)) {
    n++
    candidate = buildCode(dateStr, sigla, n)
  }

  return { codice: candidate }
}

function buildCode(dateStr: string, sigla: string, n: number): string {
  return `${dateStr}_${sigla}_${String(n).padStart(3, '0')}`
}

export function listActivePractices(): PracticesListResponse {
  return findAllActivePractices()
}

function parseCustomValues(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // payload non valido: trattato come vuoto, mai propagato come errore alla UI
  }
  return {}
}

export function getPracticeDetail(input: GetPracticeInput): GetPracticeResponse {
  const row = findPracticeDetailById(input.id)
  if (!row) {
    throw new NotFoundError('Pratica non trovata')
  }

  const p = row.practice
  const phaseNames = findPhaseNameMap()

  const history: PracticeDetailHistoryItem[] = findHistoryEventsByPractice(p.id).map(e => ({
    id:        e.id,
    timestamp: e.timestamp,
    type:      e.type,
    title:     e.title,
    fromPhaseDisplayName: e.fromPhaseId != null ? (phaseNames.get(e.fromPhaseId) ?? null) : null,
    toPhaseDisplayName:   e.toPhaseId != null ? (phaseNames.get(e.toPhaseId) ?? null) : null,
    note:      e.note ?? null,
  }))

  return {
    id:                  p.id,
    codiceIstanza:       p.codiceIstanza,
    nomeIstanza:         p.nomeIstanza,
    tipologiaAttivita:   p.tipologiaAttivita ?? null,
    dataUdienza:         p.dataUdienza ?? null,
    competenza:          p.competenza ?? null,
    autoritaGiudiziaria: p.autoritaGiudiziaria ?? null,
    dataDeposito:        p.dataDeposito ?? null,
    modalitaDeposito:    p.modalitaDeposito ?? null,
    importoRichiesto:    p.importoRichiesto ?? null,
    importoConcesso:     p.importoConcesso ?? null,
    importoFatturato:    p.importoFatturato ?? null,
    importoLiquidato:    p.importoLiquidato ?? null,
    note:                p.note ?? null,
    customValues:        parseCustomValues(p.customValues),
    currentPhase: {
      id:          p.currentPhaseId,
      key:         row.currentPhaseKey,
      displayName: row.currentPhaseDisplayName,
      category:    row.currentPhaseCategory,
      isFinal:     row.currentPhaseIsFinal ?? false,
    },
    previousPhaseDisplayName: p.previousPhaseId != null ? (phaseNames.get(p.previousPhaseId) ?? null) : null,
    collaboratoreId:             p.collaboratoreId ?? null,
    collaboratoreDenominazione:  row.collaboratoreDenominazione,
    professionistaId:            p.professionistaId ?? null,
    professionistaDenominazione: row.professionistaDenominazione,
    pecDepositoDestinatari:      findPecDepositoAddresses(p.id),
    history,
    isTrashed:  p.isTrashed,
    createdAt:  p.createdAt,
    updatedAt:  p.updatedAt,
  }
}

// Pulsanti di avanzamento (S5.2): transizioni configurate dalla fase corrente.
// Le transizioni invalide non esistono nel grafo, quindi non generano pulsanti
// (cfr. docs/03-workflow-engine.md). Una fase finale non ha azioni in uscita.
export function listAvailableTransitions(
  input: ListAvailableTransitionsInput
): PracticesListAvailableTransitionsResponse {
  const row = findPracticeDetailById(input.practiceId)
  if (!row) {
    throw new NotFoundError('Pratica non trovata')
  }

  if (row.currentPhaseIsFinal === true) {
    return []
  }

  return findAvailableTransitionsFromPhase(row.practice.currentPhaseId).map(t => ({
    id:                 t.id,
    buttonLabel:        t.buttonLabel,
    toPhaseId:          t.toPhaseId,
    toPhaseDisplayName: t.toPhaseDisplayName ?? null,
    isRepeatable:       t.isRepeatable,
    isResume:           t.isResume,
  }))
}

export function createPractice(input: CreatePracticeInput): CreatePracticeResponse {
  if (!input.dataUdienza) {
    throw new ValidationError('dataUdienza è obbligatoria')
  }

  const initialPhase = findInitialPhase()
  if (!initialPhase) {
    throw new NotFoundError('Nessuna fase iniziale configurata. Verificare le impostazioni workflow.')
  }

  const now = new Date().toISOString()
  const year = parseInt(input.dataUdienza.slice(0, 4), 10)
  const dateStr = input.dataUdienza.replace(/-/g, '')

  let result: CreatePracticeResponse

  getDb().transaction(() => {
    // Codice istanza: usa quello fornito se presente e unico, altrimenti rigenera
    let codice = input.codiceIstanza?.trim() || ''
    if (!codice || existsCodiceIstanza(codice)) {
      const sigla = getSiglaCodice()
      const existing = countPracticesByYear(year)
      let n = existing + 1
      codice = buildCode(dateStr, sigla, n)
      while (existsCodiceIstanza(codice)) {
        n++
        codice = buildCode(dateStr, sigla, n)
      }
    }

    const nomeIstanza = input.nomeIstanza?.trim() || `${dateStr}_NOTA_SPESE`

    const practiceId = insertPractice({
      codiceIstanza:       codice,
      nomeIstanza,
      collaboratoreId:     input.collaboratoreId ?? null,
      professionistaId:    input.professionistaId ?? null,
      tipologiaAttivita:   input.tipologiaAttivita ?? null,
      dataUdienza:         input.dataUdienza,
      competenza:          input.competenza ?? null,
      autoritaGiudiziaria: input.autoritaGiudiziaria ?? null,
      dataDeposito:        input.dataDeposito ?? null,
      modalitaDeposito:    input.modalitaDeposito ?? null,
      importoRichiesto:    input.importoRichiesto ?? null,
      note:                input.note ?? null,
      currentPhaseId:      initialPhase.id,
      customValues:        JSON.stringify(input.customValues ?? {}),
      createdAt:           now,
      updatedAt:           now,
    })

    insertHistoryEvent({
      practiceId,
      timestamp:   now,
      type:        'created',
      title:       'Pratica depositata',
      fromPhaseId: null,
      toPhaseId:   initialPhase.id,
      note:        null,
      payload:     JSON.stringify({ codiceIstanza: codice }),
    })

    // Esegui la transizione automatica dalla fase iniziale (depositata → in_attesa_decreto)
    const autoTransition = findAutomaticTransitionFromPhase(initialPhase.id)
    let currentPhaseId = initialPhase.id

    if (autoTransition?.toPhaseId != null) {
      updatePracticeCurrentPhase(practiceId, autoTransition.toPhaseId, now)
      insertHistoryEvent({
        practiceId,
        timestamp:   now,
        type:        'auto_transition',
        title:       'Pratica posta in attesa di decreto',
        fromPhaseId: initialPhase.id,
        toPhaseId:   autoTransition.toPhaseId,
        note:        null,
        payload:     '{}',
      })
      currentPhaseId = autoTransition.toPhaseId
    }

    // PEC deposito
    if (input.pecDestinatari && input.pecDestinatari.length > 0) {
      insertPecRecipients(practiceId, input.pecDestinatari, 'deposito')
    }

    result = { id: practiceId, codiceIstanza: codice, currentPhaseId }
  })

  return result!
}

// ---------- S4.3: modifica pratica + storico ----------

// Normalizza una stringa opzionale: trim, vuota → null.
function normStr(v: string | undefined | null): string | null {
  const t = (v ?? '').trim()
  return t.length > 0 ? t : null
}

// Serializzazione stabile (chiavi ordinate) per confrontare oggetti customValues.
function stableStringify(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort()
  const ordered: Record<string, unknown> = {}
  for (const k of keys) ordered[k] = obj[k]
  return JSON.stringify(ordered)
}

interface FieldChange {
  label: string
  from: unknown
  to: unknown
}

// Modifica i dati generali editabili di una pratica e registra nello storico le
// modifiche rilevanti (regola 9). NON tocca codiceIstanza né la fase corrente
// (la fase si muove solo via transizioni, E5). Tutto dentro una transazione.
export function updatePractice(input: UpdatePracticeInput): UpdatePracticeResponse {
  if (!input.dataUdienza) {
    throw new ValidationError('dataUdienza è obbligatoria')
  }

  const now = new Date().toISOString()
  let response: UpdatePracticeResponse

  getDb().transaction(() => {
    const current = findPracticeForEdit(input.id)
    if (!current) {
      throw new NotFoundError('Pratica non trovata')
    }
    if (current.isTrashed) {
      throw new ValidationError('Impossibile modificare una pratica nel cestino')
    }

    // Valori nuovi normalizzati. nomeIstanza non può essere svuotato: se vuoto,
    // si mantiene quello corrente.
    const next = {
      nomeIstanza:         normStr(input.nomeIstanza) ?? current.nomeIstanza,
      collaboratoreId:     input.collaboratoreId ?? null,
      professionistaId:    input.professionistaId ?? null,
      tipologiaAttivita:   normStr(input.tipologiaAttivita),
      dataUdienza:         input.dataUdienza,
      competenza:          normStr(input.competenza),
      autoritaGiudiziaria: normStr(input.autoritaGiudiziaria),
      dataDeposito:        normStr(input.dataDeposito),
      modalitaDeposito:    normStr(input.modalitaDeposito),
      importoRichiesto:    input.importoRichiesto ?? null,
      note:                normStr(input.note),
    }

    const currentCustom = parseCustomValues(current.customValues)
    const nextCustom = input.customValues ?? currentCustom

    // PEC deposito: rilevante solo se modalità = pec; altrimenti il set va azzerato.
    const isPec = next.modalitaDeposito === 'pec'
    const nextPec = isPec
      ? (input.pecDestinatari ?? []).map(a => a.trim()).filter(a => a.length > 0)
      : []
    const currentPec = findPecDepositoAddresses(input.id)

    // Costruzione del diff (campi rilevanti, etichette leggibili).
    const changes: FieldChange[] = []
    const track = (label: string, from: unknown, to: unknown): void => {
      if (from !== to) changes.push({ label, from, to })
    }

    track('Nome istanza', current.nomeIstanza, next.nomeIstanza)
    track('Collaboratore', current.collaboratoreId, next.collaboratoreId)
    track('Professionista', current.professionistaId, next.professionistaId)
    track('Tipologia attività', current.tipologiaAttivita, next.tipologiaAttivita)
    track('Data udienza', current.dataUdienza, next.dataUdienza)
    track('Competenza', current.competenza, next.competenza)
    track('Autorità giudiziaria', current.autoritaGiudiziaria, next.autoritaGiudiziaria)
    track('Data deposito', current.dataDeposito, next.dataDeposito)
    track('Modalità deposito', current.modalitaDeposito, next.modalitaDeposito)
    track('Importo richiesto', current.importoRichiesto, next.importoRichiesto)
    track('Note', current.note, next.note)

    const customChanged = stableStringify(currentCustom) !== stableStringify(nextCustom)
    if (customChanged) {
      changes.push({ label: 'Campi aggiuntivi', from: currentCustom, to: nextCustom })
    }

    const pecChanged =
      [...currentPec].sort().join('\n') !== [...nextPec].sort().join('\n')
    if (pecChanged) {
      changes.push({ label: 'Destinatari PEC deposito', from: currentPec, to: nextPec })
    }

    if (changes.length === 0) {
      response = { id: input.id, changed: false }
      return
    }

    updatePracticeFields(
      input.id,
      { ...next, customValues: JSON.stringify(nextCustom) },
      now
    )

    if (pecChanged) {
      deletePecDepositoRecipients(input.id)
      if (nextPec.length > 0) {
        insertPecRecipients(input.id, nextPec, 'deposito')
      }
    }

    insertHistoryEvent({
      practiceId:  input.id,
      timestamp:   now,
      type:        'updated',
      title:       'Pratica modificata',
      fromPhaseId: null,
      toPhaseId:   null,
      note:        `Modificati: ${changes.map(c => c.label).join(', ')}`,
      payload:     JSON.stringify({ changes }),
    })

    response = { id: input.id, changed: true }
  })

  return response!
}

// ---------- S5.3: esecuzione transizione (form dinamico + salvataggio) ----------

// Un campo condizionato è visibile solo se il suo controllore (campo menu dello
// stesso contenitore) ha, tra i valori inviati, esattamente il conditionalValue.
// Un campo nascosto non è mai obbligatorio (precisazione 4).
function isFieldVisible(
  field: TransitionFieldRow,
  fieldsById: Map<number, TransitionFieldRow>,
  values: Record<string, unknown>
): boolean {
  if (field.conditionalOnFieldId == null || field.conditionalValue == null) return true
  const controller = fieldsById.get(field.conditionalOnFieldId)
  if (!controller) return true  // controllore assente/disattivato: nessun vincolo di visibilità
  return values[controller.key] === field.conditionalValue
}

// Estrae gli indirizzi PEC non vuoti da un valore di campo `pec`.
function extractPecAddresses(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((a): a is string => typeof a === 'string')
    .map(a => a.trim())
    .filter(a => a.length > 0)
}

// Un valore è "vuoto" ai fini dell'obbligatorietà. `si_no` (booleano) ha sempre
// un valore; `pec` è vuoto se non contiene almeno un indirizzo non vuoto.
function isEmptyValue(type: string, value: unknown): boolean {
  if (type === 'si_no') return false
  if (type === 'pec') return extractPecAddresses(value).length === 0
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

// Validazione lato main (fonte autorevole) dei valori del form dinamico contro
// le definizioni dei campi della transizione. Restituisce i valori normalizzati.
function validateTransitionValues(
  fields: TransitionFieldRow[],
  rawValues: Record<string, unknown>
): Record<string, unknown> {
  const fieldsById = new Map(fields.map(f => [f.id, f]))
  const clean: Record<string, unknown> = {}

  for (const field of fields) {
    const visible = isFieldVisible(field, fieldsById, rawValues)
    if (!visible) continue  // campo nascosto: ignorato (non obbligatorio, non salvato)

    const value = rawValues[field.key]

    if (field.type === 'pec') {
      const addresses = extractPecAddresses(value)
      if (field.required && addresses.length === 0) {
        throw new ValidationError(`Indicare almeno un indirizzo PEC per «${field.label}»`)
      }
      clean[field.key] = addresses
      continue
    }

    if (field.required && isEmptyValue(field.type, value)) {
      throw new ValidationError(`Il campo «${field.label}» è obbligatorio`)
    }

    // Validazione valore menu: deve essere un'opzione attiva del set (se valorizzato)
    if (field.type === 'menu' && field.menuSetId != null && !isEmptyValue('menu', value)) {
      const allowed = findActiveMenuOptionValues(field.menuSetId)
      if (!allowed.includes(String(value))) {
        throw new ValidationError(`Valore non valido per «${field.label}»`)
      }
    }

    if (value !== undefined) clean[field.key] = value
  }

  return clean
}

// Guard di coerenza degli stati (S5.4, docs/03-workflow-engine.md §Coerenza degli stati).
// Ragiona per category canonica, non per key: le fasi custom non lo innescano.
const LIQUIDATION_CATEGORY = 'liquidated'
const REQUIRED_BEFORE_LIQUIDATION: ReadonlyArray<{ category: string; label: string }> = [
  { category: 'decree_received',      label: 'decreto ricevuto' },
  { category: 'awaiting_liquidation', label: 'invio a SCP' },
]

// Impedisce di raggiungere «Liquidata» senza che la pratica abbia attraversato
// (negli HistoryEvent) le fasi di decreto ricevuto e invio a SCP. Difesa in
// profondità contro scorciatoie nel workflow riconfigurato.
function assertLiquidationGuard(practiceId: number, targetCategory: string | null): void {
  if (targetCategory !== LIQUIDATION_CATEGORY) return
  const reached = findReachedPhaseCategories(practiceId)
  const missing = REQUIRED_BEFORE_LIQUIDATION
    .filter(req => !reached.has(req.category))
    .map(req => req.label)
  if (missing.length > 0) {
    throw new ValidationError(
      `Impossibile liquidare la pratica: manca la registrazione di ${missing.join(' e ')}.`
    )
  }
}

// Deriva il contesto della PEC dalla fase di destinazione (precisazione 1).
// TODO (post-MVP): rendere il contesto configurabile direttamente sul campo `pec`.
function derivePecContesto(toPhaseCategory: string | null): 'deposito' | 'scp' | 'altro' {
  if (toPhaseCategory === 'awaiting_liquidation') return 'scp'
  if (toPhaseCategory === 'deposited') return 'deposito'
  return 'altro'
}

// Denormalizzazione importi (E6/S6.1): mappatura esplicita e minimale field-key →
// colonna pratica. La fonte di verità resta TransitionRecord.values; queste colonne
// sono cache derivata. Le key sono uniche per contenitore (transizione) nella config
// standard, quindi ciascuna esiste su una sola transizione (vedi 02-data-model.md).
const IMPORTO_FIELD_TO_COLUMN: Record<string, keyof ImportiUpdate> = {
  importo_concesso:  'importoConcesso',
  importo_fatturato: 'importoFatturato',
  importo_liquidato: 'importoLiquidato',
}

// Estrae dagli `values` puliti gli aggiornamenti delle colonne importi: solo i campi
// mappati con valore numerico finito. Valore vuoto/non numerico → colonna invariata.
function deriveImportiUpdate(values: Record<string, unknown>): ImportiUpdate {
  const update: ImportiUpdate = {}
  for (const [fieldKey, column] of Object.entries(IMPORTO_FIELD_TO_COLUMN)) {
    const raw = values[fieldKey]
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      update[column] = raw
    }
  }
  return update
}

export function executeTransition(input: ExecuteTransitionInput): ExecuteTransitionResponse {
  const transition = findTransitionForExecution(input.transitionId)
  if (!transition) {
    throw new NotFoundError('Transizione non trovata')
  }
  if (!transition.isActive) {
    throw new ValidationError('La transizione non è attiva')
  }
  if (transition.isAutomatic) {
    throw new ValidationError('Le transizioni automatiche non si eseguono manualmente')
  }

  // Validazione dei valori del form contro la configurazione (fuori transazione:
  // non dipende dallo stato della pratica).
  const fields = findActiveTransitionFields(transition.id)
  const cleanValues = validateTransitionValues(fields, input.values ?? {})
  const note = input.note?.trim() ? input.note.trim() : null

  const now = new Date().toISOString()
  let response: ExecuteTransitionResponse

  getDb().transaction(() => {
    // Precisazione 5: rilettura dello stato reale + controllo "dalla fase corrente"
    // e calcolo destinazione tutti dentro la transazione.
    const core = findPracticeCoreById(input.practiceId)
    if (!core) {
      throw new NotFoundError('Pratica non trovata')
    }
    if (core.isTrashed) {
      throw new ValidationError('Impossibile avanzare una pratica nel cestino')
    }
    if (transition.fromPhaseId !== core.currentPhaseId) {
      throw new ValidationError('La transizione non è disponibile dalla fase corrente della pratica')
    }

    // Risoluzione della destinazione (docs/03-workflow-engine.md §Ciclo di avanzamento, passo 4)
    let newCurrentPhaseId: number
    let newPreviousPhaseId: number | null
    let phaseChanged: boolean

    if (transition.isResume) {
      if (core.previousPhaseId == null) {
        throw new ValidationError('Nessuna fase di provenienza da ripristinare')
      }
      newCurrentPhaseId = core.previousPhaseId
      newPreviousPhaseId = null
      phaseChanged = true
    } else {
      if (transition.toPhaseId == null) {
        throw new ValidationError('Transizione senza fase di destinazione')
      }
      if (transition.toPhaseIsActive === false) {
        throw new ValidationError('La fase di destinazione non è attiva')
      }
      if (transition.toPhaseId === core.currentPhaseId) {
        // Self/ripetibile (es. sollecito): resta nella fase, nessun cambio.
        newCurrentPhaseId = core.currentPhaseId
        newPreviousPhaseId = core.previousPhaseId
        phaseChanged = false
      } else if (transition.toPhaseCategory === 'suspended') {
        // Sospensione: memorizza la fase di provenienza per la futura ripresa.
        newPreviousPhaseId = core.currentPhaseId
        newCurrentPhaseId = transition.toPhaseId
        phaseChanged = true
      } else {
        newCurrentPhaseId = transition.toPhaseId
        newPreviousPhaseId = core.previousPhaseId
        phaseChanged = true
      }
    }

    // Guard di coerenza degli stati (S5.4): blocca la liquidazione senza decreto
    // e invio SCP registrati. Dentro la transazione → rollback se non superato.
    if (phaseChanged) {
      assertLiquidationGuard(input.practiceId, transition.toPhaseCategory)
    }

    const transitionRecordId = insertTransitionRecord({
      practiceId:   input.practiceId,
      transitionId: transition.id,
      fromPhaseId:  core.currentPhaseId,
      toPhaseId:    newCurrentPhaseId,
      recordedAt:   now,
      values:       JSON.stringify(cleanValues),
      note,
    })

    if (phaseChanged) {
      advancePractice(input.practiceId, newCurrentPhaseId, newPreviousPhaseId, now)
    }

    // Denormalizzazione importi (E6/S6.1): copia i campi `importo` mappati dai
    // values della transizione alle colonne omonime della pratica (cache derivata).
    const importiUpdate = deriveImportiUpdate(cleanValues)
    if (Object.keys(importiUpdate).length > 0) {
      updatePracticeImporti(input.practiceId, importiUpdate, now)
    }

    // Precisazione 3: le transizioni self/ripetibili producono un evento SENZA
    // cambio fase (type 'event', nessuna toPhase sull'evento).
    insertHistoryEvent({
      practiceId:  input.practiceId,
      timestamp:   now,
      type:        phaseChanged ? 'phase_changed' : 'event',
      title:       transition.buttonLabel,
      fromPhaseId: core.currentPhaseId,
      toPhaseId:   phaseChanged ? newCurrentPhaseId : null,
      note,
      payload:     JSON.stringify({ transitionId: transition.id, transitionRecordId }),
    })

    // PEC raccolte nei campi `pec` della transizione: salvate anche come
    // PecRecipient, con contesto derivato dalla fase di destinazione (precisazione 1).
    const pecAddresses = fields
      .filter(f => f.type === 'pec')
      .flatMap(f => extractPecAddresses(cleanValues[f.key]))
    if (pecAddresses.length > 0) {
      const contesto = derivePecContesto(transition.toPhaseCategory)
      insertPecRecipientsForTransition(input.practiceId, transitionRecordId, pecAddresses, contesto)
    }

    response = { transitionRecordId, currentPhaseId: newCurrentPhaseId, phaseChanged }
  })

  return response!
}

// ---------- S10.1: sposta nel cestino (soft delete) ----------

// Cestina le pratiche indicate con un motivo condiviso. Eliminazione logica
// (regola 6): nessuna riga rimossa, i file documentali non vengono toccati.
// Tutto in un'unica transazione: o tutte le pratiche valide vengono cestinate,
// o nessuna. Le pratiche assenti o già cestinate vengono saltate (idempotenza);
// `trashedCount` conta solo quelle effettivamente spostate ora. Ogni pratica
// cestinata scrive un HistoryEvent `trashed` con il motivo (regola 9).
export function moveToTrash(input: MoveToTrashInput): MoveToTrashResponse {
  const reason = input.reason.trim()
  if (reason.length === 0) {
    throw new ValidationError('Indicare un motivo per la cestinazione')
  }
  if (input.ids.length === 0) {
    throw new ValidationError('Nessuna pratica selezionata')
  }

  const now = new Date().toISOString()
  let trashedCount = 0

  getDb().transaction(() => {
    for (const id of input.ids) {
      const core = findPracticeCoreById(id)
      if (!core || core.isTrashed) continue  // assente o già cestinata: saltata

      const changed = moveToTrashRow(id, reason, now)
      if (changed === 0) continue

      insertHistoryEvent({
        practiceId:  id,
        timestamp:   now,
        type:        'trashed',
        title:       'Pratica spostata nel cestino',
        fromPhaseId: null,
        toPhaseId:   null,
        note:        reason,
        payload:     JSON.stringify({ trashedAt: now }),
      })
      trashedCount++
    }
  })

  return { trashedCount }
}

export function listTrashedPractices(): PracticesListTrashedResponse {
  return findTrashedPractices()
}
