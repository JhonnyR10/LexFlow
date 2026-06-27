import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useActivePractices, useMoveToTrash } from './usePractices'
import { MoveToTrashModal } from './MoveToTrashModal'
import { ipcErrorMessage } from '../../utils/ipcError'
import { type PracticeFilters, filterPractices } from './practiceFilters'
import type { PracticeListItem } from '../../../shared/ipc'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatImporto(value: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

// --- Ordinamento -----------------------------------------------------------

type SortColumn =
  | 'codiceIstanza'
  | 'nomeIstanza'
  | 'currentPhaseDisplayName'
  | 'collaboratoreDenominazione'
  | 'professionistaDenominazione'
  | 'dataUdienza'
  | 'importoRichiesto'

type SortDir = 'asc' | 'desc'

interface ColumnDef {
  col: SortColumn
  label: string
  align?: 'right'
}

const COLUMNS: ColumnDef[] = [
  { col: 'codiceIstanza', label: 'Codice istanza' },
  { col: 'nomeIstanza', label: 'Nome istanza' },
  { col: 'currentPhaseDisplayName', label: 'Fase corrente' },
  { col: 'collaboratoreDenominazione', label: 'Collaboratore' },
  { col: 'professionistaDenominazione', label: 'Professionista' },
  { col: 'dataUdienza', label: 'Data udienza' },
  { col: 'importoRichiesto', label: 'Importo richiesto', align: 'right' },
]

function sortValue(p: PracticeListItem, col: SortColumn): string | number | null {
  return p[col]
}

// Comparatore: valori nulli sempre in fondo; numeri confrontati numericamente;
// stringhe con collation italiana e ordinamento naturale (numeric) — utile per
// il codice istanza AAAAMMGG_SIGLA_NNN.
function comparePractices(a: PracticeListItem, b: PracticeListItem, col: SortColumn, dir: SortDir): number {
  const va = sortValue(a, col)
  const vb = sortValue(b, col)
  if (va == null && vb == null) return 0
  if (va == null) return 1
  if (vb == null) return -1
  const cmp = typeof va === 'number' && typeof vb === 'number'
    ? va - vb
    : String(va).localeCompare(String(vb), 'it', { numeric: true })
  return dir === 'asc' ? cmp : -cmp
}

// --- Componenti di presentazione -------------------------------------------

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  borderBottom: '2px solid var(--color-border)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '13px',
  color: 'var(--color-text)',
  verticalAlign: 'middle',
}

function PhaseBadge({ name }: { name: string | null }): React.JSX.Element {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
      background: 'var(--color-bg-subtle, #f1f5f9)',
      color: 'var(--color-text-muted, #64748b)',
      whiteSpace: 'nowrap',
    }}>
      {name ?? '—'}
    </span>
  )
}

function SortHeader({
  def, activeColumn, dir, onSort,
}: {
  def: ColumnDef
  activeColumn: SortColumn | null
  dir: SortDir
  onSort: (col: SortColumn) => void
}): React.JSX.Element {
  const isActive = activeColumn === def.col
  const indicator = isActive ? (dir === 'asc' ? ' ▲' : ' ▼') : ''
  return (
    <th
      style={{ ...thStyle, textAlign: def.align ?? 'left', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => onSort(def.col)}
      aria-sort={isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {def.label}
      <span style={{ color: isActive ? 'var(--color-accent)' : 'transparent' }}>{indicator || ' ▲'}</span>
    </th>
  )
}

function PracticeRow({
  p, selected, onToggle,
}: {
  p: PracticeListItem
  selected: boolean
  onToggle: (id: number) => void
}): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      <td style={{ ...tdStyle, textAlign: 'center', width: '36px' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(p.id)}
          aria-label={`Seleziona pratica ${p.codiceIstanza}`}
        />
      </td>
      <td style={tdStyle}>
        <Link
          to={`/pratiche/${p.id}`}
          style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}
        >
          {p.codiceIstanza}
        </Link>
      </td>
      <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.nomeIstanza}
      </td>
      <td style={tdStyle}>
        <PhaseBadge name={p.currentPhaseDisplayName} />
      </td>
      <td style={tdStyle}>{p.collaboratoreDenominazione ?? '—'}</td>
      <td style={tdStyle}>{p.professionistaDenominazione ?? '—'}</td>
      <td style={tdStyle}>{formatDate(p.dataUdienza)}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{formatImporto(p.importoRichiesto)}</td>
    </tr>
  )
}

export function PraticheTable({
  searchTerm, filters,
}: {
  searchTerm: string
  filters: PracticeFilters
}): React.JSX.Element {
  const { data: practices, isLoading, isError } = useActivePractices()
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set())
  const [trashing, setTrashing] = useState(false)
  const [trashError, setTrashError] = useState<string | null>(null)
  const moveToTrash = useMoveToTrash()

  const handleSort = (col: SortColumn): void => {
    if (sortColumn === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(col)
      setSortDir('asc')
    }
  }

  const toggleOne = (id: number): void => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        Caricamento pratiche…
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{
        padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5',
        borderRadius: '8px', fontSize: '13px', color: '#dc2626',
      }}>
        Errore nel caricamento delle pratiche. Riprova.
      </div>
    )
  }

  if (!practices || practices.length === 0) {
    return (
      <div style={{
        padding: '48px', textAlign: 'center',
        color: 'var(--color-text-muted)', fontSize: '14px',
        border: '2px dashed var(--color-border)', borderRadius: '10px',
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Nessuna pratica attiva.</p>
        <p style={{ margin: 0 }}>Usa il pulsante «+ Nuova pratica» per iniziare.</p>
      </div>
    )
  }

  const filtered = filterPractices(practices, searchTerm, filters)

  if (filtered.length === 0) {
    return (
      <div style={{
        padding: '48px', textAlign: 'center',
        color: 'var(--color-text-muted)', fontSize: '14px',
        border: '2px dashed var(--color-border)', borderRadius: '10px',
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
          Nessun risultato per i criteri selezionati.
        </p>
        <p style={{ margin: 0 }}>Modifica o azzera ricerca e filtri per vedere tutte le pratiche.</p>
      </div>
    )
  }

  const sorted = sortColumn
    ? [...filtered].sort((a, b) => comparePractices(a, b, sortColumn, sortDir))
    : filtered

  // Selezione limitata al filtrato: si considerano selezionate solo le righe
  // attualmente visibili (intersezione con `selectedIds`). "Seleziona tutto"
  // agisce esclusivamente sul filtrato corrente.
  const visibleSelectedIds = sorted.filter(p => selectedIds.has(p.id)).map(p => p.id)
  const allVisibleSelected = visibleSelectedIds.length === sorted.length
  const someVisibleSelected = visibleSelectedIds.length > 0 && !allVisibleSelected

  const toggleAllVisible = (): void => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        for (const p of sorted) next.delete(p.id)
      } else {
        for (const p of sorted) next.add(p.id)
      }
      return next
    })
  }

  const handleMoveToTrash = (reason: string): void => {
    setTrashError(null)
    moveToTrash.mutate(
      { ids: visibleSelectedIds, reason },
      {
        onSuccess: () => {
          setTrashing(false)
          setSelectedIds(new Set())
        },
        onError: (e) => setTrashError(ipcErrorMessage(e)),
      }
    )
  }

  return (
    <>
      {visibleSelectedIds.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '10px 16px', marginBottom: '12px',
          background: 'var(--color-bg-subtle, #f1f5f9)',
          border: '1px solid var(--color-border)', borderRadius: '8px',
          fontSize: '13px', color: 'var(--color-text)',
        }}>
          <span><strong>{visibleSelectedIds.length}</strong> selezionate</span>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-accent)', fontSize: '13px', padding: 0,
            }}
          >
            Deseleziona tutto
          </button>
          <button
            type="button"
            onClick={() => { setTrashError(null); setTrashing(true) }}
            style={{
              marginLeft: 'auto', padding: '6px 14px', cursor: 'pointer',
              background: 'var(--color-bg)', color: 'var(--color-destructive)',
              border: '1px solid var(--color-destructive)', borderRadius: '6px',
              fontSize: '13px', fontWeight: 500,
            }}
          >
            Sposta nel cestino
          </button>
        </div>
      )}

      {trashError && (
        <div style={{
          padding: '10px 14px', marginBottom: '12px', borderRadius: '8px',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
          color: 'var(--color-error)', fontSize: '13px',
        }}>
          {trashError}
        </div>
      )}

      {trashing && (
        <MoveToTrashModal
          count={visibleSelectedIds.length}
          pending={moveToTrash.isPending}
          onConfirm={handleMoveToTrash}
          onClose={() => { if (!moveToTrash.isPending) setTrashing(false) }}
        />
      )}

      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-subtle, #f8fafc)' }}>
              <th style={{ ...thStyle, textAlign: 'center', width: '36px' }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={el => { if (el) el.indeterminate = someVisibleSelected }}
                  onChange={toggleAllVisible}
                  aria-label="Seleziona tutte le pratiche filtrate"
                />
              </th>
              {COLUMNS.map(def => (
                <SortHeader
                  key={def.col}
                  def={def}
                  activeColumn={sortColumn}
                  dir={sortDir}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <PracticeRow
                key={p.id}
                p={p}
                selected={selectedIds.has(p.id)}
                onToggle={toggleOne}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
