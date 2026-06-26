import { Link } from 'react-router-dom'
import { useDashboardAging } from './useDashboard'
import type { DashboardAgingItem } from '../../../shared/ipc'

const sectionStyle: React.CSSProperties = {
  marginBottom: '32px',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '12px',
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

const rowStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
}

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '10px',
  flexWrap: 'wrap',
}

const codeLinkStyle: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--color-accent)',
  textDecoration: 'none',
}

const nameStyle: React.CSSProperties = {
  color: 'var(--color-text)',
  fontSize: '14px',
}

const phaseStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
}

const daysStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  whiteSpace: 'nowrap',
}

const messageStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

function AgingRow({ item }: { item: DashboardAgingItem }): React.JSX.Element {
  return (
    <div style={rowStyle}>
      <div style={headerRowStyle}>
        <Link to={`/pratiche/${item.practiceId}`} style={codeLinkStyle}>
          {item.codiceIstanza}
        </Link>
        <span style={nameStyle}>{item.nomeIstanza}</span>
        {item.currentPhaseDisplayName && (
          <span style={phaseStyle}>· {item.currentPhaseDisplayName}</span>
        )}
      </div>
      <span style={daysStyle}>{item.daysSinceDeposit} giorni dalla data deposito</span>
    </div>
  )
}

export function AgingSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useDashboardAging()

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Pratiche più vecchie</h2>
      {isLoading ? (
        <p style={messageStyle}>Caricamento anzianità…</p>
      ) : isError ? (
        <p style={messageStyle}>
          Errore nel caricamento dell&apos;anzianità: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : !data || data.length === 0 ? (
        <p style={messageStyle}>Nessuna pratica aperta con data deposito.</p>
      ) : (
        <div style={listStyle}>
          {data.map(item => (
            <AgingRow key={item.practiceId} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
