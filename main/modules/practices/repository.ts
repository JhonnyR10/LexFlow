import { count, like, eq, desc, and, sql } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import {
  practices,
  appSettings,
  phases,
  transitions,
  fieldDefs,
  menuOptions,
  historyEvents,
  pecRecipients,
  transitionRecords,
  professionisti,
  collaboratori,
} from '../../database/schema'
import type {
  NewHistoryEventRow,
  NewTransitionRecordRow,
  PracticeRow,
} from '../../database/schema'
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

export function findInitialPhase(): typeof phases.$inferSelect | undefined {
  return getDb()
    .select()
    .from(phases)
    .where(eq(phases.isInitial, true))
    .get()
}

export function findAutomaticTransitionFromPhase(
  phaseId: number
): typeof transitions.$inferSelect | null {
  return getDb()
    .select()
    .from(transitions)
    .where(eq(transitions.fromPhaseId, phaseId))
    .all()
    .find(t => t.isAutomatic && t.toPhaseId != null) ?? null
}

export interface AvailableTransitionRow {
  id: number
  buttonLabel: string
  toPhaseId: number | null
  toPhaseDisplayName: string | null
  isRepeatable: boolean
  isResume: boolean
}

// Transizioni disponibili (pulsanti) dalla fase corrente: solo attive e non
// automatiche, ordinate per `order`. Il join risolve il displayName della
// fase di destinazione (null per le isResume, che hanno toPhaseId null).
export function findAvailableTransitionsFromPhase(phaseId: number): AvailableTransitionRow[] {
  return getDb()
    .select({
      id:                 transitions.id,
      buttonLabel:        transitions.buttonLabel,
      toPhaseId:          transitions.toPhaseId,
      toPhaseDisplayName: phases.displayName,
      isRepeatable:       transitions.isRepeatable,
      isResume:           transitions.isResume,
    })
    .from(transitions)
    .leftJoin(phases, eq(transitions.toPhaseId, phases.id))
    .where(and(
      eq(transitions.fromPhaseId, phaseId),
      eq(transitions.isActive, true),
      eq(transitions.isAutomatic, false),
    ))
    .orderBy(transitions.order)
    .all()
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

export interface PracticeCore {
  id: number
  currentPhaseId: number
  previousPhaseId: number | null
  isTrashed: boolean
}

// Stato minimo della pratica, riletto dentro la transazione di avanzamento per
// fondare il calcolo della destinazione sul currentPhaseId reale (S5.3).
export function findPracticeCoreById(id: number): PracticeCore | null {
  const row = getDb()
    .select({
      id:              practices.id,
      currentPhaseId:  practices.currentPhaseId,
      previousPhaseId: practices.previousPhaseId,
      isTrashed:       practices.isTrashed,
    })
    .from(practices)
    .where(eq(practices.id, id))
    .get()
  if (!row) return null
  return {
    id:              row.id,
    currentPhaseId:  row.currentPhaseId,
    previousPhaseId: row.previousPhaseId ?? null,
    isTrashed:       row.isTrashed,
  }
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

// PEC raccolte in una transizione (S5.3): collegate al transition_record che le
// ha prodotte, con il contesto derivato dalla fase di destinazione.
export function insertPecRecipientsForTransition(
  practiceId: number,
  transitionRecordId: number,
  indirizzi: string[],
  contesto: 'deposito' | 'scp' | 'altro'
): void {
  if (indirizzi.length === 0) return
  getDb()
    .insert(pecRecipients)
    .values(indirizzi.map(indirizzo => ({ practiceId, transitionRecordId, contesto, indirizzo })))
    .run()
}

// --- S5.3: esecuzione transizione ---

export interface TransitionForExecution {
  id: number
  fromPhaseId: number
  toPhaseId: number | null
  buttonLabel: string
  isActive: boolean
  isAutomatic: boolean
  isRepeatable: boolean
  isResume: boolean
  toPhaseCategory: string | null
  toPhaseIsActive: boolean | null
}

// Transizione con i dati della fase di destinazione necessari al motore
// (category per derivare contesto PEC e sospensione, isActive come guard).
export function findTransitionForExecution(id: number): TransitionForExecution | null {
  const row = getDb()
    .select({
      id:              transitions.id,
      fromPhaseId:     transitions.fromPhaseId,
      toPhaseId:       transitions.toPhaseId,
      buttonLabel:     transitions.buttonLabel,
      isActive:        transitions.isActive,
      isAutomatic:     transitions.isAutomatic,
      isRepeatable:    transitions.isRepeatable,
      isResume:        transitions.isResume,
      toPhaseCategory: phases.category,
      toPhaseIsActive: phases.isActive,
    })
    .from(transitions)
    .leftJoin(phases, eq(transitions.toPhaseId, phases.id))
    .where(eq(transitions.id, id))
    .get()

  if (!row) return null
  return {
    id:              row.id,
    fromPhaseId:     row.fromPhaseId,
    toPhaseId:       row.toPhaseId ?? null,
    buttonLabel:     row.buttonLabel,
    isActive:        row.isActive,
    isAutomatic:     row.isAutomatic,
    isRepeatable:    row.isRepeatable,
    isResume:        row.isResume,
    toPhaseCategory: row.toPhaseCategory ?? null,
    toPhaseIsActive: row.toPhaseIsActive ?? null,
  }
}

export interface TransitionFieldRow {
  id: number
  key: string
  label: string
  type: string
  required: boolean
  menuSetId: number | null
  conditionalOnFieldId: number | null
  conditionalValue: string | null
}

// Campi configurati per la transizione (solo attivi), ordinati: definiscono il
// form dinamico e sono la fonte autorevole per la validazione lato main.
export function findActiveTransitionFields(transitionId: number): TransitionFieldRow[] {
  return getDb()
    .select({
      id:                   fieldDefs.id,
      key:                  fieldDefs.key,
      label:                fieldDefs.label,
      type:                 fieldDefs.type,
      required:             fieldDefs.required,
      menuSetId:            fieldDefs.menuSetId,
      conditionalOnFieldId: fieldDefs.conditionalOnFieldId,
      conditionalValue:     fieldDefs.conditionalValue,
    })
    .from(fieldDefs)
    .where(and(
      eq(fieldDefs.scope, 'transition'),
      eq(fieldDefs.transitionId, transitionId),
      eq(fieldDefs.isActive, true),
    ))
    .orderBy(fieldDefs.order)
    .all()
}

// Value delle opzioni attive di un menu set: usati per validare i campi `menu`.
export function findActiveMenuOptionValues(menuSetId: number): string[] {
  return getDb()
    .select({ value: menuOptions.value })
    .from(menuOptions)
    .where(and(
      eq(menuOptions.menuSetId, menuSetId),
      eq(menuOptions.isActive, true),
    ))
    .all()
    .map(r => r.value)
}

export function insertTransitionRecord(data: Omit<NewTransitionRecordRow, 'id'>): number {
  const result = getDb()
    .insert(transitionRecords)
    .values(data)
    .run()
  return Number(result.lastInsertRowid)
}

// Avanzamento pratica al salvataggio di una transizione: aggiorna fase corrente
// e fase di provenienza, incrementando `version` (predisposizione audit).
export function advancePractice(
  practiceId: number,
  newCurrentPhaseId: number,
  newPreviousPhaseId: number | null,
  updatedAt: string
): void {
  getDb()
    .update(practices)
    .set({
      currentPhaseId:  newCurrentPhaseId,
      previousPhaseId: newPreviousPhaseId,
      updatedAt,
      version:         sql`${practices.version} + 1`,
    })
    .where(eq(practices.id, practiceId))
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

export interface HistoryEventListRow {
  id: number
  timestamp: string
  type: string
  title: string
  fromPhaseId: number | null
  toPhaseId: number | null
  note: string | null
}

export function findHistoryEventsByPractice(practiceId: number): HistoryEventListRow[] {
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

// Categorie di fase che la pratica ha attraversato nella sua storia: distinte
// dalle `phases.category` raggiunte dagli HistoryEvent (toPhaseId). Usata dal
// guard di liquidazione (S5.4) per verificare decreto/SCP registrati.
export function findReachedPhaseCategories(practiceId: number): Set<string> {
  const rows = getDb()
    .selectDistinct({ category: phases.category })
    .from(historyEvents)
    .innerJoin(phases, eq(historyEvents.toPhaseId, phases.id))
    .where(eq(historyEvents.practiceId, practiceId))
    .all()
  const categories: string[] = []
  for (const r of rows) {
    if (r.category != null) categories.push(r.category)
  }
  return new Set(categories)
}

// --- S4.3: modifica pratica ---

export interface PracticeForEdit {
  id: number
  nomeIstanza: string
  collaboratoreId: number | null
  professionistaId: number | null
  tipologiaAttivita: string | null
  dataUdienza: string | null
  competenza: string | null
  autoritaGiudiziaria: string | null
  dataDeposito: string | null
  modalitaDeposito: string | null
  importoRichiesto: number | null
  note: string | null
  customValues: string  // JSON grezzo
  isTrashed: boolean
}

// Set completo dei campi editabili (+ isTrashed) per costruire il diff in S4.3.
export function findPracticeForEdit(id: number): PracticeForEdit | null {
  const row = getDb()
    .select({
      id:                  practices.id,
      nomeIstanza:         practices.nomeIstanza,
      collaboratoreId:     practices.collaboratoreId,
      professionistaId:    practices.professionistaId,
      tipologiaAttivita:   practices.tipologiaAttivita,
      dataUdienza:         practices.dataUdienza,
      competenza:          practices.competenza,
      autoritaGiudiziaria: practices.autoritaGiudiziaria,
      dataDeposito:        practices.dataDeposito,
      modalitaDeposito:    practices.modalitaDeposito,
      importoRichiesto:    practices.importoRichiesto,
      note:                practices.note,
      customValues:        practices.customValues,
      isTrashed:           practices.isTrashed,
    })
    .from(practices)
    .where(eq(practices.id, id))
    .get()
  if (!row) return null
  return {
    id:                  row.id,
    nomeIstanza:         row.nomeIstanza,
    collaboratoreId:     row.collaboratoreId ?? null,
    professionistaId:    row.professionistaId ?? null,
    tipologiaAttivita:   row.tipologiaAttivita ?? null,
    dataUdienza:         row.dataUdienza ?? null,
    competenza:          row.competenza ?? null,
    autoritaGiudiziaria: row.autoritaGiudiziaria ?? null,
    dataDeposito:        row.dataDeposito ?? null,
    modalitaDeposito:    row.modalitaDeposito ?? null,
    importoRichiesto:    row.importoRichiesto ?? null,
    note:                row.note ?? null,
    customValues:        row.customValues,
    isTrashed:           row.isTrashed,
  }
}

export interface UpdatablePracticeFields {
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
  customValues: string
}

// Aggiorna i soli campi generali editabili (mai currentPhaseId/previousPhaseId/
// codiceIstanza) e incrementa `version` (predisposizione audit, come advancePractice).
export function updatePracticeFields(
  id: number,
  fields: UpdatablePracticeFields,
  updatedAt: string
): void {
  getDb()
    .update(practices)
    .set({ ...fields, updatedAt, version: sql`${practices.version} + 1` })
    .where(eq(practices.id, id))
    .run()
}

// Sostituzione integrale dei destinatari PEC deposito di una pratica (S4.3).
export function deletePecDepositoRecipients(practiceId: number): void {
  getDb()
    .delete(pecRecipients)
    .where(and(
      eq(pecRecipients.practiceId, practiceId),
      eq(pecRecipients.contesto, 'deposito'),
    ))
    .run()
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
      note:                      practices.note,
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
    note:                        r.note ?? null,
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
