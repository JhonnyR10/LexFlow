import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { phases } from './phases'
import { professionisti } from './professionisti'
import { collaboratori } from './collaboratori'

export const practices = sqliteTable('practices', {
  id:                  integer('id').primaryKey({ autoIncrement: true }),
  codiceIstanza:       text('codice_istanza').notNull().unique(),
  nomeIstanza:         text('nome_istanza').notNull(),
  collaboratoreId:     integer('collaboratore_id').references(() => collaboratori.id),
  professionistaId:    integer('professionista_id').references(() => professionisti.id),
  tipologiaAttivita:   text('tipologia_attivita'),
  dataUdienza:         text('data_udienza'),          // ISO YYYY-MM-DD; obbligatoria alla creazione (vincolo imposto in S4.2 nel form e nel service)
  competenza:          text('competenza'),
  autoritaGiudiziaria: text('autorita_giudiziaria'),
  dataDeposito:        text('data_deposito'),          // ISO YYYY-MM-DD
  modalitaDeposito:    text('modalita_deposito'),
  importoRichiesto:    real('importo_richiesto'),
  note:                text('note'),
  currentPhaseId:      integer('current_phase_id').notNull().references(() => phases.id),
  previousPhaseId:     integer('previous_phase_id').references(() => phases.id),
  customValues:        text('custom_values').notNull().default('{}'),  // JSON {fieldKey: value}
  isTrashed:           integer('is_trashed', { mode: 'boolean' }).notNull().default(false),
  trashedAt:           text('trashed_at'),
  trashReason:         text('trash_reason'),
  createdAt:           text('created_at').notNull(),
  updatedAt:           text('updated_at').notNull(),
  version:             integer('version').notNull().default(1),
})

export type PracticeRow    = typeof practices.$inferSelect
export type NewPracticeRow = typeof practices.$inferInsert
