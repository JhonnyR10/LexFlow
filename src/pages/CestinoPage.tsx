import React from 'react'
import { Link } from 'react-router-dom'
import { useTrashedPractices } from '../features/practices/usePractices'
import type { TrashedPracticeItem } from '../../shared/ipc'

// S10.1 — Pagina Cestino (sola lettura): elenco delle pratiche cestinate con
// data e motivo. Ripristino (S10.2) e cancellazione definitiva (S10.3) sono
// storie successive: qui non ci sono ancora pulsanti d'azione.

const pageStyle: React.CSSProperties = { padding: '32px', maxWidth: '960px' }

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

function TrashedRow({ p }: { p: TrashedPracticeItem }): React.JSX.Element {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
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
    </tr>
  )
}

export function CestinoPage(): React.JSX.Element {
  const { data: trashed, isLoading, isError } = useTrashedPractices()

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>
        Cestino
      </h1>
      <div style={{
        marginBottom: '20px', padding: '12px 16px', borderRadius: '8px',
        background: 'var(--color-warning-yellow-bg, #fef9c3)', border: '1px solid var(--color-warning-orange, #f59e0b)',
        color: 'var(--color-text)', fontSize: '13px',
      }}>
        Le pratiche qui elencate sono cestinate (eliminazione logica): restano escluse da dashboard,
        elenco e avvisi. I dati e i documenti sono conservati finché non vengono cancellati definitivamente.
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

      {!isLoading && !isError && (!trashed || trashed.length === 0) && (
        <div style={{
          padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px',
          border: '2px dashed var(--color-border)', borderRadius: '10px',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Il cestino è vuoto.</p>
          <p style={{ margin: 0 }}>Le pratiche che sposti nel cestino compaiono qui.</p>
        </div>
      )}

      {!isLoading && !isError && trashed && trashed.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle, #f8fafc)' }}>
                <th style={thStyle}>Codice istanza</th>
                <th style={thStyle}>Nome istanza</th>
                <th style={thStyle}>Fase</th>
                <th style={thStyle}>Data cestinazione</th>
                <th style={thStyle}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {trashed.map(p => <TrashedRow key={p.id} p={p} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
