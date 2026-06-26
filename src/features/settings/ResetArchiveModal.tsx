import React, { useState } from 'react'

// S11.4 — Conferma FORTE a DUE PASSI per il reset dell'archivio. Distruttiva e
// irreversibile: cancella pratiche + anagrafiche + documenti (mantiene workflow e
// impostazioni). Prima del reset viene creato un backup automatico. Colore
// destructive fisso (regola 8), nessuna digitazione (coerente con PermanentDeleteModal).

interface Props {
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
const listStyle: React.CSSProperties = {
  margin: '10px 0 0', paddingLeft: '18px', fontSize: '13px',
  color: 'var(--color-text-muted)', lineHeight: 1.6,
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
  padding: '8px 20px', background: 'var(--color-destructive)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
}

export function ResetArchiveModal({ pending, onConfirm, onClose }: Props): React.JSX.Element {
  const [step, setStep] = useState<1 | 2>(1)

  const handleConfirm = (): void => {
    if (pending) return
    onConfirm()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        {step === 1 ? (
          <>
            <h2 style={titleStyle}>Reset archivio</h2>
            <p style={subtitleStyle}>Stai per svuotare l&apos;archivio. Verranno eliminati:</p>
            <ul style={listStyle}>
              <li>tutte le pratiche e i dati collegati (documenti, storico, transizioni, PEC);</li>
              <li>tutti i professionisti e i collaboratori.</li>
            </ul>
            <p style={{ ...subtitleStyle, marginTop: '10px' }}>
              La configurazione del workflow e le impostazioni dell&apos;app vengono mantenute.
              Prima del reset viene creato <strong>automaticamente un backup</strong>.
            </p>
            <div style={footerStyle}>
              <button type="button" onClick={onClose} style={btnSecondaryStyle} disabled={pending}>
                Annulla
              </button>
              <button type="button" onClick={() => setStep(2)} style={btnDangerStyle} disabled={pending}>
                Continua
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>Confermi il reset?</h2>
            <div style={warningStyle}>
              L&apos;operazione è <strong>irreversibile</strong>. Pratiche e anagrafiche verranno
              eliminate definitivamente. In caso di necessità potrai recuperare i dati dal backup
              automatico appena creato.
            </div>
            <div style={footerStyle}>
              <button type="button" onClick={() => setStep(1)} style={btnSecondaryStyle} disabled={pending}>
                Indietro
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{ ...btnDangerStyle, opacity: pending ? 0.6 : 1 }}
                disabled={pending}
              >
                {pending ? 'Reset in corso…' : 'Esegui reset'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
