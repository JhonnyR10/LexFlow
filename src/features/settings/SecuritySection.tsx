import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import {
  useChangePassword,
  useDisableLock,
  useSecurityConfig,
  useSetPassword,
} from '../security/useSecurity'
import { ipcErrorMessage } from '../../utils/ipcError'

// Gestione del lock con password (S14.1) nelle Impostazioni app. Raggiungibile
// solo ad app sbloccata (DB aperto). S14.1 non cifra il file: lo dice l'avviso.

const MIN_LENGTH = 6

const sectionStyle: React.CSSProperties = { marginTop: '36px' }

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px',
}

const hintStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '13px',
  marginBottom: '16px',
}

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg-subtle)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '10px 12px',
  marginBottom: '16px',
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '360px',
}

const inputStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '9px 12px',
}

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '2px',
}

const primaryButtonStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-on-accent)',
  background: 'var(--color-accent)',
  border: 'none',
  borderRadius: '8px',
  padding: '9px 14px',
  cursor: 'pointer',
}

const dangerButtonStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-on-accent)',
  background: 'var(--color-destructive)',
  border: 'none',
  borderRadius: '8px',
  padding: '9px 14px',
  cursor: 'pointer',
}

const messageStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-text-secondary)' }
const errorStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-error)' }
const successStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-success)' }

const setSchema = z
  .object({
    password: z.string().min(MIN_LENGTH, `Almeno ${MIN_LENGTH} caratteri.`),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Le password non coincidono.',
    path: ['confirm'],
  })

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Inserisci la password attuale.'),
    newPassword: z.string().min(MIN_LENGTH, `Almeno ${MIN_LENGTH} caratteri.`),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Le password non coincidono.',
    path: ['confirm'],
  })

export function SecuritySection(): React.JSX.Element {
  const { data, isLoading, isError, error } = useSecurityConfig()
  const setPassword = useSetPassword()
  const changePassword = useChangePassword()
  const disableLock = useDisableLock()

  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [newConfirm, setNewConfirm] = useState('')
  const [disablePw, setDisablePw] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  function resetFields(): void {
    setPw('')
    setConfirm('')
    setCurrentPw('')
    setNewPw('')
    setNewConfirm('')
    setDisablePw('')
    setLocalError(null)
  }

  function handleSet(e: FormEvent): void {
    e.preventDefault()
    setLocalError(null)
    const parsed = setSchema.safeParse({ password: pw, confirm })
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? 'Input non valido')
      return
    }
    setPassword.mutate({ password: parsed.data.password }, { onSuccess: resetFields })
  }

  function handleChange(e: FormEvent): void {
    e.preventDefault()
    setLocalError(null)
    const parsed = changeSchema.safeParse({
      currentPassword: currentPw,
      newPassword: newPw,
      confirm: newConfirm,
    })
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? 'Input non valido')
      return
    }
    changePassword.mutate(
      { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword },
      { onSuccess: resetFields }
    )
  }

  function handleDisable(e: FormEvent): void {
    e.preventDefault()
    setLocalError(null)
    if (!disablePw) {
      setLocalError('Inserisci la password attuale.')
      return
    }
    disableLock.mutate({ currentPassword: disablePw }, { onSuccess: resetFields })
  }

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Password di avvio</h2>
      <p style={hintStyle}>
        {'Proteggi LexFlow con una password richiesta all’avvio. Nessun altro utente potrà aprire l’app senza conoscerla.'}
      </p>
      <p style={noteStyle}>
        {'Nota: questa password blocca l’accesso all’app, ma non cifra ancora il file del database su disco. La cifratura a riposo arriverà in un aggiornamento successivo.'}
      </p>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>Errore nel caricamento: {ipcErrorMessage(error)}</p>
      ) : data?.lockEnabled ? (
        <>
          <form style={formStyle} onSubmit={handleChange}>
            <p style={{ ...messageStyle, fontWeight: 600, color: 'var(--color-text)' }}>
              Il lock è attivo. Cambia password:
            </p>
            <input
              type="password"
              style={inputStyle}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Password attuale"
              aria-label="Password attuale"
            />
            <input
              type="password"
              style={inputStyle}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Nuova password"
              aria-label="Nuova password"
            />
            <input
              type="password"
              style={inputStyle}
              value={newConfirm}
              onChange={(e) => setNewConfirm(e.target.value)}
              placeholder="Conferma nuova password"
              aria-label="Conferma nuova password"
            />
            <div style={buttonRowStyle}>
              <button type="submit" style={primaryButtonStyle} disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Salvataggio…' : 'Cambia password'}
              </button>
            </div>
            {changePassword.data && <p style={successStyle}>Password aggiornata.</p>}
          </form>

          <form style={{ ...formStyle, marginTop: '20px' }} onSubmit={handleDisable}>
            <p style={{ ...messageStyle, fontWeight: 600, color: 'var(--color-text)' }}>
              Rimuovi la password (disattiva il lock):
            </p>
            <input
              type="password"
              style={inputStyle}
              value={disablePw}
              onChange={(e) => setDisablePw(e.target.value)}
              placeholder="Password attuale"
              aria-label="Password attuale per rimozione"
            />
            <div style={buttonRowStyle}>
              <button type="submit" style={dangerButtonStyle} disabled={disableLock.isPending}>
                {disableLock.isPending ? 'Rimozione…' : 'Rimuovi password'}
              </button>
            </div>
            {disableLock.data?.lockEnabled === false && (
              <p style={successStyle}>Password rimossa: l’app non richiederà più lo sblocco.</p>
            )}
          </form>
        </>
      ) : (
        <form style={formStyle} onSubmit={handleSet}>
          <input
            type="password"
            style={inputStyle}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Nuova password"
            aria-label="Nuova password"
          />
          <input
            type="password"
            style={inputStyle}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Conferma password"
            aria-label="Conferma password"
          />
          <div style={buttonRowStyle}>
            <button type="submit" style={primaryButtonStyle} disabled={setPassword.isPending}>
              {setPassword.isPending ? 'Salvataggio…' : 'Attiva password'}
            </button>
          </div>
          {setPassword.data?.lockEnabled && (
            <p style={successStyle}>Password attivata: sarà richiesta al prossimo avvio.</p>
          )}
        </form>
      )}

      {localError && <p style={{ ...errorStyle, marginTop: '10px' }}>{localError}</p>}
      {setPassword.isError && (
        <p style={{ ...errorStyle, marginTop: '10px' }}>{ipcErrorMessage(setPassword.error)}</p>
      )}
      {changePassword.isError && (
        <p style={{ ...errorStyle, marginTop: '10px' }}>{ipcErrorMessage(changePassword.error)}</p>
      )}
      {disableLock.isError && (
        <p style={{ ...errorStyle, marginTop: '10px' }}>{ipcErrorMessage(disableLock.error)}</p>
      )}
    </section>
  )
}
