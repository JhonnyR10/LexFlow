import { useState } from 'react'
import { z } from 'zod'
import type { PhaseListItem, TransitionListItem } from '../../../../shared/ipc'
import { useCreateTransition, useUpdateTransition } from './useTransitions'
import { ipcErrorMessage } from '../../../utils/ipcError'

const formSchema = z
  .object({
    fromPhaseId: z.number().int().positive(),
    toPhaseId: z.number().int().positive().nullable(),
    buttonLabel: z.string().max(100, 'Massimo 100 caratteri'),
    isRepeatable: z.boolean(),
    isAutomatic: z.boolean(),
    isResume: z.boolean(),
    isActive: z.boolean()
  })
  .superRefine((data, ctx) => {
    if (!data.isResume && data.toPhaseId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['toPhaseId'],
        message: 'Seleziona la fase di destinazione'
      })
    }
    if (!data.isAutomatic && !data.buttonLabel.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['buttonLabel'],
        message: "L'etichetta pulsante è obbligatoria"
      })
    }
    if (data.isResume && data.buttonLabel.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['buttonLabel'],
        message: "L'etichetta pulsante è obbligatoria per le transizioni di ripresa"
      })
    }
  })

interface Props {
  mode: 'create' | 'edit'
  transition?: TransitionListItem
  phases: PhaseListItem[]
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
  zIndex: 1000
}

const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: '10px',
  padding: '28px 32px',
  width: '520px',
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

const fieldStyle: React.CSSProperties = { marginBottom: '16px' }

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

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

const hintStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '11px',
  color: 'var(--color-text-muted)'
}

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '10px'
}

const toggleLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text)',
  cursor: 'pointer'
}

const disabledToggleLabelStyle: React.CSSProperties = {
  ...toggleLabelStyle,
  color: 'var(--color-text-muted)',
  cursor: 'not-allowed'
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

// ---------- Component ----------

export function TransitionFormModal({ mode, transition, phases, onClose }: Props): React.JSX.Element {
  const isEdit = mode === 'edit' && transition != null

  const [fromPhaseId, setFromPhaseId] = useState<number | null>(
    isEdit ? transition.fromPhaseId : null
  )
  const [toPhaseId, setToPhaseId] = useState<number | null>(
    isEdit ? (transition.toPhaseId ?? null) : null
  )
  const [buttonLabel, setButtonLabel] = useState(isEdit ? transition.buttonLabel : '')
  const [isRepeatable, setIsRepeatable] = useState(isEdit ? transition.isRepeatable : false)
  const [isAutomatic, setIsAutomatic] = useState(isEdit ? transition.isAutomatic : false)
  const [isResume, setIsResume] = useState(isEdit ? transition.isResume : false)
  const [isActive, setIsActive] = useState(isEdit ? transition.isActive : true)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateTransition()
  const updateMutation = useUpdateTransition()
  const isPending = createMutation.isPending || updateMutation.isPending

  const hasSuspendedPhases = phases.some((p) => p.category === 'suspended' && !p.isFinal)

  const fromPhaseOptions = phases.filter((p) => {
    if (p.isFinal) return false
    if (isResume && p.category !== 'suspended') return false
    return true
  })

  const toPhaseOptions = phases.filter((p) => p.isActive)

  const currentFromPhase = phases.find((p) => p.id === fromPhaseId)
  const isSelfTransition =
    fromPhaseId != null && toPhaseId != null && fromPhaseId === toPhaseId

  function handleIsResumeChange(checked: boolean): void {
    setIsResume(checked)
    if (checked) {
      setToPhaseId(null)
      if (currentFromPhase && currentFromPhase.category !== 'suspended') {
        setFromPhaseId(null)
      }
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setFormError(null)

    if (fromPhaseId == null) {
      setFormError('Seleziona la fase di partenza')
      return
    }

    const result = formSchema.safeParse({
      fromPhaseId,
      toPhaseId: isResume ? null : toPhaseId,
      buttonLabel,
      isRepeatable,
      isAutomatic,
      isResume,
      isActive
    })

    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Dati non validi')
      return
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: transition.id, ...result.data, fromPhaseId: transition.fromPhaseId },
        {
          onSuccess: () => onClose(),
          onError: (err) => setFormError(ipcErrorMessage(err))
        }
      )
    } else {
      createMutation.mutate(result.data, {
        onSuccess: () => onClose(),
        onError: (err) => setFormError(ipcErrorMessage(err))
      })
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={dialogStyle}>
        <h2 style={titleStyle}>{isEdit ? 'Modifica transizione' : 'Nuova transizione'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Fase di partenza */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="tf-fromPhase">
              Fase di partenza *
            </label>
            {isEdit ? (
              <input style={readonlyInputStyle} value={transition.fromPhaseDisplayName} readOnly />
            ) : (
              <select
                id="tf-fromPhase"
                style={selectStyle}
                value={fromPhaseId ?? ''}
                onChange={(e) => setFromPhaseId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Seleziona una fase —</option>
                {fromPhaseOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Flags */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>Tipo di transizione</label>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="tf-isResume"
                checked={isResume}
                disabled={!hasSuspendedPhases}
                onChange={(e) => handleIsResumeChange(e.target.checked)}
              />
              <label
                style={!hasSuspendedPhases ? disabledToggleLabelStyle : toggleLabelStyle}
                htmlFor="tf-isResume"
              >
                Ripresa (↩ ritorna alla fase precedente)
                {!hasSuspendedPhases && ' — nessuna fase sospesa attiva'}
              </label>
            </div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="tf-isAutomatic"
                checked={isAutomatic}
                onChange={(e) => setIsAutomatic(e.target.checked)}
              />
              <label style={toggleLabelStyle} htmlFor="tf-isAutomatic">
                Automatica (eseguita dal motore senza pulsante)
              </label>
            </div>

            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="tf-isRepeatable"
                checked={isRepeatable || isSelfTransition}
                disabled={isSelfTransition}
                onChange={(e) => setIsRepeatable(e.target.checked)}
              />
              <label
                style={isSelfTransition ? disabledToggleLabelStyle : toggleLabelStyle}
                htmlFor="tf-isRepeatable"
              >
                Ripetibile (rimane disponibile dopo ogni esecuzione)
                {isSelfTransition && ' — obbligatorio per transizioni che restano nella stessa fase'}
              </label>
            </div>
          </div>

          {/* Fase di destinazione */}
          {!isResume && (
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="tf-toPhase">
                Fase di destinazione *
              </label>
              <select
                id="tf-toPhase"
                style={selectStyle}
                value={toPhaseId ?? ''}
                onChange={(e) => setToPhaseId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Seleziona una fase —</option>
                {toPhaseOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                    {p.id === fromPhaseId ? ' (stessa fase)' : ''}
                  </option>
                ))}
              </select>
              {isSelfTransition && (
                <div style={hintStyle}>
                  Transizione che resta nella stessa fase: isRepeatable verrà impostato
                  automaticamente.
                </div>
              )}
            </div>
          )}

          {isResume && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Fase di destinazione</label>
              <input
                style={readonlyInputStyle}
                value="↩ Fase di provenienza (dinamica, determinata al runtime)"
                readOnly
              />
            </div>
          )}

          {/* Etichetta pulsante */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="tf-buttonLabel">
              Etichetta pulsante {isAutomatic ? '(opzionale per transizioni automatiche)' : '*'}
            </label>
            <input
              id="tf-buttonLabel"
              style={inputStyle}
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder={isAutomatic ? '(automatica)' : 'Es. Registra decreto'}
              autoFocus={!isEdit}
            />
          </div>

          {/* Stato attivo */}
          <div style={{ marginBottom: '16px' }}>
            <div style={toggleRowStyle}>
              <input
                type="checkbox"
                id="tf-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label style={toggleLabelStyle} htmlFor="tf-isActive">
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
              {isPending
                ? 'Salvataggio…'
                : isEdit
                  ? 'Salva modifiche'
                  : 'Crea transizione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
