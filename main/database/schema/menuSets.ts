import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const menuSets = sqliteTable('menu_sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  label: text('label').notNull()
})

export type MenuSet = typeof menuSets.$inferSelect
export type NewMenuSet = typeof menuSets.$inferInsert
