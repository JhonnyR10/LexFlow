import { Link } from 'react-router-dom'
import { useDashboardScadenzeAlerts } from './useDashboard'
import type { DashboardScadenzaAlert } from '../../../shared/ipc'

// Colori semantici fissi (regola 8): scaduta = rosso, imminente = arancione.
const SEVERITY_COLOR: Record<DashboardScadenzaAlert['severity'], string> = {
  red: 'var(--color-warning-red)',
  orange: 'var(--color-warning-orange)',
}

const sectionStyle: React.CSSProperties = { marginBottom: '32px' }
const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '12px',
}
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px' }
const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderLeftWidth: '4px', borderRadius: '8px', padding: '14px 16px',
  display: 'flex', flexDirection: 'column', gap: '6px',
}
const headerRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap',
}
const codeLinkStyle: React.CSSProperties = {
  fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none',
}
const nameStyle: React.CSSProperties = { color: 'var(--color-text)', fontSize: '14px' }
const descRowStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)', fontSize: '13px', display: 'flex', gap: '8px', flexWrap: 'wrap',
}
const messageStyle: React.CSSProperties = { color: 'var(--color-text-secondary)', fontSize: '14px' }

function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

// Etichetta relativa: «Scaduta da N giorni» / «Scade oggi» / «Tra N giorni».
function whenLabel(daysUntil: number): string {
  if (daysUntil < 0) {
    const n = -daysUntil
    return `Scaduta da ${n} ${n === 1 ? 'giorno' : 'giorni'}`
  }
  if (daysUntil === 0) return 'Scade oggi'
  return `Tra ${daysUntil} ${daysUntil === 1 ? 'giorno' : 'giorni'}`
}

function ScadenzaAlertCard({ alert }: { alert: DashboardScadenzaAlert }): React.JSX.Element {
  const color = SEVERITY_COLOR[alert.severity]
  return (
    <div style={{ ...cardStyle, borderLeftColor: color }}>
      <div style={headerRowStyle}>
        <Link to={`/pratiche/${alert.practiceId}`} style={codeLinkStyle}>
          {alert.codiceIstanza}
        </Link>
        <span style={nameStyle}>{alert.nomeIstanza}</span>
      </div>
      <div style={descRowStyle}>
        <span style={{ color: 'var(--color-text)' }}>{alert.descrizione}</span>
        <span>· {fmtDate(alert.dataScadenza)}</span>
        <span style={{ color, fontWeight: 600 }}>· {whenLabel(alert.daysUntil)}</span>
      </div>
    </div>
  )
}

export function ScadenzeAlertsSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useDashboardScadenzeAlerts()

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Scadenze</h2>
      {isLoading ? (
        <p style={messageStyle}>Caricamento scadenze…</p>
      ) : isError ? (
        <p style={messageStyle}>
          Errore nel caricamento delle scadenze: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : !data || data.length === 0 ? (
        <p style={messageStyle}>Nessuna scadenza in arrivo o superata.</p>
      ) : (
        <div style={listStyle}>
          {data.map((alert) => (
            <ScadenzaAlertCard key={alert.scadenzaId} alert={alert} />
          ))}
        </div>
      )}
    </section>
  )
}
