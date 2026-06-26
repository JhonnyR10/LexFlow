import React from 'react'

// S10.3 — Modale di conferma FORTE per la cancellazione definitiva (hard delete).
// A differenza di RestoreFromTrashModal questa è distruttiva e irreversibile:
// avviso esplicito + pulsante con colore destructive fisso (regola 8). Nessuna
// digitazione richiesta (decisione utente: modale forte semplice). Riusata dal
// Cestino: count=1 per riga, count=N in blocco.

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
  padding: '28px 32px', width: '480px', maxWidth: '95vw',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)', flexShrink: 0,
}
const titleStyle: React.CSSProperties = {
  fontSize: '17px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-destructive)',
}
const subtitleStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px', lineHeight: 1.5,
}
// Box di avviso forte sull'irreversibilità (colori semantici fissi, regola 8).
const warningStyle: React.CSSProperties = {
  marginTop: '12px', padding: '12px 14px', borderRadius: '8px',
  background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
  color: 'var(--color-error)', fontSize: '13px', lineHeight: 1.5,
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)',
}
// Azione distruttiva: colore destructive fisso (regola 8).
const btnDangerStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-destructive)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
}

export function PermanentDeleteModal({ count, pending, onConfirm, onClose }: Props): React.JSX.Element {
  const oggetto = count === 1 ? 'questa pratica' : `${count} pratiche`

  const handleConfirm = (): void => {
    if (pending) return
    onConfirm()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={titleStyle}>Cancellazione definitiva</h2>
        <p style={subtitleStyle}>
          Stai per eliminare definitivamente {oggetto} dal cestino.
        </p>
        <div style={warningStyle}>
          L&apos;operazione è <strong>irreversibile</strong>: i dati della pratica, lo storico
          e i documenti collegati verranno eliminati e non potranno essere recuperati.
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
            {pending ? 'Eliminazione…' : 'Elimina definitivamente'}
          </button>
        </div>
      </div>
    </div>
  )
}
