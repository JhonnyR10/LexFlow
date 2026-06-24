import { useEffect, useState } from 'react'
import { appApi } from '../api/app'
import { configApi } from '../api/config'
import type { PhaseListItem, TransitionListItem } from '../../shared/ipc'

function PlaceholderPage(): React.JSX.Element {
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>LexFlow</h1>
      {version && (
        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>v{version}</p>
      )}

      <div style={{ marginTop: '2rem', width: '100%', maxWidth: '520px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#444', marginBottom: '0.75rem' }}>
          Fasi workflow (da DB)
        </h2>

        {loading && <p style={{ color: '#888', fontSize: '0.9rem' }}>Caricamento…</p>}

        {!loading && error && (
          <p style={{ color: '#c00', fontSize: '0.9rem' }}>Errore: {error}</p>
        )}

        {!loading && !error && phases.length === 0 && (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Nessuna fase trovata.</p>
        )}

        {!loading && !error && phases.length > 0 && (
          <>
            <ol style={{ margin: 0, padding: '0 0 0 1.25rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              {phases.map((p) => (
                <li key={p.id} style={{ color: p.isFinal ? '#888' : '#222' }}>
                  {p.displayName}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                    [{p.category}
                    {p.isInitial ? ' · iniziale' : ''}
                    {p.isFinal ? ' · finale' : ''}]
                  </span>
                </li>
              ))}
            </ol>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#555' }}>
              {phases.length} fasi · {transitions.length} transizioni
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default PlaceholderPage
