import type {
  PhaseListItem,
  CreatePhaseInput,
  UpdatePhaseInput,
  SetPhaseActiveInput,
  ReorderPhasesInput,
  TransitionListItem,
  CreateTransitionInput,
  UpdateTransitionInput,
  SetTransitionActiveInput,
  ReorderTransitionsInput,
  MenuSetListItem,
  MenuOptionListItem,
  CreateMenuSetInput,
  UpdateMenuSetInput,
  CreateMenuOptionInput,
  UpdateMenuOptionInput,
  SetMenuOptionActiveInput,
  ReorderMenuOptionsInput,
  FieldDefListItem,
  CreateFieldInput,
  UpdateFieldInput,
  SetFieldActiveInput,
  ReorderFieldsInput,
  ListFieldsFilter,
  DeleteByIdInput,
  DeleteResponse
} from '../../../shared/ipc'
import {
  findActivePhases,
  findAllPhases,
  findTransitions,
  findPhaseById,
  findMaxOrder,
  countActiveInitialPhases,
  countActivePracticesUsingPhase,
  keyExists,
  createPhaseAtomic,
  updatePhaseAtomic,
  setPhaseIsActive,
  reorderPhasesAtomic,
  findTransitionById,
  findTransitionEnrichedById,
  findMaxTransitionOrderForPhase,
  countActiveAutomaticTransitionsForPhase,
  transitionLabelExists,
  insertTransition,
  updateTransitionFields,
  setTransitionIsActive,
  reorderTransitionsAtomic,
  findAllMenuSets,
  findMenuSetById,
  menuSetKeyExists,
  insertMenuSet,
  updateMenuSetLabel,
  findMenuOptionById,
  menuOptionValueExists,
  findMaxMenuOptionOrder,
  insertMenuOption,
  updateMenuOptionLabel,
  setMenuOptionIsActive,
  reorderMenuOptionsAtomic,
  findFieldsByFilter,
  findFieldById,
  fieldKeyExistsInContainer,
  findMaxFieldOrderInContainer,
  insertField,
  updateFieldFields,
  setFieldIsActive,
  reorderFieldsAtomic,
  findActiveMenuOptionByValue,
  menuOptionValuesForSet,
  savedValuesForFieldKey,
  conditionalValuesDependingOn,
  countSavedValuesForFieldKey,
  countSavedValueForFieldKeyEquals,
  findFieldsUsingMenuSet,
  countTransitionsUsingPhase,
  countAnyPracticesUsingPhase,
  countHistoryUsingPhase,
  countTransitionRecordsUsingPhase,
  deletePhaseRow,
  countTransitionRecordsForTransition,
  countFieldsForTransition,
  deleteTransitionCascade,
  countFieldsConditionalOn,
  deleteFieldRow,
  countFieldsUsingMenuSet,
  countOptionsForMenuSet,
  deleteMenuSetCascade,
  deleteMenuOptionRow
} from './repository'
import { ConflictError, NotFoundError, ValidationError } from '../../errors/AppError'

function slugify(str: string): string {
  const normalized = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 60)
  return normalized || 'fase'
}

function generateUniqueKey(displayName: string): string {
  const base = slugify(displayName)
  if (!keyExists(base)) return base
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}_${i}`
    if (!keyExists(candidate)) return candidate
  }
  return `${base}_${Date.now()}`
}

function assertCanDeactivate(phaseId: number, isInitial: boolean): void {
  if (isInitial) {
    const count = countActiveInitialPhases()
    if (count <= 1) {
      throw new ConflictError(
        `Impossibile disattivare: questa è l'unica fase iniziale del workflow. ` +
          `Imposta prima un'altra fase come iniziale.`
      )
    }
  }
  // Guard di blocco: la fase è "in uso" se è la fase corrente OPPURE la fase di provenienza
  // (previousPhaseId, ricordata da una pratica sospesa per "Riprendi pratica") di una pratica
  // non cestinata. Le pratiche cestinate non bloccano.
  const usageCount = countActivePracticesUsingPhase(phaseId)
  if (usageCount > 0) {
    throw new ConflictError(
      `Impossibile disattivare: ${usageCount} pratica/e attiva/e usano questa fase.`
    )
  }
}

export function listActivePhases(): PhaseListItem[] {
  return findActivePhases()
}

export function listAllPhases(): PhaseListItem[] {
  return findAllPhases()
}

export function listTransitions(): TransitionListItem[] {
  return findTransitions()
}

export function createPhase(input: CreatePhaseInput): PhaseListItem {
  const key = generateUniqueKey(input.displayName)
  const maxOrder = findMaxOrder()
  return createPhaseAtomic({
    key,
    displayName: input.displayName,
    category: input.category,
    isInitial: input.isInitial,
    isFinal: input.isFinal,
    isActive: input.isActive,
    order: maxOrder + 10
  })
}

export function updatePhase(input: UpdatePhaseInput): PhaseListItem {
  const existing = findPhaseById(input.id)
  if (!existing) throw new NotFoundError(`Fase ${input.id} non trovata`)

  if (!input.isActive && existing.isActive) {
    assertCanDeactivate(input.id, existing.isInitial)
  }

  return updatePhaseAtomic(
    input.id,
    {
      displayName: input.displayName,
      category: input.category,
      isInitial: input.isInitial,
      isFinal: input.isFinal,
      isActive: input.isActive
    },
    existing.isInitial
  )
}

export function setPhaseActive(input: SetPhaseActiveInput): { success: true } {
  const existing = findPhaseById(input.id)
  if (!existing) throw new NotFoundError(`Fase ${input.id} non trovata`)

  if (!input.isActive) {
    assertCanDeactivate(input.id, existing.isInitial)
  }

  setPhaseIsActive(input.id, input.isActive)
  return { success: true }
}

export function reorderPhases(input: ReorderPhasesInput): { success: true } {
  reorderPhasesAtomic(input)
  return { success: true }
}

function assertTransitionInputValid(
  fromPhaseId: number,
  toPhaseId: number | null,
  buttonLabel: string,
  isAutomatic: boolean,
  isResume: boolean,
  isActive: boolean,
  excludeId?: number
): void {
  const fromPhase = findPhaseById(fromPhaseId)
  if (!fromPhase) throw new NotFoundError(`Fase di partenza ${fromPhaseId} non trovata`)
  if (fromPhase.isFinal)
    throw new ValidationError(
      `Le fasi finali non hanno transizioni in uscita (la fase "${fromPhase.displayName}" è finale)`
    )

  if (isResume) {
    if (toPhaseId != null)
      throw new ValidationError(
        `Con "Ripresa" attiva la fase di destinazione deve essere vuota (il motore usa previousPhaseId della pratica)`
      )
    if (fromPhase.category !== 'suspended')
      throw new ValidationError(
        `Le transizioni di ripresa si configurano solo sulla fase Sospesa (categoria suspended)`
      )
    if (!buttonLabel.trim())
      throw new ValidationError(`L'etichetta pulsante è obbligatoria per le transizioni di ripresa`)
  }

  if (!isResume) {
    if (toPhaseId == null) throw new ValidationError(`La fase di destinazione è obbligatoria`)
    const toPhase = findPhaseById(toPhaseId)
    if (!toPhase) throw new NotFoundError(`Fase di destinazione ${toPhaseId} non trovata`)
    if (!toPhase.isActive)
      throw new ValidationError(
        `La fase di destinazione "${toPhase.displayName}" non è attiva; attivala prima di usarla in una transizione`
      )
  }

  if (!isAutomatic && !buttonLabel.trim())
    throw new ValidationError(`L'etichetta pulsante è obbligatoria`)

  if (isAutomatic && isActive) {
    const count = countActiveAutomaticTransitionsForPhase(fromPhaseId, excludeId)
    if (count > 0)
      throw new ConflictError(
        `Esiste già una transizione automatica attiva per la fase "${fromPhase.displayName}"; può essercene al massimo una`
      )
  }

  if (buttonLabel.trim() && transitionLabelExists(fromPhaseId, buttonLabel, excludeId))
    throw new ConflictError(
      `Esiste già una transizione con l'etichetta "${buttonLabel}" dalla fase "${fromPhase.displayName}"`
    )
}

export function createTransition(input: CreateTransitionInput): TransitionListItem {
  assertTransitionInputValid(
    input.fromPhaseId,
    input.toPhaseId,
    input.buttonLabel,
    input.isAutomatic,
    input.isResume,
    input.isActive
  )

  const effectiveRepeatable =
    input.toPhaseId != null && input.toPhaseId === input.fromPhaseId ? true : input.isRepeatable

  const maxOrder = findMaxTransitionOrderForPhase(input.fromPhaseId)
  const id = insertTransition({
    fromPhaseId: input.fromPhaseId,
    toPhaseId: input.toPhaseId,
    buttonLabel: input.buttonLabel,
    order: maxOrder + 1,
    isActive: input.isActive,
    isRepeatable: effectiveRepeatable,
    isAutomatic: input.isAutomatic,
    isResume: input.isResume
  })

  const result = findTransitionEnrichedById(id)
  if (!result) throw new Error('Errore interno: transizione non trovata dopo la creazione')
  return result
}

export function updateTransition(input: UpdateTransitionInput): TransitionListItem {
  const existing = findTransitionById(input.id)
  if (!existing) throw new NotFoundError(`Transizione ${input.id} non trovata`)

  assertTransitionInputValid(
    input.fromPhaseId,
    input.toPhaseId,
    input.buttonLabel,
    input.isAutomatic,
    input.isResume,
    input.isActive,
    input.id
  )

  const effectiveRepeatable =
    input.toPhaseId != null && input.toPhaseId === input.fromPhaseId ? true : input.isRepeatable

  updateTransitionFields(input.id, {
    fromPhaseId: input.fromPhaseId,
    toPhaseId: input.toPhaseId,
    buttonLabel: input.buttonLabel,
    isRepeatable: effectiveRepeatable,
    isAutomatic: input.isAutomatic,
    isResume: input.isResume,
    isActive: input.isActive
  })

  const result = findTransitionEnrichedById(input.id)
  if (!result) throw new Error("Errore interno: transizione non trovata dopo l'aggiornamento")
  return result
}

export function setTransitionActive(input: SetTransitionActiveInput): { success: true } {
  const existing = findTransitionById(input.id)
  if (!existing) throw new NotFoundError(`Transizione ${input.id} non trovata`)

  if (input.isActive && existing.isAutomatic) {
    const count = countActiveAutomaticTransitionsForPhase(existing.fromPhaseId, input.id)
    if (count > 0)
      throw new ConflictError(
        `Impossibile attivare: esiste già una transizione automatica attiva per questa fase`
      )
  }

  setTransitionIsActive(input.id, input.isActive)
  return { success: true }
}

export function reorderTransitions(input: ReorderTransitionsInput): { success: true } {
  reorderTransitionsAtomic(input)
  return { success: true }
}

// ---------- Menu sets ----------

function generateUniqueMenuSetKey(label: string): string {
  const base = slugify(label)
  if (!menuSetKeyExists(base)) return base
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}_${i}`
    if (!menuSetKeyExists(candidate)) return candidate
  }
  return `${base}_${Date.now()}`
}

export function listMenuSets(): MenuSetListItem[] {
  return findAllMenuSets()
}

export function createMenuSet(input: CreateMenuSetInput): MenuSetListItem {
  const key = generateUniqueMenuSetKey(input.label)
  const id = insertMenuSet({ key, label: input.label })
  const created = findAllMenuSets().find((s) => s.id === id)
  if (!created) throw new Error('Errore interno: menu set non trovato dopo la creazione')
  return created
}

export function updateMenuSet(input: UpdateMenuSetInput): MenuSetListItem {
  const existing = findMenuSetById(input.id)
  if (!existing) throw new NotFoundError(`Menu set ${input.id} non trovato`)
  updateMenuSetLabel(input.id, input.label)
  const updated = findAllMenuSets().find((s) => s.id === input.id)
  if (!updated) throw new Error('Errore interno: menu set non trovato dopo il salvataggio')
  return updated
}

// ---------- Menu options ----------

function toMenuOptionListItem(opt: {
  id: number
  menuSetId: number
  label: string
  value: string
  order: number
  isActive: boolean
}): MenuOptionListItem {
  return {
    id: opt.id,
    menuSetId: opt.menuSetId,
    label: opt.label,
    value: opt.value,
    order: opt.order,
    isActive: opt.isActive
  }
}

export function createMenuOption(input: CreateMenuOptionInput): MenuOptionListItem {
  const set = findMenuSetById(input.menuSetId)
  if (!set) throw new NotFoundError(`Menu set ${input.menuSetId} non trovato`)

  if (!input.value.trim()) throw new ValidationError('Il valore è obbligatorio')

  if (menuOptionValueExists(input.menuSetId, input.value)) {
    throw new ConflictError(
      `Esiste già un'opzione con il valore "${input.value}" in questo menu`
    )
  }

  const maxOrder = findMaxMenuOptionOrder(input.menuSetId)
  const id = insertMenuOption({
    menuSetId: input.menuSetId,
    label: input.label,
    value: input.value,
    order: maxOrder + 1,
    isActive: true
  })

  const opt = findMenuOptionById(id)
  if (!opt) throw new Error("Errore interno: opzione non trovata dopo la creazione")
  return toMenuOptionListItem(opt)
}

export function updateMenuOption(input: UpdateMenuOptionInput): MenuOptionListItem {
  const existing = findMenuOptionById(input.id)
  if (!existing) throw new NotFoundError(`Opzione ${input.id} non trovata`)
  updateMenuOptionLabel(input.id, input.label)
  const opt = findMenuOptionById(input.id)!
  return toMenuOptionListItem(opt)
}

// Note di disattivazione basate sull'uso reale (scan JSON rigoroso). La disattivazione
// resta consentita e non corrompe i dati esistenti: li nasconde solo dai nuovi form.
// Lo scan serve a informare con precisione (quante volte l'elemento è già usato).

function fieldDeactivationNote(field: {
  id: number
  key: string
  scope: string
  transitionId: number | null
}): string {
  const used = countSavedValuesForFieldKey(field)
  const controllers = countFieldsConditionalOn(field.id)
  const ctrl =
    controllers > 0
      ? ` È controllore di ${controllers} camp${controllers === 1 ? 'o' : 'i'} a visibilità condizionale.`
      : ''
  const unit1 = field.scope === 'transition' ? 'registrazione di transizione' : 'pratica'
  const unitN = field.scope === 'transition' ? 'registrazioni di transizione' : 'pratiche'
  if (used > 0) {
    return (
      `Campo disattivato. Risulta valorizzato in ${used} ${used === 1 ? unit1 : unitN}: ` +
      `i valori restano invariati e il campo non comparirà nei nuovi inserimenti.${ctrl}`
    )
  }
  return `Campo disattivato. Non risulta valorizzato in alcuna pratica; non comparirà nei nuovi inserimenti.${ctrl}`
}

function optionDeactivationNote(option: { menuSetId: number; value: string }): string {
  let used = 0
  for (const f of findFieldsUsingMenuSet(option.menuSetId)) {
    used += countSavedValueForFieldKeyEquals(f, option.value)
  }
  if (used > 0) {
    return (
      `Opzione disattivata. È già scelta in ${used} ${used === 1 ? 'valore salvato' : 'valori salvati'}: ` +
      'restano invariati; non sarà più selezionabile nei nuovi inserimenti.'
    )
  }
  return 'Opzione disattivata. Non risulta scelta in alcun dato salvato; non sarà più selezionabile nei nuovi inserimenti.'
}

export function setMenuOptionActive(
  input: SetMenuOptionActiveInput
): { success: true; warning?: string } {
  const existing = findMenuOptionById(input.id)
  if (!existing) throw new NotFoundError(`Opzione ${input.id} non trovata`)
  // Disattivazione sempre consentita (reversibile, non corrompe i dati). Alla
  // disattivazione la nota è basata sull'uso reale: scan di customValues /
  // transition_records.values per contare le scelte già salvate di questa opzione.
  setMenuOptionIsActive(input.id, input.isActive)
  return input.isActive
    ? { success: true }
    : { success: true, warning: optionDeactivationNote(existing) }
}

export function reorderMenuOptions(input: ReorderMenuOptionsInput): { success: true } {
  reorderMenuOptionsAtomic(input)
  return { success: true }
}

// ---------- Field defs ----------

function generateUniqueFieldKey(
  label: string,
  scope: 'general' | 'transition',
  transitionId: number | null
): string {
  const base = slugify(label) || 'campo'
  if (!fieldKeyExistsInContainer(base, scope, transitionId)) return base
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}_${i}`
    if (!fieldKeyExistsInContainer(candidate, scope, transitionId)) return candidate
  }
  return `${base}_${Date.now()}`
}

function assertConditionalInvariant(
  conditionalOnFieldId: number | null,
  conditionalValue: string | null,
  scope: 'general' | 'transition',
  transitionId: number | null,
  selfId?: number
): void {
  if ((conditionalOnFieldId == null) !== (conditionalValue == null)) {
    throw new ValidationError(
      'Il campo controllore e il valore della condizione devono essere entrambi valorizzati o entrambi vuoti'
    )
  }

  if (conditionalOnFieldId == null) return

  const controller = findFieldById(conditionalOnFieldId)
  if (!controller) throw new NotFoundError(`Campo controllore ${conditionalOnFieldId} non trovato`)

  if (selfId !== undefined && controller.id === selfId)
    throw new ValidationError('Un campo non può essere controllore di sé stesso')

  if (controller.type !== 'menu')
    throw new ValidationError('Il campo controllore deve essere di tipo menu a tendina')

  if (!controller.isActive)
    throw new ValidationError('Il campo controllore deve essere attivo')

  // Stesso contenitore: stesso scope e stesso transitionId
  const sameContainer =
    controller.scope === scope &&
    (scope === 'general'
      ? controller.transitionId == null
      : controller.transitionId === transitionId)
  if (!sameContainer)
    throw new ValidationError('Il campo controllore deve essere nello stesso contenitore del campo')

  if (controller.menuSetId == null)
    throw new ValidationError('Il campo controllore (menu) non ha un menu set associato')

  const validOption = findActiveMenuOptionByValue(controller.menuSetId, conditionalValue!)
  if (!validOption)
    throw new ValidationError(
      `Il valore "${conditionalValue}" non corrisponde a nessuna opzione attiva del menu set del campo controllore`
    )

  // Ciclo diretto: il controllore è a sua volta condizionato da questo campo
  if (selfId !== undefined && controller.conditionalOnFieldId === selfId)
    throw new ValidationError(
      'Ciclo rilevato: il campo controllore è a sua volta condizionato da questo campo'
    )
}

export function listFields(filter?: ListFieldsFilter): FieldDefListItem[] {
  return findFieldsByFilter(filter)
}

export function createField(input: CreateFieldInput): FieldDefListItem {
  if (input.scope === 'transition') {
    if (input.transitionId == null)
      throw new ValidationError('Per i campi di transizione la transizione è obbligatoria')
    const t = findTransitionById(input.transitionId)
    if (!t) throw new NotFoundError(`Transizione ${input.transitionId} non trovata`)
  } else {
    if (input.transitionId != null)
      throw new ValidationError('Per i campi generali la transizione deve essere vuota')
  }

  if (input.type === 'pec') {
    if (input.menuSetId != null)
      throw new ValidationError('Il menu set non è consentito per i campi di tipo PEC')
  } else if (input.type === 'menu') {
    if (input.menuSetId == null)
      throw new ValidationError('Per i campi di tipo menu è obbligatorio selezionare un menu set')
    const ms = findMenuSetById(input.menuSetId)
    if (!ms) throw new NotFoundError(`Menu set ${input.menuSetId} non trovato`)
  } else {
    if (input.menuSetId != null)
      throw new ValidationError('Il menu set può essere impostato solo per campi di tipo menu')
  }

  const scope = input.scope
  const transitionId = input.transitionId ?? null

  assertConditionalInvariant(
    input.conditionalOnFieldId ?? null,
    input.conditionalValue ?? null,
    scope,
    transitionId
    // selfId undefined: il campo non esiste ancora, nessun ciclo possibile
  )

  const key = generateUniqueFieldKey(input.label, scope, transitionId)
  const maxOrder = findMaxFieldOrderInContainer(scope, transitionId)

  const id = insertField({
    scope,
    transitionId,
    key,
    label: input.label,
    type: input.type,
    required: input.required,
    visibleInTable: input.visibleInTable,
    usableInFilter: input.usableInFilter,
    includeInExport: input.includeInExport,
    order: maxOrder + 1,
    isActive: true,
    menuSetId: input.menuSetId ?? null,
    conditionalOnFieldId: input.conditionalOnFieldId ?? null,
    conditionalValue: input.conditionalValue ?? null
  })

  const result = findFieldsByFilter().find((f) => f.id === id)
  if (!result) throw new Error('Errore interno: campo non trovato dopo la creazione')
  return result
}

// Guard sul cambio di menuSetId di un campo menu: blocca se dei valori già
// salvati (customValues/transition_records.values) o dei conditionalValue di campi
// dipendenti non esistono tra le opzioni del nuovo menu (resterebbero incoerenti).
// Cambiare verso un menu che contiene comunque quei valori è consentito.
function assertMenuChangeDoesNotOrphan(
  field: { id: number; key: string; scope: string; transitionId: number | null },
  newMenuSetId: number
): void {
  const newValues = menuOptionValuesForSet(newMenuSetId)
  const orphanSaved = savedValuesForFieldKey(field).filter((v) => !newValues.has(v))
  const orphanConds = conditionalValuesDependingOn(field.id).filter((v) => !newValues.has(v))
  if (orphanSaved.length === 0 && orphanConds.length === 0) return

  const parts: string[] = []
  if (orphanSaved.length > 0)
    parts.push(`${orphanSaved.length} valore/i già salvato/i su pratiche`)
  if (orphanConds.length > 0)
    parts.push(`${orphanConds.length} condizione/i di visibilità di altri campi`)
  throw new ConflictError(
    `Impossibile cambiare il menu di questo campo: ${parts.join(' e ')} non esiste/ono ` +
      'nel nuovo menu e resterebbe/ro incoerente/i. Crea un nuovo campo oppure disattiva questo.'
  )
}

export function updateField(input: UpdateFieldInput): FieldDefListItem {
  const existing = findFieldById(input.id)
  if (!existing) throw new NotFoundError(`Campo ${input.id} non trovato`)

  if (input.type === 'pec') {
    if (input.menuSetId != null)
      throw new ValidationError('Il menu set non è consentito per i campi di tipo PEC')
  } else if (input.type === 'menu') {
    if (input.menuSetId == null)
      throw new ValidationError('Per i campi di tipo menu è obbligatorio selezionare un menu set')
    const ms = findMenuSetById(input.menuSetId)
    if (!ms) throw new NotFoundError(`Menu set ${input.menuSetId} non trovato`)
    // Cambio del menu su un campo già di tipo menu: blocca se orfanerebbe valori
    // salvati o condizioni dipendenti (vedi assertMenuChangeDoesNotOrphan).
    if (existing.type === 'menu' && existing.menuSetId !== input.menuSetId) {
      assertMenuChangeDoesNotOrphan(existing, input.menuSetId)
    }
  } else {
    if (input.menuSetId != null)
      throw new ValidationError('Il menu set può essere impostato solo per campi di tipo menu')
  }

  assertConditionalInvariant(
    input.conditionalOnFieldId ?? null,
    input.conditionalValue ?? null,
    existing.scope as 'general' | 'transition',
    existing.transitionId,
    input.id
  )

  updateFieldFields(input.id, {
    label: input.label,
    type: input.type,
    required: input.required,
    visibleInTable: input.visibleInTable,
    usableInFilter: input.usableInFilter,
    includeInExport: input.includeInExport,
    menuSetId: input.menuSetId ?? null,
    conditionalOnFieldId: input.conditionalOnFieldId ?? null,
    conditionalValue: input.conditionalValue ?? null
  })

  const result = findFieldsByFilter().find((f) => f.id === input.id)
  if (!result) throw new Error('Errore interno: campo non trovato dopo il salvataggio')
  return result
}

export function setFieldActive(
  input: SetFieldActiveInput
): { success: true; warning?: string } {
  const existing = findFieldById(input.id)
  if (!existing) throw new NotFoundError(`Campo ${input.id} non trovato`)
  // Disattivazione sempre consentita (reversibile, non corrompe i dati). Alla
  // disattivazione la nota è basata sull'uso reale: scan di customValues /
  // transition_records.values per contare le pratiche che valorizzano il campo, più
  // gli eventuali campi che lo usano come controllore condizionale (restano intatti:
  // E5 tratta il controllore inattivo come "condizione non soddisfatta" a runtime).
  setFieldIsActive(input.id, input.isActive)
  return input.isActive
    ? { success: true }
    : { success: true, warning: fieldDeactivationNote(existing) }
}

export function reorderFields(input: ReorderFieldsInput): { success: true } {
  reorderFieldsAtomic(input)
  return { success: true }
}

// ---------- Eliminazione fisica (C-002) ----------
// Consentita solo se l'entità non è in uso (altrimenti ConflictError con messaggio).
// Cascata per i figli posseduti (menu set→opzioni, transizione→campi), in transazione.
// Nessun HistoryEvent (config, non pratica): tracciato via log dal controller/DB.

export function deletePhase(input: DeleteByIdInput): DeleteResponse {
  const phase = findPhaseById(input.id)
  if (!phase) throw new NotFoundError(`Fase ${input.id} non trovata`)
  if (phase.isInitial) {
    throw new ConflictError('Non puoi eliminare la fase iniziale. Imposta prima un’altra fase come iniziale.')
  }
  if (countTransitionsUsingPhase(input.id) > 0) {
    throw new ConflictError('Fase usata da una o più transizioni: eliminale o riassegnale prima.')
  }
  if (countAnyPracticesUsingPhase(input.id) > 0) {
    throw new ConflictError('Fase usata da una o più pratiche (anche nel cestino): impossibile eliminarla.')
  }
  if (countHistoryUsingPhase(input.id) > 0 || countTransitionRecordsUsingPhase(input.id) > 0) {
    throw new ConflictError('Fase presente nello storico di alcune pratiche: impossibile eliminarla.')
  }
  deletePhaseRow(input.id)
  return { success: true }
}

export function deleteTransition(input: DeleteByIdInput): DeleteResponse {
  const transition = findTransitionById(input.id)
  if (!transition) throw new NotFoundError(`Transizione ${input.id} non trovata`)
  if (countTransitionRecordsForTransition(input.id) > 0) {
    throw new ConflictError('Transizione già eseguita da una o più pratiche: impossibile eliminarla.')
  }
  const deletedChildren = countFieldsForTransition(input.id)
  deleteTransitionCascade(input.id)
  return { success: true, deletedChildren }
}

export function deleteField(input: DeleteByIdInput): DeleteResponse {
  const field = findFieldById(input.id)
  if (!field) throw new NotFoundError(`Campo ${input.id} non trovato`)
  if (countFieldsConditionalOn(input.id) > 0) {
    throw new ConflictError('Campo usato come condizione da un altro campo: rimuovi prima la dipendenza.')
  }
  deleteFieldRow(input.id)
  return { success: true }
}

export function deleteMenuSet(input: DeleteByIdInput): DeleteResponse {
  const menuSet = findMenuSetById(input.id)
  if (!menuSet) throw new NotFoundError(`Menu ${input.id} non trovato`)
  if (countFieldsUsingMenuSet(input.id) > 0) {
    throw new ConflictError('Menu usato da uno o più campi: scollegalo prima di eliminarlo.')
  }
  const deletedChildren = countOptionsForMenuSet(input.id)
  deleteMenuSetCascade(input.id)
  return { success: true, deletedChildren }
}

export function deleteMenuOption(input: DeleteByIdInput): DeleteResponse {
  const option = findMenuOptionById(input.id)
  if (!option) throw new NotFoundError(`Opzione ${input.id} non trovata`)
  deleteMenuOptionRow(input.id)
  return { success: true }
}
