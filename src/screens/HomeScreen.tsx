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

  const visibleDays = useMemo(() => {
    if (tab === 'today') return [DAYS[todayIdx]]
    if (tab === 'week') return DAYS.slice(todayIdx, todayIdx + 7)
    return DAYS
  }, [tab, todayIdx])

  return (
    <div className="screen">
      {/* ── Header ─────────────────────────── */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{
          fontSize: 13, fontWeight: 500,
          color: 'var(--color-text-soft)', marginBottom: 4,
        }}>
          {getGreeting(personName)}
        </p>
        <h1 style={{
          fontSize: 30, fontWeight: 700,
          fontFamily: 'var(--font-display)',
          marginBottom: 20,
        }}>
          Mi itinerario
        </h1>

        {/* Segmented control */}
        <div style={{
          display: 'flex',
          background: 'var(--color-primary-10)',
          borderRadius: 14,
          padding: 4,
          gap: 2,
          marginBottom: 8,
        }}>
          {([
            { key: 'today', label: 'Hoy' },
            { key: 'week',  label: 'Esta semana' },
            { key: 'all',   label: 'Todo' },
          ] as { key: TabType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 10,
                border: 'none',
                fontSize: 13,
                fontWeight: tab === key ? 600 : 400,
                cursor: 'pointer',
                background: tab === key ? 'var(--color-surface)' : 'transparent',
                color: tab === key ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day list ───────────────────────── */}
      <div style={{ padding: '12px 20px 0' }}>
        {visibleDays.map((day, i) => (
          <DaySection
            key={day.id}
            day={day}
            dayNumber={DAYS.indexOf(day) + 1}
            personId={personId}
            isLast={i === visibleDays.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Day Section ────────────────────────────────────────── */
function DaySection({ day, dayNumber, personId, isLast }: {
  day: Day; dayNumber: number; personId: string; isLast: boolean
}) {
  const activities = getMyActivities(day, personId)
  if (activities.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: isLast ? 0 : 8 }}>
      {/* Left: circle + timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
        {/* Day circle */}
        <div style={{
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
          flexShrink: 0,
          fontFamily: 'var(--font-display)',
        }}>
          {dayNumber}
        </div>
        {/* Dashed line */}
        {!isLast && (
          <div style={{
            flex: 1,
            width: 2,
            marginTop: 6,
            marginBottom: 6,
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              var(--color-primary) 0px,
              var(--color-primary) 4px,
              transparent 4px,
              transparent 10px
            )`,
            opacity: 0.25,
            minHeight: 24,
          }} />
        )}
      </div>

      {/* Right: date + activities */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        {/* Date header */}
        <div style={{ marginBottom: 12, paddingTop: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)', textTransform: 'capitalize' }}>
            {formatDate(day.date)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--color-text-soft)' }}>
              {day.destination}
            </span>
            {day.phase === 'individual' && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: '1px 6px', borderRadius: 6,
                background: 'var(--phase-bg)', color: 'var(--phase-color)',
                marginLeft: 4,
              }}>Fase individual</span>
            )}
          </div>
        </div>

        {/* Activity cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Activity Card ──────────────────────────────────────── */
function ActivityCard({ activity }: { activity: Activity }) {
  const doc = getDocForActivity(activity.id)

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* Timeline dot */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 18,
        width: 0,
        marginLeft: -28,
        marginRight: 16,
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          border: '2px solid var(--color-surface)',
          boxShadow: '0 0 0 1.5px var(--color-accent)',
          flexShrink: 0,
        }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: 'var(--color-surface)',
        borderRadius: 16,
        padding: '14px 16px',
        border: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        transition: 'transform 0.12s ease',
        cursor: 'pointer',
      }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {/* Title row + time badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            fontWeight: 700, fontSize: 15,
            color: 'var(--color-text)',
            flex: 1, lineHeight: 1.3,
          }}>
            {activity.title}
          </div>

          {/* Time badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            background: 'var(--color-primary-10)',
            flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)' }}>
              {activity.time}
            </span>
          </div>
        </div>

        {/* Location */}
        {activity.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span style={{ fontSize: 12, color: 'var(--color-text-soft)' }}>
              {activity.location}
            </span>
          </div>
        )}

        {/* Doc chip */}
        {doc && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            marginTop: 10, padding: '4px 10px',
            borderRadius: 20,
            border: '1px solid var(--color-primary-20)',
            background: 'var(--color-primary-10)',
            fontSize: 11, fontWeight: 500,
            color: 'var(--color-primary)',
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
    </div>
  )
}
