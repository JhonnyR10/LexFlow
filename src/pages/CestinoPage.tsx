import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrashedPractices, useRestoreFromTrash, usePermanentDelete } from '../features/practices/usePractices'
import { RestoreFromTrashModal } from '../features/practices/RestoreFromTrashModal'
import { PermanentDeleteModal } from '../features/practices/PermanentDeleteModal'
import { ipcErrorMessage } from '../utils/ipcError'
import type { TrashedPracticeItem } from '../../shared/ipc'

// S10.2/S10.3 — Pagina Cestino: elenco delle pratiche cestinate con data e
// motivo, con ripristino (per riga + in blocco) e cancellazione definitiva
// (per riga + in blocco, conferma forte). È l'unico punto da cui si elimina
// definitivamente una pratica.

const pageStyle: React.CSSProperties = { padding: '32px', maxWidth: '1040px' }

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const dt = new Date(iso)
  if (isNaN(dt.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(dt)
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600,
  color: 'var(--color-text-muted)', borderBottom: '2px solid var(--color-border)', whiteSpace: 'nowrap',
}
const tdStyle: React.CSSProperties = {
  padding: '10px 14px', fontSize: '13px', color: 'var(--color-text)', verticalAlign: 'middle',
}
const btnRestoreStyle: React.CSSProperties = {
  padding: '5px 12px', background: 'var(--color-bg)', color: 'var(--color-accent)',
  border: '1px solid var(--color-accent)', borderRadius: '6px', fontSize: '12px',
  fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
}
// Azione distruttiva: colore destructive fisso (regola 8).
const btnDeleteStyle: React.CSSProperties = {
  padding: '5px 12px', background: 'var(--color-bg)', color: 'var(--color-destructive)',
  border: '1px solid var(--color-destructive)', borderRadius: '6px', fontSize: '12px',
  fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
}

interface RowProps {
  p: TrashedPracticeItem
  selected: boolean
  onToggle: (id: number) => void
  onRestore: (id: number) => void
  onDelete: (id: number) => void
}

function TrashedRow({ p, selected, onToggle, onRestore, onDelete }: RowProps): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      <td style={{ ...tdStyle, width: '36px', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(p.id)}
          aria-label={`Seleziona ${p.codiceIstanza}`}
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
      <td style={tdStyle}>{p.currentPhaseDisplayName ?? '—'}</td>
      <td style={tdStyle}>{formatDateTime(p.trashedAt)}</td>
      <td style={tdStyle}>{p.trashReason ?? '—'}</td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => onRestore(p.id)} style={btnRestoreStyle}>
            Ripristina
          </button>
          <button type="button" onClick={() => onDelete(p.id)} style={btnDeleteStyle}>
            Elimina
          </button>
        </div>
      </td>
    </tr>
  )
}

export function CestinoPage(): React.JSX.Element {
  const { data: trashed, isLoading, isError } = useTrashedPractices()
  const restore = useRestoreFromTrash()
  const permanentDelete = usePermanentDelete()

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  // Pratiche oggetto della conferma di ripristino aperta (null = nessuna modale).
  const [restoreTargets, setRestoreTargets] = useState<number[] | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  // Pratiche oggetto della conferma di cancellazione definitiva (null = chiusa).
  const [deleteTargets, setDeleteTargets] = useState<number[] | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const rows = trashed ?? []
  // La selezione effettiva è l'intersezione con le righe presenti (le pratiche
  // ripristinate spariscono dalla lista): derivata in render, niente set-in-effect.
  const presentIds = new Set(rows.map(r => r.id))
  const effectiveSelected = [...selectedIds].filter(id => presentIds.has(id))
  const selectedCount = effectiveSelected.length
  const allSelected = rows.length > 0 && selectedCount === rows.length

  const toggleOne = (id: number): void => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (): void => {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map(r => r.id)))
  }

  const clearSelection = (): void => setSelectedIds(new Set())

  const openRestore = (ids: number[]): void => {
    setRestoreError(null)
    setRestoreTargets(ids)
  }

  const handleConfirmRestore = (): void => {
    if (restoreTargets == null) return
    setRestoreError(null)
    restore.mutate(
      { ids: restoreTargets },
      {
        onSuccess: () => {
          setRestoreTargets(null)
          clearSelection()
        },
        onError: (e) => setRestoreError(ipcErrorMessage(e)),
      }
    )
  }

  const openDelete = (ids: number[]): void => {
    setDeleteError(null)
    setDeleteTargets(ids)
  }

  const handleConfirmDelete = (): void => {
    if (deleteTargets == null) return
    setDeleteError(null)
    permanentDelete.mutate(
      { ids: deleteTargets },
      {
        onSuccess: () => {
          setDeleteTargets(null)
          clearSelection()
        },
        onError: (e) => setDeleteError(ipcErrorMessage(e)),
      }
    )
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>
        Cestino
      </h1>
      <div style={{
        marginBottom: '20px', padding: '12px 16px', borderRadius: '8px',
        background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)', fontSize: '13px',
      }}>
        Le pratiche qui elencate sono cestinate (eliminazione logica): restano escluse da dashboard,
        elenco e avvisi. Puoi ripristinarle per riportarle tra le pratiche attive. I dati e i documenti
        sono conservati finché non vengono cancellati definitivamente.
      </div>

      {isLoading && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Caricamento cestino…
        </div>
      )}

      {isError && (
        <div style={{
          padding: '16px', borderRadius: '8px', fontSize: '13px',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)',
        }}>
          Errore nel caricamento del cestino. Riprova.
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div style={{
          padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px',
          border: '2px dashed var(--color-border)', borderRadius: '10px',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Il cestino è vuoto.</p>
          <p style={{ margin: 0 }}>Le pratiche che sposti nel cestino compaiono qui.</p>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <>
          {(restoreError || deleteError) && (
            <div style={{
              marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)',
            }}>
              {restoreError ?? deleteError}
            </div>
          )}

          {selectedCount > 0 && (
            <div style={{
              marginBottom: '12px', padding: '10px 14px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '14px',
              background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>
                {selectedCount} {selectedCount === 1 ? 'pratica selezionata' : 'pratiche selezionate'}
              </span>
              <button
                type="button"
                onClick={() => openRestore(effectiveSelected)}
                style={{
                  padding: '6px 16px', background: 'var(--color-accent)', color: 'var(--color-on-accent)',
                  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Ripristina {selectedCount === 1 ? 'la pratica' : `le ${selectedCount} pratiche`}
              </button>
              <button
                type="button"
                onClick={() => openDelete(effectiveSelected)}
                style={{
                  padding: '6px 16px', background: 'var(--color-destructive)', color: 'var(--color-on-accent)',
                  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Elimina definitivamente {selectedCount === 1 ? 'la pratica' : `le ${selectedCount} pratiche`}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  padding: '6px 14px', background: 'transparent', color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                }}
              >
                Deseleziona
              </button>
            </div>
          )}

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-subtle)' }}>
                  <th style={{ ...thStyle, width: '36px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = selectedCount > 0 && !allSelected }}
                      onChange={toggleAll}
                      aria-label="Seleziona tutte"
                    />
                  </th>
                  <th style={thStyle}>Codice istanza</th>
                  <th style={thStyle}>Nome istanza</th>
                  <th style={thStyle}>Fase</th>
                  <th style={thStyle}>Data cestinazione</th>
                  <th style={thStyle}>Motivo</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(p => (
                  <TrashedRow
                    key={p.id}
                    p={p}
                    selected={selectedIds.has(p.id)}
                    onToggle={toggleOne}
                    onRestore={(id) => openRestore([id])}
                    onDelete={(id) => openDelete([id])}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {restoreTargets != null && (
        <RestoreFromTrashModal
          count={restoreTargets.length}
          pending={restore.isPending}
          onConfirm={handleConfirmRestore}
          onClose={() => { if (!restore.isPending) setRestoreTargets(null) }}
        />
      )}

      {deleteTargets != null && (
        <PermanentDeleteModal
          count={deleteTargets.length}
          pending={permanentDelete.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => { if (!permanentDelete.isPending) setDeleteTargets(null) }}
        />
      )}
    </div>
  )
}
