import { useState, type FormEvent } from 'react'
import type { ScadenzaItem } from '../../../shared/ipc'
import { ipcErrorMessage } from '../../utils/ipcError'
import {
  useCreateScadenza,
  useDeleteScadenza,
  useScadenze,
  useUpdateScadenza,
} from './useScadenze'

const sectionStyle: React.CSSProperties = { marginTop: '32px' }
const titleStyle: React.CSSProperties = {
  fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '12px',
}
const messageStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-text-secondary)' }
const errorStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-error)', marginTop: '8px' }

const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }
const itemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '10px 12px', background: 'var(--color-surface)',
  border: '1px solid var(--color-border)', borderRadius: '8px',
}
const dateStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, minWidth: '92px' }
const descStyle: React.CSSProperties = { fontSize: '13px', color: 'var(--color-text)', flex: 1 }
const overdueBadgeStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: 'var(--color-on-accent)',
  background: 'var(--color-warning-red)', borderRadius: '4px', padding: '1px 6px',
}
const formStyle: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }
const inputStyle: React.CSSProperties = {
  fontSize: '13px', padding: '7px 10px', color: 'var(--color-text)',
  background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px',
}
const primaryButtonStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 500, color: 'var(--color-on-accent)',
  background: 'var(--color-accent)', border: 'none', borderRadius: '6px',
  padding: '7px 14px', cursor: 'pointer',
}
const iconButtonStyle: React.CSSProperties = {
  fontSize: '12px', color: 'var(--color-destructive)', background: 'transparent',
  border: '1px solid var(--color-destructive)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer',
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}
function isOverdue(s: ScadenzaItem): boolean {
  return !s.completata && s.dataScadenza < todayIso()
}

export function ScadenzeSection({
  practiceId,
  isTrashed,
}: {
  practiceId: number
  isTrashed: boolean
}): React.JSX.Element {
  const { data, isLoading, isError, error } = useScadenze(practiceId)
  const create = useCreateScadenza(practiceId)
  const update = useUpdateScadenza(practiceId)
  const remove = useDeleteScadenza(practiceId)

  const [descrizione, setDescrizione] = useState('')
  const [dataScadenza, setDataScadenza] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  function handleAdd(e: FormEvent): void {
    e.preventDefault()
    setFormError(null)
    if (descrizione.trim().length === 0) {
      setFormError('Inserisci una descrizione.')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataScadenza)) {
      setFormError('Inserisci una data valida.')
      return
    }
    create.mutate(
      { practiceId, descrizione: descrizione.trim(), dataScadenza },
      { onSuccess: () => { setDescrizione(''); setDataScadenza('') } }
    )
  }

  function handleToggle(s: ScadenzaItem): void {
    update.mutate({ id: s.id, descrizione: s.descrizione, dataScadenza: s.dataScadenza, completata: !s.completata })
  }

  // Ordina per data crescente (le più imminenti in cima).
  const items = data ? [...data].sort((a, b) => a.dataScadenza.localeCompare(b.dataScadenza)) : []

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Scadenze</h2>

      {isLoading ? (
        <p style={messageStyle}>Caricamento…</p>
      ) : isError ? (
        <p style={errorStyle}>Errore nel caricamento: {ipcErrorMessage(error)}</p>
      ) : (
        <>
          {items.length === 0 ? (
            <p style={messageStyle}>Nessuna scadenza registrata.</p>
          ) : (
            <div style={listStyle}>
              {items.map((s) => (
                <div key={s.id} style={itemStyle}>
                  <input
                    type="checkbox"
                    checked={s.completata}
                    disabled={isTrashed || update.isPending}
                    onChange={() => handleToggle(s)}
                    aria-label={`Completata: ${s.descrizione}`}
                  />
                  <span style={{ ...dateStyle, color: isOverdue(s) ? 'var(--color-warning-red)' : 'var(--color-text-secondary)' }}>
                    {fmtDate(s.dataScadenza)}
                  </span>
                  <span style={{ ...descStyle, textDecoration: s.completata ? 'line-through' : 'none', opacity: s.completata ? 0.6 : 1 }}>
                    {s.descrizione}
                  </span>
                  {isOverdue(s) && <span style={overdueBadgeStyle}>Scaduta</span>}
                  {!isTrashed && (
                    <button
                      type="button"
                      style={iconButtonStyle}
                      onClick={() => remove.mutate({ id: s.id })}
                      disabled={remove.isPending}
                    >
                      Elimina
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isTrashed ? (
            <p style={messageStyle}>La pratica è nel cestino: le scadenze non sono modificabili.</p>
          ) : (
            <form style={formStyle} onSubmit={handleAdd}>
              <input
                type="text"
                style={{ ...inputStyle, flex: 1, minWidth: '180px' }}
                placeholder="Descrizione (es. Termine risposta integrazione)"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                aria-label="Descrizione scadenza"
              />
              <input
                type="date"
                style={inputStyle}
                value={dataScadenza}
                onChange={(e) => setDataScadenza(e.target.value)}
                aria-label="Data scadenza"
              />
              <button type="submit" style={primaryButtonStyle} disabled={create.isPending}>
                {create.isPending ? 'Aggiunta…' : 'Aggiungi scadenza'}
              </button>
            </form>
          )}

          {formError && <p style={errorStyle}>{formError}</p>}
          {create.isError && <p style={errorStyle}>{ipcErrorMessage(create.error)}</p>}
          {update.isError && <p style={errorStyle}>{ipcErrorMessage(update.error)}</p>}
          {remove.isError && <p style={errorStyle}>{ipcErrorMessage(remove.error)}</p>}
        </>
      )}
    </section>
  )
}
