import { count, eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { practices, phases } from '../../database/schema'

export interface PhaseCountRow {
  phaseId: number
  phaseKey: string
  displayName: string
  category: string
  count: number
}

// Conteggio pratiche attive (non cestinate) raggruppate per fase corrente.
// L'inner join practices→phases + GROUP BY esclude naturalmente le fasi senza
// pratiche attive (card dinamiche, S8.1). Ordinate per phases.order.
export function findActivePhaseCounts(): PhaseCountRow[] {
  return getDb()
    .select({
      phaseId:     phases.id,
      phaseKey:    phases.key,
      displayName: phases.displayName,
      category:    phases.category,
      count:       count(practices.id),
    })
    .from(practices)
    .innerJoin(phases, eq(practices.currentPhaseId, phases.id))
    .where(eq(practices.isTrashed, false))
    .groupBy(phases.id)
    .orderBy(phases.order)
    .all()
}
