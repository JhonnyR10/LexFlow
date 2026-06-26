import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { settingsApi } from '../../api/settings'
import type {
  SettingsGetResponse,
  SettingsUpdateThemeResponse,
  UpdateThemeInput,
} from '../../../shared/ipc'

export function useAppSettings(): UseQueryResult<SettingsGetResponse, Error> {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  })
}

export function useUpdateTheme(): UseMutationResult<
  SettingsUpdateThemeResponse,
  Error,
  UpdateThemeInput,
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateThemeInput) => settingsApi.updateTheme(input),
    onSuccess: (data) => {
      // Aggiorna subito la cache così che ThemeApplier e la pagina riflettano
      // il tema persistito senza attendere un refetch.
      queryClient.setQueryData<SettingsGetResponse>(['settings'], data)
    },
  })
}
