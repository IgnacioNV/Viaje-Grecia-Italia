import { NavLink } from 'react-router-dom'
import { IconStamp } from './IconStamp'

const NAV_ITEMS = [
  { to: '/home',    label: 'Hoy',    icon: 'home'     as const },
  { to: '/family',  label: 'Family', icon: 'family'   as const },
  { to: '/docs',    label: 'Docs',   icon: 'document' as const },
  { to: '/journal', label: 'Diario', icon: 'journal'  as const },
  { to: '/map',     label: 'Mapa',   icon: 'map'      as const },
]

// Navbar height exported so screens can use it for bottom padding
export const NAVBAR_HEIGHT = 72

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
      alignItems: 'flex-start',
      paddingTop: 8,
      paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
      zIndex: 100,
      minHeight: NAVBAR_HEIGHT,
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
              gap: 4,
            }}>
              {/* Icon — bigger, no background container */}
              <IconStamp
                icon={icon}
                size={38}
                style={{
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  opacity: isActive ? 1 : 0.45,
                }}
              />

              {/* Label */}
              <span style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-detail)',
              }}>
                {label}
              </span>

              {/* Active bar — under the label */}
              <div style={{
                height: 2.5,
                width: 20,
                borderRadius: 2,
                background: isActive ? 'var(--color-accent)' : 'transparent',
                marginTop: 1,
              }} />
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
