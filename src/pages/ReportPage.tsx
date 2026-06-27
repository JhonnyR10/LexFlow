import React from 'react'
import { Link } from 'react-router-dom'

const wrapperStyle: React.CSSProperties = {
  padding: '32px 36px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '12px',
}

const bodyStyle: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontSize: '14px',
  lineHeight: 1.6,
  maxWidth: '560px',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  fontWeight: 500,
  textDecoration: 'none',
}

export function ReportPage(): React.JSX.Element {
  return (
    <div style={wrapperStyle}>
      <h1 style={titleStyle}>Report</h1>
      <p style={bodyStyle}>
        L&apos;esportazione delle pratiche è disponibile in{' '}
        <Link to="/pratiche" style={linkStyle}>Pratiche</Link> tramite il pulsante
        «Esporta CSV»: il file rispetta i filtri e la ricerca attivi ed esclude le pratiche nel cestino.
      </p>
      <p style={{ ...bodyStyle, marginTop: '12px' }}>
        I riepiloghi aggregati (per stato, collaboratore, professionista, importi e documenti) saranno
        aggiunti in una versione successiva.
      </p>
    </div>
  )
}
