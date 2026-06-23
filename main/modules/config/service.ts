import type { PhaseListItem } from '../../../shared/ipc'
import { findActivePhases } from './repository'

export function listActivePhases(): PhaseListItem[] {
  return findActivePhases()
}
