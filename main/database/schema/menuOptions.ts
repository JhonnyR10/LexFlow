import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { menuSets } from './menuSets'

export const menuOptions = sqliteTable(
  'menu_options',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    menuSetId: integer('menu_set_id')
      .notNull()
      .references(() => menuSets.id),
    label: text('label').notNull(),
    value: text('value').notNull(),
    order: integer('order').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
  },
  (table) => [uniqueIndex('menu_options_set_value_idx').on(table.menuSetId, table.value)]
)

export type MenuOption = typeof menuOptions.$inferSelect
export type NewMenuOption = typeof menuOptions.$inferInsert
