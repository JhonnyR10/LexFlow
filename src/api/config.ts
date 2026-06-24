import type { ConfigListPhasesResponse, ConfigListTransitionsResponse } from '../../shared/ipc'

export const configApi = {
  listPhases: (): Promise<ConfigListPhasesResponse> => window.api.config.listPhases(),
  listTransitions: (): Promise<ConfigListTransitionsResponse> => window.api.config.listTransitions()
}
