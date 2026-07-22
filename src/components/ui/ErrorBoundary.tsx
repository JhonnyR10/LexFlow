import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

const overlayStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '24px',
  background: 'var(--color-bg)'
}

// Token semantici di errore fissi (06-ui-ux.md): NON ridefiniti dal tema.
const cardStyle: React.CSSProperties = {
  maxWidth: '520px',
  width: '100%',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: '10px',
  padding: '28px 32px'
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--color-error)',
  fontSize: '18px',
  fontWeight: 600
}

const bodyStyle: React.CSSProperties = {
  margin: '12px 0 0',
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
  lineHeight: 1.5
}

const detailStyle: React.CSSProperties = {
  margin: '12px 0 0',
  color: 'var(--color-text-muted)',
  fontSize: '13px',
  wordBreak: 'break-word'
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '22px'
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  background: 'var(--color-accent)',
  color: 'var(--color-on-accent)',
  fontSize: '14px',
  cursor: 'pointer'
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '14px',
  cursor: 'pointer'
}

/**
 * Error boundary per la shell del renderer: cattura gli errori di rendering di una vista
 * e mostra un fallback leggibile invece di uno schermo bianco. Avvolge le pagine in
 * AppLayout; usata con `key={location.key}` perché la navigazione la rimonti e azzeri l'errore.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log diagnostico (utile in sviluppo); nessun dato sensibile esposto all'utente.
    console.error('Errore di rendering catturato da ErrorBoundary:', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={overlayStyle}>
        <div style={cardStyle} role="alert">
          <h2 style={titleStyle}>Si è verificato un errore imprevisto in questa schermata.</h2>
          <p style={bodyStyle}>
            Puoi riprovare a caricare la vista oppure ricaricare l&apos;app. Se il problema persiste,
            riavvia l&apos;applicazione.
          </p>
          {this.state.error?.message && <p style={detailStyle}>Dettaglio: {this.state.error.message}</p>}
          <div style={actionsStyle}>
            <button type="button" style={primaryBtnStyle} onClick={this.handleReset}>
              Riprova
            </button>
            <button type="button" style={secondaryBtnStyle} onClick={this.handleReload}>
              Ricarica l&apos;app
            </button>
          </div>
        </div>
      </div>
    )
  }
}
