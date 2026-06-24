import { asc, eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { professionisti } from '../../database/schema'
import type { ProfessionistaListItem } from '../../../shared/ipc'
import type { NewProfessionistaRow, ProfessionistaRow } from '../../database/schema/professionisti'

function toListItem(row: ProfessionistaRow): ProfessionistaListItem {
  return {
    id:            row.id,
    nome:          row.nome,
    cognome:       row.cognome,
    denominazione: row.denominazione,
    codiceFiscale: row.codiceFiscale ?? null,
    email:         row.email ?? null,
    pec:           row.pec ?? null,
    telefono:      row.telefono ?? null,
    ruolo:         row.ruolo ?? null,
    note:          row.note ?? null,
    isActive:      row.isActive
  }
}

export function findAllProfessionisti(): ProfessionistaListItem[] {
  const rows = getDb()
    .select()
    .from(professionisti)
    .orderBy(asc(professionisti.denominazione))
    .all()
  return rows.map(toListItem)
}

export function findProfessionistaById(id: number): ProfessionistaListItem | undefined {
  const row = getDb().select().from(professionisti).where(eq(professionisti.id, id)).get()
  return row ? toListItem(row) : undefined
}

export function insertProfessionista(data: NewProfessionistaRow): ProfessionistaListItem {
  const [row] = getDb().insert(professionisti).values(data).returning().all()
  return toListItem(row)
}

export function updateProfessionistaFields(
  id: number,
  data: Omit<NewProfessionistaRow, 'id'>
): ProfessionistaListItem {
  const [row] = getDb()
    .update(professionisti)
    .set(data)
    .where(eq(professionisti.id, id))
    .returning()
    .all()
  return toListItem(row)
}

export function setProfessionistaIsActive(id: number, isActive: boolean): void {
  getDb()
    .update(professionisti)
    .set({ isActive })
    .where(eq(professionisti.id, id))
    .run()
}
