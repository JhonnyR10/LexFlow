import type { ExportCsvInput, ExportCsvResponse } from '../../shared/ipc'

export const exportApi = {
  csv: (input: ExportCsvInput): Promise<ExportCsvResponse> => window.api.export.csv(input),
}
