import { AlertsSection } from '../features/dashboard/AlertsSection'
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '12px',
}

export function DashboardPage(): React.JSX.Element {
  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Dashboard</h1>
      <p style={subtitleStyle}>Centro di controllo delle pratiche attive.</p>
      <AlertsSection />
      <h2 style={sectionTitleStyle}>Pratiche per fase</h2>
      <PhaseCountCards />
    </div>
  )
}
