import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult
} from '@tanstack/react-query'
import { configApi } from '../../../api/config'
import type {
  ConfigListFieldsResponse,
  ConfigCreateFieldResponse,
  ConfigUpdateFieldResponse,
  ConfigSetFieldActiveResponse,
  ConfigReorderFieldsResponse,
  ListFieldsFilter,
  CreateFieldInput,
  UpdateFieldInput,
  SetFieldActiveInput,
  ReorderFieldsInput
} from '../../../../shared/ipc'

export const FIELDS_QUERY_KEY = ['config', 'fields'] as const

export function useFields(
  filter?: ListFieldsFilter,
  enabled = true
): UseQueryResult<ConfigListFieldsResponse, Error> {
  return useQuery({
    queryKey: [...FIELDS_QUERY_KEY, filter],
    queryFn: () => configApi.listFields(filter),
    enabled
  })
}

export function useCreateField(): UseMutationResult<
  ConfigCreateFieldResponse,
  Error,
  CreateFieldInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFieldInput) => configApi.createField(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: FIELDS_QUERY_KEY })
    }
  })
}

export function useUpdateField(): UseMutationResult<
  ConfigUpdateFieldResponse,
  Error,
  UpdateFieldInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateFieldInput) => configApi.updateField(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: FIELDS_QUERY_KEY })
    }
  })
}

export function useSetFieldActive(): UseMutationResult<
  ConfigSetFieldActiveResponse,
  Error,
  SetFieldActiveInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetFieldActiveInput) => configApi.setFieldActive(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: FIELDS_QUERY_KEY })
    }
  })
}

export function useReorderFields(): UseMutationResult<
  ConfigReorderFieldsResponse,
  Error,
  ReorderFieldsInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReorderFieldsInput) => configApi.reorderFields(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: FIELDS_QUERY_KEY })
    }
  })
}
