import type {
  GenerateCodiceIstanzaInput,
  GenerateCodiceIstanzaResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
  PracticesListResponse,
  GetPracticeInput,
  GetPracticeResponse,
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
}
