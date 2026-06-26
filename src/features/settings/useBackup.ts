import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { backupApi } from '../../api/backup'
import type { BackupExportResponse, BackupRestoreResponse } from '../../../shared/ipc'

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
