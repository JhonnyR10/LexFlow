import type { ResetArchiveResponse } from '../../shared/ipc'

export const resetApi = {
  archive: (): Promise<ResetArchiveResponse> => window.api.reset.archive(),
}
