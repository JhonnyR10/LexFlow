import type {
  AlertSeverity,
  DashboardAgingItem,
  DashboardAgingResponse,
  DashboardAlert,
  DashboardAlertsResponse,
  DashboardMissingDocItem,
  DashboardMissingDocumentsResponse,
  DashboardPhaseCountsResponse,
  DashboardScadenzaAlert,
  DashboardScadenzeAlertsResponse,
  DocumentKind,
} from '../../../shared/ipc'
import type { AlertConfig } from '../../../shared/ipc'
import { daysSinceDeposit } from '../../../shared/giorniDeposito'
import { getAlertConfig } from '../settings/repository'
import {
  findActiveOpenPracticesWithDeposit,
  findActiveOpenPracticesWithDocFlags,
  findActivePendingScadenze,
  findActivePhaseCounts,
  type OpenPracticeDocFlagsRow,
  type OpenPracticeRow,
} from './repository'

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

const SEVERITY_RANK: Record<AlertSeverity, number> = { red: 3, orange: 2, yellow: 1 }

// Severità in base a soglie/abilitazioni configurabili (S11.5). L'alert compare
// al livello più alto TRA QUELLI ABILITATI la cui soglia è superata (confronto
// stretto). Disabilitare un livello non nasconde una pratica più vecchia: ricade
// sul livello inferiore abilitato.
function severityForDays(days: number, cfg: AlertConfig): AlertSeverity | null {
  if (cfg.red.enabled && days > cfg.red.thresholdDays) return 'red'
  if (cfg.orange.enabled && days > cfg.orange.thresholdDays) return 'orange'
  if (cfg.yellow.enabled && days > cfg.yellow.thresholdDays) return 'yellow'
  return null
}

// Motivazioni aggregate nello stesso box. La prima (anzianità) è sempre presente
// quando severità ≠ null; le contestuali ragionano per category canonica.
function buildReasons(days: number, category: string): string[] {
  const reasons = [`Ferma da ${days} giorni dalla data deposito.`]
  if (category === 'decree_received') {
    reasons.push('Decreto ricevuto ma non ancora inviato a SCP.')
  }
  return reasons
}

function toAlert(row: OpenPracticeRow, cfg: AlertConfig): DashboardAlert | null {
  const days = daysSinceDeposit(row.dataDeposito)
  if (days === null) return null
  const severity = severityForDays(days, cfg)
  if (severity === null) return null
  return {
    practiceId:              row.practiceId,
    codiceIstanza:           row.codiceIstanza,
    nomeIstanza:             row.nomeIstanza,
    currentPhaseDisplayName: row.currentPhaseDisplayName,
    severity,
    daysSinceDeposit:        days,
    reasons:                 buildReasons(days, row.currentPhaseCategory),
  }
}

// Alert aggregato per pratica (S8.2): un box per pratica attiva oltre soglia,
// ordinato per severità (rosso → arancione → giallo) poi giorni decrescenti.
export function getDashboardAlerts(): DashboardAlertsResponse {
  const cfg = getAlertConfig()
  return findActiveOpenPracticesWithDeposit()
    .map((row) => toAlert(row, cfg))
    .filter((a): a is DashboardAlert => a !== null)
    .sort(
      (a, b) =>
        SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
        b.daysSinceDeposit - a.daysSinceDeposit
    )
}

const AGING_LIMIT = 5

// Anzianità (S8.4): le pratiche aperte più vecchie per giorni dalla data deposito,
// senza soglia (a differenza degli alert). Le pratiche senza data deposito sono
// escluse (non ordinabili per età). Ordinate per giorni decrescenti, prime N.
export function getDashboardAging(limit = AGING_LIMIT): DashboardAgingResponse {
  return findActiveOpenPracticesWithDeposit()
    .map((row): DashboardAgingItem | null => {
      const days = daysSinceDeposit(row.dataDeposito)
      if (days === null) return null
      return {
        practiceId:              row.practiceId,
        codiceIstanza:           row.codiceIstanza,
        nomeIstanza:             row.nomeIstanza,
        currentPhaseDisplayName: row.currentPhaseDisplayName,
        daysSinceDeposit:        days,
      }
    })
    .filter((i): i is DashboardAgingItem => i !== null)
    .sort((a, b) => b.daysSinceDeposit - a.daysSinceDeposit)
    .slice(0, limit)
}

// Category in cui un documento diventa **atteso** (fase raggiunta). Si ragiona per
// category canonica come gli alert (S8.2), non per key: il decreto è dovuto dalla
// fase «Decreto ricevuto» in avanti; la fattura dalla fase «In attesa di
// liquidazione SCP» in avanti. Prima di queste soglie il documento non manca:
// non è ancora dovuto (evita rumore sulle pratiche appena depositate).
const DECRETO_EXPECTED_CATEGORIES: ReadonlySet<string> = new Set([
  'decree_received',
  'awaiting_correction',
  'awaiting_appeal',
  'awaiting_liquidation',
  'awaiting_integration_scp',
  'liquidated',
])
const FATTURA_EXPECTED_CATEGORIES: ReadonlySet<string> = new Set([
  'awaiting_liquidation',
  'awaiting_integration_scp',
  'liquidated',
])

function missingDocsForRow(row: OpenPracticeDocFlagsRow): DocumentKind[] {
  const missing: DocumentKind[] = []
  if (DECRETO_EXPECTED_CATEGORIES.has(row.currentPhaseCategory) && !row.hasDecreto) {
    missing.push('decreto')
  }
  if (FATTURA_EXPECTED_CATEGORIES.has(row.currentPhaseCategory) && !row.hasFattura) {
    missing.push('fattura')
  }
  return missing
}

// Documenti mancanti (S8.5): per ogni pratica aperta, i documenti attesi per la
// fase raggiunta ma assenti. Le pratiche senza mancanze non entrano nel risultato.
// Ordinate per numero di documenti mancanti decrescente, poi per codice istanza.
export function getDashboardMissingDocuments(): DashboardMissingDocumentsResponse {
  return findActiveOpenPracticesWithDocFlags()
    .map((row): DashboardMissingDocItem | null => {
      const missing = missingDocsForRow(row)
      if (missing.length === 0) return null
      return {
        practiceId:              row.practiceId,
        codiceIstanza:           row.codiceIstanza,
        nomeIstanza:             row.nomeIstanza,
        currentPhaseDisplayName: row.currentPhaseDisplayName,
        missing,
      }
    })
    .filter((i): i is DashboardMissingDocItem => i !== null)
    .sort(
      (a, b) =>
        b.missing.length - a.missing.length ||
        a.codiceIstanza.localeCompare(b.codiceIstanza, 'it')
    )
}

// Finestra di imminenza fissa (S15.2): una scadenza è "imminente" se cade entro
// questi giorni da oggi. Le scadute (data passata) sono sempre in alert.
const IMMINENCE_DAYS = 7

// Giorni interi da oggi (mezzanotte locale) alla data `YYYY-MM-DD`. Negativo se
// passata. Round: entrambe le date sono a mezzanotte, quindi multiplo esatto.
function daysUntilDate(dateIso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso)
  if (!m) return null
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(target.getTime())) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

// Alert scadenze (S15.2): scadute (rosso) e imminenti entro IMMINENCE_DAYS
// (arancione); oltre, escluse. Ordinate per giorni crescenti: scadute (più
// negative) prima, poi imminenti più vicine.
export function getDashboardScadenzeAlerts(): DashboardScadenzeAlertsResponse {
  return findActivePendingScadenze()
    .map((row): DashboardScadenzaAlert | null => {
      const daysUntil = daysUntilDate(row.dataScadenza)
      if (daysUntil === null || daysUntil > IMMINENCE_DAYS) return null
      return {
        scadenzaId:    row.scadenzaId,
        practiceId:    row.practiceId,
        codiceIstanza: row.codiceIstanza,
        nomeIstanza:   row.nomeIstanza,
        descrizione:   row.descrizione,
        dataScadenza:  row.dataScadenza,
        daysUntil,
        severity:      daysUntil < 0 ? 'red' : 'orange',
      }
    })
    .filter((a): a is DashboardScadenzaAlert => a !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}
