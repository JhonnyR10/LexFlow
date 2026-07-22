import { getDb } from '../../database/connection'
import {
  collaboratori,
  documents,
  historyEvents,
  pecRecipients,
  practices,
  professionisti,
  scadenze,
  transitionRecords,
} from '../../database/schema'

export interface ResetCounts {
  practicesDeleted: number
  professionistiDeleted: number
  collaboratoriDeleted: number
}

// Svuota l'archivio: pratiche + figli + anagrafiche, in un'unica transazione e in
// ordine FK-safe (`foreign_keys = ON`: i figli prima dei genitori; `practices`
// referenzia `professionisti`/`collaboratori`, quindi va eliminata prima di loro).
// Mantiene workflow (fasi/transizioni/campi/menu) e impostazioni app.
export function resetArchive(): ResetCounts {
  const db = getDb()
  return db.transaction(() => {
    db.delete(documents).run()
    db.delete(pecRecipients).run()
    db.delete(historyEvents).run()
    db.delete(transitionRecords).run()
    db.delete(scadenze).run()
    const practicesDeleted = db.delete(practices).run().changes
    const professionistiDeleted = db.delete(professionisti).run().changes
    const collaboratoriDeleted = db.delete(collaboratori).run().changes
    return { practicesDeleted, professionistiDeleted, collaboratoriDeleted }
  })
}
