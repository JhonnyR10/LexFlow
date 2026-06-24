import { useEffect, useState } from 'react'
import { appApi } from '../api/app'
import { configApi } from '../api/config'
import type { PhaseListItem, TransitionListItem } from '../../shared/ipc'

const wrapStyle: React.CSSProperties = {
  padding: '32px 36px',
  fontFamily: 'system-ui, sans-serif',
  maxWidth: '600px'
}

export function IpcDemoPage(): React.JSX.Element {
  const [version, setVersion] = useState<string>('')
  const [phases, setPhases] = useState<PhaseListItem[]>([])
  const [transitions, setTransitions] = useState<TransitionListItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    appApi.getVersion().then(setVersion).catch(console.error)

    Promise.all([configApi.listPhases(), configApi.listTransitions()])
      .then(([phasesData, transitionsData]) => {
        setPhases(phasesData)
        setTransitions(transitionsData)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        setLoading(false)
      })
  }, [])

  return (
    <div style={wrapStyle}>
      <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Diagnostica IPC</h1>
      {version && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '20px' }}>
          v{version}
        </p>
      )}

      <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
        Fasi workflow (solo attive, da DB)
      </h2>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Caricamento…</p>}

      {!loading && error && (
        <p style={{ color: 'var(--color-error)' }}>Errore: {error}</p>
      )}

      {!loading && !error && phases.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>Nessuna fase trovata.</p>
      )}

      {!loading && !error && phases.length > 0 && (
        <>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '13px', lineHeight: '1.8' }}>
            {phases.map((p) => (
              <li key={p.id} style={{ color: p.isFinal ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                {p.displayName}
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  [{p.category}
                  {p.isInitial ? ' · iniziale' : ''}
                  {p.isFinal ? ' · finale' : ''}]
                </span>
              </li>
            ))}
          </ol>
          <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {phases.length} fasi attive · {transitions.length} transizioni
          </p>
        </>
      )}
    </div>
  )
}
