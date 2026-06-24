import { useState } from 'react'
import { z } from 'zod'
import type { MenuSetListItem } from '../../../../shared/ipc'
import { useCreateMenuSet, useUpdateMenuSet } from './useMenus'
import { ipcErrorMessage } from '../../../utils/ipcError'

const schema = z.object({
  label: z.string().min(1, 'Il nome del menu è obbligatorio').max(100)
})

interface Props {
  mode: 'create' | 'edit'
  menuSet?: MenuSetListItem
  onClose: () => void
}

// ---------- Styles ----------

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200
}

const modalStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '24px 28px',
  minWidth: '340px',
  maxWidth: '480px',
  width: '100%'
}

const titleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--color-text)',
  marginBottom: '20px'
}

const fieldStyle: React.CSSProperties = { marginBottom: '14px' }

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: '5px'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  boxSizing: 'border-box'
}

const readonlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'var(--color-surface)',
  color: 'var(--color-text-muted)',
  cursor: 'default'
}

const fieldErrorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-error)',
  marginTop: '4px'
}

const errorBoxStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: '6px',
  color: 'var(--color-error)',
  fontSize: '13px',
  marginBottom: '14px'
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px'
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '7px 16px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer',
  color: 'var(--color-text)'
}

const saveBtnStyle: React.CSSProperties = {
  padding: '7px 16px',
  background: 'var(--color-accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
}

// ---------- Component ----------

export function MenuSetFormModal({ mode, menuSet, onClose }: Props): React.JSX.Element {
  const [label, setLabel] = useState(menuSet?.label ?? '')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const createMutation = useCreateMenuSet()
  const updateMutation = useUpdateMenuSet()
  const isPending = createMutation.isPending || updateMutation.isPending

  function validate(): boolean {
    const result = schema.safeParse({ label })
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Valore non valido')
      return false
    }
    setFieldError(null)
    return true
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)

    if (mode === 'create') {
      createMutation.mutate(
        { label: label.trim() },
        {
          onSuccess: () => onClose(),
          onError: (err) => setServerError(ipcErrorMessage(err))
        }
      )
    } else {
      if (!menuSet) return
      updateMutation.mutate(
        { id: menuSet.id, label: label.trim() },
        {
          onSuccess: () => onClose(),
          onError: (err) => setServerError(ipcErrorMessage(err))
        }
      )
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>{mode === 'create' ? 'Nuovo menu a tendina' : 'Rinomina menu'}</div>

        {serverError && <div style={errorBoxStyle}>{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nome del menu</label>
            <input
              style={inputStyle}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Es. Tipo di udienza"
              autoFocus
            />
            {fieldError && <div style={fieldErrorStyle}>{fieldError}</div>}
          </div>

          {mode === 'edit' && menuSet && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Chiave tecnica (immutabile)</label>
              <input style={readonlyStyle} value={menuSet.key} readOnly tabIndex={-1} />
            </div>
          )}

          {mode === 'create' && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              La chiave tecnica verrà generata automaticamente dal nome.
            </div>
          )}

          <div style={actionsStyle}>
            <button type="button" style={cancelBtnStyle} onClick={onClose} disabled={isPending}>
              Annulla
            </button>
            <button type="submit" style={saveBtnStyle} disabled={isPending}>
              {isPending ? 'Salvataggio…' : mode === 'create' ? 'Crea menu' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
