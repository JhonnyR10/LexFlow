import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { settingsApi } from '../../api/settings'
import type {
  SettingsChangeDataPathResponse,
  SettingsGetAlertConfigResponse,
  SettingsGetResponse,
  SettingsOpenDataFolderResponse,
  SettingsUpdateAlertConfigResponse,
  SettingsUpdateThemeResponse,
  UpdateAlertConfigInput,
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

export function useOpenDataFolder(): UseMutationResult<
  SettingsOpenDataFolderResponse,
  Error,
  void,
  unknown
> {
  return useMutation({
    mutationFn: () => settingsApi.openDataFolder(),
  })
}

export function useChangeDataPath(): UseMutationResult<
  SettingsChangeDataPathResponse,
  Error,
  void,
  unknown
> {
  return useMutation({
    mutationFn: () => settingsApi.changeDataPath(),
  })
}

export function useAlertConfig(): UseQueryResult<SettingsGetAlertConfigResponse, Error> {
  return useQuery({
    queryKey: ['alertConfig'],
    queryFn: () => settingsApi.getAlertConfig(),
  })
}

export function useUpdateAlertConfig(): UseMutationResult<
  SettingsUpdateAlertConfigResponse,
  Error,
  UpdateAlertConfigInput,
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAlertConfigInput) => settingsApi.updateAlertConfig(input),
    onSuccess: (data) => {
      queryClient.setQueryData<SettingsGetAlertConfigResponse>(['alertConfig'], data)
      // Gli avvisi Dashboard dipendono dalle soglie/abilitazioni.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
