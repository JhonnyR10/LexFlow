import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import type {
  AnagraficheListProfessionistiResponse,
  AnagraficheCreateProfessionistaResponse,
  AnagraficheUpdateProfessionistaResponse,
  AnagraficheSetProfessionistaActiveResponse,
  CreateProfessionistaInput,
  UpdateProfessionistaInput,
  SetProfessionistaActiveInput,
  DeleteByIdInput,
  DeleteResponse
} from '../../../../shared/ipc'
import { anagraficheApi } from '../../../api/anagrafiche'

const QUERY_KEY = ['anagrafiche', 'professionisti'] as const

export function useAllProfessionisti(): UseQueryResult<AnagraficheListProfessionistiResponse, Error> {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => anagraficheApi.listProfessionisti()
  })
}

export function useCreateProfessionista(): UseMutationResult<
  AnagraficheCreateProfessionistaResponse,
  Error,
  CreateProfessionistaInput
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProfessionistaInput) =>
      anagraficheApi.createProfessionista(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useUpdateProfessionista(): UseMutationResult<
  AnagraficheUpdateProfessionistaResponse,
  Error,
  UpdateProfessionistaInput
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfessionistaInput) =>
      anagraficheApi.updateProfessionista(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useSetProfessionistaActive(): UseMutationResult<
  AnagraficheSetProfessionistaActiveResponse,
  Error,
  SetProfessionistaActiveInput
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetProfessionistaActiveInput) =>
      anagraficheApi.setProfessionistaActive(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}

export function useDeleteProfessionista(): UseMutationResult<DeleteResponse, Error, DeleteByIdInput, unknown> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteByIdInput) => anagraficheApi.deleteProfessionista(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}
