import { app } from 'electron'
import { eq } from 'drizzle-orm'
import type { BackupConfig, BackupTrigger, UpdateBackupConfigInput } from '../../../shared/ipc'
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

// --- Config backup (JSON `app_settings.backup`) ---
// Lettura/scrittura centralizzate dell'oggetto JSON, robuste a valori illeggibili.

function readBackupObject(): Record<string, unknown> {
  const row = getDb()
    .select({ backup: appSettings.backup })
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ID))
    .get()
  if (!row) return {}
  try {
    const parsed: unknown = JSON.parse(row.backup)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function writeBackupObject(obj: Record<string, unknown>): void {
  getDb()
    .update(appSettings)
    .set({ backup: JSON.stringify(obj) })
    .where(eq(appSettings.id, SETTINGS_ID))
    .run()
}

const VALID_TRIGGERS: readonly BackupTrigger[] = ['onClose', 'interval', 'both']

// Config completa, con default per ogni campo mancante/illeggibile (robusto).
export function getBackupConfig(): BackupConfig {
  const o = readBackupObject()
  const bp = typeof o.backupPath === 'string' && o.backupPath.trim() ? o.backupPath : app.getPath('userData')
  const trigger = VALID_TRIGGERS.includes(o.trigger as BackupTrigger) ? (o.trigger as BackupTrigger) : 'onClose'
  const intervalHours = typeof o.intervalHours === 'number' && o.intervalHours >= 1 ? o.intervalHours : 24
  const retentionCount = typeof o.retentionCount === 'number' && o.retentionCount >= 1 ? o.retentionCount : 10
  return {
    autoEnabled: typeof o.autoEnabled === 'boolean' ? o.autoEnabled : true,
    trigger,
    intervalHours,
    retentionCount,
    backupPath: bp,
    lastBackupAt: typeof o.lastBackupAt === 'string' ? o.lastBackupAt : null,
  }
}

// Percorso di destinazione dei backup automatici (S11.4/S11.7). Fallback a userData.
export function getBackupPath(): string {
  return getBackupConfig().backupPath
}

// Aggiorna i soli campi editabili da form (S11.7), preservando backupPath/lastBackupAt.
export function updateBackupConfig(input: UpdateBackupConfigInput): void {
  const o = readBackupObject()
  o.autoEnabled = input.autoEnabled
  o.trigger = input.trigger
  o.intervalHours = input.intervalHours
  o.retentionCount = input.retentionCount
  writeBackupObject(o)
}

export function updateBackupPath(path: string): void {
  const o = readBackupObject()
  o.backupPath = path
  writeBackupObject(o)
}

// Aggiorna `lastBackupAt` dopo un backup riuscito (manuale o automatico).
export function updateBackupLastBackupAt(iso: string): void {
  const o = readBackupObject()
  o.lastBackupAt = iso
  writeBackupObject(o)
}
