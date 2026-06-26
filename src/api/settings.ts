import type {
  SettingsGetResponse,
  SettingsUpdateThemeResponse,
  UpdateThemeInput,
} from '../../shared/ipc'

export const settingsApi = {
  get: (): Promise<SettingsGetResponse> => window.api.settings.get(),
  updateTheme: (input: UpdateThemeInput): Promise<SettingsUpdateThemeResponse> =>
    window.api.settings.updateTheme(input),
}
