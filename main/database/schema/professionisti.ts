import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const professionisti = sqliteTable('professionisti', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  nome:          text('nome').notNull(),
  cognome:       text('cognome').notNull(),
  denominazione: text('denominazione').notNull(),
  codiceFiscale: text('codice_fiscale'),
  email:         text('email'),
  pec:           text('pec'),
  telefono:      text('telefono'),
  ruolo:         text('ruolo'),
  note:          text('note'),
  isActive:      integer('is_active', { mode: 'boolean' }).notNull().default(true)
})

export type ProfessionistaRow    = typeof professionisti.$inferSelect
export type NewProfessionistaRow = typeof professionisti.$inferInsert
