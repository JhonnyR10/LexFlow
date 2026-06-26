import type { DashboardPhaseCountsResponse } from '../../shared/ipc'

export const dashboardApi = {
  phaseCounts: (): Promise<DashboardPhaseCountsResponse> =>
    window.api.dashboard.phaseCounts(),
}
