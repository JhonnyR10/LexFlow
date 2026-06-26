import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { dashboardApi } from '../../api/dashboard'
import type {
  DashboardAlertsResponse,
  DashboardPhaseCountsResponse,
} from '../../../shared/ipc'

export function useDashboardPhaseCounts(): UseQueryResult<DashboardPhaseCountsResponse, Error> {
  return useQuery({
    queryKey: ['dashboard', 'phaseCounts'],
    queryFn: () => dashboardApi.phaseCounts(),
  })
}

export function useDashboardAlerts(): UseQueryResult<DashboardAlertsResponse, Error> {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.alerts(),
  })
}
