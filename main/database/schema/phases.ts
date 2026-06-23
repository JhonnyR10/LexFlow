import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const phases = sqliteTable('phases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  displayName: text('display_name').notNull(),
  category: text('category', {
    enum: [
      'deposited',
      'awaiting_decree',
      'decree_received',
      'scp_sent',
      'awaiting_liquidation',
      'liquidated',
      'closed',
      'refused',
      'suspended',
      'annulled',
      'custom'
    ]
  }).notNull(),
  isInitial: integer('is_initial', { mode: 'boolean' }).notNull().default(false),
  isFinal: integer('is_final', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  order: integer('order').notNull(),
  pecEnabled: integer('pec_enabled', { mode: 'boolean' }).notNull().default(false)
})

export type Phase = typeof phases.$inferSelect
export type NewPhase = typeof phases.$inferInsert
