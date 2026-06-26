import type {
  GenerateCodiceIstanzaInput,
  GenerateCodiceIstanzaResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
  UpdatePracticeInput,
  UpdatePracticeResponse,
  PracticesListResponse,
  GetPracticeInput,
  GetPracticeResponse,
  ListAvailableTransitionsInput,
  PracticesListAvailableTransitionsResponse,
  ExecuteTransitionInput,
  ExecuteTransitionResponse,
  MoveToTrashInput,
  MoveToTrashResponse,
  RestoreFromTrashInput,
  RestoreFromTrashResponse,
  PracticesListTrashedResponse,
} from '../../shared/ipc'

export const practicesApi = {
  generateCodiceIstanza: (
    input: GenerateCodiceIstanzaInput
  ): Promise<GenerateCodiceIstanzaResponse> =>
    window.api.practices.generateCodiceIstanza(input),

  createPractice: (
    input: CreatePracticeInput
  ): Promise<CreatePracticeResponse> =>
    window.api.practices.createPractice(input),

  updatePractice: (
    input: UpdatePracticeInput
  ): Promise<UpdatePracticeResponse> =>
    window.api.practices.updatePractice(input),

  listPractices: (): Promise<PracticesListResponse> =>
    window.api.practices.listPractices(),

  getPractice: (input: GetPracticeInput): Promise<GetPracticeResponse> =>
    window.api.practices.getPractice(input),

  listAvailableTransitions: (
    input: ListAvailableTransitionsInput
  ): Promise<PracticesListAvailableTransitionsResponse> =>
    window.api.practices.listAvailableTransitions(input),

  executeTransition: (
    input: ExecuteTransitionInput
  ): Promise<ExecuteTransitionResponse> =>
    window.api.practices.executeTransition(input),

  moveToTrash: (input: MoveToTrashInput): Promise<MoveToTrashResponse> =>
    window.api.practices.moveToTrash(input),

  restore: (input: RestoreFromTrashInput): Promise<RestoreFromTrashResponse> =>
    window.api.practices.restore(input),

  listTrashed: (): Promise<PracticesListTrashedResponse> =>
    window.api.practices.listTrashed(),
}
