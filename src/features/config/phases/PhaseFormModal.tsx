import { useState } from 'react'
import { z } from 'zod'
import { PHASE_CATEGORIES } from '../../../../shared/ipc'
import type { PhaseCategory, PhaseListItem } from '../../../../shared/ipc'
import { useCreatePhase, useUpdatePhase } from './usePhases'
import { ipcErrorMessage } from '../../../utils/ipcError'

const CATEGORY_LABELS: Record<PhaseCategory, string> = {
  deposited: 'Depositata',
  awaiting_decree: 'In attesa di decreto',
  awaiting_integration: 'In attesa di integrazione',
  decree_received: 'Decreto ricevuto',
  awaiting_correction: 'In attesa di correzione',
  awaiting_appeal: 'In attesa di impugnazione',
  awaiting_liquidation: 'In attesa di liquidazione',
  awaiting_integration_scp: 'In attesa di integrazione SCP',
  liquidated: 'Liquidata',
  closed: 'Chiusa',
  refused: 'Rifiutata',
  suspended: 'Sospesa',
  annulled: 'Annullata',
  custom: 'Personalizzata'
}

const formSchema = z.object({
  displayName: z.string().min(1, 'Il nome è obbligatorio').max(100, 'Massimo 100 caratteri'),
  category: z.enum(PHASE_CATEGORIES),
  isInitial: z.boolean(),
  isFinal: z.boolean(),
  isActive: z.boolean()
})

interface Props {
  mode: 'create' | 'edit'
  phase?: PhaseListItem
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: '10px',
  padding: '28px 32px',
  width: '480px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
}

const titleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: '20px',
  color: 'var(--color-text)'
}

const fieldStyle: React.CSSProperties = {
  marginBottom: '16px'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '5px',
  color: 'var(--color-text)'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  outline: 'none'
}

const readonlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'var(--color-bg)',
  color: 'var(--color-text-secondary)',
  cursor: 'default'
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer'
}

const checkRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px'
}

const checkLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text)',
  cursor: 'pointer'
}

const errorStyle: React.CSSProperties = {
  marginBottom: '14px',
  padding: '8px 12px',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: '6px',
  color: 'var(--color-error)',
  fontSize: '13px'
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid var(--color-border)'
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: 'var(--color-accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer'
}

export function PhaseFormModal({ mode, phase, onClose }: Props): React.JSX.Element {
  const isEdit = mode === 'edit' && phase != null

  const [displayName, setDisplayName] = useState(isEdit ? phase.displayName : '')
  const [category, setCategory] = useState<PhaseCategory>(isEdit ? phase.category : 'custom')
  const [isInitial, setIsInitial] = useState(isEdit ? phase.isInitial : false)
  const [isFinal, setIsFinal] = useState(isEdit ? phase.isFinal : false)
  const [isActive, setIsActive] = useState(isEdit ? phase.isActive : true)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreatePhase()
  const updateMutation = useUpdatePhase()

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setFormError(null)

    const result = formSchema.safeParse({ displayName, category, isInitial, isFinal, isActive })
    if (!result.success) {
      const issue = result.error.issues[0]
      setFormError(issue?.message ?? 'Dati non validi')
      return
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: phase.id, ...result.data },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setFormError(ipcErrorMessage(err))
        }
      )
    } else {
      createMutation.mutate(result.data, {
        onSuccess: () => onClose(),
        onError: (err) =>
          setFormError(ipcErrorMessage(err))
      })
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={dialogStyle}>
        <h2 style={titleStyle}>{isEdit ? 'Modifica fase' : 'Nuova fase'}</h2>

        <form onSubmit={handleSubmit}>
          {isEdit && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Chiave tecnica (non modificabile)</label>
              <input style={readonlyInputStyle} value={phase.key} readOnly />
            </div>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="pf-displayName">
              Nome visualizzato *
            </label>
            <input
              id="pf-displayName"
              style={inputStyle}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Es. In attesa di risposta"
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="pf-category">
              Categoria
            </label>
            <select
              id="pf-category"
              style={selectStyle}
              value={category}
              onChange={(e) => setCategory(e.target.value as PhaseCategory)}
            >
              {PHASE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>Opzioni</label>
            <div style={checkRowStyle}>
              <input
                type="checkbox"
                id="pf-isInitial"
                checked={isInitial}
                onChange={(e) => setIsInitial(e.target.checked)}
              />
              <label style={checkLabelStyle} htmlFor="pf-isInitial">
                Fase iniziale (punto di partenza del workflow)
              </label>
            </div>
            <div style={checkRowStyle}>
              <input
                type="checkbox"
                id="pf-isFinal"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
              />
              <label style={checkLabelStyle} htmlFor="pf-isFinal">
                Fase finale (nessuna transizione in uscita)
              </label>
            </div>
            <div style={checkRowStyle}>
              <input
                type="checkbox"
                id="pf-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label style={checkLabelStyle} htmlFor="pf-isActive">
                Attiva
              </label>
            </div>
          </div>

          {formError && <div style={errorStyle}>{formError}</div>}

          <div style={footerStyle}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose} disabled={isPending}>
              Annulla
            </button>
            <button type="submit" style={btnPrimaryStyle} disabled={isPending}>
              {isPending ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea fase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
