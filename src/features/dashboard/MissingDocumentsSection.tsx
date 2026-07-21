import { Link } from 'react-router-dom'
import { useDashboardMissingDocuments } from './useDashboard'
import type { DashboardMissingDocItem, DocumentKind } from '../../../shared/ipc'

// S8.5: sezione «Documenti mancanti». Elenca le pratiche aperte cui manca un
// documento atteso per la fase raggiunta (logica nel dashboard service). Sola
// lettura; colori via token (regola 8), nessun hex.

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

const badgesStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
}

const badgeStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg-subtle)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  padding: '2px 8px',
  whiteSpace: 'nowrap',
}

const messageStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
}

const KIND_LABEL: Record<DocumentKind, string> = {
  decreto: 'Decreto',
  fattura: 'Fattura',
}

function MissingDocRow({ item }: { item: DashboardMissingDocItem }): React.JSX.Element {
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
      <div style={badgesStyle}>
        {item.missing.map(kind => (
          <span key={kind} style={badgeStyle}>Manca {KIND_LABEL[kind]}</span>
        ))}
      </div>
    </div>
  )
}

export function MissingDocumentsSection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useDashboardMissingDocuments()

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Documenti mancanti</h2>
      {isLoading ? (
        <p style={messageStyle}>Caricamento documenti mancanti…</p>
      ) : isError ? (
        <p style={messageStyle}>
          Errore nel caricamento dei documenti mancanti: {error?.message ?? 'errore sconosciuto'}
        </p>
      ) : !data || data.length === 0 ? (
        <p style={messageStyle}>Nessun documento atteso risulta mancante.</p>
      ) : (
        <div style={listStyle}>
          {data.map(item => (
            <MissingDocRow key={item.practiceId} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
