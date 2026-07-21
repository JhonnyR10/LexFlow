import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import type {
  AnagraficheListCollaboratoriResponse,
  AnagraficheCreateCollaboratoreResponse,
  AnagraficheUpdateCollaboratoreResponse,
  AnagraficheSetCollaboratoreActiveResponse,
  CreateCollaboratoreInput,
  UpdateCollaboratoreInput,
  SetCollaboratoreActiveInput,
  DeleteByIdInput,
  DeleteResponse
} from '../../../../shared/ipc'
import { anagraficheApi } from '../../../api/anagrafiche'

const QUERY_KEY = ['anagrafiche', 'collaboratori'] as const

export function useAllCollaboratori(): UseQueryResult<AnagraficheListCollaboratoriResponse, Error> {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => anagraficheApi.listCollaboratori()
  })
}

export function useCreateCollaboratore(): UseMutationResult<
  AnagraficheCreateCollaboratoreResponse,
  Error,
  CreateCollaboratoreInput
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCollaboratoreInput) =>
      anagraficheApi.createCollaboratore(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useUpdateCollaboratore(): UseMutationResult<
  AnagraficheUpdateCollaboratoreResponse,
  Error,
  UpdateCollaboratoreInput
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCollaboratoreInput) =>
      anagraficheApi.updateCollaboratore(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useSetCollaboratoreActive(): UseMutationResult<
  AnagraficheSetCollaboratoreActiveResponse,
  Error,
  SetCollaboratoreActiveInput
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetCollaboratoreActiveInput) =>
      anagraficheApi.setCollaboratoreActive(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useDeleteCollaboratore(): UseMutationResult<DeleteResponse, Error, DeleteByIdInput, unknown> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteByIdInput) => anagraficheApi.deleteCollaboratore(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}
