import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult
} from '@tanstack/react-query'
import { configApi } from '../../../api/config'
import type {
  ConfigListTransitionsResponse,
  ConfigCreateTransitionResponse,
  ConfigUpdateTransitionResponse,
  ConfigSetTransitionActiveResponse,
  ConfigReorderTransitionsResponse,
  CreateTransitionInput,
  UpdateTransitionInput,
  SetTransitionActiveInput,
  ReorderTransitionsInput
} from '../../../../shared/ipc'

export const TRANSITIONS_QUERY_KEY = ['config', 'transitions'] as const

export function useAllTransitions(): UseQueryResult<ConfigListTransitionsResponse, Error> {
  return useQuery({
    queryKey: TRANSITIONS_QUERY_KEY,
    queryFn: () => configApi.listTransitions()
  })
}

export function useCreateTransition(): UseMutationResult<
  ConfigCreateTransitionResponse,
  Error,
  CreateTransitionInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransitionInput) => configApi.createTransition(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TRANSITIONS_QUERY_KEY })
    }
  })
}

export function useUpdateTransition(): UseMutationResult<
  ConfigUpdateTransitionResponse,
  Error,
  UpdateTransitionInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTransitionInput) => configApi.updateTransition(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TRANSITIONS_QUERY_KEY })
    }
  })
}

export function useSetTransitionActive(): UseMutationResult<
  ConfigSetTransitionActiveResponse,
  Error,
  SetTransitionActiveInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetTransitionActiveInput) => configApi.setTransitionActive(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TRANSITIONS_QUERY_KEY })
    }
  })
}

export function useReorderTransitions(): UseMutationResult<
  ConfigReorderTransitionsResponse,
  Error,
  ReorderTransitionsInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReorderTransitionsInput) => configApi.reorderTransitions(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TRANSITIONS_QUERY_KEY })
    }
  })
}
