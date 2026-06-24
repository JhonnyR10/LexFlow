import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pratiche', label: 'Pratiche' },
  { to: '/report', label: 'Report' },
  { to: '/impostazioni-istanze', label: 'Impostazioni istanze' },
  { to: '/impostazioni-app', label: 'Impostazioni app' },
  { to: '/cestino', label: 'Cestino' }
]

const sidebarStyle: React.CSSProperties = {
  width: 'var(--sidebar-width)',
  minWidth: 'var(--sidebar-width)',
  height: '100%',
  background: 'var(--sidebar-bg)',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid var(--sidebar-border)',
  overflow: 'hidden'
}

const logoStyle: React.CSSProperties = {
  padding: '20px 16px 16px',
  borderBottom: '1px solid var(--sidebar-border)'
}

const logoTextStyle: React.CSSProperties = {
  fontSize: '17px',
  fontWeight: 700,
  color: '#f8fafc',
  letterSpacing: '-0.3px'
}

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 0',
  overflowY: 'auto'
}

const bottomStyle: React.CSSProperties = {
  padding: '12px 0',
  borderTop: '1px solid var(--sidebar-border)'
}

function linkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'
}

export function Sidebar(): React.JSX.Element {
  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <span style={logoTextStyle}>LexFlow</span>
      </div>

      <nav style={navStyle}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClassName} end={item.to === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={bottomStyle}>
        <NavLink to="/dev/ipc" className={linkClassName} style={{ fontSize: '12px', opacity: 0.6 }}>
          Diagnostica IPC
        </NavLink>
      </div>

      <style>{`
        .sidebar-link {
          display: block;
          padding: 9px 16px;
          color: var(--sidebar-text);
          text-decoration: none;
          font-size: 13.5px;
          border-left: 2px solid transparent;
          transition: background 0.1s, color 0.1s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-link:hover {
          background: var(--sidebar-item-hover);
          color: var(--sidebar-text-active);
        }
        .sidebar-link--active {
          background: var(--sidebar-item-active);
          color: var(--sidebar-text-active);
          border-left-color: var(--color-accent);
          font-weight: 500;
        }
      `}</style>
    </aside>
  )
}
