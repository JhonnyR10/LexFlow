import { and, count, eq, sql } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { practices, phases, documents } from '../../database/schema'

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

export interface OpenPracticeRow {
  practiceId: number
  codiceIstanza: string
  nomeIstanza: string
  dataDeposito: string | null
  currentPhaseCategory: string
  currentPhaseDisplayName: string
}

// Pratiche aperte: attive (non cestinate) in fase NON finale. Set di candidati
// condiviso dagli alert (S8.2) e dall'anzianità (S8.4); la logica (severità,
// ordinamento per età) vive nel service. Qui solo lettura.
export function findActiveOpenPracticesWithDeposit(): OpenPracticeRow[] {
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

export interface OpenPracticeDocFlagsRow {
  practiceId: number
  codiceIstanza: string
  nomeIstanza: string
  currentPhaseCategory: string
  currentPhaseDisplayName: string
  hasDecreto: boolean
  hasFattura: boolean
}

// Pratiche aperte (attive, fase non finale) con flag di presenza dei documenti
// per kind, per la sezione «Documenti mancanti» (S8.5). LEFT JOIN su documents +
// aggregazione condizionale: `max(case…)` vale 1 se esiste almeno un documento
// di quel kind, 0 altrimenti (0 anche quando la pratica non ha documenti, per il
// left join). La decisione di cosa è «atteso» (per category) vive nel service.
export function findActiveOpenPracticesWithDocFlags(): OpenPracticeDocFlagsRow[] {
  const rows = getDb()
    .select({
      practiceId:              practices.id,
      codiceIstanza:           practices.codiceIstanza,
      nomeIstanza:             practices.nomeIstanza,
      currentPhaseCategory:    phases.category,
      currentPhaseDisplayName: phases.displayName,
      hasDecreto:              sql<number>`max(case when ${documents.kind} = 'decreto' then 1 else 0 end)`,
      hasFattura:              sql<number>`max(case when ${documents.kind} = 'fattura' then 1 else 0 end)`,
    })
    .from(practices)
    .innerJoin(phases, eq(practices.currentPhaseId, phases.id))
    .leftJoin(documents, eq(documents.practiceId, practices.id))
    .where(and(eq(practices.isTrashed, false), eq(phases.isFinal, false)))
    .groupBy(practices.id)
    .all()

  return rows.map(r => ({
    practiceId:              r.practiceId,
    codiceIstanza:           r.codiceIstanza,
    nomeIstanza:             r.nomeIstanza,
    currentPhaseCategory:    r.currentPhaseCategory,
    currentPhaseDisplayName: r.currentPhaseDisplayName,
    hasDecreto:              r.hasDecreto > 0,
    hasFattura:              r.hasFattura > 0,
  }))
}
