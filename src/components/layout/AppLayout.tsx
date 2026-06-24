import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

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
  return (
    <div style={layoutStyle}>
      <Sidebar />
      <main style={contentStyle}>
        <Outlet />
      </main>
    </div>
  )
}
