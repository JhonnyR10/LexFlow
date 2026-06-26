import { useDashboardPhaseCounts } from './useDashboard'
import type { DashboardPhaseCount } from '../../../shared/ipc'

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '16px',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const countStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 700,
  color: 'var(--color-text)',
  lineHeight: 1,
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
}

const messageStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

function PhaseCard({ item }: { item: DashboardPhaseCount }): React.JSX.Element {
  return (
    <div style={cardStyle}>
      <span style={countStyle}>{item.count}</span>
      <span style={labelStyle}>{item.displayName}</span>
    </div>
  )
}

export function PhaseCountCards(): React.JSX.Element {
  const { data, isLoading, isError, error } = useDashboardPhaseCounts()

  if (isLoading) {
    return <p style={messageStyle}>Caricamento conteggi…</p>
  }

  if (isError) {
    return (
      <p style={messageStyle}>
        Errore nel caricamento dei conteggi: {error?.message ?? 'errore sconosciuto'}
      </p>
    )
  }

  if (!data || data.length === 0) {
    return (
      <p style={messageStyle}>
        Archivio vuoto. Puoi iniziare creando una nuova pratica oppure ripristinare un backup.
      </p>
    )
  }

  return (
    <div style={gridStyle}>
      {data.map(item => (
        <PhaseCard key={item.phaseId} item={item} />
      ))}
    </div>
  )
}
