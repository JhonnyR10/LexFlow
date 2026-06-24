import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Riga singola (id=1). I campi JSON sono stringhe serializzate.
export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  theme: text('theme').notNull().default('light'),
  alertsEnabled: text('alerts_enabled').notNull(),
  alertThresholds: text('alert_thresholds').notNull(),
  assistant: text('assistant').notNull(),
  dataPath: text('data_path').notNull(),
  appVersion: text('app_version').notNull(),
  siglaCodice: text('sigla_codice').notNull().default('NP'),
  backup: text('backup').notNull(),
  security: text('security').notNull()
})

export type AppSettingsRow = typeof appSettings.$inferSelect
export type NewAppSettings = typeof appSettings.$inferInsert
