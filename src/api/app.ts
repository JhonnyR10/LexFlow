export const appApi = {
  getVersion: (): Promise<string> => window.api.app.getVersion()
}
