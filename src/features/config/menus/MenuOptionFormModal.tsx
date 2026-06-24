import { useState } from 'react'
import { z } from 'zod'
import type { MenuOptionListItem } from '../../../../shared/ipc'
import { useCreateMenuOption, useUpdateMenuOption } from './useMenus'
import { ipcErrorMessage } from '../../../utils/ipcError'

const createSchema = z.object({
  label: z.string().min(1, "L'etichetta è obbligatoria").max(100),
  value: z.string().min(1, 'Il valore è obbligatorio').max(100)
})

const updateSchema = z.object({
  label: z.string().min(1, "L'etichetta è obbligatoria").max(100)
})

interface Props {
  mode: 'create' | 'edit'
  menuSetId: number
  option?: MenuOptionListItem
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

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  marginTop: '3px'
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

export function MenuOptionFormModal({ mode, menuSetId, option, onClose }: Props): React.JSX.Element {
  const [label, setLabel] = useState(option?.label ?? '')
  const [value, setValue] = useState(option?.value ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const createMutation = useCreateMenuOption()
  const updateMutation = useUpdateMenuOption()
  const isPending = createMutation.isPending || updateMutation.isPending

  function validate(): boolean {
    const input = mode === 'create' ? { label, value } : { label }
    const schema = mode === 'create' ? createSchema : updateSchema
    const result = schema.safeParse(input)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!validate()) return
    setServerError(null)

    if (mode === 'create') {
      createMutation.mutate(
        { menuSetId, label: label.trim(), value: value.trim() },
        {
          onSuccess: () => onClose(),
          onError: (err) => setServerError(ipcErrorMessage(err))
        }
      )
    } else {
      if (!option) return
      updateMutation.mutate(
        { id: option.id, label: label.trim() },
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
        <div style={titleStyle}>{mode === 'create' ? 'Nuova opzione' : 'Modifica opzione'}</div>

        {serverError && <div style={errorBoxStyle}>{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Etichetta</label>
            <input
              style={inputStyle}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Es. Tribunale"
              autoFocus
            />
            {errors.label && <div style={fieldErrorStyle}>{errors.label}</div>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Valore tecnico</label>
            {mode === 'create' ? (
              <>
                <input
                  style={inputStyle}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Es. tribunale"
                />
                <div style={hintStyle}>
                  Usato internamente come identificatore. Non modificabile dopo la creazione.
                </div>
                {errors.value && <div style={fieldErrorStyle}>{errors.value}</div>}
              </>
            ) : (
              <>
                <input style={readonlyStyle} value={option?.value ?? ''} readOnly tabIndex={-1} />
                <div style={hintStyle}>Il valore tecnico non è modificabile.</div>
              </>
            )}
          </div>

          <div style={actionsStyle}>
            <button type="button" style={cancelBtnStyle} onClick={onClose} disabled={isPending}>
              Annulla
            </button>
            <button type="submit" style={saveBtnStyle} disabled={isPending}>
              {isPending ? 'Salvataggio…' : mode === 'create' ? 'Aggiungi' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
