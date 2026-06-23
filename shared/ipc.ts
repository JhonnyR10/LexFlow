export const IPC_CHANNELS = {
  APP_GET_VERSION: 'app:getVersion'
} as const

export type AppGetVersionResponse = string

export interface LexFlowApi {
  app: {
    getVersion(): Promise<AppGetVersionResponse>
  }
}
