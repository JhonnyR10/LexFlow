import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import type { CollaboratoreListItem } from '../../../../shared/ipc'
import { useCreateCollaboratore, useUpdateCollaboratore } from './useCollaboratori'
import { ipcErrorMessage } from '../../../utils/ipcError'

const formSchema = z.object({
  nome:          z.string().min(1, 'Il nome è obbligatorio').max(100),
  cognome:       z.string().min(1, 'Il cognome è obbligatorio').max(100),
  denominazione: z.string().max(200).nullable(),
  codiceInterno: z.string().max(50).nullable(),
  note:          z.string().max(2000).nullable(),
  isActive:      z.boolean()
})

interface Props {
  mode: 'create' | 'edit'
  collaboratore?: CollaboratoreListItem
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'var(--color-overlay)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '480px', maxWidth: '95vw',
  maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px var(--color-shadow)'
}
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--color-text)'
}
const rowStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'
}
const fieldStyle: React.CSSProperties = { marginBottom: '12px' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500,
  marginBottom: '4px', color: 'var(--color-text)'
}
const hintStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)',
  borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box'
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', minHeight: '64px', fontFamily: 'inherit'
}
const checkRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'
}
const checkLabelStyle: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text)', cursor: 'pointer'
}
const errorStyle: React.CSSProperties = {
  marginBottom: '14px', padding: '8px 12px',
  background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
  borderRadius: '6px', color: 'var(--color-error)', fontSize: '13px'
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)'
}
const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-accent)', color: 'var(--color-on-accent)',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
}

export function CollaboratoreFormModal({ mode, collaboratore, onClose }: Props): React.JSX.Element {
  const isEdit = mode === 'edit' && collaboratore != null

  const [nome,          setNome]          = useState(isEdit ? collaboratore.nome          : '')
  const [cognome,       setCognome]       = useState(isEdit ? collaboratore.cognome       : '')
  const [denominazione, setDenominazione] = useState(isEdit ? collaboratore.denominazione : '')
  const [codiceInterno, setCodiceInterno] = useState(isEdit ? (collaboratore.codiceInterno ?? '') : '')
  const [note,          setNote]          = useState(isEdit ? (collaboratore.note          ?? '') : '')
  const [isActive,      setIsActive]      = useState(isEdit ? collaboratore.isActive : true)
  const [formError,     setFormError]     = useState<string | null>(null)

  const denominazioneTouched = useRef(false)

  useEffect(() => {
    if (denominazioneTouched.current) return
    const auto = `${cognome.trim()} ${nome.trim()}`.trim()
    setDenominazione(auto)
  }, [nome, cognome])

  function handleDenominazioneChange(val: string): void {
    setDenominazione(val)
    const auto = `${cognome.trim()} ${nome.trim()}`.trim()
    denominazioneTouched.current = val.trim().length > 0 && val !== auto
  }

  const createMutation = useCreateCollaboratore()
  const updateMutation = useUpdateCollaboratore()
  const isPending = createMutation.isPending || updateMutation.isPending

  function emptyToNull(s: string): string | null {
    const t = s.trim()
    return t.length > 0 ? t : null
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setFormError(null)

    const result = formSchema.safeParse({
      nome, cognome,
      denominazione: emptyToNull(denominazione),
      codiceInterno: emptyToNull(codiceInterno),
      note:          emptyToNull(note),
      isActive
    })
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Dati non validi')
      return
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: collaboratore.id, ...result.data },
        { onSuccess: () => onClose(), onError: (err) => setFormError(ipcErrorMessage(err)) }
      )
    } else {
      const { isActive: _ia, ...createData } = result.data
      createMutation.mutate(createData, {
        onSuccess: () => onClose(),
        onError:   (err) => setFormError(ipcErrorMessage(err))
      })
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={dialogStyle}>
        <h2 style={titleStyle}>
          {isEdit ? 'Modifica collaboratore' : 'Nuovo collaboratore'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle} htmlFor="col-cognome">Cognome *</label>
              <input
                id="col-cognome"
                style={inputStyle}
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                placeholder="Bianchi"
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="col-nome">Nome *</label>
              <input
                id="col-nome"
                style={inputStyle}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Luigi"
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="col-denom">Denominazione *</label>
            <input
              id="col-denom"
              style={inputStyle}
              value={denominazione}
              onChange={(e) => handleDenominazioneChange(e.target.value)}
              placeholder="Bianchi Luigi"
            />
            <p style={hintStyle}>
              Etichetta usata nei menu delle pratiche.
              Si auto-popola da cognome + nome; puoi modificarla liberamente
              (svuotarla ripristina l&apos;auto-sincronizzazione).
            </p>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="col-codice">Codice interno</label>
            <input
              id="col-codice"
              style={inputStyle}
              value={codiceInterno}
              onChange={(e) => setCodiceInterno(e.target.value)}
              placeholder="Es. CTU-001"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="col-note">Note</label>
            <textarea
              id="col-note"
              style={textareaStyle}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note aggiuntive…"
            />
          </div>

          {isEdit && (
            <div style={checkRowStyle}>
              <input
                type="checkbox"
                id="col-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label style={checkLabelStyle} htmlFor="col-active">Attivo</label>
            </div>
          )}

          {formError && <div style={errorStyle}>{formError}</div>}

          <div style={footerStyle}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose} disabled={isPending}>
              Annulla
            </button>
            <button type="submit" style={btnPrimaryStyle} disabled={isPending}>
              {isPending ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea collaboratore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
