import React, { useState, useCallback } from 'react'
import { useFields } from '../config/fields/useFields'
import { useMenuSets } from '../config/menus/useMenus'
import { useExecuteTransition } from './usePractices'
import { ipcErrorMessage } from '../../utils/ipcError'
import { DynamicField } from './dynamicFields'
import type { AvailableTransition, FieldDefListItem } from '../../../shared/ipc'

// S5.3 — Form dinamico della transizione. I campi arrivano dalla configurazione
// (scope='transition') e sono renderizzati dal componente condiviso DynamicField,
// con visibilità condizionale (incluso il blocco PEC). La validazione di merito
// è ribadita lato main: qui si fa una verifica leggera per il feedback immediato.

interface Props {
  practiceId: number
  transition: AvailableTransition
  onClose: () => void
  onDone: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '40px', paddingBottom: '40px', overflowY: 'auto'
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '560px', maxWidth: '95vw',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)', flexShrink: 0
}
const titleStyle: React.CSSProperties = {
  fontSize: '17px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)'
}
const subtitleStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px'
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: 'var(--color-text)'
}
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)',
  borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
  resize: 'vertical', minHeight: '64px', fontFamily: 'inherit'
}
const mutedStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0
}
const errorStyle: React.CSSProperties = {
  marginTop: '16px', marginBottom: '4px', padding: '8px 12px',
  background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
  borderRadius: '6px', color: 'var(--color-error)', fontSize: '13px'
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)'
}
const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-accent)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
}

// Visibilità condizionale (stessa regola del backend): un campo nascosto non è obbligatorio.
function isVisible(
  field: FieldDefListItem,
  fields: FieldDefListItem[],
  values: Record<string, unknown>
): boolean {
  if (field.conditionalOnFieldId == null || field.conditionalValue == null) return true
  const controller = fields.find(f => f.id === field.conditionalOnFieldId)
  if (!controller) return true
  return values[controller.key] === field.conditionalValue
}

function pecAddresses(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((a): a is string => typeof a === 'string').map(a => a.trim()).filter(a => a.length > 0)
}

function destinationHint(t: AvailableTransition): string {
  if (t.isResume) return 'Riporta la pratica alla fase di provenienza.'
  if (t.toPhaseDisplayName) return `Porta la pratica a: ${t.toPhaseDisplayName}.`
  return 'Resta nella fase corrente.'
}

export function TransitionFormModal({ practiceId, transition, onClose, onDone }: Props): React.JSX.Element {
  const { data: fieldsData, isLoading, isError } = useFields({ scope: 'transition', transitionId: transition.id })
  const { data: menuSets = [], isLoading: loadingMenus } = useMenuSets()
  const execute = useExecuteTransition(practiceId)

  const [values, setValues] = useState<Record<string, unknown>>({})
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((key: string, value: unknown): void => {
    setValues(prev => ({ ...prev, [key]: value }))
  }, [])

  const activeFields = (fieldsData ?? []).filter(f => f.isActive)

  const validate = (): string | null => {
    for (const field of activeFields) {
      if (!isVisible(field, activeFields, values)) continue
      if (!field.required) continue
      if (field.type === 'pec') {
        if (pecAddresses(values[field.key]).length === 0) {
          return `Indicare almeno un indirizzo PEC per «${field.label}»`
        }
        continue
      }
      if (field.type === 'si_no') continue
      const v = values[field.key]
      if (v == null || (typeof v === 'string' && v.trim() === '')) {
        return `Il campo «${field.label}» è obbligatorio`
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      await execute.mutateAsync({
        practiceId,
        transitionId: transition.id,
        values,
        note: note.trim() ? note.trim() : null,
      })
      onDone()
    } catch (err) {
      setError(ipcErrorMessage(err))
    }
  }

  const busy = execute.isPending
  const dataLoading = isLoading || loadingMenus

  return (
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={dialogStyle} onMouseDown={e => e.stopPropagation()}>
        <div style={titleStyle}>{transition.buttonLabel}</div>
        <div style={subtitleStyle}>{destinationHint(transition)}</div>

        <form onSubmit={handleSubmit} noValidate>
          {dataLoading && <p style={mutedStyle}>Caricamento campi…</p>}

          {isError && (
            <p style={{ ...mutedStyle, color: 'var(--color-error)', fontStyle: 'normal' }}>
              Errore nel caricamento dei campi della transizione.
            </p>
          )}

          {!dataLoading && !isError && activeFields.length === 0 && (
            <p style={mutedStyle}>Nessun dato da compilare per questa azione.</p>
          )}

          {!dataLoading && !isError && activeFields.map(field => (
            <DynamicField
              key={field.id}
              field={field}
              value={values[field.key]}
              onChange={handleChange}
              allFields={activeFields}
              customValues={values}
              menuSets={menuSets}
            />
          ))}

          {/* Note libere sull'evento di transizione */}
          <div style={{ marginTop: activeFields.length > 0 ? '12px' : '16px' }}>
            <label style={labelStyle}>Note</label>
            <textarea
              style={textareaStyle}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note opzionali su questa operazione…"
            />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <div style={footerStyle}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose} disabled={busy}>
              Annulla
            </button>
            <button
              type="submit"
              style={{ ...btnPrimaryStyle, opacity: busy || dataLoading ? 0.7 : 1 }}
              disabled={busy || dataLoading || isError}
            >
              {busy ? 'Salvataggio…' : 'Conferma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
