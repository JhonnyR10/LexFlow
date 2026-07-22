import { eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { appSettings, type AppSettingsRow } from '../../database/schema'
import type { AlertConfig } from '../../../shared/ipc'
import { logger } from '../../utils/logger'

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

// --- Config avvisi Dashboard (S11.5) ---
// Persistita su due colonne JSON con chiavi IT (giallo/arancione/rosso), mappate
// alla nomenclatura EN dell'API. Default 30/60/90 tutti attivi.
const DEFAULT_ALERT_CONFIG: AlertConfig = {
  yellow: { enabled: true, thresholdDays: 30 },
  orange: { enabled: true, thresholdDays: 60 },
  red:    { enabled: true, thresholdDays: 90 },
}

function boolOr(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}
function intOr(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

// Lettura robusta: qualsiasi JSON mancante/malformato ricade sui default (mai
// throw). Riusata dal dashboard service per calcolare la severità degli alert.
export function getAlertConfig(): AlertConfig {
  const row = getAppSettingsRow()
  const d = DEFAULT_ALERT_CONFIG
  try {
    const enabled = row ? JSON.parse(row.alertsEnabled) : {}
    const thr = row ? JSON.parse(row.alertThresholds) : {}
    return {
      yellow: { enabled: boolOr(enabled.giallo, d.yellow.enabled),    thresholdDays: intOr(thr.giallo, d.yellow.thresholdDays) },
      orange: { enabled: boolOr(enabled.arancione, d.orange.enabled), thresholdDays: intOr(thr.arancione, d.orange.thresholdDays) },
      red:    { enabled: boolOr(enabled.rosso, d.red.enabled),        thresholdDays: intOr(thr.rosso, d.red.thresholdDays) },
    }
  } catch (err) {
    logger.warn('ALERT_CONFIG_PARSE', err instanceof Error ? err.message : String(err))
    return d
  }
}

// Scrive le due colonne JSON dall'AlertConfig (rimappa EN → chiavi IT del DB).
export function updateAlertConfig(cfg: AlertConfig): number {
  const alertsEnabled = JSON.stringify({
    giallo: cfg.yellow.enabled,
    arancione: cfg.orange.enabled,
    rosso: cfg.red.enabled,
  })
  const alertThresholds = JSON.stringify({
    giallo: cfg.yellow.thresholdDays,
    arancione: cfg.orange.thresholdDays,
    rosso: cfg.red.thresholdDays,
  })
  const result = getDb()
    .update(appSettings)
    .set({ alertsEnabled, alertThresholds })
    .where(eq(appSettings.id, SETTINGS_ID))
    .run()
  return result.changes
}
