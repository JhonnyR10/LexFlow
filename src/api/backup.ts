import type { BackupExportResponse, BackupRestoreResponse } from '../../shared/ipc'

export const backupApi = {
  export: (): Promise<BackupExportResponse> => window.api.backup.export(),
  restore: (): Promise<BackupRestoreResponse> => window.api.backup.restore(),
}
