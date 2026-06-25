import { useState } from 'react'
import { IconStamp } from '../components/ui/IconStamp'
import people from '../data/people.json'
import type { Person } from '../types'

const PEOPLE = people as Person[]

export function FamilyScreen() {
  const [selected, setSelected] = useState<Person | null>(null)

  if (selected) {
    return <PersonDetail person={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Familia Valcarce</p>
        <h1 style={{ fontSize: 28 }}>{PEOPLE.length} viajeros</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px' }}>
        {PEOPLE.map(person => (
          <button
            key={person.id}
            onClick={() => setSelected(person)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px',
              background: 'var(--color-surface)',
              border: 'var(--card-border)',
              borderRadius: 'var(--card-radius)',
              boxShadow: 'var(--card-shadow)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
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
            }}>
              {person.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)' }}>
                {person.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-soft)', marginTop: 1, fontFamily: 'var(--font-detail)' }}>
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
    </div>
  )
}

function PersonDetail({ person, onBack }: { person: Person; onBack: () => void }) {
  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-primary)', fontSize: 14, fontWeight: 500,
          marginBottom: 20, padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Todos los viajeros
        </button>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--stamp-radius)',
            background: 'var(--color-primary-10)',
            border: 'var(--stamp-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: 12,
          }}>
            {person.name.charAt(0)}
          </div>
          <h2 style={{ fontSize: 24 }}>{person.name}</h2>
          <div style={{
            marginTop: 6,
            padding: '3px 12px',
            borderRadius: 20,
            background: 'var(--color-primary-10)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-detail)',
          }}>
            {person.role}
          </div>
        </div>
      </div>

      {/* Document sections */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 4 }}>Sus documentos</p>

        {person.passport && (
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconStamp icon="passport" size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Pasaporte</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
                  Vence {person.passport.expiry} · válido
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: '#2d6a4f',
                background: '#d8f3dc',
                padding: '2px 8px',
                borderRadius: 8,
              }}>Listo</span>
            </div>
          </div>
        )}

        {person.insurance && (
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconStamp icon="shield" size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Seguro médico</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
                  {person.insurance}
                </div>
              </div>
            </div>
          </div>
        )}

        {person.emergencyContact && (
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconStamp icon="family" size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Contacto de emergencia</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
                  {person.emergencyContact}
                </div>
              </div>
            </div>
          </div>
        )}

        {person.flightOrigin && (
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconStamp icon="flight" size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Vuelo propio</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
                  {person.flightOrigin}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
