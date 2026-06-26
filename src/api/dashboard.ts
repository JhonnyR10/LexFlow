import type {
  DashboardAlertsResponse,
  DashboardPhaseCountsResponse,
} from '../../shared/ipc'

export const dashboardApi = {
  phaseCounts: (): Promise<DashboardPhaseCountsResponse> =>
    window.api.dashboard.phaseCounts(),
  alerts: (): Promise<DashboardAlertsResponse> =>
    window.api.dashboard.alerts(),
}
