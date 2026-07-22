import type { ReportSummaryResponse } from '../../shared/ipc'

export const reportApi = {
  summary: (): Promise<ReportSummaryResponse> => window.api.report.summary(),
}
