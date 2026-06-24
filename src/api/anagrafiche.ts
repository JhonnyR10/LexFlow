import type {
  AnagraficheListProfessionistiResponse,
  AnagraficheCreateProfessionistaResponse,
  AnagraficheUpdateProfessionistaResponse,
  AnagraficheSetProfessionistaActiveResponse,
  CreateProfessionistaInput,
  UpdateProfessionistaInput,
  SetProfessionistaActiveInput
} from '../../shared/ipc'

export const anagraficheApi = {
  listProfessionisti: (): Promise<AnagraficheListProfessionistiResponse> =>
    window.api.anagrafiche.listProfessionisti(),

  createProfessionista: (
    input: CreateProfessionistaInput
  ): Promise<AnagraficheCreateProfessionistaResponse> =>
    window.api.anagrafiche.createProfessionista(input),

  updateProfessionista: (
    input: UpdateProfessionistaInput
  ): Promise<AnagraficheUpdateProfessionistaResponse> =>
    window.api.anagrafiche.updateProfessionista(input),

  setProfessionistaActive: (
    input: SetProfessionistaActiveInput
  ): Promise<AnagraficheSetProfessionistaActiveResponse> =>
    window.api.anagrafiche.setProfessionistaActive(input)
}
