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
  ReorderTransitionsInput
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
  reorderTransitionsAtomic
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
