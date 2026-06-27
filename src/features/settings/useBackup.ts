import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { backupApi } from '../../api/backup'
import type {
  BackupChangeFolderResponse,
  BackupConfig,
  BackupExportResponse,
  BackupRestoreResponse,
  UpdateBackupConfigInput,
} from '../../../shared/ipc'

const CONFIG_KEY = ['backup', 'config']

export function useExportBackup(): UseMutationResult<BackupExportResponse, Error, void, unknown> {
  return useMutation({
    mutationFn: () => backupApi.export(),
  })
}

// Il ripristino prepara lo swap e riavvia l'app: non c'è onSuccess utile lato
// renderer (la finestra viene chiusa dal main).
export function useRestoreBackup(): UseMutationResult<BackupRestoreResponse, Error, void, unknown> {
  return useMutation({
    mutationFn: () => backupApi.restore(),
  })
}

export function useBackupConfig(): UseQueryResult<BackupConfig, Error> {
  return useQuery({
    queryKey: CONFIG_KEY,
    queryFn: () => backupApi.getConfig(),
  })
}

export function useUpdateBackupConfig(): UseMutationResult<
  BackupConfig,
  Error,
  UpdateBackupConfigInput,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBackupConfigInput) => backupApi.updateConfig(input),
    onSuccess: (data) => qc.setQueryData<BackupConfig>(CONFIG_KEY, data),
  })
}

export function useChangeBackupFolder(): UseMutationResult<
  BackupChangeFolderResponse,
  Error,
  void,
  unknown
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => backupApi.changeFolder(),
    onSuccess: (data) => {
      if (!data.canceled && data.config) qc.setQueryData<BackupConfig>(CONFIG_KEY, data.config)
    },
  })
}

export function useOpenBackupFolder(): UseMutationResult<
  { success: boolean },
  Error,
  void,
  unknown
> {
  return useMutation({
    mutationFn: () => backupApi.openFolder(),
  })
}
