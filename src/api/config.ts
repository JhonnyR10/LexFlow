import type {
  DeleteByIdInput,
  DeleteResponse,
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
  ConfigListMenuSetsResponse,
  ConfigCreateMenuSetResponse,
  ConfigUpdateMenuSetResponse,
  ConfigCreateMenuOptionResponse,
  ConfigUpdateMenuOptionResponse,
  ConfigSetMenuOptionActiveResponse,
  ConfigReorderMenuOptionsResponse,
  ConfigListFieldsResponse,
  ConfigCreateFieldResponse,
  ConfigUpdateFieldResponse,
  ConfigSetFieldActiveResponse,
  ConfigReorderFieldsResponse,
  CreatePhaseInput,
  UpdatePhaseInput,
  SetPhaseActiveInput,
  ReorderPhasesInput,
  CreateTransitionInput,
  UpdateTransitionInput,
  SetTransitionActiveInput,
  ReorderTransitionsInput,
  CreateMenuSetInput,
  UpdateMenuSetInput,
  CreateMenuOptionInput,
  UpdateMenuOptionInput,
  SetMenuOptionActiveInput,
  ReorderMenuOptionsInput,
  ListFieldsFilter,
  CreateFieldInput,
  UpdateFieldInput,
  SetFieldActiveInput,
  ReorderFieldsInput
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
    window.api.config.reorderTransitions(input),
  listMenuSets: (): Promise<ConfigListMenuSetsResponse> =>
    window.api.config.listMenuSets(),
  createMenuSet: (input: CreateMenuSetInput): Promise<ConfigCreateMenuSetResponse> =>
    window.api.config.createMenuSet(input),
  updateMenuSet: (input: UpdateMenuSetInput): Promise<ConfigUpdateMenuSetResponse> =>
    window.api.config.updateMenuSet(input),
  createMenuOption: (input: CreateMenuOptionInput): Promise<ConfigCreateMenuOptionResponse> =>
    window.api.config.createMenuOption(input),
  updateMenuOption: (input: UpdateMenuOptionInput): Promise<ConfigUpdateMenuOptionResponse> =>
    window.api.config.updateMenuOption(input),
  setMenuOptionActive: (input: SetMenuOptionActiveInput): Promise<ConfigSetMenuOptionActiveResponse> =>
    window.api.config.setMenuOptionActive(input),
  reorderMenuOptions: (input: ReorderMenuOptionsInput): Promise<ConfigReorderMenuOptionsResponse> =>
    window.api.config.reorderMenuOptions(input),
  listFields: (filter?: ListFieldsFilter): Promise<ConfigListFieldsResponse> =>
    window.api.config.listFields(filter),
  createField: (input: CreateFieldInput): Promise<ConfigCreateFieldResponse> =>
    window.api.config.createField(input),
  updateField: (input: UpdateFieldInput): Promise<ConfigUpdateFieldResponse> =>
    window.api.config.updateField(input),
  setFieldActive: (input: SetFieldActiveInput): Promise<ConfigSetFieldActiveResponse> =>
    window.api.config.setFieldActive(input),
  reorderFields: (input: ReorderFieldsInput): Promise<ConfigReorderFieldsResponse> =>
    window.api.config.reorderFields(input),
  deletePhase: (input: DeleteByIdInput): Promise<DeleteResponse> =>
    window.api.config.deletePhase(input),
  deleteTransition: (input: DeleteByIdInput): Promise<DeleteResponse> =>
    window.api.config.deleteTransition(input),
  deleteField: (input: DeleteByIdInput): Promise<DeleteResponse> =>
    window.api.config.deleteField(input),
  deleteMenuSet: (input: DeleteByIdInput): Promise<DeleteResponse> =>
    window.api.config.deleteMenuSet(input),
  deleteMenuOption: (input: DeleteByIdInput): Promise<DeleteResponse> =>
    window.api.config.deleteMenuOption(input)
}
