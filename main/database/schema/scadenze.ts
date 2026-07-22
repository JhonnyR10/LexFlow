import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { practices } from './practices'

// Scadenza/termine legato a una pratica (E15/S15.1). Es. termine per rispondere
// a un'integrazione, termine impugnazione. Figlia di `practices`: rientra nelle
// cascate di hard delete (S10.3) e reset (S11.4).
export const scadenze = sqliteTable('scadenze', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  practiceId:   integer('practice_id').notNull().references(() => practices.id),
  descrizione:  text('descrizione').notNull(),
  dataScadenza: text('data_scadenza').notNull(),                 // YYYY-MM-DD
  completata:   integer('completata', { mode: 'boolean' }).notNull().default(false),
  completataAt: text('completata_at'),                           // ISO, nullable
  createdAt:    text('created_at').notNull(),
})

export type ScadenzaRow    = typeof scadenze.$inferSelect
export type NewScadenzaRow = typeof scadenze.$inferInsert
