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
  ListFieldsFilter
} from '../../../shared/ipc'
import {
  findActivePhases,
  findAllPhases,
  findTransitions,
  findPhaseById,
  findMaxOrder,
  countActiveInitialPhases,
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
  reorderFieldsAtomic
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
  // TODO: verificare che nessuna pratica attiva si trovi in questa fase.
  // Implementare quando esiste la tabella practices:
  // const usageCount = countActivePracticesInPhase(phaseId)
  // if (usageCount > 0) {
  //   throw new ConflictError(`Impossibile disattivare: ${usageCount} pratica/e attiva/e si trovano in questa fase.`)
  // }
  void phaseId
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

export function setMenuOptionActive(input: SetMenuOptionActiveInput): { success: true } {
  const existing = findMenuOptionById(input.id)
  if (!existing) throw new NotFoundError(`Opzione ${input.id} non trovata`)
  // TODO: verificare che l'opzione non sia in uso da pratiche prima di disattivarla.
  // Implementare quando esiste la tabella practices con i campi configurabili.
  setMenuOptionIsActive(input.id, input.isActive)
  return { success: true }
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

  if (input.type === 'menu') {
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
    menuSetId: input.menuSetId ?? null
  })

  const result = findFieldsByFilter().find((f) => f.id === id)
  if (!result) throw new Error('Errore interno: campo non trovato dopo la creazione')
  return result
}

export function updateField(input: UpdateFieldInput): FieldDefListItem {
  const existing = findFieldById(input.id)
  if (!existing) throw new NotFoundError(`Campo ${input.id} non trovato`)

  if (input.type === 'menu') {
    if (input.menuSetId == null)
      throw new ValidationError('Per i campi di tipo menu è obbligatorio selezionare un menu set')
    const ms = findMenuSetById(input.menuSetId)
    if (!ms) throw new NotFoundError(`Menu set ${input.menuSetId} non trovato`)
  } else {
    if (input.menuSetId != null)
      throw new ValidationError('Il menu set può essere impostato solo per campi di tipo menu')
  }

  updateFieldFields(input.id, {
    label: input.label,
    type: input.type,
    required: input.required,
    visibleInTable: input.visibleInTable,
    usableInFilter: input.usableInFilter,
    includeInExport: input.includeInExport,
    menuSetId: input.menuSetId ?? null
  })

  const result = findFieldsByFilter().find((f) => f.id === input.id)
  if (!result) throw new Error('Errore interno: campo non trovato dopo il salvataggio')
  return result
}

export function setFieldActive(input: SetFieldActiveInput): { success: true } {
  const existing = findFieldById(input.id)
  if (!existing) throw new NotFoundError(`Campo ${input.id} non trovato`)
  // TODO: verificare che il campo non sia valorizzato in pratiche prima di disattivarlo.
  // Implementare quando esiste la tabella practices.
  setFieldIsActive(input.id, input.isActive)
  return { success: true }
}

export function reorderFields(input: ReorderFieldsInput): { success: true } {
  reorderFieldsAtomic(input)
  return { success: true }
}
