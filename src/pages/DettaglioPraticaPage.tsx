import React from 'react'
import { useParams, Link } from 'react-router-dom'

export function DettaglioPraticaPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/pratiche"
          style={{ fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          ← Torna alle pratiche
        </Link>
      </div>
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 24px' }}>
        Pratica #{id}
      </h1>
      <div style={{
        padding: '48px', textAlign: 'center',
        color: 'var(--color-text-muted)', fontSize: '14px',
        border: '2px dashed var(--color-border)', borderRadius: '10px',
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Dettaglio pratica</p>
        <p style={{ margin: 0 }}>Disponibile in S5.1 — Workflow operativo.</p>
      </div>
    </div>
  )
}
