import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { exportApi } from '../../api/export'
import type { ExportCsvInput, ExportCsvResponse } from '../../../shared/ipc'

export function useExportCsv(): UseMutationResult<ExportCsvResponse, Error, ExportCsvInput, unknown> {
  return useMutation({
    mutationFn: (input: ExportCsvInput) => exportApi.csv(input),
  })
}
