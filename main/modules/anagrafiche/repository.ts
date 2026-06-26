import { and, asc, count, eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { professionisti, collaboratori, practices } from '../../database/schema'
import type { ProfessionistaListItem, CollaboratoreListItem } from '../../../shared/ipc'
import type { NewProfessionistaRow, ProfessionistaRow } from '../../database/schema/professionisti'
import type { NewCollaboratoreRow, CollaboratoreRow } from '../../database/schema/collaboratori'

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

/** Numero di pratiche NON cestinate che referenziano questo professionista. */
export function countActivePracticesByProfessionista(id: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(practices)
    .where(and(eq(practices.professionistaId, id), eq(practices.isTrashed, false)))
    .all()
  return row?.cnt ?? 0
}

// ---------- Collaboratori ----------

function toCollaboratoreListItem(row: CollaboratoreRow): CollaboratoreListItem {
  return {
    id:            row.id,
    nome:          row.nome,
    cognome:       row.cognome,
    denominazione: row.denominazione,
    codiceInterno: row.codiceInterno ?? null,
    note:          row.note ?? null,
    isActive:      row.isActive
  }
}

export function findAllCollaboratori(): CollaboratoreListItem[] {
  const rows = getDb()
    .select()
    .from(collaboratori)
    .orderBy(asc(collaboratori.denominazione))
    .all()
  return rows.map(toCollaboratoreListItem)
}

export function findCollaboratoreById(id: number): CollaboratoreListItem | undefined {
  const row = getDb().select().from(collaboratori).where(eq(collaboratori.id, id)).get()
  return row ? toCollaboratoreListItem(row) : undefined
}

export function insertCollaboratore(data: NewCollaboratoreRow): CollaboratoreListItem {
  const [row] = getDb().insert(collaboratori).values(data).returning().all()
  return toCollaboratoreListItem(row)
}

export function updateCollaboratoreFields(
  id: number,
  data: Omit<NewCollaboratoreRow, 'id'>
): CollaboratoreListItem {
  const [row] = getDb()
    .update(collaboratori)
    .set(data)
    .where(eq(collaboratori.id, id))
    .returning()
    .all()
  return toCollaboratoreListItem(row)
}

export function setCollaboratoreIsActive(id: number, isActive: boolean): void {
  getDb()
    .update(collaboratori)
    .set({ isActive })
    .where(eq(collaboratori.id, id))
    .run()
}

/** Numero di pratiche NON cestinate che referenziano questo collaboratore. */
export function countActivePracticesByCollaboratore(id: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(practices)
    .where(and(eq(practices.collaboratoreId, id), eq(practices.isTrashed, false)))
    .all()
  return row?.cnt ?? 0
}
