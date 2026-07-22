import type { DocumentItem, PracticeDetail } from '../../../shared/ipc'
import { daysSinceDeposit } from '../../../shared/giorniDeposito'

// Template puro della scheda pratica in HTML (E16). Nessun accesso a electron/fs:
// riceve i dati già assemblati e restituisce una stringa HTML autonoma, resa poi
// in PDF da una BrowserWindow offscreen (printToPDF). Colori da documento, fissi.

function esc(v: unknown): string {
  if (v == null) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const NON_PRESENTE = 'Non presente'
const NON_CALCOLABILE = 'Non calcolabile'

function fmtImporto(v: number | null): string {
  if (v == null) return NON_PRESENTE
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v)
}

// Differenza fra due importi: «Non calcolabile» se manca un operando.
function fmtDiff(a: number | null, b: number | null): string {
  if (a == null || b == null) return NON_CALCOLABILE
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(a - b)
}

function fmtPercReduction(richiesto: number | null, concesso: number | null): string {
  if (richiesto == null || concesso == null || richiesto === 0) return NON_CALCOLABILE
  const perc = ((richiesto - concesso) / richiesto) * 100
  return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(perc)}%`
}

// YYYY-MM-DD → gg/mm/aaaa. Stringhe non parsabili → il valore grezzo.
function fmtDate(iso: string | null): string {
  if (!iso) return NON_PRESENTE
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('it-IT')
}

function fmtSize(bytes: number | null): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DOC_KIND_LABEL: Record<string, string> = { decreto: 'Decreto', fattura: 'Fattura' }

function row(label: string, value: string): string {
  return `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`
}

function section(title: string, inner: string): string {
  return `<section><h2>${esc(title)}</h2>${inner}</section>`
}

function giorniDepositoLabel(dataDeposito: string | null): string {
  const days = daysSinceDeposit(dataDeposito)
  return days == null ? 'Data deposito non presente' : `${days} giorni`
}

// customValues → righe con label risolta (fieldLabels key→label; fallback key).
function customValuesRows(values: Record<string, unknown>, fieldLabels: Record<string, string>): string {
  const keys = Object.keys(values)
  if (keys.length === 0) return ''
  return keys
    .map((k) => {
      const v = values[k]
      const shown = v == null || v === '' ? NON_PRESENTE : typeof v === 'boolean' ? (v ? 'Sì' : 'No') : String(v)
      return row(fieldLabels[k] ?? k, shown)
    })
    .join('')
}

export function buildPracticeHtml(
  detail: PracticeDetail,
  documents: DocumentItem[],
  fieldLabels: Record<string, string>
): string {
  const generatedAt = new Date().toLocaleString('it-IT')

  const datiGenerali = section(
    'Dati generali',
    `<table class="kv">
      ${row('Tipologia attività', detail.tipologiaAttivita ?? NON_PRESENTE)}
      ${row('Competenza', detail.competenza ?? NON_PRESENTE)}
      ${row('Autorità giudiziaria', detail.autoritaGiudiziaria ?? NON_PRESENTE)}
      ${row('Data udienza', fmtDate(detail.dataUdienza))}
      ${row('Data deposito', fmtDate(detail.dataDeposito))}
      ${row('Giorni dalla data deposito', giorniDepositoLabel(detail.dataDeposito))}
      ${row('Modalità deposito', detail.modalitaDeposito ?? NON_PRESENTE)}
      ${row('Note', detail.note ?? NON_PRESENTE)}
    </table>`
  )

  const soggetti = section(
    'Soggetti',
    `<table class="kv">
      ${row('Collaboratore', detail.collaboratoreDenominazione ?? NON_PRESENTE)}
      ${row('Professionista', detail.professionistaDenominazione ?? NON_PRESENTE)}
      ${row('PEC deposito', detail.pecDepositoDestinatari.length ? detail.pecDepositoDestinatari.join(', ') : NON_PRESENTE)}
    </table>`
  )

  const importi = section(
    'Importi',
    `<table class="kv">
      ${row('Richiesto', fmtImporto(detail.importoRichiesto))}
      ${row('Concesso', fmtImporto(detail.importoConcesso))}
      ${row('Fatturato', fmtImporto(detail.importoFatturato))}
      ${row('Liquidato', fmtImporto(detail.importoLiquidato))}
    </table>
    <h3>Differenze</h3>
    <table class="kv">
      ${row('Richiesto − Concesso', fmtDiff(detail.importoRichiesto, detail.importoConcesso))}
      ${row('Riduzione %', fmtPercReduction(detail.importoRichiesto, detail.importoConcesso))}
      ${row('Concesso − Fatturato', fmtDiff(detail.importoConcesso, detail.importoFatturato))}
      ${row('Fatturato − Liquidato', fmtDiff(detail.importoFatturato, detail.importoLiquidato))}
      ${row('Concesso − Liquidato', fmtDiff(detail.importoConcesso, detail.importoLiquidato))}
    </table>`
  )

  const customRows = customValuesRows(detail.customValues, fieldLabels)
  const personalizzati = customRows
    ? section('Campi personalizzati', `<table class="kv">${customRows}</table>`)
    : ''

  const workflow = section(
    'Workflow',
    `<table class="kv">
      ${row('Fase corrente', detail.currentPhase.displayName ?? NON_PRESENTE)}
      ${detail.previousPhaseDisplayName ? row('Fase precedente (sospensione)', detail.previousPhaseDisplayName) : ''}
    </table>`
  )

  const documentiInner = documents.length
    ? `<table class="list">
        <thead><tr><th>Tipo</th><th>Nome file</th><th>Dimensione</th><th>Caricato</th></tr></thead>
        <tbody>
          ${documents
            .map(
              (d) =>
                `<tr><td>${esc(DOC_KIND_LABEL[d.kind] ?? d.kind)}</td><td>${esc(d.originalName)}</td><td>${esc(fmtSize(d.size))}</td><td>${esc(fmtDateTime(d.createdAt))}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>`
    : `<p class="empty">Nessun documento.</p>`
  const documenti = section('Documenti', documentiInner)

  const storicoInner = detail.history.length
    ? `<table class="list">
        <thead><tr><th>Data</th><th>Evento</th><th>Fasi</th><th>Nota</th></tr></thead>
        <tbody>
          ${detail.history
            .map((h) => {
              const fasi = [h.fromPhaseDisplayName, h.toPhaseDisplayName].filter(Boolean).join(' → ')
              return `<tr><td>${esc(fmtDateTime(h.timestamp))}</td><td>${esc(h.title)}</td><td>${esc(fasi)}</td><td>${esc(h.note ?? '')}</td></tr>`
            })
            .join('')}
        </tbody>
      </table>`
    : `<p class="empty">Nessun evento registrato.</p>`
  const storico = section('Storico', storicoInner)

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 28px 32px; font-size: 12px; }
  header { border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 18px; }
  header .code { font-size: 11px; color: #64748b; letter-spacing: 0.04em; }
  header h1 { font-size: 20px; margin: 4px 0 6px; color: #1e3a5f; }
  header .meta { font-size: 11px; color: #475569; }
  header .badge { display: inline-block; background: #1e3a5f; color: #fff; border-radius: 4px; padding: 2px 8px; font-size: 11px; }
  section { margin-top: 16px; break-inside: avoid; }
  h2 { font-size: 13px; color: #1e3a5f; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 0 0 8px; }
  h3 { font-size: 12px; color: #334155; margin: 12px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  table.kv th { text-align: left; width: 200px; color: #475569; font-weight: 600; vertical-align: top; padding: 3px 8px 3px 0; }
  table.kv td { padding: 3px 0; vertical-align: top; }
  table.list th { text-align: left; background: #f1f5f9; color: #475569; font-weight: 600; padding: 5px 8px; border-bottom: 1px solid #cbd5e1; }
  table.list td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  .empty { color: #64748b; font-style: italic; }
  footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
  <header>
    <div class="code">${esc(detail.codiceIstanza)}</div>
    <h1>${esc(detail.nomeIstanza)}</h1>
    <div class="meta"><span class="badge">${esc(detail.currentPhase.displayName ?? '—')}</span> &nbsp; Generato il ${esc(generatedAt)}</div>
  </header>
  ${datiGenerali}
  ${soggetti}
  ${importi}
  ${personalizzati}
  ${workflow}
  ${documenti}
  ${storico}
  <footer>LexFlow — Scheda pratica ${esc(detail.codiceIstanza)}</footer>
</body>
</html>`
}
