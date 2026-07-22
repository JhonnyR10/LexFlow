import type { AppInfoResponse } from '../../shared/ipc'

export const appApi = {
  getVersion: (): Promise<string> => window.api.app.getVersion(),
  getInfo: (): Promise<AppInfoResponse> => window.api.app.getInfo(),
}
