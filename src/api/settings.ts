import type {
  SettingsGetAlertConfigResponse,
  SettingsGetResponse,
  SettingsOpenDataFolderResponse,
  SettingsUpdateAlertConfigResponse,
  SettingsUpdateThemeResponse,
  UpdateAlertConfigInput,
  UpdateThemeInput,
} from '../../shared/ipc'

export const settingsApi = {
  get: (): Promise<SettingsGetResponse> => window.api.settings.get(),
  updateTheme: (input: UpdateThemeInput): Promise<SettingsUpdateThemeResponse> =>
    window.api.settings.updateTheme(input),
  openDataFolder: (): Promise<SettingsOpenDataFolderResponse> =>
    window.api.settings.openDataFolder(),
  getAlertConfig: (): Promise<SettingsGetAlertConfigResponse> =>
    window.api.settings.getAlertConfig(),
  updateAlertConfig: (
    input: UpdateAlertConfigInput
  ): Promise<SettingsUpdateAlertConfigResponse> => window.api.settings.updateAlertConfig(input),
}
