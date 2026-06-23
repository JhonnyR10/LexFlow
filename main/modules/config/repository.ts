import { eq } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { phases } from '../../database/schema'
import type { PhaseListItem } from '../../../shared/ipc'

export function findActivePhases(): PhaseListItem[] {
  const db = getDb()
  return db
    .select({
      id: phases.id,
      key: phases.key,
      displayName: phases.displayName,
      category: phases.category,
      order: phases.order,
      isInitial: phases.isInitial,
      isFinal: phases.isFinal,
      isActive: phases.isActive,
      pecEnabled: phases.pecEnabled
    })
    .from(phases)
    .where(eq(phases.isActive, true))
    .orderBy(phases.order)
    .all()
}
