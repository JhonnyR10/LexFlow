import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult
} from '@tanstack/react-query'
import { configApi } from '../../../api/config'
import type {
  ConfigListAllPhasesResponse,
  ConfigCreatePhaseResponse,
  ConfigUpdatePhaseResponse,
  ConfigSetPhaseActiveResponse,
  ConfigReorderPhasesResponse,
  CreatePhaseInput,
  UpdatePhaseInput,
  SetPhaseActiveInput,
  ReorderPhasesInput
} from '../../../../shared/ipc'

const QUERY_KEY = ['config', 'phases', 'all'] as const

export function useAllPhases(): UseQueryResult<ConfigListAllPhasesResponse, Error> {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => configApi.listAllPhases()
  })
}

export function useCreatePhase(): UseMutationResult<
  ConfigCreatePhaseResponse,
  Error,
  CreatePhaseInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePhaseInput) => configApi.createPhase(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
      void qc.invalidateQueries({ queryKey: ['config', 'phases'] })
    }
  })
}

export function useUpdatePhase(): UseMutationResult<
  ConfigUpdatePhaseResponse,
  Error,
  UpdatePhaseInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePhaseInput) => configApi.updatePhase(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
      void qc.invalidateQueries({ queryKey: ['config', 'phases'] })
    }
  })
}

export function useSetPhaseActive(): UseMutationResult<
  ConfigSetPhaseActiveResponse,
  Error,
  SetPhaseActiveInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetPhaseActiveInput) => configApi.setPhaseActive(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
      void qc.invalidateQueries({ queryKey: ['config', 'phases'] })
    }
  })
}

export function useReorderPhases(): UseMutationResult<
  ConfigReorderPhasesResponse,
  Error,
  ReorderPhasesInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReorderPhasesInput) => configApi.reorderPhases(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY })
    }
  })
}
