import type React from 'react'

// Stili inline condivisi dai modali di pratica (Nuova pratica S4.2 / Modifica S4.3).
// Estratti da NuovaPraticaModal per evitarne la duplicazione (regola 4).

export const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'var(--color-overlay)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '40px', paddingBottom: '40px', overflowY: 'auto'
}
export const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '600px', maxWidth: '95vw',
  boxShadow: '0 8px 32px var(--color-shadow)', flexShrink: 0
}
export const titleStyle: React.CSSProperties = {
  fontSize: '17px', fontWeight: 600, marginBottom: '24px', color: 'var(--color-text)'
}
export const sectionTitleStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--color-text-muted)',
  marginBottom: '10px', marginTop: '20px',
  paddingBottom: '6px', borderBottom: '1px solid var(--color-border)'
}
export const rowStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'
}
export const fieldStyle: React.CSSProperties = { marginBottom: '12px' }
export const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500,
  marginBottom: '4px', color: 'var(--color-text)'
}
export const requiredDot: React.CSSProperties = { color: 'var(--color-error)', marginLeft: '2px' }
export const hintStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px'
}
export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)',
  borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box'
}
export const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }
export const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit'
}
export const errorStyle: React.CSSProperties = {
  marginBottom: '14px', padding: '8px 12px',
  background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
  borderRadius: '6px', color: 'var(--color-error)', fontSize: '13px'
}
export const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)'
}
export const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-accent)', color: 'var(--color-on-accent)',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
}
export const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
}

// Stile di un campo in sola lettura (es. codice istanza in modifica).
export const readonlyInputStyle: React.CSSProperties = {
  ...inputStyle, background: 'var(--color-bg)', color: 'var(--color-text-muted)', cursor: 'not-allowed'
}
