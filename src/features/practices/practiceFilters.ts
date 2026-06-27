import type { PracticeListItem } from '../../../shared/ipc'

// Filtri base dell'elenco pratiche (S3.3). Applicati lato renderer sull'elenco
// già caricato/cachato, combinabili tra loro e con la ricerca globale (S3.2).
// `null` su un campo = filtro non attivo.
export interface PracticeFilters {
  phaseId: number | null
  collaboratoreId: number | null
  professionistaId: number | null
  dataDepositoFrom: string | null // ISO YYYY-MM-DD
  dataDepositoTo: string | null   // ISO YYYY-MM-DD
  importoMin: number | null
  importoMax: number | null
}

export const emptyFilters: PracticeFilters = {
  phaseId: null,
  collaboratoreId: null,
  professionistaId: null,
  dataDepositoFrom: null,
  dataDepositoTo: null,
  importoMin: null,
  importoMax: null,
}

// Deep-link dalla Dashboard (S8.4): "Vedi pratiche" passa il filtro coerente come
// query string (es. ?phaseId=5). Parte da emptyFilters e legge solo le chiavi
// numeriche supportate; valori assenti o non numerici sono ignorati.
export function filtersFromSearchParams(params: URLSearchParams): PracticeFilters {
  return {
    ...emptyFilters,
    phaseId: parseNumericParam(params.get('phaseId')),
    collaboratoreId: parseNumericParam(params.get('collaboratoreId')),
    professionistaId: parseNumericParam(params.get('professionistaId')),
  }
}

function parseNumericParam(value: string | null): number | null {
  if (value == null || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function hasActiveFilters(f: PracticeFilters): boolean {
  return (
    f.phaseId != null ||
    f.collaboratoreId != null ||
    f.professionistaId != null ||
    f.dataDepositoFrom != null ||
    f.dataDepositoTo != null ||
    f.importoMin != null ||
    f.importoMax != null
  )
}

// Predicato puro: la pratica soddisfa tutti i filtri attivi (AND).
export function matchesFilters(p: PracticeListItem, f: PracticeFilters): boolean {
  if (f.phaseId != null && p.currentPhaseId !== f.phaseId) return false
  if (f.collaboratoreId != null && p.collaboratoreId !== f.collaboratoreId) return false
  if (f.professionistaId != null && p.professionistaId !== f.professionistaId) return false

  // Le date ISO YYYY-MM-DD si confrontano lessicograficamente.
  if (f.dataDepositoFrom != null) {
    if (p.dataDeposito == null || p.dataDeposito < f.dataDepositoFrom) return false
  }
  if (f.dataDepositoTo != null) {
    if (p.dataDeposito == null || p.dataDeposito > f.dataDepositoTo) return false
  }

  if (f.importoMin != null) {
    if (p.importoRichiesto == null || p.importoRichiesto < f.importoMin) return false
  }
  if (f.importoMax != null) {
    if (p.importoRichiesto == null || p.importoRichiesto > f.importoMax) return false
  }

  return true
}

// --- Ricerca globale (S3.2) ---
// Estratte da PraticheTable per essere condivise con l'export CSV (S9.1): un'unica
// fonte della logica di filtro+ricerca, così l'export rispetta esattamente la vista.

// Normalizza per la ricerca: minuscolo + rimozione dei segni diacritici, così il
// confronto è case-insensitive e accent-insensitive ("AUTORITA" trova "Autorità").
export function normalizeForSearch(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Stringa cercabile per riga: concatena i campi su cui opera la ricerca globale.
export function searchableBlob(p: PracticeListItem): string {
  return normalizeForSearch(
    [
      p.codiceIstanza,
      p.nomeIstanza,
      p.collaboratoreDenominazione,
      p.professionistaDenominazione,
      p.autoritaGiudiziaria,
      p.note,
    ]
      .filter((v): v is string => v != null)
      .join(' ')
  )
}

// Insieme risultante da ricerca + filtri combinati (AND). Riusato da PraticheTable
// (vista) e dall'export CSV (S9.1).
export function filterPractices(
  list: PracticeListItem[],
  searchTerm: string,
  filters: PracticeFilters
): PracticeListItem[] {
  const term = normalizeForSearch(searchTerm.trim())
  return list.filter(
    (p) => matchesFilters(p, filters) && (term === '' || searchableBlob(p).includes(term))
  )
}

export interface FilterOption {
  id: number
  label: string
}

// Opzioni dei menu a tendina derivate dalle pratiche presenti (solo valori in
// uso): nessuna query aggiuntiva e nessun filtro che produrrebbe zero risultati.
export function derivePhaseOptions(practices: PracticeListItem[]): FilterOption[] {
  return dedupeOptions(
    practices.map(p => ({ id: p.currentPhaseId, label: p.currentPhaseDisplayName ?? '—' }))
  )
}

export function deriveCollaboratoreOptions(practices: PracticeListItem[]): FilterOption[] {
  return dedupeOptions(
    practices
      .filter(p => p.collaboratoreId != null)
      .map(p => ({ id: p.collaboratoreId as number, label: p.collaboratoreDenominazione ?? '—' }))
  )
}

export function deriveProfessionistaOptions(practices: PracticeListItem[]): FilterOption[] {
  return dedupeOptions(
    practices
      .filter(p => p.professionistaId != null)
      .map(p => ({ id: p.professionistaId as number, label: p.professionistaDenominazione ?? '—' }))
  )
}

function dedupeOptions(options: FilterOption[]): FilterOption[] {
  const byId = new Map<number, FilterOption>()
  for (const o of options) {
    if (!byId.has(o.id)) byId.set(o.id, o)
  }
  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label, 'it'))
}
