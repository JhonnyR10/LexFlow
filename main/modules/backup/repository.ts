import { app } from 'electron'
import { eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import {
  appSettings,
  collaboratori,
  documents,
  fieldDefs,
  historyEvents,
  menuOptions,
  menuSets,
  pecRecipients,
  phases,
  practices,
  professionisti,
  transitionRecords,
  transitions,
} from '../../database/schema'

// La riga delle impostazioni è unica (id=1), garantita dal seed a boot.
const SETTINGS_ID = 1

// Tutte le tabelle del dominio, con il nome stabile usato nel dump JSON
// (`data.json`) e nel manifest del backup (S11.3).
const ALL_TABLES = {
  phases,
  transitions,
  field_defs: fieldDefs,
  menu_sets: menuSets,
  menu_options: menuOptions,
  app_settings: appSettings,
  professionisti,
  collaboratori,
  practices,
  history_events: historyEvents,
  pec_recipients: pecRecipients,
  transition_records: transitionRecords,
  documents,
} as const

export function tableNames(): string[] {
  return Object.keys(ALL_TABLES)
}

// Dump completo di tutte le tabelle: copia di sicurezza/ispezione dentro l'archivio.
export function dumpAllTables(): Record<string, unknown[]> {
  const db = getDb()
  const out: Record<string, unknown[]> = {}
  for (const [name, table] of Object.entries(ALL_TABLES)) {
    out[name] = db.select().from(table).all()
  }
  return out
}

// Percorso di destinazione dei backup automatici (es. pre-reset, S11.4), letto da
// `app_settings.backup.backupPath`. Fallback robusto a userData se assente/illeggibile.
export function getBackupPath(): string {
  const fallback = app.getPath('userData')
  const row = getDb()
    .select({ backup: appSettings.backup })
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .get()
  if (!row) return fallback
  try {
    const parsed: unknown = JSON.parse(row.backup)
    if (parsed && typeof parsed === 'object') {
      const bp = (parsed as Record<string, unknown>).backupPath
      if (typeof bp === 'string' && bp.trim()) return bp
    }
  } catch {
    return fallback
  }
  return fallback
}

// Aggiorna `app_settings.backup.lastBackupAt` (JSON serializzato) dopo un backup
// manuale riuscito. Robusto: se il JSON fosse illeggibile, riparte da un oggetto vuoto.
export function updateBackupLastBackupAt(iso: string): void {
  const db = getDb()
  const row = db
    .select({ backup: appSettings.backup })
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .get()
  if (!row) return

  let backup: Record<string, unknown> = {}
  try {
    const parsed: unknown = JSON.parse(row.backup)
    if (parsed && typeof parsed === 'object') {
      backup = parsed as Record<string, unknown>
    }
  } catch {
    backup = {}
  }
  backup.lastBackupAt = iso

  db
    .update(appSettings)
    .set({ backup: JSON.stringify(backup) })
    .where(eq(appSettings.id, SETTINGS_ID))
    .run()
}
