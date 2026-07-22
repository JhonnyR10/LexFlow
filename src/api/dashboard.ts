import type {
  DashboardAgingResponse,
  DashboardAlertsResponse,
  DashboardMissingDocumentsResponse,
  DashboardPhaseCountsResponse,
  DashboardScadenzeAlertsResponse,
} from '../../shared/ipc'

export const dashboardApi = {
  phaseCounts: (): Promise<DashboardPhaseCountsResponse> =>
    window.api.dashboard.phaseCounts(),
  alerts: (): Promise<DashboardAlertsResponse> =>
    window.api.dashboard.alerts(),
  aging: (): Promise<DashboardAgingResponse> =>
    window.api.dashboard.aging(),
  missingDocuments: (): Promise<DashboardMissingDocumentsResponse> =>
    window.api.dashboard.missingDocuments(),
  scadenzeAlerts: (): Promise<DashboardScadenzeAlertsResponse> =>
    window.api.dashboard.scadenzeAlerts(),
}
