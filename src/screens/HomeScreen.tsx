import { useState, useMemo } from 'react'
import itinerary from '../data/itinerary.json'
import seedDocs from '../data/documents.seed.json'
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
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

type TabType = 'today' | 'week' | 'all'

interface HomeScreenProps {
  personId: string
  personName: string
}

export function HomeScreen({ personId, personName }: HomeScreenProps) {
  const todayIdx = useMemo(getTodayIndex, [])
  const [tab, setTab] = useState<TabType>('today')
  const [selectedIdx, setSelectedIdx] = useState(todayIdx)

  const visibleDays = useMemo(() => {
    if (tab === 'week') return DAYS.slice(todayIdx, todayIdx + 7)
    if (tab === 'all')  return DAYS
    return [DAYS[todayIdx]]
  }, [tab, todayIdx])

  // For week/all: which day is selected in the day strip
  const stripSelectedIdx = tab === 'today' ? todayIdx : selectedIdx
  const displayDay = tab === 'today' ? DAYS[todayIdx] : DAYS[stripSelectedIdx]

  return (
    <div className="screen">
      {/* ── Header ─────────────────────────── */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-soft)', marginBottom: 4 }}>
          {getGreeting(personName)}
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 20 }}>
          Mi itinerario
        </h1>

        {/* Segmented control */}
        <div style={{
          display: 'flex',
          background: 'var(--color-primary-10)',
          borderRadius: 14,
          padding: 4,
          gap: 2,
          marginBottom: 16,
        }}>
          {([
            { key: 'today', label: 'Hoy' },
            { key: 'week',  label: 'Esta semana' },
            { key: 'all',   label: 'Todo' },
          ] as { key: TabType; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setSelectedIdx(todayIdx) }} style={{
              flex: 1, padding: '8px 4px', borderRadius: 10,
              border: 'none', fontSize: 13, cursor: 'pointer',
              fontWeight: tab === key ? 600 : 400,
              fontFamily: 'var(--font-body)',
              background: tab === key ? 'var(--color-surface)' : 'transparent',
              color: tab === key ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              transition: 'all 0.2s ease',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Day strip — only for week/all */}
        {tab !== 'today' && (
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 12, scrollbarWidth: 'none',
            margin: '0 -20px', padding: '0 20px 12px',
          }}>
            {visibleDays.map((day) => {
              const i = DAYS.indexOf(day)
              const isSelected = i === stripSelectedIdx
              const d = new Date(day.date + 'T12:00:00')
              return (
                <button key={day.id} onClick={() => setSelectedIdx(i)} style={{
                  flexShrink: 0, width: 54, padding: '8px 4px',
                  borderRadius: 12,
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-detail)',
                  }}>
                    {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </span>
                  <span style={{
                    fontSize: 17, fontWeight: 700,
                    color: isSelected ? '#fff' : 'var(--color-text)',
                  }}>
                    {d.getDate()}
                  </span>
                  <span style={{
                    fontSize: 8, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-detail)',
                  }}>
                    {day.destination.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Selected day content ─────────────── */}
      <div style={{ padding: '0 20px' }}>
        <DayContent day={displayDay} personId={personId} dayNumber={DAYS.indexOf(displayDay) + 1} />
      </div>
    </div>
  )
}

/* ── Day Content ────────────────────────────────────────── */
function DayContent({ day, personId, dayNumber }: { day: Day; personId: string; dayNumber: number }) {
  const activities = getMyActivities(day, personId)

  return (
    <div>
      {/* Day header */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, paddingTop: 4 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, flexShrink: 0,
        }}>
          {dayNumber}
        </div>
        <div style={{ paddingTop: 4 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)', textTransform: 'capitalize' }}>
            {formatDate(day.date)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--color-accent)', fontFamily: 'var(--font-detail)' }}>
              {day.destination}
            </span>
            {day.phase === 'individual' && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 6,
                background: 'var(--phase-bg)', color: 'var(--phase-color)', marginLeft: 4,
              }}>Fase individual</span>
            )}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {activities.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
            No hay actividades para vos este día.
          </p>
        ) : (
          activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  )
}

/* ── Activity Card ──────────────────────────────────────── */
function ActivityCard({ activity }: { activity: Activity }) {
  const doc = getDocForActivity(activity.id)
  const notes = (activity as Activity & { notes?: string }).notes

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 16, padding: '14px 16px',
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
          color: 'var(--color-accent)', fontStyle: 'italic',
          fontFamily: 'var(--font-detail)',
        }}>
          {notes}
        </p>
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
