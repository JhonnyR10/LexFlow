import type {
  AssistantAnswer,
  AssistantAnswerItem,
  AssistantAskInput,
} from '../../../shared/ipc'
import {
  getDashboardAging,
  getDashboardAlerts,
  getDashboardMissingDocuments,
  getDashboardPhaseCounts,
  getDashboardScadenzeAlerts,
} from '../dashboard/service'
import { getReportSummary } from '../report/service'

// Domande d'esempio mostrate quando non riconosciamo l'intento (o come guida):
// non promettono nulla che l'assistente non sappia fare.
const SUGGESTIONS: string[] = [
  'Quante pratiche attive ci sono?',
  'Quali pratiche sono ferme da troppo tempo?',
  'A quali pratiche mancano dei documenti?',
  'Ci sono scadenze imminenti o scadute?',
  'Qual è il totale concesso e liquidato?',
]

// Minuscolo + rimozione accenti (NFD) per un confronto robusto delle parole
// chiave indipendente da maiuscole/accenti.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function includesAny(text: string, needles: string[]): boolean {
  return needles.some((n) => text.includes(n))
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

function answer(
  intent: AssistantAnswer['intent'],
  text: string,
  items: AssistantAnswerItem[] = [],
  suggestions: string[] = []
): AssistantAnswer {
  return { intent, text, items, suggestions }
}

// Conteggi per fase (S8.1). Se la domanda nomina una fase presente nei conteggi,
// risponde con quella singola; altrimenti dà il totale e la distribuzione.
function answerPhaseCounts(text: string): AssistantAnswer {
  const counts = getDashboardPhaseCounts()
  const total = counts.reduce((sum, c) => sum + c.count, 0)

  const matched = counts.find((c) => text.includes(normalize(c.displayName)))
  if (matched) {
    return answer(
      'phase_counts',
      `Ci sono ${matched.count} pratiche attive nella fase «${matched.displayName}».`
    )
  }

  if (total === 0) {
    return answer('phase_counts', 'Non ci sono pratiche attive in archivio.')
  }

  const lines = counts.map((c) => `• ${c.displayName}: ${c.count}`).join('\n')
  return answer(
    'phase_counts',
    `Ci sono ${total} pratiche attive, distribuite per fase:\n${lines}`
  )
}

// Pratiche ferme (alert S8.2) o più vecchie per anzianità (S8.4), secondo la
// formulazione della domanda.
function answerStuck(text: string): AssistantAnswer {
  const wantsAging = includesAny(text, ['vecchi', 'anzianit'])

  if (wantsAging) {
    const aging = getDashboardAging()
    if (aging.length === 0) {
      return answer(
        'stuck',
        'Nessuna pratica attiva con data di deposito da elencare per anzianità.'
      )
    }
    const items: AssistantAnswerItem[] = aging.map((a) => ({
      practiceId: a.practiceId,
      codiceIstanza: a.codiceIstanza,
      nomeIstanza: a.nomeIstanza,
      detail: `ferma da ${a.daysSinceDeposit} giorni`,
    }))
    return answer('stuck', `Le pratiche aperte più vecchie (${items.length}):`, items)
  }

  const alerts = getDashboardAlerts()
  if (alerts.length === 0) {
    return answer(
      'stuck',
      'Nessuna pratica attiva risulta ferma oltre le soglie di avviso configurate.'
    )
  }
  const items: AssistantAnswerItem[] = alerts.map((a) => ({
    practiceId: a.practiceId,
    codiceIstanza: a.codiceIstanza,
    nomeIstanza: a.nomeIstanza,
    detail: `ferma da ${a.daysSinceDeposit} giorni`,
  }))
  return answer('stuck', `${items.length} pratiche risultano ferme oltre soglia:`, items)
}

// Documenti mancanti (S8.5).
function answerMissingDocs(): AssistantAnswer {
  const missing = getDashboardMissingDocuments()
  if (missing.length === 0) {
    return answer('missing_docs', 'Nessuna pratica attiva ha documenti attesi mancanti.')
  }
  const items: AssistantAnswerItem[] = missing.map((m) => ({
    practiceId: m.practiceId,
    codiceIstanza: m.codiceIstanza,
    nomeIstanza: m.nomeIstanza,
    detail: `manca ${m.missing.join(' e ')}`,
  }))
  return answer('missing_docs', `${items.length} pratiche hanno documenti mancanti:`, items)
}

// Scadenze imminenti/scadute (S15.2).
function answerScadenze(): AssistantAnswer {
  const alerts = getDashboardScadenzeAlerts()
  if (alerts.length === 0) {
    return answer('scadenze', 'Nessuna scadenza scaduta o imminente (entro 7 giorni).')
  }
  const items: AssistantAnswerItem[] = alerts.map((s) => {
    const when =
      s.daysUntil < 0
        ? `scaduta da ${Math.abs(s.daysUntil)} giorni`
        : s.daysUntil === 0
          ? 'scade oggi'
          : `scade tra ${s.daysUntil} giorni`
    return {
      practiceId: s.practiceId,
      codiceIstanza: s.codiceIstanza,
      nomeIstanza: s.nomeIstanza,
      detail: `${s.descrizione} — ${when} (${s.dataScadenza})`,
    }
  })
  const scadute = alerts.filter((s) => s.daysUntil < 0).length
  return answer(
    'scadenze',
    `${items.length} scadenze da attenzionare (${scadute} scadute):`,
    items
  )
}

// Totali importi delle pratiche attive (report S9.2).
function answerTotals(): AssistantAnswer {
  const { totals } = getReportSummary()
  if (totals.practicesCount === 0) {
    return answer('totals', 'Non ci sono pratiche attive di cui riepilogare gli importi.')
  }
  const f = (v: number | null): string => (v == null ? 'Non presente' : formatEuro(v))
  const text = [
    `Su ${totals.practicesCount} pratiche attive:`,
    `• Richiesto: ${f(totals.importoRichiesto)}`,
    `• Concesso: ${f(totals.importoConcesso)}`,
    `• Fatturato: ${f(totals.importoFatturato)}`,
    `• Liquidato: ${f(totals.importoLiquidato)}`,
  ].join('\n')
  return answer('totals', text)
}

// Risposta onesta quando non riconosciamo la domanda: nessun dato inventato,
// solo la guida alle domande gestite.
function answerHelp(): AssistantAnswer {
  return answer(
    'help',
    'Non ho capito la domanda. Rispondo solo con dati presenti in archivio, senza inventare. Ecco alcune domande che gestisco:',
    [],
    SUGGESTIONS
  )
}

// Riconoscimento dell'intento per parole chiave (IT, accent/case-insensitive).
// Ordine dal più specifico al più generico: "pratiche" è generico e resta
// l'ultimo prima dell'aiuto.
export function askAssistant(input: AssistantAskInput): AssistantAnswer {
  const text = normalize(input.query)
  if (text.length === 0) return answerHelp()

  if (includesAny(text, ['scadenz', 'scadut', 'termine', 'termini'])) {
    return answerScadenze()
  }
  if (
    includesAny(text, ['mancant']) ||
    (includesAny(text, ['manca', 'senza']) &&
      includesAny(text, ['document', 'decreto', 'fattura']))
  ) {
    return answerMissingDocs()
  }
  if (includesAny(text, ['ferm', 'ritardo', 'vecchi', 'anzianit', 'sollecit'])) {
    return answerStuck(text)
  }
  if (
    includesAny(text, [
      'importo',
      'importi',
      'totale',
      'totali',
      'concesso',
      'liquidato',
      'fatturato',
      'somma',
      'euro',
    ])
  ) {
    return answerTotals()
  }
  if (
    includesAny(text, ['quant', 'conteggio', 'numero', 'fase', 'stato', 'attive', 'pratiche'])
  ) {
    return answerPhaseCounts(text)
  }

  return answerHelp()
}
