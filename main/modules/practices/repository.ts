import { count, like, eq, desc, and } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import {
  practices,
  appSettings,
  phases,
  transitions,
  historyEvents,
  pecRecipients,
  professionisti,
  collaboratori,
} from '../../database/schema'
import type { NewHistoryEventRow, PracticeRow } from '../../database/schema'
import type { PracticeListItem } from '../../../shared/ipc'

export function countPracticesByYear(year: number): number {
  const prefix = `${year}%`
  const [row] = getDb()
    .select({ cnt: count() })
    .from(practices)
    .where(like(practices.codiceIstanza, prefix))
    .all()
  return row?.cnt ?? 0
}

export function existsCodiceIstanza(code: string): boolean {
  const row = getDb()
    .select({ id: practices.id })
    .from(practices)
    .where(eq(practices.codiceIstanza, code))
    .get()
  return row != null
}

export function getSiglaCodice(): string {
  const row = getDb()
    .select({ siglaCodice: appSettings.siglaCodice })
    .from(appSettings)
    .get()
  return row?.siglaCodice ?? 'NP'
}

export function findInitialPhase() {
  return getDb()
    .select()
    .from(phases)
    .where(eq(phases.isInitial, true))
    .get()
}

export function findAutomaticTransitionFromPhase(phaseId: number) {
  return getDb()
    .select()
    .from(transitions)
    .where(eq(transitions.fromPhaseId, phaseId))
    .all()
    .find(t => t.isAutomatic && t.toPhaseId != null) ?? null
}

export function insertPractice(data: {
  codiceIstanza: string
  nomeIstanza: string
  collaboratoreId: number | null
  professionistaId: number | null
  tipologiaAttivita: string | null
  dataUdienza: string
  competenza: string | null
  autoritaGiudiziaria: string | null
  dataDeposito: string | null
  modalitaDeposito: string | null
  importoRichiesto: number | null
  note: string | null
  currentPhaseId: number
  customValues: string
  createdAt: string
  updatedAt: string
}): number {
  const result = getDb()
    .insert(practices)
    .values(data)
    .run()
  return Number(result.lastInsertRowid)
}

export function updatePracticeCurrentPhase(
  practiceId: number,
  newPhaseId: number,
  updatedAt: string
): void {
  getDb()
    .update(practices)
    .set({ currentPhaseId: newPhaseId, updatedAt, version: 2 })
    .where(eq(practices.id, practiceId))
    .run()
}

export function insertHistoryEvent(data: Omit<NewHistoryEventRow, 'id'>): number {
  const result = getDb()
    .insert(historyEvents)
    .values(data)
    .run()
  return Number(result.lastInsertRowid)
}

export function insertPecRecipients(
  practiceId: number,
  indirizzi: string[],
  contesto: 'deposito' | 'scp' | 'altro'
): void {
  if (indirizzi.length === 0) return
  getDb()
    .insert(pecRecipients)
    .values(indirizzi.map(indirizzo => ({ practiceId, contesto, indirizzo })))
    .run()
}

export interface PracticeDetailRow {
  practice: PracticeRow
  currentPhaseKey: string | null
  currentPhaseDisplayName: string | null
  currentPhaseCategory: string | null
  currentPhaseIsFinal: boolean | null
  collaboratoreDenominazione: string | null
  professionistaDenominazione: string | null
}

export function findPracticeDetailById(id: number): PracticeDetailRow | null {
  const row = getDb()
    .select({
      practice:                practices,
      currentPhaseKey:         phases.key,
      currentPhaseDisplayName: phases.displayName,
      currentPhaseCategory:    phases.category,
      currentPhaseIsFinal:     phases.isFinal,
      collaboratoreDenominazione:  collaboratori.denominazione,
      professionistaDenominazione: professionisti.denominazione,
    })
    .from(practices)
    .leftJoin(phases, eq(practices.currentPhaseId, phases.id))
    .leftJoin(professionisti, eq(practices.professionistaId, professionisti.id))
    .leftJoin(collaboratori, eq(practices.collaboratoreId, collaboratori.id))
    .where(eq(practices.id, id))
    .get()

  if (!row) return null
  return {
    practice:                    row.practice,
    currentPhaseKey:             row.currentPhaseKey ?? null,
    currentPhaseDisplayName:     row.currentPhaseDisplayName ?? null,
    currentPhaseCategory:        row.currentPhaseCategory ?? null,
    currentPhaseIsFinal:         row.currentPhaseIsFinal ?? null,
    collaboratoreDenominazione:  row.collaboratoreDenominazione ?? null,
    professionistaDenominazione: row.professionistaDenominazione ?? null,
  }
}

// Mappa id → displayName di tutte le fasi (tabella piccola): risolve i nomi
// fase di provenienza e from/to degli HistoryEvent senza doppi join aliasati.
export function findPhaseNameMap(): Map<number, string> {
  const rows = getDb()
    .select({ id: phases.id, displayName: phases.displayName })
    .from(phases)
    .all()
  return new Map(rows.map(r => [r.id, r.displayName]))
}

export function findHistoryEventsByPractice(practiceId: number) {
  return getDb()
    .select({
      id:          historyEvents.id,
      timestamp:   historyEvents.timestamp,
      type:        historyEvents.type,
      title:       historyEvents.title,
      fromPhaseId: historyEvents.fromPhaseId,
      toPhaseId:   historyEvents.toPhaseId,
      note:        historyEvents.note,
    })
    .from(historyEvents)
    .where(eq(historyEvents.practiceId, practiceId))
    .orderBy(historyEvents.timestamp, historyEvents.id)
    .all()
}

export function findPecDepositoAddresses(practiceId: number): string[] {
  return getDb()
    .select({ indirizzo: pecRecipients.indirizzo })
    .from(pecRecipients)
    .where(and(
      eq(pecRecipients.practiceId, practiceId),
      eq(pecRecipients.contesto, 'deposito'),
    ))
    .all()
    .map(r => r.indirizzo)
}

export function findAllActivePractices(): PracticeListItem[] {
  const rows = getDb()
    .select({
      id:                        practices.id,
      codiceIstanza:             practices.codiceIstanza,
      nomeIstanza:               practices.nomeIstanza,
      dataUdienza:               practices.dataUdienza,
      dataDeposito:              practices.dataDeposito,
      autoritaGiudiziaria:       practices.autoritaGiudiziaria,
      currentPhaseId:            practices.currentPhaseId,
      currentPhaseKey:           phases.key,
      currentPhaseDisplayName:   phases.displayName,
      currentPhaseCategory:      phases.category,
      collaboratoreId:           practices.collaboratoreId,
      collaboratoreDenominazione: collaboratori.denominazione,
      professionistaId:          practices.professionistaId,
      professionistaDenominazione: professionisti.denominazione,
      importoRichiesto:          practices.importoRichiesto,
      createdAt:                 practices.createdAt,
    })
    .from(practices)
    .leftJoin(phases, eq(practices.currentPhaseId, phases.id))
    .leftJoin(professionisti, eq(practices.professionistaId, professionisti.id))
    .leftJoin(collaboratori, eq(practices.collaboratoreId, collaboratori.id))
    .where(eq(practices.isTrashed, false))
    .orderBy(desc(practices.createdAt))
    .all()

  return rows.map(r => ({
    id:                          r.id,
    codiceIstanza:               r.codiceIstanza,
    nomeIstanza:                 r.nomeIstanza,
    dataUdienza:                 r.dataUdienza ?? null,
    dataDeposito:                r.dataDeposito ?? null,
    autoritaGiudiziaria:         r.autoritaGiudiziaria ?? null,
    currentPhaseId:              r.currentPhaseId,
    currentPhaseKey:             r.currentPhaseKey ?? null,
    currentPhaseDisplayName:     r.currentPhaseDisplayName ?? null,
    currentPhaseCategory:        r.currentPhaseCategory ?? null,
    collaboratoreId:             r.collaboratoreId ?? null,
    collaboratoreDenominazione:  r.collaboratoreDenominazione ?? null,
    professionistaId:            r.professionistaId ?? null,
    professionistaDenominazione: r.professionistaDenominazione ?? null,
    importoRichiesto:            r.importoRichiesto ?? null,
    createdAt:                   r.createdAt,
  }))
}
