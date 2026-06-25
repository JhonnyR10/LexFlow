import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { practicesApi } from '../../api/practices'
import type {
  CreatePracticeInput,
  CreatePracticeResponse,
  UpdatePracticeInput,
  UpdatePracticeResponse,
  GetPracticeResponse,
  PracticesListResponse,
  PracticesListAvailableTransitionsResponse,
  ExecuteTransitionInput,
  ExecuteTransitionResponse,
} from '../../../shared/ipc'

export function useActivePractices(): UseQueryResult<PracticesListResponse, Error> {
  return useQuery({
    queryKey: ['practices'],
    queryFn: () => practicesApi.listPractices(),
  })
}

export function usePracticeDetail(id: number | null): UseQueryResult<GetPracticeResponse, Error> {
  return useQuery({
    queryKey: ['practice', id],
    queryFn: () => practicesApi.getPractice({ id: id as number }),
    enabled: id != null,
  })
}

export function useAvailableTransitions(
  practiceId: number | null
): UseQueryResult<PracticesListAvailableTransitionsResponse, Error> {
  return useQuery({
    queryKey: ['practice', practiceId, 'transitions'],
    queryFn: () => practicesApi.listAvailableTransitions({ practiceId: practiceId as number }),
    enabled: practiceId != null,
  })
}

export function useCreatePractice(): UseMutationResult<CreatePracticeResponse, Error, CreatePracticeInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePracticeInput) => practicesApi.createPractice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
    },
  })
}

export function useUpdatePractice(
  practiceId: number
): UseMutationResult<UpdatePracticeResponse, Error, UpdatePracticeInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePracticeInput) => practicesApi.updatePractice(input),
    onSuccess: () => {
      // Dettaglio (dati + nuovo evento storico) ed elenco vanno ricaricati.
      queryClient.invalidateQueries({ queryKey: ['practice', practiceId] })
      queryClient.invalidateQueries({ queryKey: ['practices'] })
    },
  })
}

export function useExecuteTransition(
  practiceId: number
): UseMutationResult<ExecuteTransitionResponse, Error, ExecuteTransitionInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExecuteTransitionInput) => practicesApi.executeTransition(input),
    onSuccess: () => {
      // La pratica cambia fase/storico e l'elenco azioni disponibili va ricalcolato.
      queryClient.invalidateQueries({ queryKey: ['practice', practiceId] })
      queryClient.invalidateQueries({ queryKey: ['practice', practiceId, 'transitions'] })
      queryClient.invalidateQueries({ queryKey: ['practices'] })
    },
  })
}
