import React from 'react'

// S11.3 — Conferma FORTE per il ripristino da backup. È distruttiva: sovrascrive
// i dati correnti e riavvia l'app. Avviso esplicito + pulsante con colore
// destructive fisso (regola 8). Viene comunque creata una copia di sicurezza
// automatica dei dati correnti prima dello swap. Nessuna digitazione richiesta
// (coerente con PermanentDeleteModal).

interface Props {
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'var(--color-overlay)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '60px', paddingBottom: '40px', overflowY: 'auto',
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '480px', maxWidth: '95vw',
  boxShadow: '0 8px 32px var(--color-shadow)', flexShrink: 0,
}
const titleStyle: React.CSSProperties = {
  fontSize: '17px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-destructive)',
}
const subtitleStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px', lineHeight: 1.5,
}
const warningStyle: React.CSSProperties = {
  marginTop: '12px', padding: '12px 14px', borderRadius: '8px',
  background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
  color: 'var(--color-error)', fontSize: '13px', lineHeight: 1.5,
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)',
}
const btnDangerStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-destructive)', color: 'var(--color-on-accent)',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
}

export function RestoreBackupModal({ pending, onConfirm, onClose }: Props): React.JSX.Element {
  const handleConfirm = (): void => {
    if (pending) return
    onConfirm()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={titleStyle}>Ripristina da backup</h2>
        <p style={subtitleStyle}>
          Stai per ripristinare l&apos;archivio selezionato. I dati correnti (database e documenti)
          verranno sostituiti con quelli del backup.
        </p>
        <div style={warningStyle}>
          L&apos;operazione <strong>sovrascrive i dati correnti</strong> e l&apos;app verrà
          <strong> riavviata</strong>. Prima dello swap viene creata automaticamente una
          <strong> copia di sicurezza</strong> dei dati attuali, così sono recuperabili in caso di problemi.
        </div>

        <div style={footerStyle}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle} disabled={pending}>
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{ ...btnDangerStyle, opacity: pending ? 0.6 : 1 }}
            disabled={pending}
          >
            {pending ? 'Ripristino…' : 'Ripristina e riavvia'}
          </button>
        </div>
      </div>
    </div>
  )
}
