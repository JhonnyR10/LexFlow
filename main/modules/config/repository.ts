import { eq, asc, and, ne, sql } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { phases, transitions } from '../../database/schema'
import type { PhaseListItem, TransitionListItem } from '../../../shared/ipc'
import type { NewPhase } from '../../database/schema/phases'
import type { NewTransition, Transition } from '../../database/schema/transitions'

function toListItem(row: typeof phases.$inferSelect): PhaseListItem {
  return {
    id: row.id,
    key: row.key,
    displayName: row.displayName,
    category: row.category as PhaseListItem['category'],
    order: row.order,
    isInitial: row.isInitial,
    isFinal: row.isFinal,
    isActive: row.isActive
  }
}

export function findActivePhases(): PhaseListItem[] {
  return getDb()
    .select()
    .from(phases)
    .where(eq(phases.isActive, true))
    .orderBy(asc(phases.order))
    .all()
    .map(toListItem)
}

export function findAllPhases(): PhaseListItem[] {
  return getDb()
    .select()
    .from(phases)
    .orderBy(asc(phases.order))
    .all()
    .map(toListItem)
}

export function findPhaseById(id: number): typeof phases.$inferSelect | undefined {
  return getDb().select().from(phases).where(eq(phases.id, id)).get()
}

export function findMaxOrder(): number {
  const result = getDb()
    .select({ maxOrder: sql<number>`MAX(${phases.order})` })
    .from(phases)
    .get()
  return result?.maxOrder ?? 0
}

export function countActiveInitialPhases(): number {
  const result = getDb()
    .select({ c: sql<number>`COUNT(*)` })
    .from(phases)
    .where(and(eq(phases.isInitial, true), eq(phases.isActive, true)))
    .get()
  return result?.c ?? 0
}

export function keyExists(key: string): boolean {
  return getDb().select({ id: phases.id }).from(phases).where(eq(phases.key, key)).get() != null
}

// Crea una fase in transazione: resetta isInitial sulle altre se necessario.
// Business rule (reset isInitial) portata qui per tenere il tx atomico senza passare tx ai repo.
export function createPhaseAtomic(data: NewPhase): PhaseListItem {
  return getDb().transaction((tx) => {
    if (data.isInitial) {
      tx.update(phases).set({ isInitial: false }).where(eq(phases.isInitial, true)).run()
    }
    const [row] = tx.insert(phases).values(data).returning().all()
    return toListItem(row)
  })
}

// Aggiorna una fase in transazione: resetta isInitial sulle altre se necessario.
export function updatePhaseAtomic(
  id: number,
  data: {
    displayName: string
    category: PhaseListItem['category']
    isInitial: boolean
    isFinal: boolean
    isActive: boolean
  },
  wasInitial: boolean
): PhaseListItem {
  return getDb().transaction((tx) => {
    if (data.isInitial && !wasInitial) {
      tx.update(phases)
        .set({ isInitial: false })
        .where(and(eq(phases.isInitial, true), ne(phases.id, id)))
        .run()
    }
    const [row] = tx.update(phases).set(data).where(eq(phases.id, id)).returning().all()
    return toListItem(row)
  })
}

export function setPhaseIsActive(id: number, isActive: boolean): void {
  getDb().update(phases).set({ isActive }).where(eq(phases.id, id)).run()
}

export function reorderPhasesAtomic(items: { id: number; order: number }[]): void {
  getDb().transaction((tx) => {
    for (const item of items) {
      tx.update(phases).set({ order: item.order }).where(eq(phases.id, item.id)).run()
    }
  })
}

export function findTransitions(): TransitionListItem[] {
  const db = getDb()

  const rows = db
    .select({
      id: transitions.id,
      fromPhaseId: transitions.fromPhaseId,
      fromPhaseKey: phases.key,
      fromPhaseDisplayName: phases.displayName,
      fromPhaseOrder: phases.order,
      toPhaseId: transitions.toPhaseId,
      buttonLabel: transitions.buttonLabel,
      order: transitions.order,
      isActive: transitions.isActive,
      isRepeatable: transitions.isRepeatable,
      isAutomatic: transitions.isAutomatic,
      isResume: transitions.isResume
    })
    .from(transitions)
    .innerJoin(phases, eq(transitions.fromPhaseId, phases.id))
    .orderBy(asc(phases.order), asc(transitions.order))
    .all()

  const allPhases = db
    .select({ id: phases.id, key: phases.key, displayName: phases.displayName })
    .from(phases)
    .all()
  const phaseInfoById = new Map(allPhases.map((p) => [p.id, { key: p.key, displayName: p.displayName }]))

  return rows.map((r) => ({
    ...r,
    toPhaseKey: r.toPhaseId != null ? (phaseInfoById.get(r.toPhaseId)?.key ?? null) : null,
    toPhaseDisplayName: r.toPhaseId != null ? (phaseInfoById.get(r.toPhaseId)?.displayName ?? null) : null
  }))
}

export function findTransitionById(id: number): Transition | undefined {
  return getDb().select().from(transitions).where(eq(transitions.id, id)).get()
}

export function findTransitionEnrichedById(id: number): TransitionListItem | undefined {
  const db = getDb()

  const row = db
    .select({
      id: transitions.id,
      fromPhaseId: transitions.fromPhaseId,
      fromPhaseKey: phases.key,
      fromPhaseDisplayName: phases.displayName,
      fromPhaseOrder: phases.order,
      toPhaseId: transitions.toPhaseId,
      buttonLabel: transitions.buttonLabel,
      order: transitions.order,
      isActive: transitions.isActive,
      isRepeatable: transitions.isRepeatable,
      isAutomatic: transitions.isAutomatic,
      isResume: transitions.isResume
    })
    .from(transitions)
    .innerJoin(phases, eq(transitions.fromPhaseId, phases.id))
    .where(eq(transitions.id, id))
    .get()

  if (!row) return undefined

  const toPhase =
    row.toPhaseId != null
      ? db
          .select({ key: phases.key, displayName: phases.displayName })
          .from(phases)
          .where(eq(phases.id, row.toPhaseId))
          .get()
      : null

  return {
    ...row,
    toPhaseKey: toPhase?.key ?? null,
    toPhaseDisplayName: toPhase?.displayName ?? null
  }
}

export function findMaxTransitionOrderForPhase(fromPhaseId: number): number {
  const result = getDb()
    .select({ maxOrder: sql<number>`MAX(${transitions.order})` })
    .from(transitions)
    .where(eq(transitions.fromPhaseId, fromPhaseId))
    .get()
  return result?.maxOrder ?? 0
}

export function countActiveAutomaticTransitionsForPhase(
  fromPhaseId: number,
  excludeId?: number
): number {
  const result = getDb()
    .select({ c: sql<number>`COUNT(*)` })
    .from(transitions)
    .where(
      and(
        eq(transitions.fromPhaseId, fromPhaseId),
        eq(transitions.isAutomatic, true),
        eq(transitions.isActive, true),
        excludeId !== undefined ? ne(transitions.id, excludeId) : undefined
      )
    )
    .get()
  return result?.c ?? 0
}

export function transitionLabelExists(
  fromPhaseId: number,
  buttonLabel: string,
  excludeId?: number
): boolean {
  return (
    getDb()
      .select({ id: transitions.id })
      .from(transitions)
      .where(
        and(
          eq(transitions.fromPhaseId, fromPhaseId),
          eq(transitions.buttonLabel, buttonLabel),
          excludeId !== undefined ? ne(transitions.id, excludeId) : undefined
        )
      )
      .get() != null
  )
}

export function insertTransition(data: NewTransition): number {
  const [row] = getDb().insert(transitions).values(data).returning({ id: transitions.id }).all()
  return row.id
}

export function updateTransitionFields(
  id: number,
  data: {
    fromPhaseId: number
    toPhaseId: number | null
    buttonLabel: string
    isRepeatable: boolean
    isAutomatic: boolean
    isResume: boolean
    isActive: boolean
  }
): void {
  getDb().update(transitions).set(data).where(eq(transitions.id, id)).run()
}

export function setTransitionIsActive(id: number, isActive: boolean): void {
  getDb().update(transitions).set({ isActive }).where(eq(transitions.id, id)).run()
}

export function reorderTransitionsAtomic(items: { id: number; order: number }[]): void {
  getDb().transaction((tx) => {
    for (const item of items) {
      tx.update(transitions).set({ order: item.order }).where(eq(transitions.id, item.id)).run()
    }
  })
}
