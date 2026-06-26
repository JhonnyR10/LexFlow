import type {
  AlertSeverity,
  DashboardAlert,
  DashboardAlertsResponse,
  DashboardPhaseCountsResponse,
} from '../../../shared/ipc'
import {
  findActivePhaseCounts,
  findActivePracticesForAlerts,
  type AlertCandidateRow,
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

const MS_PER_DAY = 24 * 60 * 60 * 1000
const SEVERITY_RANK: Record<AlertSeverity, number> = { red: 3, orange: 2, yellow: 1 }

// Giorni interi (>= 0) tra oggi (data locale) e la data deposito ISO YYYY-MM-DD.
// null se la data è assente o non parsabile (→ nessun alert di anzianità in S8.2).
function daysSinceDeposit(dataDeposito: string | null): number | null {
  if (!dataDeposito) return null
  const deposito = new Date(`${dataDeposito}T00:00:00`)
  if (Number.isNaN(deposito.getTime())) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.floor((today.getTime() - deposito.getTime()) / MS_PER_DAY)
  return diff < 0 ? 0 : diff
}

// Soglie 30/60/90, strettamente maggiori. Driver unico della comparsa del box.
function severityForDays(days: number): AlertSeverity | null {
  if (days > 90) return 'red'
  if (days > 60) return 'orange'
  if (days > 30) return 'yellow'
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

function toAlert(row: AlertCandidateRow): DashboardAlert | null {
  const days = daysSinceDeposit(row.dataDeposito)
  if (days === null) return null
  const severity = severityForDays(days)
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
  return findActivePracticesForAlerts()
    .map(toAlert)
    .filter((a): a is DashboardAlert => a !== null)
    .sort(
      (a, b) =>
        SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
        b.daysSinceDeposit - a.daysSinceDeposit
    )
}
