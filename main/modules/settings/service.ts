import type {
  SettingsGetResponse,
  SettingsUpdateThemeResponse,
  UpdateThemeInput,
} from '../../../shared/ipc'
import { DEFAULT_THEME, isThemeKey, type ThemeKey } from '../../../shared/themes'
import { NotFoundError, ValidationError } from '../../errors/AppError'
import { getAppSettingsRow, updateThemeRow } from './repository'

// Normalizza il tema letto dal DB: se per qualche ragione contenesse un valore
// non più valido (es. tema rimosso), ricade sul default invece di propagare un
// valore fuori dominio al renderer.
function readTheme(): ThemeKey {
  const row = getAppSettingsRow()
  return isThemeKey(row?.theme) ? row.theme : DEFAULT_THEME
}

export function getAppSettings(): SettingsGetResponse {
  return { theme: readTheme() }
}

export function updateTheme(input: UpdateThemeInput): SettingsUpdateThemeResponse {
  if (!isThemeKey(input.theme)) {
    throw new ValidationError(`Tema non valido: ${String(input.theme)}`)
  }
  const changes = updateThemeRow(input.theme)
  if (changes === 0) {
    throw new NotFoundError('Impostazioni non trovate')
  }
  return { theme: input.theme }
}
