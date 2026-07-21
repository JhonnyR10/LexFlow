import { eq, asc, and, ne, or, count, sql, isNull } from 'drizzle-orm'
import { getDb } from '../../database/connection'
import { phases, transitions, menuSets, menuOptions, fieldDefs, practices, historyEvents, transitionRecords } from '../../database/schema'
import type {
  PhaseListItem,
  TransitionListItem,
  MenuSetListItem,
  MenuOptionListItem,
  FieldDefListItem,
  FieldType,
  ListFieldsFilter
} from '../../../shared/ipc'
import type { NewPhase } from '../../database/schema/phases'
import type { NewTransition, Transition } from '../../database/schema/transitions'
import type { NewMenuSet, MenuSet } from '../../database/schema/menuSets'
import type { NewMenuOption, MenuOption } from '../../database/schema/menuOptions'
import type { NewFieldDef } from '../../database/schema/fieldDefs'

function toListItem(row: typeof phases.$inferSelect): PhaseListItem {
  return {
    id: row.id,
    key: row.key,
    displayName: row.displayName,
    category: row.category as PhaseListItem['category'],
    order: row.order,
    isInitial: row.isInitial,
    isFinal: row.isFinal,
    isActive: row.isActive
  }
}

export function findActivePhases(): PhaseListItem[] {
  return getDb()
    .select()
    .from(phases)
    .where(eq(phases.isActive, true))
    .orderBy(asc(phases.order))
    .all()
    .map(toListItem)
}

export function findAllPhases(): PhaseListItem[] {
  return getDb()
    .select()
    .from(phases)
    .orderBy(asc(phases.order))
    .all()
    .map(toListItem)
}

export function findPhaseById(id: number): typeof phases.$inferSelect | undefined {
  return getDb().select().from(phases).where(eq(phases.id, id)).get()
}

export function findMaxOrder(): number {
  const result = getDb()
    .select({ maxOrder: sql<number>`MAX(${phases.order})` })
    .from(phases)
    .get()
  return result?.maxOrder ?? 0
}

export function countActiveInitialPhases(): number {
  const result = getDb()
    .select({ c: sql<number>`COUNT(*)` })
    .from(phases)
    .where(and(eq(phases.isInitial, true), eq(phases.isActive, true)))
    .get()
  return result?.c ?? 0
}

export function keyExists(key: string): boolean {
  return getDb().select({ id: phases.id }).from(phases).where(eq(phases.key, key)).get() != null
}

/**
 * Numero di pratiche NON cestinate che usano questa fase, sia come fase corrente
 * (`currentPhaseId`) sia come fase di provenienza salvata (`previousPhaseId`, ricordata
 * da una pratica sospesa per "Riprendi pratica"). Disattivare una fase in uso romperebbe
 * pratiche vive, quindi è bloccato.
 */
export function countActivePracticesUsingPhase(phaseId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(practices)
    .where(
      and(
        or(eq(practices.currentPhaseId, phaseId), eq(practices.previousPhaseId, phaseId)),
        eq(practices.isTrashed, false)
      )
    )
    .all()
  return row?.cnt ?? 0
}

// Crea una fase in transazione: resetta isInitial sulle altre se necessario.
// Business rule (reset isInitial) portata qui per tenere il tx atomico senza passare tx ai repo.
export function createPhaseAtomic(data: NewPhase): PhaseListItem {
  return getDb().transaction((tx) => {
    if (data.isInitial) {
      tx.update(phases).set({ isInitial: false }).where(eq(phases.isInitial, true)).run()
    }
    const [row] = tx.insert(phases).values(data).returning().all()
    return toListItem(row)
  })
}

// Aggiorna una fase in transazione: resetta isInitial sulle altre se necessario.
export function updatePhaseAtomic(
  id: number,
  data: {
    displayName: string
    category: PhaseListItem['category']
    isInitial: boolean
    isFinal: boolean
    isActive: boolean
  },
  wasInitial: boolean
): PhaseListItem {
  return getDb().transaction((tx) => {
    if (data.isInitial && !wasInitial) {
      tx.update(phases)
        .set({ isInitial: false })
        .where(and(eq(phases.isInitial, true), ne(phases.id, id)))
        .run()
    }
    const [row] = tx.update(phases).set(data).where(eq(phases.id, id)).returning().all()
    return toListItem(row)
  })
}

export function setPhaseIsActive(id: number, isActive: boolean): void {
  getDb().update(phases).set({ isActive }).where(eq(phases.id, id)).run()
}

export function reorderPhasesAtomic(items: { id: number; order: number }[]): void {
  getDb().transaction((tx) => {
    for (const item of items) {
      tx.update(phases).set({ order: item.order }).where(eq(phases.id, item.id)).run()
    }
  })
}

export function findTransitions(): TransitionListItem[] {
  const db = getDb()

  const rows = db
    .select({
      id: transitions.id,
      fromPhaseId: transitions.fromPhaseId,
      fromPhaseKey: phases.key,
      fromPhaseDisplayName: phases.displayName,
      fromPhaseOrder: phases.order,
      toPhaseId: transitions.toPhaseId,
      buttonLabel: transitions.buttonLabel,
      order: transitions.order,
      isActive: transitions.isActive,
      isRepeatable: transitions.isRepeatable,
      isAutomatic: transitions.isAutomatic,
      isResume: transitions.isResume
    })
    .from(transitions)
    .innerJoin(phases, eq(transitions.fromPhaseId, phases.id))
    .orderBy(asc(phases.order), asc(transitions.order))
    .all()

  const allPhases = db
    .select({ id: phases.id, key: phases.key, displayName: phases.displayName })
    .from(phases)
    .all()
  const phaseInfoById = new Map(allPhases.map((p) => [p.id, { key: p.key, displayName: p.displayName }]))

  return rows.map((r) => ({
    ...r,
    toPhaseKey: r.toPhaseId != null ? (phaseInfoById.get(r.toPhaseId)?.key ?? null) : null,
    toPhaseDisplayName: r.toPhaseId != null ? (phaseInfoById.get(r.toPhaseId)?.displayName ?? null) : null
  }))
}

export function findTransitionById(id: number): Transition | undefined {
  return getDb().select().from(transitions).where(eq(transitions.id, id)).get()
}

export function findTransitionEnrichedById(id: number): TransitionListItem | undefined {
  const db = getDb()

  const row = db
    .select({
      id: transitions.id,
      fromPhaseId: transitions.fromPhaseId,
      fromPhaseKey: phases.key,
      fromPhaseDisplayName: phases.displayName,
      fromPhaseOrder: phases.order,
      toPhaseId: transitions.toPhaseId,
      buttonLabel: transitions.buttonLabel,
      order: transitions.order,
      isActive: transitions.isActive,
      isRepeatable: transitions.isRepeatable,
      isAutomatic: transitions.isAutomatic,
      isResume: transitions.isResume
    })
    .from(transitions)
    .innerJoin(phases, eq(transitions.fromPhaseId, phases.id))
    .where(eq(transitions.id, id))
    .get()

  if (!row) return undefined

  const toPhase =
    row.toPhaseId != null
      ? db
          .select({ key: phases.key, displayName: phases.displayName })
          .from(phases)
          .where(eq(phases.id, row.toPhaseId))
          .get()
      : null

  return {
    ...row,
    toPhaseKey: toPhase?.key ?? null,
    toPhaseDisplayName: toPhase?.displayName ?? null
  }
}

export function findMaxTransitionOrderForPhase(fromPhaseId: number): number {
  const result = getDb()
    .select({ maxOrder: sql<number>`MAX(${transitions.order})` })
    .from(transitions)
    .where(eq(transitions.fromPhaseId, fromPhaseId))
    .get()
  return result?.maxOrder ?? 0
}

export function countActiveAutomaticTransitionsForPhase(
  fromPhaseId: number,
  excludeId?: number
): number {
  const result = getDb()
    .select({ c: sql<number>`COUNT(*)` })
    .from(transitions)
    .where(
      and(
        eq(transitions.fromPhaseId, fromPhaseId),
        eq(transitions.isAutomatic, true),
        eq(transitions.isActive, true),
        excludeId !== undefined ? ne(transitions.id, excludeId) : undefined
      )
    )
    .get()
  return result?.c ?? 0
}

export function transitionLabelExists(
  fromPhaseId: number,
  buttonLabel: string,
  excludeId?: number
): boolean {
  return (
    getDb()
      .select({ id: transitions.id })
      .from(transitions)
      .where(
        and(
          eq(transitions.fromPhaseId, fromPhaseId),
          eq(transitions.buttonLabel, buttonLabel),
          excludeId !== undefined ? ne(transitions.id, excludeId) : undefined
        )
      )
      .get() != null
  )
}

export function insertTransition(data: NewTransition): number {
  const [row] = getDb().insert(transitions).values(data).returning({ id: transitions.id }).all()
  return row.id
}

export function updateTransitionFields(
  id: number,
  data: {
    fromPhaseId: number
    toPhaseId: number | null
    buttonLabel: string
    isRepeatable: boolean
    isAutomatic: boolean
    isResume: boolean
    isActive: boolean
  }
): void {
  getDb().update(transitions).set(data).where(eq(transitions.id, id)).run()
}

export function setTransitionIsActive(id: number, isActive: boolean): void {
  getDb().update(transitions).set({ isActive }).where(eq(transitions.id, id)).run()
}

export function reorderTransitionsAtomic(items: { id: number; order: number }[]): void {
  getDb().transaction((tx) => {
    for (const item of items) {
      tx.update(transitions).set({ order: item.order }).where(eq(transitions.id, item.id)).run()
    }
  })
}

// ---------- Menu sets ----------

export function findAllMenuSets(): MenuSetListItem[] {
  const db = getDb()
  const sets = db.select().from(menuSets).orderBy(asc(menuSets.id)).all()
  const opts = db
    .select()
    .from(menuOptions)
    .orderBy(asc(menuOptions.menuSetId), asc(menuOptions.order))
    .all()

  const optsBySet = new Map<number, MenuOptionListItem[]>()
  for (const o of opts) {
    if (!optsBySet.has(o.menuSetId)) optsBySet.set(o.menuSetId, [])
    optsBySet.get(o.menuSetId)!.push({
      id: o.id,
      menuSetId: o.menuSetId,
      label: o.label,
      value: o.value,
      order: o.order,
      isActive: o.isActive
    })
  }

  return sets.map((s) => ({
    id: s.id,
    key: s.key,
    label: s.label,
    options: optsBySet.get(s.id) ?? []
  }))
}

export function findMenuSetById(id: number): MenuSet | undefined {
  return getDb().select().from(menuSets).where(eq(menuSets.id, id)).get()
}

export function menuSetKeyExists(key: string): boolean {
  return getDb().select({ id: menuSets.id }).from(menuSets).where(eq(menuSets.key, key)).get() != null
}

export function insertMenuSet(data: NewMenuSet): number {
  const [row] = getDb().insert(menuSets).values(data).returning({ id: menuSets.id }).all()
  return row.id
}

export function updateMenuSetLabel(id: number, label: string): void {
  getDb().update(menuSets).set({ label }).where(eq(menuSets.id, id)).run()
}

// ---------- Menu options ----------

export function findMenuOptionById(id: number): MenuOption | undefined {
  return getDb().select().from(menuOptions).where(eq(menuOptions.id, id)).get()
}

export function menuOptionValueExists(menuSetId: number, value: string, excludeId?: number): boolean {
  return (
    getDb()
      .select({ id: menuOptions.id })
      .from(menuOptions)
      .where(
        and(
          eq(menuOptions.menuSetId, menuSetId),
          eq(menuOptions.value, value),
          excludeId !== undefined ? ne(menuOptions.id, excludeId) : undefined
        )
      )
      .get() != null
  )
}

export function findMaxMenuOptionOrder(menuSetId: number): number {
  const result = getDb()
    .select({ maxOrder: sql<number>`MAX(${menuOptions.order})` })
    .from(menuOptions)
    .where(eq(menuOptions.menuSetId, menuSetId))
    .get()
  return result?.maxOrder ?? 0
}

export function insertMenuOption(data: NewMenuOption): number {
  const [row] = getDb().insert(menuOptions).values(data).returning({ id: menuOptions.id }).all()
  return row.id
}

export function updateMenuOptionLabel(id: number, label: string): void {
  getDb().update(menuOptions).set({ label }).where(eq(menuOptions.id, id)).run()
}

export function setMenuOptionIsActive(id: number, isActive: boolean): void {
  getDb().update(menuOptions).set({ isActive }).where(eq(menuOptions.id, id)).run()
}

export function reorderMenuOptionsAtomic(items: { id: number; order: number }[]): void {
  getDb().transaction((tx) => {
    for (const item of items) {
      tx.update(menuOptions).set({ order: item.order }).where(eq(menuOptions.id, item.id)).run()
    }
  })
}

// ---------- Field defs ----------

export function findFieldsByFilter(filter?: ListFieldsFilter): FieldDefListItem[] {
  const db = getDb()
  const allFields = db.select().from(fieldDefs).orderBy(asc(fieldDefs.order)).all()

  const filtered = allFields.filter((f) => {
    if (filter?.scope !== undefined && f.scope !== filter.scope) return false
    if (filter?.transitionId !== undefined && f.transitionId !== filter.transitionId) return false
    return true
  })

  const tIds = new Set(filtered.map((f) => f.transitionId).filter((id): id is number => id != null))
  const msIds = new Set(filtered.map((f) => f.menuSetId).filter((id): id is number => id != null))
  const cfIds = new Set(
    filtered.map((f) => f.conditionalOnFieldId).filter((id): id is number => id != null)
  )

  const tLabelById = new Map<number, string>()
  if (tIds.size > 0) {
    for (const row of db
      .select({ id: transitions.id, buttonLabel: transitions.buttonLabel })
      .from(transitions)
      .all()) {
      if (tIds.has(row.id)) tLabelById.set(row.id, row.buttonLabel)
    }
  }

  const msLabelById = new Map<number, string>()
  if (msIds.size > 0) {
    for (const row of db.select({ id: menuSets.id, label: menuSets.label }).from(menuSets).all()) {
      if (msIds.has(row.id)) msLabelById.set(row.id, row.label)
    }
  }

  // Resolve label of controller field (may live outside the filtered set)
  const cfLabelById = new Map<number, string>()
  if (cfIds.size > 0) {
    for (const row of allFields) {
      if (cfIds.has(row.id)) cfLabelById.set(row.id, row.label)
    }
  }

  return filtered.map((f) => ({
    id: f.id,
    scope: f.scope as 'general' | 'transition',
    transitionId: f.transitionId,
    transitionLabel: f.transitionId != null ? (tLabelById.get(f.transitionId) ?? null) : null,
    key: f.key,
    label: f.label,
    type: f.type as FieldType,
    required: f.required,
    visibleInTable: f.visibleInTable,
    usableInFilter: f.usableInFilter,
    includeInExport: f.includeInExport,
    order: f.order,
    isActive: f.isActive,
    menuSetId: f.menuSetId,
    menuSetLabel: f.menuSetId != null ? (msLabelById.get(f.menuSetId) ?? null) : null,
    conditionalOnFieldId: f.conditionalOnFieldId,
    conditionalValue: f.conditionalValue,
    conditionalOnFieldLabel:
      f.conditionalOnFieldId != null ? (cfLabelById.get(f.conditionalOnFieldId) ?? null) : null
  }))
}

export function findFieldById(id: number): typeof fieldDefs.$inferSelect | undefined {
  return getDb().select().from(fieldDefs).where(eq(fieldDefs.id, id)).get()
}

export function fieldKeyExistsInContainer(
  key: string,
  scope: 'general' | 'transition',
  transitionId: number | null,
  excludeId?: number
): boolean {
  const conditions = [
    eq(fieldDefs.key, key),
    eq(fieldDefs.scope, scope),
    transitionId != null ? eq(fieldDefs.transitionId, transitionId) : isNull(fieldDefs.transitionId),
    ...(excludeId !== undefined ? [ne(fieldDefs.id, excludeId)] : [])
  ]
  return getDb().select({ id: fieldDefs.id }).from(fieldDefs).where(and(...conditions)).get() != null
}

export function findMaxFieldOrderInContainer(
  scope: 'general' | 'transition',
  transitionId: number | null
): number {
  const conditions = [
    eq(fieldDefs.scope, scope),
    ...(transitionId != null ? [eq(fieldDefs.transitionId, transitionId)] : [])
  ]
  const result = getDb()
    .select({ maxOrder: sql<number>`MAX(${fieldDefs.order})` })
    .from(fieldDefs)
    .where(and(...conditions))
    .get()
  return result?.maxOrder ?? 0
}

export function insertField(data: NewFieldDef): number {
  const [row] = getDb().insert(fieldDefs).values(data).returning({ id: fieldDefs.id }).all()
  return row.id
}

export function updateFieldFields(
  id: number,
  data: {
    label: string
    type: FieldType
    required: boolean
    visibleInTable: boolean
    usableInFilter: boolean
    includeInExport: boolean
    menuSetId: number | null
    conditionalOnFieldId: number | null
    conditionalValue: string | null
  }
): void {
  getDb().update(fieldDefs).set(data).where(eq(fieldDefs.id, id)).run()
}

export function findActiveMenuOptionByValue(
  menuSetId: number,
  value: string
): typeof menuOptions.$inferSelect | undefined {
  return getDb()
    .select()
    .from(menuOptions)
    .where(
      and(
        eq(menuOptions.menuSetId, menuSetId),
        eq(menuOptions.value, value),
        eq(menuOptions.isActive, true)
      )
    )
    .get()
}

// Tutti i value delle opzioni (attive e non) di un menu set. Serve al guard sul
// cambio di menuSetId (config/service): un valore salvato è «orfano» solo se il
// nuovo menu non lo contiene tra le sue opzioni (anche disattivate).
export function menuOptionValuesForSet(menuSetId: number): Set<string> {
  const rows = getDb()
    .select({ value: menuOptions.value })
    .from(menuOptions)
    .where(eq(menuOptions.menuSetId, menuSetId))
    .all()
  return new Set(rows.map((r) => r.value))
}

// Valori distinti non vuoti salvati sotto la `key` di un campo, per rilevare gli
// orfani al cambio di menu. Scope-aware: i campi generali vivono in
// practices.custom_values (tutte le pratiche, anche cestinate); i campi di
// transizione in transition_records.values ristretti al loro transitionId.
export function savedValuesForFieldKey(field: {
  key: string
  scope: string
  transitionId: number | null
}): string[] {
  const path = `$."${field.key.replace(/"/g, '""')}"`
  let rows: { v: string | null }[]
  if (field.scope === 'transition' && field.transitionId != null) {
    rows = getDb()
      .select({ v: sql<string | null>`json_extract(${transitionRecords.values}, ${path})` })
      .from(transitionRecords)
      .where(eq(transitionRecords.transitionId, field.transitionId))
      .all()
  } else {
    rows = getDb()
      .select({ v: sql<string | null>`json_extract(${practices.customValues}, ${path})` })
      .from(practices)
      .all()
  }
  const values = new Set<string>()
  for (const r of rows) {
    if (r.v != null && r.v !== '') values.add(r.v)
  }
  return [...values]
}

// conditionalValue distinti non vuoti dei campi che dipendono (come controllore)
// dal campo indicato. Al cambio di menu del controllore, un conditionalValue non
// più presente tra le opzioni renderebbe la condizione insoddisfacibile.
export function conditionalValuesDependingOn(fieldId: number): string[] {
  const rows = getDb()
    .select({ cv: fieldDefs.conditionalValue })
    .from(fieldDefs)
    .where(eq(fieldDefs.conditionalOnFieldId, fieldId))
    .all()
  const values = new Set<string>()
  for (const r of rows) {
    if (r.cv != null && r.cv !== '') values.add(r.cv)
  }
  return [...values]
}

// Conta le righe (pratiche o transition_records, scope-aware) che hanno un valore
// salvato sotto la `key` del campo. Con `equals` conta solo i valori uguali a quello
// indicato (usato per l'uso reale di una singola opzione menu); senza `equals` conta
// tutti i valori non vuoti (uso reale del campo). Fonte del conteggio per gli avvisi
// di disattivazione (scan JSON rigoroso).
function countFieldValueRows(
  field: { key: string; scope: string; transitionId: number | null },
  equals?: string
): number {
  const path = `$."${field.key.replace(/"/g, '""')}"`
  if (field.scope === 'transition' && field.transitionId != null) {
    const expr = sql`json_extract(${transitionRecords.values}, ${path})`
    const valueCond = equals !== undefined
      ? sql`${expr} = ${equals}`
      : sql`${expr} IS NOT NULL AND ${expr} <> ''`
    const row = getDb()
      .select({ n: count() })
      .from(transitionRecords)
      .where(and(eq(transitionRecords.transitionId, field.transitionId), valueCond))
      .get()
    return row?.n ?? 0
  }
  const expr = sql`json_extract(${practices.customValues}, ${path})`
  const valueCond = equals !== undefined
    ? sql`${expr} = ${equals}`
    : sql`${expr} IS NOT NULL AND ${expr} <> ''`
  const row = getDb().select({ n: count() }).from(practices).where(valueCond).get()
  return row?.n ?? 0
}

export function countSavedValuesForFieldKey(field: {
  key: string
  scope: string
  transitionId: number | null
}): number {
  return countFieldValueRows(field)
}

export function countSavedValueForFieldKeyEquals(
  field: { key: string; scope: string; transitionId: number | null },
  value: string
): number {
  return countFieldValueRows(field, value)
}

// Campi (chiave/scope/transizione) che usano un dato menu set: servono a stimare
// l'uso reale di una singola opzione, sommando i match del suo value sui loro valori.
export function findFieldsUsingMenuSet(
  menuSetId: number
): { id: number; key: string; scope: string; transitionId: number | null }[] {
  return getDb()
    .select({
      id: fieldDefs.id,
      key: fieldDefs.key,
      scope: fieldDefs.scope,
      transitionId: fieldDefs.transitionId,
    })
    .from(fieldDefs)
    .where(eq(fieldDefs.menuSetId, menuSetId))
    .all()
}

export function setFieldIsActive(id: number, isActive: boolean): void {
  getDb().update(fieldDefs).set({ isActive }).where(eq(fieldDefs.id, id)).run()
}

export function reorderFieldsAtomic(items: { id: number; order: number }[]): void {
  getDb().transaction((tx) => {
    for (const item of items) {
      tx.update(fieldDefs).set({ order: item.order }).where(eq(fieldDefs.id, item.id)).run()
    }
  })
}

// ---------- Eliminazione fisica (C-002): conteggi-riferimenti + delete ----------

// --- Fase ---
export function countTransitionsUsingPhase(phaseId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(transitions)
    .where(or(eq(transitions.fromPhaseId, phaseId), eq(transitions.toPhaseId, phaseId)))
    .all()
  return row?.cnt ?? 0
}

// Include le pratiche cestinate (la FK vale anche per esse): current O previous.
export function countAnyPracticesUsingPhase(phaseId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(practices)
    .where(or(eq(practices.currentPhaseId, phaseId), eq(practices.previousPhaseId, phaseId)))
    .all()
  return row?.cnt ?? 0
}

export function countHistoryUsingPhase(phaseId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(historyEvents)
    .where(or(eq(historyEvents.fromPhaseId, phaseId), eq(historyEvents.toPhaseId, phaseId)))
    .all()
  return row?.cnt ?? 0
}

export function countTransitionRecordsUsingPhase(phaseId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(transitionRecords)
    .where(or(eq(transitionRecords.fromPhaseId, phaseId), eq(transitionRecords.toPhaseId, phaseId)))
    .all()
  return row?.cnt ?? 0
}

export function deletePhaseRow(id: number): number {
  return getDb().delete(phases).where(eq(phases.id, id)).run().changes
}

// --- Transizione ---
export function countTransitionRecordsForTransition(transitionId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(transitionRecords)
    .where(eq(transitionRecords.transitionId, transitionId))
    .all()
  return row?.cnt ?? 0
}

export function countFieldsForTransition(transitionId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(fieldDefs)
    .where(eq(fieldDefs.transitionId, transitionId))
    .all()
  return row?.cnt ?? 0
}

// Elimina la transizione e, in cascata, i suoi campi (scope=transition). Una transazione.
export function deleteTransitionCascade(id: number): void {
  getDb().transaction((tx) => {
    tx.delete(fieldDefs).where(eq(fieldDefs.transitionId, id)).run()
    tx.delete(transitions).where(eq(transitions.id, id)).run()
  })
}

// --- Campo ---
export function countFieldsConditionalOn(fieldId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(fieldDefs)
    .where(eq(fieldDefs.conditionalOnFieldId, fieldId))
    .all()
  return row?.cnt ?? 0
}

export function deleteFieldRow(id: number): number {
  return getDb().delete(fieldDefs).where(eq(fieldDefs.id, id)).run().changes
}

// --- Menu set / opzione ---
export function countFieldsUsingMenuSet(menuSetId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(fieldDefs)
    .where(eq(fieldDefs.menuSetId, menuSetId))
    .all()
  return row?.cnt ?? 0
}

export function countOptionsForMenuSet(menuSetId: number): number {
  const [row] = getDb()
    .select({ cnt: count() })
    .from(menuOptions)
    .where(eq(menuOptions.menuSetId, menuSetId))
    .all()
  return row?.cnt ?? 0
}

// Elimina il menu set e, in cascata, le sue opzioni. Una transazione.
export function deleteMenuSetCascade(id: number): void {
  getDb().transaction((tx) => {
    tx.delete(menuOptions).where(eq(menuOptions.menuSetId, id)).run()
    tx.delete(menuSets).where(eq(menuSets.id, id)).run()
  })
}

export function deleteMenuOptionRow(id: number): number {
  return getDb().delete(menuOptions).where(eq(menuOptions.id, id)).run().changes
}
