import type {
  PhaseListItem,
  CreatePhaseInput,
  UpdatePhaseInput,
  SetPhaseActiveInput,
  ReorderPhasesInput,
  TransitionListItem
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
  reorderPhasesAtomic
} from './repository'
import { ConflictError, NotFoundError } from '../../errors/AppError'

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
