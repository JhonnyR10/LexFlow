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
  MoveToTrashInput,
  MoveToTrashResponse,
  PracticesListTrashedResponse,
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
      // I conteggi per fase della Dashboard (S8.1) cambiano con la nuova pratica.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
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

export function useTrashedPractices(): UseQueryResult<PracticesListTrashedResponse, Error> {
  return useQuery({
    queryKey: ['trash'],
    queryFn: () => practicesApi.listTrashed(),
  })
}

// Sposta una o più pratiche nel cestino (S10.1). Le pratiche cestinate escono
// da elenco/Dashboard/alert ed entrano nel cestino: invalidiamo le relative
// query, più il dettaglio di ciascuna pratica coinvolta.
export function useMoveToTrash(): UseMutationResult<MoveToTrashResponse, Error, MoveToTrashInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MoveToTrashInput) => practicesApi.moveToTrash(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
      queryClient.invalidateQueries({ queryKey: ['trash'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      for (const id of variables.ids) {
        queryClient.invalidateQueries({ queryKey: ['practice', id] })
      }
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
      // L'avanzamento sposta la pratica di fase: i conteggi Dashboard (S8.1) cambiano.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
