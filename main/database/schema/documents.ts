import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { practices } from './practices'
import { transitionRecords } from './transitionRecords'

// Documento allegato a una pratica (S7.1). Nell'MVP `kind` è `decreto | fattura`
// (una sola istanza per tipo: l'upload sostituisce). Il file vive su filesystem in
// `<percorsoDati>/documenti/<codiceIstanza>/`; in DB resta solo il riferimento.
// `filePath` è RELATIVO alla radice documenti (`<codiceIstanza>/<filename>`):
// percorso portabile per backup/ripristino e percorso dati configurabile.
export const documents = sqliteTable('documents', {
  id:                 integer('id').primaryKey({ autoIncrement: true }),
  practiceId:         integer('practice_id').notNull().references(() => practices.id),
  transitionRecordId: integer('transition_record_id').references(() => transitionRecords.id),  // nullable, non popolato in S7.1
  kind:               text('kind').notNull(),            // 'decreto' | 'fattura' (text libero per kind futuri)
  filePath:           text('file_path').notNull(),       // relativo alla radice documenti
  originalName:       text('original_name').notNull(),
  metadata:           text('metadata').notNull().default('{}'),  // JSON { size, ext }
  createdAt:          text('created_at').notNull(),
})

export type DocumentRow    = typeof documents.$inferSelect
export type NewDocumentRow = typeof documents.$inferInsert
