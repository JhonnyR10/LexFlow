import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { practices } from './practices'

export const pecRecipients = sqliteTable('pec_recipients', {
  id:                 integer('id').primaryKey({ autoIncrement: true }),
  practiceId:         integer('practice_id').notNull().references(() => practices.id),
  transitionRecordId: integer('transition_record_id'),  // nullable — FK futura verso transition_records (E5)
  contesto:           text('contesto').notNull().default('deposito'),  // 'deposito' | 'scp' | 'altro'
  indirizzo:          text('indirizzo').notNull(),
})

export type PecRecipientRow    = typeof pecRecipients.$inferSelect
export type NewPecRecipientRow = typeof pecRecipients.$inferInsert
