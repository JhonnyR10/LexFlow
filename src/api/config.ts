import type {
  ConfigListPhasesResponse,
  ConfigListAllPhasesResponse,
  ConfigListTransitionsResponse,
  ConfigCreatePhaseResponse,
  ConfigUpdatePhaseResponse,
  ConfigSetPhaseActiveResponse,
  ConfigReorderPhasesResponse,
  ConfigCreateTransitionResponse,
  ConfigUpdateTransitionResponse,
  ConfigSetTransitionActiveResponse,
  ConfigReorderTransitionsResponse,
  CreatePhaseInput,
  UpdatePhaseInput,
  SetPhaseActiveInput,
  ReorderPhasesInput,
  CreateTransitionInput,
  UpdateTransitionInput,
  SetTransitionActiveInput,
  ReorderTransitionsInput
} from '../../shared/ipc'

export const configApi = {
  listPhases: (): Promise<ConfigListPhasesResponse> => window.api.config.listPhases(),
  listAllPhases: (): Promise<ConfigListAllPhasesResponse> => window.api.config.listAllPhases(),
  listTransitions: (): Promise<ConfigListTransitionsResponse> =>
    window.api.config.listTransitions(),
  createPhase: (input: CreatePhaseInput): Promise<ConfigCreatePhaseResponse> =>
    window.api.config.createPhase(input),
  updatePhase: (input: UpdatePhaseInput): Promise<ConfigUpdatePhaseResponse> =>
    window.api.config.updatePhase(input),
  setPhaseActive: (input: SetPhaseActiveInput): Promise<ConfigSetPhaseActiveResponse> =>
    window.api.config.setPhaseActive(input),
  reorderPhases: (input: ReorderPhasesInput): Promise<ConfigReorderPhasesResponse> =>
    window.api.config.reorderPhases(input),
  createTransition: (input: CreateTransitionInput): Promise<ConfigCreateTransitionResponse> =>
    window.api.config.createTransition(input),
  updateTransition: (input: UpdateTransitionInput): Promise<ConfigUpdateTransitionResponse> =>
    window.api.config.updateTransition(input),
  setTransitionActive: (input: SetTransitionActiveInput): Promise<ConfigSetTransitionActiveResponse> =>
    window.api.config.setTransitionActive(input),
  reorderTransitions: (input: ReorderTransitionsInput): Promise<ConfigReorderTransitionsResponse> =>
    window.api.config.reorderTransitions(input)
}
