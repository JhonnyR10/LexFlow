import type { PracticeDetailHistoryItem } from '../../../shared/ipc'
import { normalizeForSearch } from './practiceFilters'

// S5.5: filtri/ricerca sulla timeline (storico) del dettaglio pratica. Logica
// pura, applicata lato renderer sullo storico già caricato da practices:getPractice.
// Nessun IPC, nessuna migrazione. `null` / stringa vuota = filtro non attivo.

// Categorie leggibili in cui raggruppiamo i `type` grezzi degli HistoryEvent.
// Le chiavi tecniche prodotte dal main (created, auto_transition, updated,
// phase_changed, event, trashed, restored, document_added/replaced/removed)
// non sono adatte a un menu utente: le mappiamo su poche categorie di dominio.
export type TimelineCategoryKey =
  | 'creazione'
  | 'workflow'
  | 'modifica'
  | 'documenti'
  | 'cestino'
  | 'altro'

export interface TimelineCategory {
  key: TimelineCategoryKey
  label: string
}

// Ordine di presentazione stabile delle categorie nel menu.
export const TIMELINE_CATEGORIES: readonly TimelineCategory[] = [
  { key: 'creazione', label: 'Creazione' },
  { key: 'workflow', label: 'Fase/transizione' },
  { key: 'modifica', label: 'Modifica' },
  { key: 'documenti', label: 'Documenti' },
  { key: 'cestino', label: 'Cestino' },
  { key: 'altro', label: 'Altro' },
]

// Mappa un `type` grezzo dell'evento sulla sua categoria di dominio.
// I type non riconosciuti confluiscono in 'altro' così nessun evento sparisce.
export function categoryForType(type: string): TimelineCategoryKey {
  switch (type) {
    case 'created':
      return 'creazione'
    case 'auto_transition':
    case 'phase_changed':
    case 'event':
      return 'workflow'
    case 'updated':
      return 'modifica'
    case 'document_added':
    case 'document_replaced':
    case 'document_removed':
      return 'documenti'
    case 'trashed':
    case 'restored':
      return 'cestino'
    default:
      return 'altro'
  }
}

// Categorie effettivamente presenti nello storico di questa pratica, nell'ordine
// canonico di TIMELINE_CATEGORIES. Stesso pattern dei filtri elenco pratiche:
// il menu mostra solo le opzioni che hanno riscontro nei dati.
export function availableTimelineCategories(
  items: PracticeDetailHistoryItem[],
): TimelineCategory[] {
  const present = new Set<TimelineCategoryKey>()
  for (const it of items) present.add(categoryForType(it.type))
  return TIMELINE_CATEGORIES.filter((c) => present.has(c.key))
}

export interface TimelineFilterState {
  term: string
  category: TimelineCategoryKey | null
  from: string | null // 'YYYY-MM-DD' inclusivo
  to: string | null // 'YYYY-MM-DD' inclusivo
}

export const emptyTimelineFilter: TimelineFilterState = {
  term: '',
  category: null,
  from: null,
  to: null,
}

export function hasActiveTimelineFilter(f: TimelineFilterState): boolean {
  return f.term.trim().length > 0 || f.category !== null || f.from !== null || f.to !== null
}

// Stringa cercabile per evento: titolo + nota + nomi fase (da/a).
function searchableEvent(e: PracticeDetailHistoryItem): string {
  return normalizeForSearch(
    [e.title, e.note, e.fromPhaseDisplayName, e.toPhaseDisplayName]
      .filter((s): s is string => Boolean(s))
      .join(' '),
  )
}

// Applica ricerca testuale + categoria + intervallo di date allo storico.
// La data dell'evento è la porzione YYYY-MM-DD del timestamp ISO.
export function filterTimeline(
  items: PracticeDetailHistoryItem[],
  f: TimelineFilterState,
): PracticeDetailHistoryItem[] {
  const term = normalizeForSearch(f.term.trim())
  return items.filter((e) => {
    if (f.category !== null && categoryForType(e.type) !== f.category) return false
    const day = e.timestamp.slice(0, 10)
    if (f.from !== null && day < f.from) return false
    if (f.to !== null && day > f.to) return false
    if (term.length > 0 && !searchableEvent(e).includes(term)) return false
    return true
  })
}
