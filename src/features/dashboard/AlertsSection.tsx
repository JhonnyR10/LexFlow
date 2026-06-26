import { Link } from 'react-router-dom'
import { useDashboardAlerts } from './useDashboard'
import type { AlertSeverity, DashboardAlert } from '../../../shared/ipc'

// Colori semantici fissi (NON sovrascrivibili dal tema, CLAUDE.md regola 8):
// 30/60/90 giorni → giallo/arancione/rosso.
const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  yellow: 'var(--color-warning-yellow)',
  orange: 'var(--color-warning-orange)',
  red: 'var(--color-warning-red)',
}

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

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderLeftWidth: '4px',
  borderRadius: '8px',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
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

const reasonsListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '18px',
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

const messageStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

function AlertCard({ alert }: { alert: DashboardAlert }): React.JSX.Element {
  const color = SEVERITY_COLOR[alert.severity]
  return (
    <div style={{ ...cardStyle, borderLeftColor: color }}>
      <div style={headerRowStyle}>
        <Link to={`/pratiche/${alert.practiceId}`} style={codeLinkStyle}>
          {alert.codiceIstanza}
        </Link>
        <span style={nameStyle}>{alert.nomeIstanza}</span>
        {alert.currentPhaseDisplayName && (
          <span style={phaseStyle}>· {alert.currentPhaseDisplayName}</span>
        )}
      </div>
      <ul style={reasonsListStyle}>
        {alert.reasons.map((reason, i) => (
          <li key={i}>{reason}</li>
        ))}
      </ul>
    </div>
  )
}

export function AlertsSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useDashboardAlerts()

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Avvisi</h2>
      {isLoading ? (
        <p style={messageStyle}>Caricamento avvisi…</p>
      ) : isError ? (
        <p style={messageStyle}>
          Errore nel caricamento degli avvisi: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : !data || data.length === 0 ? (
        <p style={messageStyle}>
          Nessun avviso. Tutte le pratiche attive sono nei tempi.
        </p>
      ) : (
        <div style={listStyle}>
          {data.map(alert => (
            <AlertCard key={alert.practiceId} alert={alert} />
          ))}
        </div>
      )}
    </section>
  )
}
