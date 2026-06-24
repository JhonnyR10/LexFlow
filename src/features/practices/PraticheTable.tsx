import React from 'react'
import { Link } from 'react-router-dom'
import { useActivePractices } from './usePractices'
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

function PhaseBadge({ name }: { name: string | null }) {
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

function PracticeRow({ p }: { p: PracticeListItem }) {
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

export function PraticheTable(): React.JSX.Element {
  const { data: practices, isLoading, isError } = useActivePractices()

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

  return (
    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)' }}>
        <thead>
          <tr style={{ background: 'var(--color-bg-subtle, #f8fafc)' }}>
            <th style={thStyle}>Codice istanza</th>
            <th style={thStyle}>Nome istanza</th>
            <th style={thStyle}>Fase corrente</th>
            <th style={thStyle}>Collaboratore</th>
            <th style={thStyle}>Professionista</th>
            <th style={thStyle}>Data udienza</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Importo richiesto</th>
          </tr>
        </thead>
        <tbody>
          {practices.map(p => <PracticeRow key={p.id} p={p} />)}
        </tbody>
      </table>
    </div>
  )
}
