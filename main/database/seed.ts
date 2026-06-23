import { eq, sql } from 'drizzle-orm'
import { app } from 'electron'
import { getDb } from './connection'
import { phases, transitions, menuSets, menuOptions, appSettings } from './schema'
import type { NewPhase, NewTransition, NewMenuSet, NewMenuOption } from './schema'
import { logger } from '../utils/logger'

// ---------- Fasi standard ----------

const SEED_PHASES: NewPhase[] = [
  { key: 'deposited', displayName: 'Depositata', category: 'deposited', isInitial: true, isFinal: false, isActive: true, order: 1, pecEnabled: true },
  { key: 'awaiting_decree', displayName: 'In attesa di decreto', category: 'awaiting_decree', isInitial: false, isFinal: false, isActive: true, order: 2, pecEnabled: false },
  { key: 'sollecito_effettuato', displayName: 'Sollecito effettuato', category: 'custom', isInitial: false, isFinal: false, isActive: true, order: 3, pecEnabled: false },
  { key: 'integrazione_richiesta', displayName: 'Integrazione richiesta', category: 'custom', isInitial: false, isFinal: false, isActive: true, order: 4, pecEnabled: false },
  { key: 'integrazione_inviata', displayName: 'Integrazione inviata', category: 'custom', isInitial: false, isFinal: false, isActive: true, order: 5, pecEnabled: false },
  { key: 'refused', displayName: 'Rifiutata', category: 'refused', isInitial: false, isFinal: true, isActive: true, order: 6, pecEnabled: false },
  { key: 'decree_received', displayName: 'Decreto ricevuto', category: 'decree_received', isInitial: false, isFinal: false, isActive: true, order: 7, pecEnabled: false },
  { key: 'scp_sent', displayName: 'Invio a SCP', category: 'scp_sent', isInitial: false, isFinal: false, isActive: true, order: 8, pecEnabled: true },
  { key: 'awaiting_liquidation', displayName: 'In attesa di liquidazione SCP', category: 'awaiting_liquidation', isInitial: false, isFinal: false, isActive: true, order: 9, pecEnabled: false },
  { key: 'liquidated', displayName: 'Liquidata', category: 'liquidated', isInitial: false, isFinal: true, isActive: true, order: 10, pecEnabled: false },
  { key: 'closed', displayName: 'Chiusa', category: 'closed', isInitial: false, isFinal: true, isActive: true, order: 11, pecEnabled: false },
  { key: 'suspended', displayName: 'Sospesa', category: 'suspended', isInitial: false, isFinal: false, isActive: true, order: 12, pecEnabled: false },
  { key: 'annulled', displayName: 'Annullata', category: 'annulled', isInitial: false, isFinal: true, isActive: true, order: 13, pecEnabled: false }
]

// ---------- Transizioni standard (fromKey → toKey) ----------

interface TransitionSeed {
  fromKey: string
  toKey: string
  buttonLabel: string
  order: number
}

// Fasi non finali che ricevono le transizioni universali → Sospesa e → Annullata
// (Sospesa non riceve → Sospesa, ma riceve → Annullata come fase non finale)
const NON_FINAL_KEYS_FOR_SUSPENSION = [
  'deposited',
  'awaiting_decree',
  'sollecito_effettuato',
  'integrazione_richiesta',
  'integrazione_inviata',
  'decree_received',
  'scp_sent',
  'awaiting_liquidation'
]

const BASE_TRANSITIONS: TransitionSeed[] = [
  { fromKey: 'deposited', toKey: 'awaiting_decree', buttonLabel: 'In attesa di decreto', order: 1 },
  { fromKey: 'awaiting_decree', toKey: 'sollecito_effettuato', buttonLabel: 'Registra sollecito', order: 1 },
  { fromKey: 'awaiting_decree', toKey: 'integrazione_richiesta', buttonLabel: 'Integrazione richiesta', order: 2 },
  { fromKey: 'awaiting_decree', toKey: 'decree_received', buttonLabel: 'Decreto ricevuto', order: 3 },
  { fromKey: 'awaiting_decree', toKey: 'refused', buttonLabel: 'Rifiutata', order: 4 },
  { fromKey: 'integrazione_richiesta', toKey: 'integrazione_inviata', buttonLabel: 'Integrazione inviata', order: 1 },
  { fromKey: 'integrazione_inviata', toKey: 'awaiting_decree', buttonLabel: 'Torna in attesa di decreto', order: 1 },
  { fromKey: 'sollecito_effettuato', toKey: 'awaiting_decree', buttonLabel: 'Torna in attesa di decreto', order: 1 },
  { fromKey: 'decree_received', toKey: 'scp_sent', buttonLabel: 'Invia a SCP', order: 1 },
  { fromKey: 'scp_sent', toKey: 'awaiting_liquidation', buttonLabel: 'In attesa di liquidazione SCP', order: 1 },
  { fromKey: 'awaiting_liquidation', toKey: 'liquidated', buttonLabel: 'Liquidata', order: 1 },
  { fromKey: 'liquidated', toKey: 'closed', buttonLabel: 'Chiudi', order: 1 },
  // Da Sospesa: Riattiva e Annulla
  { fromKey: 'suspended', toKey: 'awaiting_decree', buttonLabel: 'Riattiva', order: 1 },
  { fromKey: 'suspended', toKey: 'annulled', buttonLabel: 'Annulla', order: 91 }
]

function buildAllTransitions(): TransitionSeed[] {
  const all = [...BASE_TRANSITIONS]
  for (const fromKey of NON_FINAL_KEYS_FOR_SUSPENSION) {
    all.push({ fromKey, toKey: 'suspended', buttonLabel: 'Sospendi', order: 90 })
    all.push({ fromKey, toKey: 'annulled', buttonLabel: 'Annulla', order: 91 })
  }
  return all
}

// ---------- Menu standard ----------

interface MenuSeedSet {
  key: string
  label: string
  options: Array<{ label: string; value: string; order: number }>
}

const SEED_MENU_SETS: MenuSeedSet[] = [
  {
    key: 'modalita_deposito',
    label: 'Modalità deposito',
    options: [
      { label: 'PEC', value: 'pec', order: 1 },
      { label: 'A mano', value: 'a_mano', order: 2 }
    ]
  },
  {
    key: 'modalita_invio_scp',
    label: 'Modalità invio SCP',
    options: [
      { label: 'PEC', value: 'pec', order: 1 },
      { label: 'Raccomandata', value: 'raccomandata', order: 2 }
    ]
  },
  {
    key: 'tipologia_attivita',
    label: 'Tipologia attività',
    options: [
      { label: 'Interrogatorio', value: 'interrogatorio', order: 1 },
      { label: 'Processo', value: 'processo', order: 2 },
      { label: 'Testimonianza assistita', value: 'testimonianza_assistita', order: 3 }
    ]
  },
  {
    key: 'competenza',
    label: 'Competenza',
    options: [
      { label: 'GIP/GUP', value: 'gip_gup', order: 1 },
      { label: 'Tribunale', value: 'tribunale', order: 2 },
      { label: "Corte d'Assise", value: 'corte_assise', order: 3 },
      { label: "Corte d'Appello", value: 'corte_appello', order: 4 },
      { label: 'Cassazione', value: 'cassazione', order: 5 }
    ]
  },
  {
    key: 'autorita_giudiziaria',
    label: 'Autorità giudiziaria',
    options: [] // nessuna opzione di default — l'utente le aggiungerà
  }
]

// ---------- Esecuzione seed ----------

export function runSeed(): void {
  const db = getDb()
  logger.info('SEED_START')

  // 1. Fasi (idempotente per key unique)
  db.insert(phases).values(SEED_PHASES).onConflictDoNothing().run()
  logger.debug('SEED_PHASES_OK', `${SEED_PHASES.length} fasi`)

  // 2. Leggo le fasi per ricavare gli ID necessari alle transizioni
  const phaseRows = db.select({ id: phases.id, key: phases.key }).from(phases).all()
  const phaseIdByKey = new Map<string, number>(phaseRows.map((r) => [r.key, r.id]))

  // 3. Transizioni (idempotente per unique(fromPhaseId, toPhaseId))
  const allTransitions = buildAllTransitions()
  const transitionRows: NewTransition[] = allTransitions
    .map(({ fromKey, toKey, buttonLabel, order }): NewTransition | null => {
      const fromPhaseId = phaseIdByKey.get(fromKey)
      const toPhaseId = phaseIdByKey.get(toKey)
      if (fromPhaseId === undefined || toPhaseId === undefined) {
        logger.warn('SEED_TRANSITION_SKIP', `fase non trovata: ${fromKey} → ${toKey}`)
        return null
      }
      return { fromPhaseId, toPhaseId, buttonLabel, order, isActive: true }
    })
    .filter((t): t is NewTransition => t !== null)

  if (transitionRows.length > 0) {
    db.insert(transitions).values(transitionRows).onConflictDoNothing().run()
    logger.debug('SEED_TRANSITIONS_OK', `${transitionRows.length} transizioni`)
  }

  // 4. Menu set e opzioni (idempotente per key unique / unique(menuSetId, value))
  for (const setDef of SEED_MENU_SETS) {
    const setRow: NewMenuSet = { key: setDef.key, label: setDef.label }
    db.insert(menuSets).values(setRow).onConflictDoNothing().run()

    if (setDef.options.length > 0) {
      const setRecord = db.select({ id: menuSets.id }).from(menuSets).where(eq(menuSets.key, setDef.key)).get()
      if (setRecord) {
        const optRows: NewMenuOption[] = setDef.options.map((o) => ({
          menuSetId: setRecord.id,
          label: o.label,
          value: o.value,
          order: o.order,
          isActive: true
        }))
        db.insert(menuOptions).values(optRows).onConflictDoNothing().run()
      }
    }
  }
  logger.debug('SEED_MENUS_OK', `${SEED_MENU_SETS.length} menu set`)

  // 5. AppSettings (riga unica di default — non sovrascrivere se già presente)
  const existing = db.select({ id: appSettings.id }).from(appSettings).get()
  if (!existing) {
    const userDataPath = app.getPath('userData')
    db
      .insert(appSettings)
      .values({
        theme: 'light',
        alertsEnabled: JSON.stringify({ giallo: true, arancione: true, rosso: true }),
        alertThresholds: JSON.stringify({ giallo: 30, arancione: 60, rosso: 90 }),
        assistant: JSON.stringify({
          localEnabled: false,
          apiEnabled: false,
          provider: null,
          model: null,
          apiKeyRef: null,
          instructions: null
        }),
        dataPath: userDataPath,
        appVersion: app.getVersion(),
        backup: JSON.stringify({
          autoEnabled: true,
          trigger: 'onClose',
          intervalHours: 24,
          retentionCount: 10,
          backupPath: userDataPath,
          lastBackupAt: null
        }),
        security: JSON.stringify({ lockEnabled: false, encryptionEnabled: false })
      })
      .run()
    logger.debug('SEED_SETTINGS_OK')
  } else {
    logger.debug('SEED_SETTINGS_SKIP', 'riga già presente')
  }

  // Aggiorna appVersion se l'app è stata aggiornata
  db
    .update(appSettings)
    .set({ appVersion: app.getVersion() })
    .where(sql`1=1`)
    .run()

  logger.info('SEED_DONE')
}
