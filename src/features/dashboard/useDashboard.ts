import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { dashboardApi } from '../../api/dashboard'
import type {
  DashboardAgingResponse,
  DashboardAlertsResponse,
  DashboardMissingDocumentsResponse,
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

export function useDashboardAging(): UseQueryResult<DashboardAgingResponse, Error> {
  return useQuery({
    queryKey: ['dashboard', 'aging'],
    queryFn: () => dashboardApi.aging(),
  })
}

export function useDashboardMissingDocuments(): UseQueryResult<DashboardMissingDocumentsResponse, Error> {
  return useQuery({
    queryKey: ['dashboard', 'missingDocs'],
    queryFn: () => dashboardApi.missingDocuments(),
  })
}
