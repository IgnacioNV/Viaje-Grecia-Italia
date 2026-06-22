import itinerary from '../data/itinerary.json'
import type { Day } from '../types'

const DAYS = itinerary as Day[]

const DESTINATIONS = [
  { id: 'puglia',  label: 'Puglia',     emoji: '🫒', days: [1,2,3] },
  { id: 'cruise',  label: 'Crucero',    emoji: '⚓', days: [4,5,6] },
  { id: 'greece',  label: 'Grecia',     emoji: '🏛️', days: [7,8,9] },
]

export function MapScreen() {
  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Nuestro recorrido</p>
        <h1 style={{ fontSize: 28 }}>El viaje</h1>
      </div>

      {/* Journey timeline */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {DESTINATIONS.map((dest, i) => (
          <div key={dest.id} style={{ display: 'flex', gap: 16 }}>
            {/* Timeline line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 'var(--stamp-radius)',
                background: 'var(--color-primary-10)',
                border: 'var(--stamp-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {dest.emoji}
              </div>
              {i < DESTINATIONS.length - 1 && (
                <div style={{
                  width: 2, flex: 1, minHeight: 40,
                  background: 'var(--color-border)',
                  margin: '4px 0',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: i < DESTINATIONS.length - 1 ? 24 : 0, paddingTop: 10 }}>
              <h3 style={{ fontSize: 18, marginBottom: 4 }}>{dest.label}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
                Días {dest.days[0]}–{dest.days[dest.days.length - 1]}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {DAYS
                  .filter((_, idx) => dest.days.includes(idx + 1))
                  .map(day => (
                    <span key={day.id} style={{
                      fontSize: 11, padding: '2px 8px',
                      background: 'var(--color-surface)',
                      border: 'var(--card-border)',
                      borderRadius: 8,
                      color: 'var(--color-text-soft)',
                    }}>
                      {day.destination}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        margin: '0 16px',
        padding: '14px',
        background: 'var(--color-primary-10)',
        borderRadius: 12,
        fontSize: 12,
        color: 'var(--color-text-soft)',
        textAlign: 'center',
      }}>
        🗺️ Vista ilustrada del mapa — próximamente
      </div>
    </div>
  )
}
