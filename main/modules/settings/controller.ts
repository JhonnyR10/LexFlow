import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type { SettingsGetResponse, SettingsUpdateThemeResponse } from '../../../shared/ipc'
import { THEME_KEYS } from '../../../shared/themes'
import { getAppSettings, updateTheme } from './service'
import { logger } from '../../utils/logger'

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Input non valido'
    throw new Error(msg)
  }
  return result.data
}

const updateThemeSchema = z.object({
  theme: z.enum(THEME_KEYS)
})

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, (): SettingsGetResponse => {
    logger.debug('IPC', IPC_CHANNELS.SETTINGS_GET)
    return getAppSettings()
  })

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_UPDATE_THEME,
    (_event, input: unknown): SettingsUpdateThemeResponse => {
      logger.debug('IPC', IPC_CHANNELS.SETTINGS_UPDATE_THEME)
      const parsed = parseOrThrow(updateThemeSchema, input)
      return updateTheme(parsed)
    }
  )
}
