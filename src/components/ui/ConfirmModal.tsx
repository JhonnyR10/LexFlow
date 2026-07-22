import React from 'react'

// Modale di conferma generica riusabile (C-002 e oltre). Tono distruttivo
// opzionale (colore --color-destructive fisso, regola 8). Nessuna digitazione.

interface Props {
  title: string
  message: React.ReactNode
  confirmLabel: string
  pending?: boolean
  destructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'var(--color-overlay)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '80px', paddingBottom: '40px', overflowY: 'auto',
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '24px 28px', width: '440px', maxWidth: '95vw',
  boxShadow: '0 8px 32px var(--color-shadow)', flexShrink: 0,
}
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-text)',
}
const messageStyle: React.CSSProperties = {
  fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '20px',
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
}

export function ConfirmModal({
  title, message, confirmLabel, pending = false, destructive = false, onConfirm, onClose,
}: Props): React.JSX.Element {
  const confirmStyle: React.CSSProperties = {
    padding: '8px 20px',
    background: destructive ? 'var(--color-destructive)' : 'var(--color-accent)',
    color: 'var(--color-on-accent)', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', opacity: pending ? 0.6 : 1,
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={titleStyle}>{title}</h2>
        <div style={messageStyle}>{message}</div>
        <div style={footerStyle}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle} disabled={pending}>
            Annulla
          </button>
          <button
            type="button"
            onClick={() => { if (!pending) onConfirm() }}
            style={confirmStyle}
            disabled={pending}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
