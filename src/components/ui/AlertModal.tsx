import React from 'react'

// Modale di sola notifica (C-001): mostra un messaggio di blocco/errore in un
// popup con un pulsante «OK». Usata per i messaggi dei guard (es. «non puoi
// disattivare l'unica fase iniziale», «in uso da N pratiche») che altrimenti
// finirebbero inline in fondo alla card. Non è una conferma: nessuna azione.

interface Props {
  message: string
  title?: string
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '80px', paddingBottom: '40px', overflowY: 'auto',
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '24px 28px', width: '420px', maxWidth: '95vw',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)', flexShrink: 0,
}
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-text)',
}
const messageStyle: React.CSSProperties = {
  fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '20px',
}
const footerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end',
}
const btnStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-accent)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}

export function AlertModal({ message, title = 'Operazione non consentita', onClose }: Props): React.JSX.Element {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={messageStyle}>{message}</p>
        <div style={footerStyle}>
          <button type="button" onClick={onClose} style={btnStyle} autoFocus>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
