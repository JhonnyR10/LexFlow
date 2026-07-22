import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { securityApi } from '../../api/security'
import type {
  SecurityChangePasswordInput,
  SecurityConfigResponse,
  SecurityDisableLockInput,
  SecurityMutationResponse,
  SecuritySetPasswordInput,
  SecurityStateResponse,
  SecurityUnlockInput,
  SecurityUnlockResponse,
} from '../../../shared/ipc'

// Stato del cancello di boot. Non fa retry a oltranza: una singola risposta è
// sufficiente per decidere se mostrare la schermata di sblocco.
export function useSecurityState(): UseQueryResult<SecurityStateResponse, Error> {
  return useQuery({
    queryKey: ['security', 'state'],
    queryFn: () => securityApi.getState(),
    staleTime: Infinity,
  })
}

export function useSecurityConfig(): UseQueryResult<SecurityConfigResponse, Error> {
  return useQuery({
    queryKey: ['security', 'config'],
    queryFn: () => securityApi.getConfig(),
  })
}

export function useUnlock(): UseMutationResult<
  SecurityUnlockResponse,
  Error,
  SecurityUnlockInput,
  unknown
> {
  return useMutation({
    mutationFn: (input: SecurityUnlockInput) => securityApi.unlock(input),
  })
}

export function useSetPassword(): UseMutationResult<
  SecurityMutationResponse,
  Error,
  SecuritySetPasswordInput,
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SecuritySetPasswordInput) => securityApi.setPassword(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] })
    },
  })
}

export function useChangePassword(): UseMutationResult<
  SecurityMutationResponse,
  Error,
  SecurityChangePasswordInput,
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SecurityChangePasswordInput) => securityApi.changePassword(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] })
    },
  })
}

export function useDisableLock(): UseMutationResult<
  SecurityMutationResponse,
  Error,
  SecurityDisableLockInput,
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SecurityDisableLockInput) => securityApi.disableLock(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] })
    },
  })
}
