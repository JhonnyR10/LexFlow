import React, { useState } from 'react'

// S10.1 — Modale di conferma per lo spostamento nel cestino (soft delete).
// Raccoglie un motivo obbligatorio applicato a tutte le pratiche selezionate.
// Riusata dal dettaglio (count=1) e dalla toolbar di selezione (count=N).

interface Props {
  count: number
  pending: boolean
  onConfirm: (reason: string) => void
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
  fontSize: '17px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)',
}
const subtitleStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.5,
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: 'var(--color-text)',
}
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)',
  borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
  resize: 'vertical', minHeight: '64px', fontFamily: 'inherit',
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)',
}
// Colore distruttivo fisso (regola 8): non cambia col tema.
const btnDangerStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-destructive)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
}

export function MoveToTrashModal({ count, pending, onConfirm, onClose }: Props): React.JSX.Element {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmed = reason.trim()
  const reasonMissing = trimmed.length === 0

  const handleConfirm = (): void => {
    setTouched(true)
    if (reasonMissing || pending) return
    onConfirm(trimmed)
  }

  const oggetto = count === 1 ? 'questa pratica' : `${count} pratiche`

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={titleStyle}>Sposta nel cestino</h2>
        <p style={subtitleStyle}>
          Stai per spostare nel cestino {oggetto}. Le pratiche cestinate sono escluse da
          dashboard, elenco e avvisi, ma non vengono eliminate: potrai ripristinarle dal Cestino.
        </p>

        <label style={labelStyle} htmlFor="trash-reason">Motivo *</label>
        <textarea
          id="trash-reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Indica il motivo della cestinazione"
          style={textareaStyle}
          autoFocus
        />
        {touched && reasonMissing && (
          <div style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
            Il motivo è obbligatorio.
          </div>
        )}

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
            {pending ? 'Spostamento…' : 'Sposta nel cestino'}
          </button>
        </div>
      </div>
    </div>
  )
}
