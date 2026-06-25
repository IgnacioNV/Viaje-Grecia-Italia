import { useState, useMemo } from 'react'
import itinerary from '../data/itinerary.json'
import seedDocs from '../data/documents.seed.json'
import { getDestinationInfo } from '../data/cultural'
import type { Day, Activity, SeedDocument } from '../types'

const DAYS = itinerary as Day[]
const DOCS = seedDocs as SeedDocument[]

function getMyActivities(day: Day, personId: string): Activity[] {
  return day.activities.filter(a =>
    a.scope === 'group' || (Array.isArray(a.scope) && a.scope.includes(personId))
  )
}
function getDocForActivity(actId: string) {
  return DOCS.find(d => d.linkedActivityId === actId)
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
function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

type TabType = 'today' | 'all'

interface HomeScreenProps { personId: string; personName: string }

export function HomeScreen({ personId, personName }: HomeScreenProps) {
  const todayIdx = useMemo(getTodayIndex, [])
  const [tab, setTab] = useState<TabType>('today')
  const [selectedIdx, setSelectedIdx] = useState(todayIdx)

  const displayDay = tab === 'today' ? DAYS[todayIdx] : DAYS[selectedIdx]

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-soft)', marginBottom: 4 }}>
          {getGreeting(personName)}
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 20 }}>Mi itinerario</h1>

        {/* Tabs: Hoy / Todo */}
        <div style={{
          display: 'flex', background: 'var(--color-primary-10)',
          borderRadius: 14, padding: 4, gap: 2, marginBottom: 16,
        }}>
          {([{ key: 'today', label: 'Hoy' }, { key: 'all', label: 'Todo el viaje' }] as { key: TabType; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setSelectedIdx(todayIdx) }} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10,
              border: 'none', fontSize: 13, cursor: 'pointer',
              fontWeight: tab === key ? 600 : 400, fontFamily: 'var(--font-body)',
              background: tab === key ? 'var(--color-surface)' : 'transparent',
              color: tab === key ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              transition: 'all 0.2s ease',
            }}>{label}</button>
          ))}
        </div>

        {/* Day strip — only for "Todo" */}
        {tab === 'all' && (
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            scrollbarWidth: 'none', margin: '0 -20px',
            padding: '0 20px 12px',
          }}>
            {DAYS.map((day, i) => {
              const isSelected = i === selectedIdx
              const d = new Date(day.date + 'T12:00:00')
              return (
                <button key={day.id} onClick={() => setSelectedIdx(i)} style={{
                  flexShrink: 0, width: 54, padding: '8px 4px', borderRadius: 12,
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-detail)',
                  }}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: isSelected ? '#fff' : 'var(--color-text)' }}>
                    {d.getDate()}
                  </span>
                  <span style={{
                    fontSize: 8, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-detail)',
                  }}>{day.destination.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Day content */}
      <DayContent
        day={displayDay}
        personId={personId}
        dayNumber={DAYS.indexOf(displayDay) + 1}
      />
    </div>
  )
}

/* ── Day Content ────────────────────────────────────────── */
function DayContent({ day, personId, dayNumber }: { day: Day; personId: string; dayNumber: number }) {
  const activities = getMyActivities(day, personId)
  const info = getDestinationInfo(day.destination)
  const [expandedFact, setExpandedFact] = useState<number | null>(null)

  return (
    <div>
      {/* Destination hero image */}
      {info?.image && (
        <div style={{ position: 'relative', margin: '16px 20px 0', borderRadius: 20, overflow: 'hidden', height: 180 }}>
          <img
            src={info.image}
            alt={day.destination}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
          }}/>
          {/* Day badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'var(--color-primary)', color: '#fff',
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
          }}>{dayNumber}</div>
          {/* Destination label */}
          <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
              {day.destination}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'var(--font-detail)', marginTop: 2 }}>
              {formatDate(day.date)} · {day.country}
            </div>
          </div>
          {day.phase === 'individual' && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'var(--phase-bg)', color: 'var(--phase-color)',
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 8,
            }}>Fase individual</div>
          )}
        </div>
      )}

      {/* Without image fallback */}
      {!info?.image && (
        <div style={{ padding: '12px 20px 0', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--color-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, flexShrink: 0,
          }}>{dayNumber}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, textTransform: 'capitalize' }}>{formatDate(day.date)}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>
              {day.destination} · {day.country}
            </div>
          </div>
        </div>
      )}

      {/* Activities */}
      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activities.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No hay actividades para vos este día.
            </p>
          : activities.map(a => <ActivityCard key={a.id} activity={a} />)
        }
      </div>

      {/* Cultural facts */}
      {info?.facts && info.facts.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Cultura e historia</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.facts.map((fact, i) => (
              <div key={i}
                onClick={() => setExpandedFact(expandedFact === i ? null : i)}
                style={{
                  background: 'var(--color-surface)', borderRadius: 14,
                  border: 'var(--card-border)', padding: '12px 14px', cursor: 'pointer',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-primary)' }}>
                    {fact.title}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round"
                    style={{ transform: expandedFact === i ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                {expandedFact === i && (
                  <p style={{
                    marginTop: 8, fontSize: 13, lineHeight: 1.6,
                    color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)',
                  }}>{fact.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Activity Card ──────────────────────────────────────── */
function ActivityCard({ activity }: { activity: Activity }) {
  const doc = getDocForActivity(activity.id)
  const notes = (activity as Activity & { notes?: string }).notes

  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: 16, padding: '14px 16px',
      border: 'var(--card-border)', boxShadow: 'var(--card-shadow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', flex: 1, lineHeight: 1.3 }}>
          {activity.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 20,
          background: 'var(--color-primary-10)', flexShrink: 0,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-detail)' }}>
            {activity.time}
          </span>
        </div>
      </div>

      {activity.location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>
            {activity.location}
          </span>
        </div>
      )}

      {notes && (
        <p style={{
          marginTop: 10, fontSize: 13, lineHeight: 1.55,
          color: 'var(--color-accent)', fontStyle: 'italic', fontFamily: 'var(--font-detail)',
        }}>{notes}</p>
      )}

      {doc && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          marginTop: 10, padding: '4px 10px', borderRadius: 20,
          border: '1px solid var(--color-primary-20)',
          background: 'var(--color-primary-10)',
          fontSize: 11, fontWeight: 500, color: 'var(--color-primary)',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          {doc.title}
        </div>
      )}
    </div>
  )
}
