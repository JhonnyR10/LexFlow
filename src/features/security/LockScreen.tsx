import { useState, type FormEvent } from 'react'
import { useUnlock } from './useSecurity'
import { ipcErrorMessage } from '../../utils/ipcError'

// Schermata di sblocco (S14.1). Mostrata al boot quando il lock è attivo, PRIMA
// che il DB sia aperto: qui non si può leggere il tema dal DB, quindi usa i
// token di base di :root (tema chiaro di default). Nessun accesso ai dati
// finché la password non è corretta.

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg)',
  padding: '24px',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '360px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  boxShadow: '0 10px 30px var(--color-shadow)',
}

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--color-text)',
  margin: 0,
}

const hintStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  margin: 0,
}

const inputStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text)',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '10px 12px',
  width: '100%',
}

const buttonStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--color-on-accent)',
  background: 'var(--color-accent)',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 14px',
  cursor: 'pointer',
}

const errorStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-error)',
  margin: 0,
}

export function LockScreen({ onUnlocked }: { onUnlocked: () => void }): React.JSX.Element {
  const [password, setPassword] = useState('')
  const [wrong, setWrong] = useState(false)
  const unlock = useUnlock()

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (!password || unlock.isPending) return
    setWrong(false)
    unlock.mutate(
      { password },
      {
        onSuccess: (res) => {
          if (res.success) {
            setPassword('')
            onUnlocked()
          } else {
            setWrong(true)
            setPassword('')
          }
        },
      }
    )
  }

  return (
    <div style={overlayStyle}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <h1 style={titleStyle}>LexFlow è bloccato</h1>
        <p style={hintStyle}>Inserisci la password per accedere ai dati.</p>
        <input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          disabled={unlock.isPending}
          aria-label="Password di sblocco"
        />
        <button type="submit" style={buttonStyle} disabled={unlock.isPending || !password}>
          {unlock.isPending ? 'Sblocco…' : 'Sblocca'}
        </button>
        {wrong && <p style={errorStyle}>Password errata. Riprova.</p>}
        {unlock.isError && <p style={errorStyle}>{ipcErrorMessage(unlock.error)}</p>}
      </form>
    </div>
  )
}
