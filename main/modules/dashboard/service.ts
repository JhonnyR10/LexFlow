import type { DashboardPhaseCountsResponse } from '../../../shared/ipc'
import { findActivePhaseCounts } from './repository'

// Card di conteggio per fase (S8.1): pass-through tipizzato dal repository.
// Solo fasi con pratiche attive; cestino già escluso a livello di query.
export function getDashboardPhaseCounts(): DashboardPhaseCountsResponse {
  return findActivePhaseCounts().map(r => ({
    phaseId:     r.phaseId,
    phaseKey:    r.phaseKey,
    displayName: r.displayName,
    category:    r.category,
    count:       r.count,
  }))
}
