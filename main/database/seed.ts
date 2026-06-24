import { eq, sql } from 'drizzle-orm'
import { app } from 'electron'
import { getDb } from './connection'
import { phases, transitions, menuSets, menuOptions, appSettings } from './schema'
import type { NewPhase, NewTransition, NewMenuSet, NewMenuOption } from './schema'
import { logger } from '../utils/logger'

// ---------- Fasi canoniche (13) ----------
// Chiave tecnica immutabile. pecEnabled rimosso: la PEC è guidata dai campi della transizione.

const SEED_PHASES: NewPhase[] = [
  { key: 'depositata',                  displayName: 'Depositata',                           category: 'deposited',               isInitial: true,  isFinal: false, isActive: true, order: 1  },
  { key: 'in_attesa_decreto',           displayName: 'In attesa di decreto',                 category: 'awaiting_decree',          isInitial: false, isFinal: false, isActive: true, order: 2  },
  { key: 'in_attesa_integrazione',      displayName: 'In attesa di integrazione',            category: 'awaiting_integration',     isInitial: false, isFinal: false, isActive: true, order: 3  },
  { key: 'decreto_ricevuto',            displayName: 'Decreto ricevuto',                     category: 'decree_received',          isInitial: false, isFinal: false, isActive: true, order: 4  },
  { key: 'in_attesa_esito_correzione',  displayName: 'In attesa di esito correzione decreto',category: 'awaiting_correction',      isInitial: false, isFinal: false, isActive: true, order: 5  },
  { key: 'in_attesa_esito_impugnazione',displayName: 'In attesa di esito impugnazione',      category: 'awaiting_appeal',          isInitial: false, isFinal: false, isActive: true, order: 6  },
  { key: 'in_attesa_liquidazione_scp',  displayName: 'In attesa di liquidazione SCP',        category: 'awaiting_liquidation',     isInitial: false, isFinal: false, isActive: true, order: 7  },
  { key: 'in_attesa_integrazione_scp',  displayName: 'In attesa di integrazione SCP',        category: 'awaiting_integration_scp', isInitial: false, isFinal: false, isActive: true, order: 8  },
  { key: 'liquidata',                   displayName: 'Liquidata',                            category: 'liquidated',               isInitial: false, isFinal: false, isActive: true, order: 9  },
  { key: 'chiusa',                      displayName: 'Chiusa',                               category: 'closed',                   isInitial: false, isFinal: true,  isActive: true, order: 10 },
  { key: 'rifiutata',                   displayName: 'Rifiutata',                            category: 'refused',                  isInitial: false, isFinal: true,  isActive: true, order: 11 },
  { key: 'sospesa',                     displayName: 'Sospesa',                              category: 'suspended',                isInitial: false, isFinal: false, isActive: true, order: 12 },
  { key: 'annullata',                   displayName: 'Annullata',                            category: 'annulled',                 isInitial: false, isFinal: true,  isActive: true, order: 13 }
]

// ---------- Transizioni canoniche (40) ----------
// Chiave idempotenza: (fromKey, buttonLabel).
// self = fromKey == toKey (la fase rimane invariata, viene registrato un evento).
// isResume = true → toKey null (il motore riporta la pratica alla previousPhase).

interface TransitionSeed {
  fromKey: string
  toKey: string | null
  buttonLabel: string
  order: number
  isRepeatable?: boolean
  isAutomatic?: boolean
  isResume?: boolean
}

const SEED_TRANSITIONS: TransitionSeed[] = [
  // depositata
  { fromKey: 'depositata',                   toKey: 'in_attesa_decreto',           buttonLabel: '',                                        order: 1, isAutomatic: true },

  // in_attesa_decreto
  { fromKey: 'in_attesa_decreto',            toKey: 'in_attesa_decreto',           buttonLabel: 'Registra sollecito',                      order: 1, isRepeatable: true },
  { fromKey: 'in_attesa_decreto',            toKey: 'in_attesa_integrazione',      buttonLabel: 'Registra richiesta di integrazione',       order: 2 },
  { fromKey: 'in_attesa_decreto',            toKey: 'decreto_ricevuto',            buttonLabel: 'Registra decreto',                         order: 3 },
  { fromKey: 'in_attesa_decreto',            toKey: 'rifiutata',                   buttonLabel: 'Segna come rifiutata',                     order: 4 },
  { fromKey: 'in_attesa_decreto',            toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 5 },
  { fromKey: 'in_attesa_decreto',            toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 6 },

  // in_attesa_integrazione
  { fromKey: 'in_attesa_integrazione',       toKey: 'in_attesa_integrazione',      buttonLabel: 'Registra sollecito integrazione',          order: 1, isRepeatable: true },
  { fromKey: 'in_attesa_integrazione',       toKey: 'in_attesa_integrazione',      buttonLabel: 'Aggiorna richiesta / proroga termine',     order: 2, isRepeatable: true },
  { fromKey: 'in_attesa_integrazione',       toKey: 'in_attesa_decreto',           buttonLabel: 'Registra invio integrazione',              order: 3 },
  { fromKey: 'in_attesa_integrazione',       toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 4 },
  { fromKey: 'in_attesa_integrazione',       toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 5 },

  // decreto_ricevuto
  { fromKey: 'decreto_ricevuto',             toKey: 'in_attesa_liquidazione_scp',  buttonLabel: 'Registra invio a SCP',                     order: 1 },
  { fromKey: 'decreto_ricevuto',             toKey: 'in_attesa_esito_correzione',  buttonLabel: 'Richiedi correzione decreto',               order: 2 },
  { fromKey: 'decreto_ricevuto',             toKey: 'in_attesa_esito_impugnazione',buttonLabel: 'Registra impugnazione',                    order: 3 },
  { fromKey: 'decreto_ricevuto',             toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 4 },
  { fromKey: 'decreto_ricevuto',             toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 5 },

  // in_attesa_esito_correzione
  { fromKey: 'in_attesa_esito_correzione',   toKey: 'in_attesa_esito_correzione',  buttonLabel: 'Registra sollecito correzione',            order: 1, isRepeatable: true },
  { fromKey: 'in_attesa_esito_correzione',   toKey: 'decreto_ricevuto',            buttonLabel: 'Registra decreto corretto',                order: 2 },
  { fromKey: 'in_attesa_esito_correzione',   toKey: 'decreto_ricevuto',            buttonLabel: 'Chiudi correzione senza nuovo decreto',    order: 3 },
  { fromKey: 'in_attesa_esito_correzione',   toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 4 },
  { fromKey: 'in_attesa_esito_correzione',   toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 5 },

  // in_attesa_esito_impugnazione
  { fromKey: 'in_attesa_esito_impugnazione', toKey: 'in_attesa_esito_impugnazione',buttonLabel: 'Registra sollecito impugnazione',          order: 1, isRepeatable: true },
  { fromKey: 'in_attesa_esito_impugnazione', toKey: 'decreto_ricevuto',            buttonLabel: 'Registra nuovo decreto',                   order: 2 },
  { fromKey: 'in_attesa_esito_impugnazione', toKey: 'decreto_ricevuto',            buttonLabel: 'Registra rigetto impugnazione',            order: 3 },
  { fromKey: 'in_attesa_esito_impugnazione', toKey: 'decreto_ricevuto',            buttonLabel: 'Ritira impugnazione',                      order: 4 },
  { fromKey: 'in_attesa_esito_impugnazione', toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 5 },
  { fromKey: 'in_attesa_esito_impugnazione', toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 6 },

  // in_attesa_liquidazione_scp
  { fromKey: 'in_attesa_liquidazione_scp',   toKey: 'in_attesa_liquidazione_scp',  buttonLabel: 'Registra sollecito SCP',                   order: 1, isRepeatable: true },
  { fromKey: 'in_attesa_liquidazione_scp',   toKey: 'in_attesa_integrazione_scp',  buttonLabel: 'Registra richiesta di integrazione SCP',   order: 2 },
  { fromKey: 'in_attesa_liquidazione_scp',   toKey: 'liquidata',                   buttonLabel: 'Registra liquidazione',                    order: 3 },
  { fromKey: 'in_attesa_liquidazione_scp',   toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 4 },
  { fromKey: 'in_attesa_liquidazione_scp',   toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 5 },

  // in_attesa_integrazione_scp
  { fromKey: 'in_attesa_integrazione_scp',   toKey: 'in_attesa_integrazione_scp',  buttonLabel: 'Registra sollecito integrazione SCP',      order: 1, isRepeatable: true },
  { fromKey: 'in_attesa_integrazione_scp',   toKey: 'in_attesa_liquidazione_scp',  buttonLabel: 'Registra invio integrazione SCP',          order: 2 },
  { fromKey: 'in_attesa_integrazione_scp',   toKey: 'sospesa',                     buttonLabel: 'Sospendi pratica',                         order: 3 },
  { fromKey: 'in_attesa_integrazione_scp',   toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 4 },

  // liquidata
  { fromKey: 'liquidata',                    toKey: 'chiusa',                      buttonLabel: 'Chiudi pratica',                           order: 1 },

  // sospesa
  { fromKey: 'sospesa',                      toKey: null,                          buttonLabel: 'Riprendi pratica',                         order: 1, isResume: true },
  { fromKey: 'sospesa',                      toKey: 'annullata',                   buttonLabel: 'Annulla pratica',                          order: 2 }

  // Nessuna transizione in uscita da: chiusa, rifiutata, annullata
]

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
    options: []
  }
]

// ---------- Esecuzione seed ----------

export function runSeed(): void {
  const db = getDb()
  logger.info('SEED_START')

  // 1. Fasi (idempotente per key unique — onConflictDoNothing se già esiste)
  db.insert(phases).values(SEED_PHASES).onConflictDoNothing().run()
  logger.debug('SEED_PHASES_OK', `${SEED_PHASES.length} fasi`)

  // 2. Recupera gli ID fase per costruire le transizioni
  const phaseRows = db.select({ id: phases.id, key: phases.key }).from(phases).all()
  const phaseIdByKey = new Map<string, number>(phaseRows.map((r) => [r.key, r.id]))

  // 3. Transizioni (idempotente per unique(fromPhaseId, buttonLabel))
  const transitionRows: NewTransition[] = SEED_TRANSITIONS
    .map((t): NewTransition | null => {
      const fromPhaseId = phaseIdByKey.get(t.fromKey)
      const toPhaseId   = t.toKey != null ? phaseIdByKey.get(t.toKey) : undefined

      if (fromPhaseId === undefined) {
        logger.warn('SEED_TRANSITION_SKIP', `fase fromKey non trovata: ${t.fromKey}`)
        return null
      }
      if (t.toKey != null && toPhaseId === undefined) {
        logger.warn('SEED_TRANSITION_SKIP', `fase toKey non trovata: ${t.toKey}`)
        return null
      }

      return {
        fromPhaseId,
        toPhaseId:   t.toKey != null ? toPhaseId! : null,
        buttonLabel: t.buttonLabel,
        order:       t.order,
        isActive:    true,
        isRepeatable: t.isRepeatable ?? false,
        isAutomatic:  t.isAutomatic  ?? false,
        isResume:     t.isResume     ?? false
      }
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
          label:     o.label,
          value:     o.value,
          order:     o.order,
          isActive:  true
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
        alertsEnabled:   JSON.stringify({ giallo: true, arancione: true, rosso: true }),
        alertThresholds: JSON.stringify({ giallo: 30, arancione: 60, rosso: 90 }),
        assistant: JSON.stringify({
          localEnabled: false,
          apiEnabled:   false,
          provider:     null,
          model:        null,
          apiKeyRef:    null,
          instructions: null
        }),
        dataPath:   userDataPath,
        appVersion: app.getVersion(),
        backup: JSON.stringify({
          autoEnabled:    true,
          trigger:        'onClose',
          intervalHours:  24,
          retentionCount: 10,
          backupPath:     userDataPath,
          lastBackupAt:   null
        }),
        security: JSON.stringify({ lockEnabled: false, encryptionEnabled: false })
      })
      .run()
    logger.debug('SEED_SETTINGS_OK')
  } else {
    logger.debug('SEED_SETTINGS_SKIP', 'riga già presente')
  }

  db.update(appSettings).set({ appVersion: app.getVersion() }).where(sql`1=1`).run()

  logger.info('SEED_DONE')
}
