import type {
  BackupChangeFolderResponse,
  BackupConfig,
  BackupExportResponse,
  BackupOpenFolderResponse,
  BackupRestoreResponse,
  UpdateBackupConfigInput,
} from '../../shared/ipc'

export const backupApi = {
  export: (): Promise<BackupExportResponse> => window.api.backup.export(),
  restore: (): Promise<BackupRestoreResponse> => window.api.backup.restore(),
  getConfig: (): Promise<BackupConfig> => window.api.backup.getConfig(),
  updateConfig: (input: UpdateBackupConfigInput): Promise<BackupConfig> =>
    window.api.backup.updateConfig(input),
  changeFolder: (): Promise<BackupChangeFolderResponse> => window.api.backup.changeFolder(),
  openFolder: (): Promise<BackupOpenFolderResponse> => window.api.backup.openFolder(),
}
