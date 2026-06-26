import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { dashboardApi } from '../../api/dashboard'
import type { DashboardPhaseCountsResponse } from '../../../shared/ipc'

export function useDashboardPhaseCounts(): UseQueryResult<DashboardPhaseCountsResponse, Error> {
  return useQuery({
    queryKey: ['dashboard', 'phaseCounts'],
    queryFn: () => dashboardApi.phaseCounts(),
  })
}
