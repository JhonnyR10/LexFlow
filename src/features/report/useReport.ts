import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { reportApi } from '../../api/report'
import type { ReportSummaryResponse } from '../../../shared/ipc'

export function useReportSummary(): UseQueryResult<ReportSummaryResponse, Error> {
  return useQuery({
    queryKey: ['report'],
    queryFn: () => reportApi.summary(),
  })
}
