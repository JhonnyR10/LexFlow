import { PhaseCountCards } from '../features/dashboard/PhaseCountCards'

const wrapperStyle: React.CSSProperties = {
  padding: '32px 36px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px',
}

const subtitleStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
  marginBottom: '24px',
}

export function DashboardPage(): React.JSX.Element {
  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Dashboard</h1>
      <p style={subtitleStyle}>Pratiche attive per fase del workflow.</p>
      <PhaseCountCards />
    </div>
  )
}
