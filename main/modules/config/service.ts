import type { PhaseListItem, TransitionListItem } from '../../../shared/ipc'
import { findActivePhases, findTransitions } from './repository'

export function listActivePhases(): PhaseListItem[] {
  return findActivePhases()
}

export function listTransitions(): TransitionListItem[] {
  return findTransitions()
}
