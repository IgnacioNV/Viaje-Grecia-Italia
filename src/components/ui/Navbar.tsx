import { NavLink } from 'react-router-dom'
import { IconStamp } from './IconStamp'

const NAV_ITEMS = [
  { to: '/home',   label: 'Hoy',    icon: 'home'     as const },
  { to: '/family', label: 'Family', icon: 'family'   as const },
  { to: '/docs',   label: 'Docs',   icon: 'document' as const },
  { to: '/journal',label: 'Diario', icon: 'journal'  as const },
  { to: '/map',    label: 'Mapa',   icon: 'map'      as const },
]

export function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'var(--color-surface)',
      borderTop: '0.5px solid var(--color-border)',
      display: 'flex',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          style={{ flex: 1, textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}>
              <IconStamp
                icon={icon}
                size={32}
                style={isActive ? {
                  background: 'var(--nav-active-bg)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: 'none',
                } : {
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  color: 'var(--color-text-muted)',
                  opacity: 0.5,
                }}
              />
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-detail)',
              }}>
                {label}
              </span>
              {isActive && (
                <div style={{
                  width: 18,
                  height: 2.5,
                  borderRadius: 2,
                  background: 'var(--color-accent)',
                  marginTop: -1,
                }} />
              )}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
