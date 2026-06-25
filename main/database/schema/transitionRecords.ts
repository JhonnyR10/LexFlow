import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { practices } from './practices'
import { transitions } from './transitions'
import { phases } from './phases'

// Registrazione di una transizione eseguita (S5.3). Ogni esecuzione — incluse
// quelle ripetibili (solleciti) che restano nella stessa fase — crea un record.
// I valori dei campi configurati per la transizione vivono in `values` (JSON
// keyed by fieldKey). Relazione 1:1 con l'HistoryEvent corrispondente.
export const transitionRecords = sqliteTable('transition_records', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  practiceId:   integer('practice_id').notNull().references(() => practices.id),
  transitionId: integer('transition_id').notNull().references(() => transitions.id),
  fromPhaseId:  integer('from_phase_id').notNull().references(() => phases.id),
  toPhaseId:    integer('to_phase_id').references(() => phases.id),  // destinazione risolta (self/resume inclusi); null solo se sconosciuta
  recordedAt:   text('recorded_at').notNull(),
  values:       text('values').notNull().default('{}'),  // JSON {fieldKey: value}
  note:         text('note'),
})

export type TransitionRecordRow    = typeof transitionRecords.$inferSelect
export type NewTransitionRecordRow = typeof transitionRecords.$inferInsert
