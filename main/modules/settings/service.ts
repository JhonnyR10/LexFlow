import { shell } from 'electron'
import type {
  AlertConfig,
  SettingsGetAlertConfigResponse,
  SettingsGetResponse,
  SettingsOpenDataFolderResponse,
  SettingsUpdateAlertConfigResponse,
  SettingsUpdateThemeResponse,
  UpdateAlertConfigInput,
  UpdateThemeInput,
} from '../../../shared/ipc'
import { DEFAULT_THEME, isThemeKey, type ThemeKey } from '../../../shared/themes'
import { NotFoundError, ValidationError } from '../../errors/AppError'
import { getDataPath } from '../../config/dataPath'
import { logger } from '../../utils/logger'
import { getAlertConfig, getAppSettingsRow, updateAlertConfig, updateThemeRow } from './repository'

// Normalizza il tema letto dal DB: se per qualche ragione contenesse un valore
// non più valido (es. tema rimosso), ricade sul default invece di propagare un
// valore fuori dominio al renderer.
function readTheme(): ThemeKey {
  const row = getAppSettingsRow()
  return isThemeKey(row?.theme) ? row.theme : DEFAULT_THEME
}

// Il percorso dati esposto è quello RISOLTO dal puntatore di bootstrap
// (config.json in userData), non la colonna DB legacy `app_settings.dataPath`.
export function getAppSettings(): SettingsGetResponse {
  return { theme: readTheme(), dataPath: getDataPath() }
}

export function updateTheme(input: UpdateThemeInput): SettingsUpdateThemeResponse {
  if (!isThemeKey(input.theme)) {
    throw new ValidationError(`Tema non valido: ${String(input.theme)}`)
  }
  const changes = updateThemeRow(input.theme)
  if (changes === 0) {
    throw new NotFoundError('Impostazioni non trovate')
  }
  return { theme: input.theme, dataPath: getDataPath() }
}

// Config avvisi Dashboard (S11.5): pass-through dal repository.
export function readAlertConfig(): SettingsGetAlertConfigResponse {
  return getAlertConfig()
}

// Valida e persiste la config avvisi. Soglie: interi positivi e strettamente
// crescenti (giallo < arancione < rosso). Le abilitazioni non hanno vincoli.
export function saveAlertConfig(
  input: UpdateAlertConfigInput
): SettingsUpdateAlertConfigResponse {
  assertAlertConfig(input)
  const changes = updateAlertConfig(input)
  if (changes === 0) {
    throw new NotFoundError('Impostazioni non trovate')
  }
  return getAlertConfig()
}

function assertAlertConfig(cfg: AlertConfig): void {
  const { yellow, orange, red } = cfg
  for (const [name, level] of [['giallo', yellow], ['arancione', orange], ['rosso', red]] as const) {
    if (!Number.isInteger(level.thresholdDays) || level.thresholdDays <= 0) {
      throw new ValidationError(`La soglia «${name}» deve essere un numero di giorni positivo.`)
    }
  }
  if (!(yellow.thresholdDays < orange.thresholdDays && orange.thresholdDays < red.thresholdDays)) {
    throw new ValidationError(
      'Le soglie devono essere crescenti: giallo < arancione < rosso.'
    )
  }
}

// Apre la cartella dati nel file manager di sistema (S11.2). `shell.openPath`
// ritorna stringa vuota in caso di successo, un messaggio d'errore altrimenti.
export async function openDataFolder(): Promise<SettingsOpenDataFolderResponse> {
  const dataPath = getDataPath()
  const errMsg = await shell.openPath(dataPath)
  if (errMsg) {
    logger.warn('SETTINGS_OPEN_DATA_FOLDER_FAILED', `${dataPath}: ${errMsg}`)
    return { success: false }
  }
  return { success: true }
}
