import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { phases } from './phases'

export const transitions = sqliteTable(
  'transitions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fromPhaseId: integer('from_phase_id')
      .notNull()
      .references(() => phases.id),
    toPhaseId: integer('to_phase_id')
      .notNull()
      .references(() => phases.id),
    buttonLabel: text('button_label').notNull(),
    order: integer('order').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
  },
  (table) => [uniqueIndex('transitions_from_to_idx').on(table.fromPhaseId, table.toPhaseId)]
)

export type Transition = typeof transitions.$inferSelect
export type NewTransition = typeof transitions.$inferInsert
