import people from '../data/people.json'
import type { Person } from '../types'

interface WelcomeScreenProps {
  onSelect: (id: string) => void
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 24px 32px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Bari · Crucero · Grecia · Julio 2026</p>
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: 12, whiteSpace: 'nowrap' }}>
          ¿Quién sos?
        </h1>
        <p style={{ color: 'var(--color-text-soft)', fontSize: 15, lineHeight: 1.5 }}>
          Tocá tu nombre para empezar.
        </p>
      </div>

      {/* Person list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(people as Person[]).map((person) => (
          <button
            key={person.id}
            onClick={() => onSelect(person.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              background: 'var(--color-surface)',
              border: 'var(--card-border)',
              borderRadius: 'var(--card-radius)',
              boxShadow: 'var(--card-shadow)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'transform 0.12s ease, background 0.15s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* Avatar */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--stamp-radius)',
              background: 'var(--color-primary-10)',
              border: 'var(--stamp-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-primary)',
              flexShrink: 0,
              fontFamily: 'var(--font-display)',
              transition: 'border-radius 0.4s ease',
            }}>
              {person.name.charAt(0)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)' }}>
                {person.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-soft)', marginTop: 1 }}>
                {person.role}
              </div>
            </div>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        marginTop: 'auto',
        paddingTop: 32,
        fontSize: 11,
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        Viaje Europa · Familia Valcarce
      </p>
    </div>
  )
}
