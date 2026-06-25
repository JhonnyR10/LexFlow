import { eq, and, desc } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { documents, practices, historyEvents } from '../../database/schema'
import type { NewDocumentRow, DocumentRow, NewHistoryEventRow } from '../../database/schema'

// Stato minimo della pratica usato dal service documenti (codice per il path,
// isTrashed per il guard cestino).
export interface PracticeRefForDocs {
  id: number
  codiceIstanza: string
  isTrashed: boolean
}

export function findPracticeRefForDocs(practiceId: number): PracticeRefForDocs | null {
  const row = getDb()
    .select({
      id:            practices.id,
      codiceIstanza: practices.codiceIstanza,
      isTrashed:     practices.isTrashed,
    })
    .from(practices)
    .where(eq(practices.id, practiceId))
    .get()
  return row ?? null
}

export function insertDocument(data: Omit<NewDocumentRow, 'id'>): number {
  const result = getDb().insert(documents).values(data).run()
  return Number(result.lastInsertRowid)
}

// Documenti di una pratica, più recenti prima. Tabella piccola: nessun indice
// dedicato necessario nell'MVP.
export function findDocumentsByPractice(practiceId: number): DocumentRow[] {
  return getDb()
    .select()
    .from(documents)
    .where(eq(documents.practiceId, practiceId))
    .orderBy(desc(documents.createdAt), desc(documents.id))
    .all()
}

// Documento esistente di un dato kind per la pratica (semantica di sostituzione:
// un solo decreto e una sola fattura per pratica).
export function findDocumentByKind(practiceId: number, kind: string): DocumentRow | null {
  const row = getDb()
    .select()
    .from(documents)
    .where(and(eq(documents.practiceId, practiceId), eq(documents.kind, kind)))
    .get()
  return row ?? null
}

export function findDocumentById(id: number): DocumentRow | null {
  const row = getDb().select().from(documents).where(eq(documents.id, id)).get()
  return row ?? null
}

export function deleteDocumentRow(id: number): void {
  getDb().delete(documents).where(eq(documents.id, id)).run()
}

// HistoryEvent locale (regola 9): piccolo duplicato deliberato del pattern in
// practices/repository per non importare il repository di un altro modulo.
export function insertHistoryEvent(data: Omit<NewHistoryEventRow, 'id'>): number {
  const result = getDb().insert(historyEvents).values(data).run()
  return Number(result.lastInsertRowid)
}
