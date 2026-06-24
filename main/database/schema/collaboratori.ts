import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const collaboratori = sqliteTable('collaboratori', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  nome:          text('nome').notNull(),
  cognome:       text('cognome').notNull(),
  denominazione: text('denominazione').notNull(),
  codiceInterno: text('codice_interno'),
  note:          text('note'),
  isActive:      integer('is_active', { mode: 'boolean' }).notNull().default(true)
})

export type CollaboratoreRow    = typeof collaboratori.$inferSelect
export type NewCollaboratoreRow = typeof collaboratori.$inferInsert
