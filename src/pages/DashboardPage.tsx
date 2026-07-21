import { Link } from 'react-router-dom'
import { AgingSection } from '../features/dashboard/AgingSection'
import { AlertsSection } from '../features/dashboard/AlertsSection'
import { MissingDocumentsSection } from '../features/dashboard/MissingDocumentsSection'
import { PhaseCountCards } from '../features/dashboard/PhaseCountCards'
import { useDashboardPhaseCounts } from '../features/dashboard/useDashboard'

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

const messageStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

const emptyBoxStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '32px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
}

const emptyActionStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: 'var(--color-accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  textDecoration: 'none',
}

export function DashboardPage(): React.JSX.Element {
  const { data, isLoading, isError, error } = useDashboardPhaseCounts()

  // L'archivio è vuoto quando nessuna fase ha pratiche attive (la query esclude
  // già il cestino). In quel caso un solo stato vuoto con azione, niente sezioni.
  const isArchiveEmpty = !isLoading && !isError && (!data || data.length === 0)

  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Dashboard</h1>
      <p style={subtitleStyle}>Centro di controllo delle pratiche attive.</p>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={messageStyle}>
          Errore nel caricamento della dashboard: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : isArchiveEmpty ? (
        <div style={emptyBoxStyle}>
          <p style={messageStyle}>
            Archivio vuoto. Puoi iniziare creando una nuova pratica oppure ripristinare un backup.
          </p>
          <Link to="/pratiche" style={emptyActionStyle}>
            Crea una nuova pratica
          </Link>
        </div>
      ) : (
        <>
          <AlertsSection />
          <MissingDocumentsSection />
          <AgingSection />
          <h2 style={sectionTitleStyle}>Pratiche per fase</h2>
          <PhaseCountCards />
        </>
      )}
    </div>
  )
}
