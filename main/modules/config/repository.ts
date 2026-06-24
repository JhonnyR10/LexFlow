import { eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { phases, transitions } from '../../database/schema'
import type { PhaseListItem, TransitionListItem } from '../../../shared/ipc'

export function findActivePhases(): PhaseListItem[] {
  const db = getDb()
  return db
    .select({
      id: phases.id,
      key: phases.key,
      displayName: phases.displayName,
      category: phases.category,
      order: phases.order,
      isInitial: phases.isInitial,
      isFinal: phases.isFinal,
      isActive: phases.isActive
    })
    .from(phases)
    .where(eq(phases.isActive, true))
    .orderBy(phases.order)
    .all()
}

export function findTransitions(): TransitionListItem[] {
  const db = getDb()

  // Join transitions → phases su fromPhaseId per ottenere fromPhaseKey.
  // toPhaseKey risolto in memoria: set piccolo (≤ 13 fasi std + poche custom).
  const rows = db
    .select({
      id: transitions.id,
      fromPhaseId: transitions.fromPhaseId,
      fromPhaseKey: phases.key,
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
    .orderBy(transitions.fromPhaseId, transitions.order)
    .all()

  const allPhases = db.select({ id: phases.id, key: phases.key }).from(phases).all()
  const phaseKeyById = new Map<number, string>(allPhases.map((p) => [p.id, p.key]))

  return rows.map((r) => ({
    ...r,
    toPhaseKey: r.toPhaseId != null ? (phaseKeyById.get(r.toPhaseId) ?? null) : null
  }))
}
