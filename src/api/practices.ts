import type {
  GenerateCodiceIstanzaInput,
  GenerateCodiceIstanzaResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
  PracticesListResponse,
  GetPracticeInput,
  GetPracticeResponse,
  ListAvailableTransitionsInput,
  PracticesListAvailableTransitionsResponse,
  ExecuteTransitionInput,
  ExecuteTransitionResponse,
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
}
