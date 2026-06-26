import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '../ui/ErrorBoundary'

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden'
}

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  background: 'var(--color-bg)'
}

export function AppLayout(): React.JSX.Element {
  const location = useLocation()
  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={contentStyle}>
        {/* key=location.key: la boundary si rimonta ad ogni navigazione, azzerando l'errore */}
        <ErrorBoundary key={location.key}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
