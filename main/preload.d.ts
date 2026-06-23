import type { LexFlowApi } from '../shared/ipc'

declare global {
  interface Window {
    api: LexFlowApi
  }
}
