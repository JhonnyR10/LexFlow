import type { PracticeListItem } from '../../../shared/ipc'

// Generazione CSV in formato Excel italiano (S9.1): separatore `;`, terminatore
// `\r\n`, decimali con virgola, date gg/mm/aaaa. Il BOM è aggiunto nel main alla
// scrittura del file. Funzioni pure, riusabili/testabili.

const DELIMITER = ';'
const EOL = '\r\n'

const HEADERS = [
  'Codice istanza',
  'Nome istanza',
  'Fase corrente',
  'Collaboratore',
  'Professionista',
  'Data udienza',
  'Data deposito',
  'Autorità giudiziaria',
  'Importo richiesto',
  'Importo concesso',
  'Importo fatturato',
  'Importo liquidato',
  'Note',
] as const

// Racchiude tra virgolette i campi che contengono il separatore, virgolette o
// a-capo, raddoppiando le virgolette interne (RFC 4180).
function escapeCsv(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : ''
}

// Importo come stringa con virgola decimale e 2 cifre (es. 1234,56); null → ''.
function formatImporto(value: number | null): string {
  if (value == null) return ''
  return value.toFixed(2).replace('.', ',')
}

function rowFor(p: PracticeListItem): string {
  const fields = [
    p.codiceIstanza,
    p.nomeIstanza,
    p.currentPhaseDisplayName ?? '',
    p.collaboratoreDenominazione ?? '',
    p.professionistaDenominazione ?? '',
    formatDate(p.dataUdienza),
    formatDate(p.dataDeposito),
    p.autoritaGiudiziaria ?? '',
    formatImporto(p.importoRichiesto),
    formatImporto(p.importoConcesso),
    formatImporto(p.importoFatturato),
    formatImporto(p.importoLiquidato),
    p.note ?? '',
  ]
  return fields.map(escapeCsv).join(DELIMITER)
}

export function practicesToCsv(rows: PracticeListItem[]): string {
  const lines = [HEADERS.join(DELIMITER), ...rows.map(rowFor)]
  return lines.join(EOL)
}

// Nome file suggerito: pratiche-AAAAMMGG-HHMMSS.csv (ora locale).
export function buildCsvFileName(d: Date = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0')
  const stamp =
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  return `pratiche-${stamp}.csv`
}
