import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { transitions } from './transitions'
import { menuSets } from './menuSets'

export const fieldDefs = sqliteTable('field_defs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scope: text('scope', { enum: ['general', 'transition'] }).notNull(),
  transitionId: integer('transition_id').references(() => transitions.id),
  key: text('key').notNull(),
  label: text('label').notNull(),
  type: text('type', {
    enum: ['testo_breve', 'testo_lungo', 'numero', 'importo', 'data', 'menu', 'si_no', 'note', 'file', 'pec']
  }).notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  visibleInTable: integer('visible_in_table', { mode: 'boolean' }).notNull().default(false),
  usableInFilter: integer('usable_in_filter', { mode: 'boolean' }).notNull().default(false),
  includeInExport: integer('include_in_export', { mode: 'boolean' }).notNull().default(false),
  order: integer('order').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  menuSetId: integer('menu_set_id').references(() => menuSets.id),
  // Visibilità condizionale: entrambi null o entrambi valorizzati
  conditionalOnFieldId: integer('conditional_on_field_id').references(() => fieldDefs.id),
  conditionalValue: text('conditional_value')
})

export type FieldDef = typeof fieldDefs.$inferSelect
export type NewFieldDef = typeof fieldDefs.$inferInsert
