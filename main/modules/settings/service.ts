import { app, dialog, shell, type BrowserWindow } from 'electron'
import { accessSync, constants, existsSync } from 'fs'
import { isAbsolute, join, relative, resolve } from 'path'
import type {
  AlertConfig,
  SettingsChangeDataPathResponse,
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
import { writePendingMove } from '../../config/dataPathMove'
import { checkpointDb } from '../../database/connection'
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

// True se `child` è contenuto in `parent` (o coincide): evita copie ricorsive.
function isInsideOrEqual(child: string, parent: string): boolean {
  const rel = relative(parent, child)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

// Spostamento del percorso dati (S11.2b): sceglie la cartella, valida, programma
// il move (marker) e riavvia. Lo swap effettivo avviene a freddo al boot.
export async function changeDataPath(
  win: BrowserWindow | null
): Promise<SettingsChangeDataPathResponse> {
  const picked = win
    ? await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] })
    : await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
  if (picked.canceled || picked.filePaths.length === 0) {
    return { canceled: true }
  }

  const target = resolve(picked.filePaths[0])
  const current = resolve(getDataPath())

  if (target === current) {
    throw new ValidationError('La cartella scelta è già il percorso dati corrente.')
  }
  if (isInsideOrEqual(target, current) || isInsideOrEqual(current, target)) {
    throw new ValidationError('Scegli una cartella non contenuta nel percorso dati corrente (né viceversa).')
  }
  try {
    accessSync(target, constants.W_OK)
  } catch {
    throw new ValidationError('La cartella scelta non è scrivibile.')
  }
  if (existsSync(join(target, 'lexflow.db'))) {
    throw new ValidationError('La cartella scelta contiene già un archivio LexFlow.')
  }

  // Consolida il WAL nel file DB così la copia a freddo è consistente.
  checkpointDb()
  writePendingMove(target)
  logger.info('DATA_PATH_MOVE_SCHEDULED', `${current} → ${target}`)

  app.relaunch()
  app.exit(0)
  return { canceled: false, willRestart: true }
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
