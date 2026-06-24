import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { practices } from './practices'
import { phases } from './phases'

export const historyEvents = sqliteTable('history_events', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  practiceId:  integer('practice_id').notNull().references(() => practices.id),
  timestamp:   text('timestamp').notNull(),
  type:        text('type').notNull(),       // 'created' | 'auto_transition' | 'phase_changed' | 'updated' | 'trashed' | 'restored'
  title:       text('title').notNull(),
  fromPhaseId: integer('from_phase_id').references(() => phases.id),
  toPhaseId:   integer('to_phase_id').references(() => phases.id),
  note:        text('note'),
  payload:     text('payload').notNull().default('{}'),  // JSON
})

export type HistoryEventRow    = typeof historyEvents.$inferSelect
export type NewHistoryEventRow = typeof historyEvents.$inferInsert
