import type { ConfigListPhasesResponse } from '../../shared/ipc'

export const configApi = {
  listPhases: (): Promise<ConfigListPhasesResponse> => window.api.config.listPhases()
}
