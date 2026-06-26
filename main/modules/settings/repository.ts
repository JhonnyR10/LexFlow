import { eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { appSettings, type AppSettingsRow } from '../../database/schema'

// La riga delle impostazioni è unica (id=1) ed è garantita dal seed a boot.
const SETTINGS_ID = 1

export function getAppSettingsRow(): AppSettingsRow | undefined {
  return getDb().select().from(appSettings).where(eq(appSettings.id, SETTINGS_ID)).get()
}

// Aggiorna la sola colonna `theme`. Ritorna le righe modificate (0 se assente).
export function updateThemeRow(theme: string): number {
  const result = getDb()
    .update(appSettings)
    .set({ theme })
    .where(eq(appSettings.id, SETTINGS_ID))
    .run()
  return result.changes
}
