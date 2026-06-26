import React from 'react'

// S10.2 — Modale di conferma leggera per il ripristino dal cestino.
// A differenza di MoveToTrashModal NON raccoglie un motivo: il ripristino è
// l'operazione inversa (non distruttiva), quindi pulsante neutro/accent e nessun
// colore destructive (regola 8). Riusata dal Cestino (count=1 per riga o count=N
// in blocco) e dal dettaglio di una pratica cestinata (count=1).

interface Props {
  count: number
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '60px', paddingBottom: '40px', overflowY: 'auto',
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '460px', maxWidth: '95vw',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)', flexShrink: 0,
}
const titleStyle: React.CSSProperties = {
  fontSize: '17px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)',
}
const subtitleStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px', lineHeight: 1.5,
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)',
}
// Azione non distruttiva: pulsante accent neutro (NON --color-destructive).
const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-accent)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
}

export function RestoreFromTrashModal({ count, pending, onConfirm, onClose }: Props): React.JSX.Element {
  const oggetto = count === 1 ? 'questa pratica' : `${count} pratiche`

  const handleConfirm = (): void => {
    if (pending) return
    onConfirm()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={titleStyle}>Ripristina dal cestino</h2>
        <p style={subtitleStyle}>
          Stai per ripristinare {oggetto}. {count === 1 ? 'Tornerà' : 'Torneranno'} tra le pratiche
          attive e {count === 1 ? 'comparirà' : 'compariranno'} di nuovo in elenco, dashboard e conteggi.
        </p>

        <div style={footerStyle}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle} disabled={pending}>
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{ ...btnPrimaryStyle, opacity: pending ? 0.6 : 1 }}
            disabled={pending}
          >
            {pending ? 'Ripristino…' : 'Ripristina'}
          </button>
        </div>
      </div>
    </div>
  )
}
