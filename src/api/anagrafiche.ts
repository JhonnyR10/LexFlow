import type {
  AnagraficheListProfessionistiResponse,
  AnagraficheCreateProfessionistaResponse,
  AnagraficheUpdateProfessionistaResponse,
  AnagraficheSetProfessionistaActiveResponse,
  CreateProfessionistaInput,
  UpdateProfessionistaInput,
  SetProfessionistaActiveInput,
  AnagraficheListCollaboratoriResponse,
  AnagraficheCreateCollaboratoreResponse,
  AnagraficheUpdateCollaboratoreResponse,
  AnagraficheSetCollaboratoreActiveResponse,
  CreateCollaboratoreInput,
  UpdateCollaboratoreInput,
  SetCollaboratoreActiveInput
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
    window.api.anagrafiche.setProfessionistaActive(input),

  listCollaboratori: (): Promise<AnagraficheListCollaboratoriResponse> =>
    window.api.anagrafiche.listCollaboratori(),

  createCollaboratore: (
    input: CreateCollaboratoreInput
  ): Promise<AnagraficheCreateCollaboratoreResponse> =>
    window.api.anagrafiche.createCollaboratore(input),

  updateCollaboratore: (
    input: UpdateCollaboratoreInput
  ): Promise<AnagraficheUpdateCollaboratoreResponse> =>
    window.api.anagrafiche.updateCollaboratore(input),

  setCollaboratoreActive: (
    input: SetCollaboratoreActiveInput
  ): Promise<AnagraficheSetCollaboratoreActiveResponse> =>
    window.api.anagrafiche.setCollaboratoreActive(input)
}
