import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import type { ProfessionistaListItem } from '../../../../shared/ipc'
import { useCreateProfessionista, useUpdateProfessionista } from './useProfessionisti'
import { ipcErrorMessage } from '../../../utils/ipcError'

const formSchema = z.object({
  nome:          z.string().min(1, 'Il nome è obbligatorio').max(100),
  cognome:       z.string().min(1, 'Il cognome è obbligatorio').max(100),
  denominazione: z.string().max(200).nullable(),
  codiceFiscale: z.string().max(16).nullable(),
  email:         z.string().max(200).nullable(),
  pec:           z.string().max(200).nullable(),
  telefono:      z.string().max(50).nullable(),
  ruolo:         z.string().max(100).nullable(),
  note:          z.string().max(2000).nullable(),
  isActive:      z.boolean()
})

interface Props {
  mode: 'create' | 'edit'
  professionista?: ProfessionistaListItem
  onClose: () => void
}

/* ---- stili (stesso sistema di PhaseFormModal) ---- */
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '540px', maxWidth: '95vw',
  maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
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
  padding: '8px 18px', background: 'var(--color-accent)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
}

export function ProfessionistaFormModal({ mode, professionista, onClose }: Props): React.JSX.Element {
  const isEdit = mode === 'edit' && professionista != null

  const [nome,          setNome]          = useState(isEdit ? professionista.nome          : '')
  const [cognome,       setCognome]       = useState(isEdit ? professionista.cognome       : '')
  const [denominazione, setDenominazione] = useState(isEdit ? professionista.denominazione : '')
  const [codiceFiscale, setCodiceFiscale] = useState(isEdit ? (professionista.codiceFiscale ?? '') : '')
  const [email,         setEmail]         = useState(isEdit ? (professionista.email         ?? '') : '')
  const [pec,           setPec]           = useState(isEdit ? (professionista.pec           ?? '') : '')
  const [telefono,      setTelefono]      = useState(isEdit ? (professionista.telefono      ?? '') : '')
  const [ruolo,         setRuolo]         = useState(isEdit ? (professionista.ruolo         ?? '') : '')
  const [note,          setNote]          = useState(isEdit ? (professionista.note          ?? '') : '')
  const [isActive,      setIsActive]      = useState(isEdit ? professionista.isActive : true)
  const [formError,     setFormError]     = useState<string | null>(null)

  // Denominazione auto-sync: segue nome+cognome finché non è stata editata manualmente
  const denominazioneTouched = useRef(false)

  useEffect(() => {
    if (denominazioneTouched.current) return
    const auto = `${cognome.trim()} ${nome.trim()}`.trim()
    setDenominazione(auto)
  }, [nome, cognome])

  function handleDenominazioneChange(val: string): void {
    setDenominazione(val)
    const auto = `${cognome.trim()} ${nome.trim()}`.trim()
    // Se l'utente svuota il campo → sblocca l'auto-sync
    denominazioneTouched.current = val.trim().length > 0 && val !== auto
  }

  const createMutation = useCreateProfessionista()
  const updateMutation = useUpdateProfessionista()
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
      codiceFiscale: emptyToNull(codiceFiscale),
      email:         emptyToNull(email),
      pec:           emptyToNull(pec),
      telefono:      emptyToNull(telefono),
      ruolo:         emptyToNull(ruolo),
      note:          emptyToNull(note),
      isActive
    })
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Dati non validi')
      return
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: professionista.id, ...result.data },
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
          {isEdit ? 'Modifica professionista' : 'Nuovo professionista'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Nome + Cognome */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle} htmlFor="pf-cognome">Cognome *</label>
              <input
                id="pf-cognome"
                style={inputStyle}
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                placeholder="Rossi"
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="pf-nome">Nome *</label>
              <input
                id="pf-nome"
                style={inputStyle}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Mario"
              />
            </div>
          </div>

          {/* Denominazione */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="pf-denom">Denominazione *</label>
            <input
              id="pf-denom"
              style={inputStyle}
              value={denominazione}
              onChange={(e) => handleDenominazioneChange(e.target.value)}
              placeholder="Rossi Mario"
            />
            <p style={hintStyle}>
              Etichetta usata nei menu delle pratiche.
              Si auto-popola da cognome + nome; puoi modificarla liberamente
              (svuotarla ripristina l&apos;auto-sincronizzazione).
            </p>
          </div>

          {/* CF + Ruolo */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle} htmlFor="pf-cf">Codice fiscale / P.IVA</label>
              <input
                id="pf-cf"
                style={inputStyle}
                value={codiceFiscale}
                onChange={(e) => setCodiceFiscale(e.target.value)}
                placeholder="RSSMRA80A01H501U"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="pf-ruolo">Ruolo</label>
              <input
                id="pf-ruolo"
                style={inputStyle}
                value={ruolo}
                onChange={(e) => setRuolo(e.target.value)}
                placeholder="Es. Avvocato, Perito…"
              />
            </div>
          </div>

          {/* Email + PEC */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle} htmlFor="pf-email">Email</label>
              <input
                id="pf-email"
                style={inputStyle}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@esempio.it"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="pf-pec">PEC</label>
              <input
                id="pf-pec"
                style={inputStyle}
                type="email"
                value={pec}
                onChange={(e) => setPec(e.target.value)}
                placeholder="mario.rossi@pec.it"
              />
            </div>
          </div>

          {/* Telefono */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="pf-tel">Telefono</label>
            <input
              id="pf-tel"
              style={inputStyle}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+39 02 1234567"
            />
          </div>

          {/* Note */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="pf-note">Note</label>
            <textarea
              id="pf-note"
              style={textareaStyle}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note aggiuntive…"
            />
          </div>

          {/* isActive (solo in edit) */}
          {isEdit && (
            <div style={checkRowStyle}>
              <input
                type="checkbox"
                id="pf-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label style={checkLabelStyle} htmlFor="pf-active">Attivo</label>
            </div>
          )}

          {formError && <div style={errorStyle}>{formError}</div>}

          <div style={footerStyle}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose} disabled={isPending}>
              Annulla
            </button>
            <button type="submit" style={btnPrimaryStyle} disabled={isPending}>
              {isPending ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea professionista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
