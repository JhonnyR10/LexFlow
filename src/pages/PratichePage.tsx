import React, { useState } from 'react'
import { NuovaPraticaModal } from '../features/practices/NuovaPraticaModal'
import { PraticheTable } from '../features/practices/PraticheTable'

export function PratichePage(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [lastCreated, setLastCreated] = useState<{ id: number; codice: string } | null>(null)

  const handleCreated = (id: number, codiceIstanza: string): void => {
    setLastCreated({ id, codice: codiceIstanza })
    setModalOpen(false)
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          Pratiche
        </h1>
        <button
          style={{
            padding: '8px 18px', background: 'var(--color-accent)', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
          }}
          onClick={() => { setLastCreated(null); setModalOpen(true) }}
        >
          + Nuova pratica
        </button>
      </div>

      {lastCreated && (
        <div style={{
          padding: '12px 16px', background: 'var(--color-success-bg, #f0fdf4)',
          border: '1px solid var(--color-success-border, #86efac)',
          borderRadius: '8px', fontSize: '13px', color: 'var(--color-text)', marginBottom: '20px'
        }}>
          Pratica <strong>{lastCreated.codice}</strong> creata con successo.
        </div>
      )}

      <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '16px' }}>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per codice, nome, soggetti, autorità, note…"
          aria-label="Cerca pratiche"
          style={{
            width: '100%', padding: '8px 32px 8px 12px',
            background: 'var(--color-surface)', color: 'var(--color-text)',
            border: '1px solid var(--color-border)', borderRadius: '6px',
            fontSize: '13px', boxSizing: 'border-box',
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Azzera ricerca"
            style={{
              position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1, padding: '2px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      <PraticheTable searchTerm={search} />

      {modalOpen && (
        <NuovaPraticaModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
