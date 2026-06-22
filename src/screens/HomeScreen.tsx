import { useState, useMemo } from 'react'
import { IconStamp } from '../components/ui/IconStamp'
import itinerary from '../data/itinerary.json'
import seedDocs from '../data/documents.seed.json'
import type { Day, Activity, SeedDocument } from '../types'

const DAYS = itinerary as Day[]
const DOCS = seedDocs as SeedDocument[]

const PERIOD_LABELS: Record<string, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  night: 'Noche',
}

function getMyActivities(day: Day, personId: string): Activity[] {
  return day.activities.filter(a =>
    a.scope === 'group' || (Array.isArray(a.scope) && a.scope.includes(personId))
  )
}

function getDocForActivity(activityId: string) {
  return DOCS.find(d => d.linkedActivityId === activityId)
}

function getTodayIndex(): number {
  const today = new Date().toISOString().split('T')[0]
  const idx = DAYS.findIndex(d => d.date === today)
  return idx >= 0 ? idx : 0
}

function getGreeting(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Buenos días, ${name}`
  if (h < 20) return `Buenas tardes, ${name}`
  return `Buenas noches, ${name}`
}

interface HomeScreenProps {
  personId: string
  personName: string
}

export function HomeScreen({ personId, personName }: HomeScreenProps) {
  const todayIdx = useMemo(getTodayIndex, [])
  const [selectedIdx, setSelectedIdx] = useState(todayIdx)
  const [view, setView] = useState<'day' | 'week'>('day')

  const day = DAYS[selectedIdx]
  const myActivities = useMemo(
    () => getMyActivities(day, personId),
    [day, personId]
  )

  const grouped = useMemo(() => {
    const g: Record<string, Activity[]> = {}
    for (const a of myActivities) {
      if (!g[a.period]) g[a.period] = []
      g[a.period].push(a)
    }
    return g
  }, [myActivities])

  return (
    <div className="screen">
      {/* ── Header ─────────────────────────────── */}
      <div style={{ padding: '20px 20px 0' }}>
        {/* Person badge + toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="person-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Viendo como {personName}
          </div>

          {/* Day / Week toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--color-primary-10)',
            borderRadius: 20,
            padding: 2,
            gap: 2,
          }}>
            {(['day', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '4px 12px',
                borderRadius: 18,
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: view === v ? 'var(--color-primary)' : 'transparent',
                color: view === v ? '#fff' : 'var(--color-text-soft)',
                transition: 'all 0.2s ease',
              }}>
                {v === 'day' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
        </div>

        {/* Greeting */}
        <p className="eyebrow" style={{ marginBottom: 4 }}>{getGreeting(personName)}</p>
        <h1 style={{ fontSize: 28 }}>
          Día {selectedIdx + 1} · {day.destination}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-soft)', marginTop: 3 }}>
          {new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', {
            day: 'numeric', month: 'long'
          })} · {day.country}
        </p>

        {/* Individual phase warning */}
        {day.phase === 'individual' && (
          <div className="phase-badge">
            ⚠️ Fase individual — el grupo aún no se ha encontrado
          </div>
        )}
      </div>

      {view === 'week' ? (
        <WeekView
          days={DAYS}
          selectedIdx={selectedIdx}
          todayIdx={todayIdx}
          onSelect={setSelectedIdx}
        />
      ) : (
        <DayView grouped={grouped} />
      )}
    </div>
  )
}

/* ── Day View ──────────────────────────────────────────── */
function DayView({ grouped }: { grouped: Record<string, Activity[]> }) {
  const periods = ['morning', 'afternoon', 'night'].filter(p => grouped[p]?.length)

  if (periods.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p style={{ fontSize: 15 }}>No hay actividades para vos hoy.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {periods.map(period => (
        <div key={period}>
          <div className="period-header">{PERIOD_LABELS[period]}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
            {grouped[period].map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Activity Card ─────────────────────────────────────── */
function ActivityCard({ activity }: { activity: Activity }) {
  const doc = getDocForActivity(activity.id)

  const iconName = (): 'plane' | 'restaurant' | 'ticket' | 'reservation' | 'location' | 'home' => {
    if (activity.id.includes('vuelo') || activity.title.toLowerCase().includes('vuelo')) return 'plane'
    if (activity.title.toLowerCase().includes('almuerzo') || activity.title.toLowerCase().includes('cena') || activity.title.toLowerCase().includes('desayuno')) return 'restaurant'
    if (doc?.type === 'ticket') return 'ticket'
    if (doc?.type === 'reservation') return 'reservation'
    return 'location'
  }

  return (
    <div className="card card--activity">
      <IconStamp icon={iconName()} size={38} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)', marginBottom: 2 }}>
          {activity.title}
        </div>
        {activity.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
              {activity.location}
            </span>
          </div>
        )}
        {doc && (
          <div className="doc-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            {doc.title}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>
        {activity.time}
      </div>
    </div>
  )
}

/* ── Week View ─────────────────────────────────────────── */
interface WeekViewProps {
  days: Day[]
  selectedIdx: number
  todayIdx: number
  onSelect: (i: number) => void
}

function WeekView({ days, selectedIdx, todayIdx, onSelect }: WeekViewProps) {
  return (
    <div style={{ padding: '16px 0' }}>
      {/* Day strip */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 8,
        padding: '0 16px 16px',
        scrollbarWidth: 'none',
      }}>
        {days.map((day, i) => {
          const isSelected = i === selectedIdx
          const isToday = i === todayIdx
          const d = new Date(day.date + 'T12:00:00')
          return (
            <button key={day.id} onClick={() => onSelect(i)} style={{
              flexShrink: 0,
              width: 52,
              padding: '8px 4px',
              borderRadius: 12,
              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}>
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                textTransform: 'uppercase',
              }}>
                {d.toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span style={{
                fontSize: 16,
                fontWeight: 700,
                color: isSelected ? '#fff' : 'var(--color-text)',
              }}>
                {d.getDate()}
              </span>
              {isToday && (
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: isSelected ? 'var(--color-accent)' : 'var(--color-primary)',
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Day summaries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
        {days.map((day, i) => (
          <button key={day.id} onClick={() => { onSelect(i) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: selectedIdx === i ? 'var(--color-primary-10)' : 'var(--color-surface)',
              border: selectedIdx === i ? '1.5px solid var(--color-primary)' : 'var(--card-border)',
              borderRadius: 'var(--card-radius)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}>
            <div style={{
              fontWeight: 700, fontSize: 13,
              color: 'var(--color-primary)',
              minWidth: 28,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
                {day.destination}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-soft)', marginTop: 1 }}>
                {day.activities.length} actividades · {day.country}
              </div>
            </div>
            <div style={{
              fontSize: 9, fontWeight: 600,
              padding: '2px 7px', borderRadius: 8,
              background: 'var(--color-primary-10)',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
            }}>
              {day.theme}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
