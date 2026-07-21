import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult
} from '@tanstack/react-query'
import { configApi } from '../../../api/config'
import type {
  ConfigListMenuSetsResponse,
  ConfigCreateMenuSetResponse,
  ConfigUpdateMenuSetResponse,
  ConfigCreateMenuOptionResponse,
  ConfigUpdateMenuOptionResponse,
  ConfigSetMenuOptionActiveResponse,
  ConfigReorderMenuOptionsResponse,
  CreateMenuSetInput,
  UpdateMenuSetInput,
  CreateMenuOptionInput,
  UpdateMenuOptionInput,
  SetMenuOptionActiveInput,
  ReorderMenuOptionsInput,
  DeleteByIdInput,
  DeleteResponse
} from '../../../../shared/ipc'

export const MENU_SETS_QUERY_KEY = ['config', 'menuSets'] as const

export function useMenuSets(): UseQueryResult<ConfigListMenuSetsResponse, Error> {
  return useQuery({
    queryKey: MENU_SETS_QUERY_KEY,
    queryFn: () => configApi.listMenuSets()
  })
}

export function useCreateMenuSet(): UseMutationResult<
  ConfigCreateMenuSetResponse,
  Error,
  CreateMenuSetInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMenuSetInput) => configApi.createMenuSet(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useUpdateMenuSet(): UseMutationResult<
  ConfigUpdateMenuSetResponse,
  Error,
  UpdateMenuSetInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateMenuSetInput) => configApi.updateMenuSet(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useCreateMenuOption(): UseMutationResult<
  ConfigCreateMenuOptionResponse,
  Error,
  CreateMenuOptionInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMenuOptionInput) => configApi.createMenuOption(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useUpdateMenuOption(): UseMutationResult<
  ConfigUpdateMenuOptionResponse,
  Error,
  UpdateMenuOptionInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateMenuOptionInput) => configApi.updateMenuOption(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useSetMenuOptionActive(): UseMutationResult<
  ConfigSetMenuOptionActiveResponse,
  Error,
  SetMenuOptionActiveInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetMenuOptionActiveInput) => configApi.setMenuOptionActive(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useReorderMenuOptions(): UseMutationResult<
  ConfigReorderMenuOptionsResponse,
  Error,
  ReorderMenuOptionsInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReorderMenuOptionsInput) => configApi.reorderMenuOptions(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useDeleteMenuSet(): UseMutationResult<DeleteResponse, Error, DeleteByIdInput, unknown> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteByIdInput) => configApi.deleteMenuSet(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}

export function useDeleteMenuOption(): UseMutationResult<DeleteResponse, Error, DeleteByIdInput, unknown> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteByIdInput) => configApi.deleteMenuOption(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MENU_SETS_QUERY_KEY })
    }
  })
}
