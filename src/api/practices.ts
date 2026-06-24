import type {
  GenerateCodiceIstanzaInput,
  GenerateCodiceIstanzaResponse
} from '../../shared/ipc'

export const practicesApi = {
  generateCodiceIstanza: (
    input: GenerateCodiceIstanzaInput
  ): Promise<GenerateCodiceIstanzaResponse> =>
    window.api.practices.generateCodiceIstanza(input)
}
