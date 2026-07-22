import { count, desc, eq, sql, sum } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { practices, collaboratori, professionisti, documents } from '../../database/schema'

// Query aggregate per il Report (S9.2). Tutte ristrette alle pratiche ATTIVE
// (isTrashed=false); le fasi finali restano incluse (dati rilevanti per i totali).
// I conteggi per fase riusano `findActivePhaseCounts` di dashboard (non qui).

export interface ReportTotalsRow {
  practicesCount: number
  importoRichiesto: number | null
  importoConcesso: number | null
  importoFatturato: number | null
  importoLiquidato: number | null
}

export function findReportTotals(): ReportTotalsRow {
  const row = getDb()
    .select({
      practicesCount:   count(practices.id),
      importoRichiesto: sum(practices.importoRichiesto),
      importoConcesso:  sum(practices.importoConcesso),
      importoFatturato: sum(practices.importoFatturato),
      importoLiquidato: sum(practices.importoLiquidato),
    })
    .from(practices)
    .where(eq(practices.isTrashed, false))
    .get()

  // drizzle `sum` ritorna string|null; `count` ritorna number.
  const toNum = (v: string | null): number | null => (v == null ? null : Number(v))
  return {
    practicesCount:   row?.practicesCount ?? 0,
    importoRichiesto: toNum(row?.importoRichiesto ?? null),
    importoConcesso:  toNum(row?.importoConcesso ?? null),
    importoFatturato: toNum(row?.importoFatturato ?? null),
    importoLiquidato: toNum(row?.importoLiquidato ?? null),
  }
}

export interface ReportEntityRow {
  id: number | null
  denominazione: string | null
  count: number
  importoConcesso: number | null
  importoLiquidato: number | null
}

// Aggregato per collaboratore: pratiche attive raggruppate per collaboratoreId
// (incluso NULL → bucket «Non assegnato», risolto nel service). LEFT JOIN per
// portare la denominazione senza perdere il gruppo NULL.
export function findReportByCollaboratore(): ReportEntityRow[] {
  const rows = getDb()
    .select({
      id:              practices.collaboratoreId,
      denominazione:   collaboratori.denominazione,
      count:           count(practices.id),
      importoConcesso: sum(practices.importoConcesso),
      importoLiquidato: sum(practices.importoLiquidato),
    })
    .from(practices)
    .leftJoin(collaboratori, eq(practices.collaboratoreId, collaboratori.id))
    .where(eq(practices.isTrashed, false))
    .groupBy(practices.collaboratoreId)
    .orderBy(desc(count(practices.id)))
    .all()
  return mapEntityRows(rows)
}

export function findReportByProfessionista(): ReportEntityRow[] {
  const rows = getDb()
    .select({
      id:              practices.professionistaId,
      denominazione:   professionisti.denominazione,
      count:           count(practices.id),
      importoConcesso: sum(practices.importoConcesso),
      importoLiquidato: sum(practices.importoLiquidato),
    })
    .from(practices)
    .leftJoin(professionisti, eq(practices.professionistaId, professionisti.id))
    .where(eq(practices.isTrashed, false))
    .groupBy(practices.professionistaId)
    .orderBy(desc(count(practices.id)))
    .all()
  return mapEntityRows(rows)
}

function mapEntityRows(
  rows: { id: number | null; denominazione: string | null; count: number; importoConcesso: string | null; importoLiquidato: string | null }[]
): ReportEntityRow[] {
  return rows.map((r) => ({
    id:              r.id,
    denominazione:   r.denominazione,
    count:           r.count,
    importoConcesso: r.importoConcesso == null ? null : Number(r.importoConcesso),
    importoLiquidato: r.importoLiquidato == null ? null : Number(r.importoLiquidato),
  }))
}

export interface ReportDocumentsRow {
  practicesCount: number
  withDecreto: number
  withFattura: number
}

// Copertura documenti sulle pratiche attive: per ciascuna, presenza di almeno un
// decreto / una fattura (max(case…)), poi somma dei flag. Subquery per-pratica
// per non moltiplicare i conteggi con il join su documents.
export function findReportDocumentsCoverage(): ReportDocumentsRow {
  const perPractice = getDb()
    .select({
      practiceId: practices.id,
      hasDecreto: sql<number>`max(case when ${documents.kind} = 'decreto' then 1 else 0 end)`.as('has_decreto'),
      hasFattura: sql<number>`max(case when ${documents.kind} = 'fattura' then 1 else 0 end)`.as('has_fattura'),
    })
    .from(practices)
    .leftJoin(documents, eq(documents.practiceId, practices.id))
    .where(eq(practices.isTrashed, false))
    .groupBy(practices.id)
    .as('per_practice')

  const row = getDb()
    .select({
      practicesCount: count(perPractice.practiceId),
      withDecreto:    sql<number>`coalesce(sum(${perPractice.hasDecreto}), 0)`,
      withFattura:    sql<number>`coalesce(sum(${perPractice.hasFattura}), 0)`,
    })
    .from(perPractice)
    .get()

  return {
    practicesCount: row?.practicesCount ?? 0,
    withDecreto:    row?.withDecreto ?? 0,
    withFattura:    row?.withFattura ?? 0,
  }
}
