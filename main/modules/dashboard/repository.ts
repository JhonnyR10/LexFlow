import { and, count, eq } from 'drizzle-orm'
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

export interface AlertCandidateRow {
  practiceId: number
  codiceIstanza: string
  nomeIstanza: string
  dataDeposito: string | null
  currentPhaseCategory: string
  currentPhaseDisplayName: string
}

// Pratiche attive (non cestinate) in fase NON finale, candidate al calcolo alert
// (S8.2). La logica di severità/motivazioni vive nel service: qui solo lettura.
export function findActivePracticesForAlerts(): AlertCandidateRow[] {
  return getDb()
    .select({
      practiceId:              practices.id,
      codiceIstanza:           practices.codiceIstanza,
      nomeIstanza:             practices.nomeIstanza,
      dataDeposito:            practices.dataDeposito,
      currentPhaseCategory:    phases.category,
      currentPhaseDisplayName: phases.displayName,
    })
    .from(practices)
    .innerJoin(phases, eq(practices.currentPhaseId, phases.id))
    .where(and(eq(practices.isTrashed, false), eq(phases.isFinal, false)))
    .all()
}
