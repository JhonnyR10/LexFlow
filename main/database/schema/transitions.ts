import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { phases } from './phases'

export const transitions = sqliteTable(
  'transitions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    fromPhaseId: integer('from_phase_id')
      .notNull()
      .references(() => phases.id),
    toPhaseId: integer('to_phase_id').references(() => phases.id),
    buttonLabel: text('button_label').notNull(),
    order: integer('order').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    isRepeatable: integer('is_repeatable', { mode: 'boolean' }).notNull().default(false),
    isAutomatic: integer('is_automatic', { mode: 'boolean' }).notNull().default(false),
    isResume: integer('is_resume', { mode: 'boolean' }).notNull().default(false)
  },
  (table) => [uniqueIndex('transitions_from_label_idx').on(table.fromPhaseId, table.buttonLabel)]
)

export type Transition = typeof transitions.$inferSelect
export type NewTransition = typeof transitions.$inferInsert
