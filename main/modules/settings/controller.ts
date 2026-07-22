import { ipcMain } from 'electron'
import { z } from 'zod'
import { IPC_CHANNELS } from '../../../shared/ipc'
import type {
  SettingsGetAlertConfigResponse,
  SettingsGetResponse,
  SettingsOpenDataFolderResponse,
  SettingsUpdateAlertConfigResponse,
  SettingsUpdateThemeResponse,
} from '../../../shared/ipc'
import { THEME_KEYS } from '../../../shared/themes'
import { getAppSettings, openDataFolder, readAlertConfig, saveAlertConfig, updateTheme } from './service'
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

const alertLevelSchema = z.object({
  enabled: z.boolean(),
  thresholdDays: z.number().int().positive()
})
const alertConfigSchema = z.object({
  yellow: alertLevelSchema,
  orange: alertLevelSchema,
  red: alertLevelSchema
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

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_OPEN_DATA_FOLDER,
    (): Promise<SettingsOpenDataFolderResponse> => {
      logger.debug('IPC', IPC_CHANNELS.SETTINGS_OPEN_DATA_FOLDER)
      return openDataFolder()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_GET_ALERT_CONFIG,
    (): SettingsGetAlertConfigResponse => {
      logger.debug('IPC', IPC_CHANNELS.SETTINGS_GET_ALERT_CONFIG)
      return readAlertConfig()
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_UPDATE_ALERT_CONFIG,
    (_event, input: unknown): SettingsUpdateAlertConfigResponse => {
      logger.debug('IPC', IPC_CHANNELS.SETTINGS_UPDATE_ALERT_CONFIG)
      return saveAlertConfig(parseOrThrow(alertConfigSchema, input))
    }
  )
}
