import React, { useState } from 'react'
import { NuovaPraticaModal } from '../features/practices/NuovaPraticaModal'
import { PraticheTable } from '../features/practices/PraticheTable'

export function PratichePage(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false)
  const [lastCreated, setLastCreated] = useState<{ id: number; codice: string } | null>(null)

  const handleCreated = (id: number, codiceIstanza: string) => {
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

      <PraticheTable />

      {modalOpen && (
        <NuovaPraticaModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
