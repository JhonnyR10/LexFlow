import { eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { scadenze, practices, historyEvents } from '../../database/schema'
import type { ScadenzaRow, NewScadenzaRow, NewHistoryEventRow } from '../../database/schema'

export interface PracticeRef {
  id: number
  isTrashed: boolean
}

export function findPracticeRef(practiceId: number): PracticeRef | null {
  const row = getDb()
    .select({ id: practices.id, isTrashed: practices.isTrashed })
    .from(practices)
    .where(eq(practices.id, practiceId))
    .get()
  return row ?? null
}

export function findScadenzeByPractice(practiceId: number): ScadenzaRow[] {
  return getDb()
    .select()
    .from(scadenze)
    .where(eq(scadenze.practiceId, practiceId))
    .all()
}

export function findScadenzaById(id: number): ScadenzaRow | null {
  return getDb().select().from(scadenze).where(eq(scadenze.id, id)).get() ?? null
}

export function insertScadenza(data: Omit<NewScadenzaRow, 'id'>): number {
  const res = getDb().insert(scadenze).values(data).run()
  return Number(res.lastInsertRowid)
}

export function updateScadenzaRow(
  id: number,
  fields: Partial<Pick<ScadenzaRow, 'descrizione' | 'dataScadenza' | 'completata' | 'completataAt'>>
): void {
  getDb().update(scadenze).set(fields).where(eq(scadenze.id, id)).run()
}

export function deleteScadenzaRow(id: number): void {
  getDb().delete(scadenze).where(eq(scadenze.id, id)).run()
}

export function insertHistoryEvent(data: Omit<NewHistoryEventRow, 'id'>): void {
  getDb().insert(historyEvents).values(data).run()
}
