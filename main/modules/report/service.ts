import type {
  ReportByEntityItem,
  ReportSummaryResponse,
} from '../../../shared/ipc'
import { findActivePhaseCounts } from '../dashboard/repository'
import type { ReportEntityRow } from './repository'
import {
  findReportByCollaboratore,
  findReportByProfessionista,
  findReportDocumentsCoverage,
  findReportTotals,
} from './repository'

const UNASSIGNED_LABEL = 'Non assegnato'

function toEntityItems(rows: ReportEntityRow[]): ReportByEntityItem[] {
  return rows.map((r) => ({
    id:              r.id,
    denominazione:   r.id == null ? UNASSIGNED_LABEL : r.denominazione ?? UNASSIGNED_LABEL,
    count:           r.count,
    importoConcesso: r.importoConcesso,
    importoLiquidato: r.importoLiquidato,
  }))
}

// Compone il report aggregato delle pratiche attive (S9.2). Riusa i conteggi per
// fase di dashboard per non duplicare la query.
export function getReportSummary(): ReportSummaryResponse {
  const totals = findReportTotals()
  const byPhase = findActivePhaseCounts().map((p) => ({
    phaseId:     p.phaseId,
    displayName: p.displayName,
    category:    p.category,
    count:       p.count,
  }))
  const documents = findReportDocumentsCoverage()

  return {
    totals,
    byPhase,
    byCollaboratore: toEntityItems(findReportByCollaboratore()),
    byProfessionista: toEntityItems(findReportByProfessionista()),
    documents: {
      practicesCount: documents.practicesCount,
      withDecreto:    documents.withDecreto,
      withoutDecreto: documents.practicesCount - documents.withDecreto,
      withFattura:    documents.withFattura,
      withoutFattura: documents.practicesCount - documents.withFattura,
    },
  }
}
