import { useEffect, useState } from 'react'
import { appApi } from '../api/app'

function PlaceholderPage(): React.JSX.Element {
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    appApi.getVersion().then(setVersion).catch(console.error)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>LexFlow</h1>
      {version && (
        <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>v{version}</p>
      )}
    </div>
  )
}

export default PlaceholderPage
