import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CopyButton, StaticFilePreview } from '../components/ui/FilePreview'
import itinerary from '../data/itinerary.json'
import seedDocs from '../data/documents.seed.json'
import { getDestinationInfo } from '../data/cultural'
import { db } from '../db/dexie'
import type { Day, Activity, SeedDocument, Passport } from '../types'

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

type TabType = 'today' | 'all'

interface HomeScreenProps { personId: string; personName: string }

export function HomeScreen({ personId, personName }: HomeScreenProps) {
  const todayIdx = useMemo(getTodayIndex, [])
  const [tab, setTab] = useState<TabType>('today')
  const [selectedIdx, setSelectedIdx] = useState(todayIdx)
  const [showProfile, setShowProfile] = useState(false)

  const homeProfile = useLiveQuery(
    () => db.personalProfiles.where('personId').equals(personId).first(),
    [personId]
  )

  const displayDay = tab === 'today' ? DAYS[todayIdx] : DAYS[selectedIdx]
  const initials = personName.slice(0, 2).toUpperCase()

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        {/* Top row: greeting + avatar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-soft)' }}>
            {getGreeting(personName)}
          </p>
          <button onClick={() => setShowProfile(true)} style={{
            width: 36, height: 36, borderRadius: '50%',
            border: 'none', cursor: 'pointer', flexShrink: 0,
            overflow: 'hidden', padding: 0,
            background: 'var(--color-primary)',
          }}>
            {homeProfile?.facePhoto
              ? <img src={homeProfile.facePhoto} alt={personName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>{initials}</span>
            }
          </button>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>Mi itinerario</h1>

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

      {/* Profile sheet */}
      {showProfile && (
        <ProfileSheet personId={personId} personName={personName} onClose={() => setShowProfile(false)} />
      )}
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
      {/* Destination hero */}
      <div style={{
        position: 'relative', margin: '16px 20px 0',
        borderRadius: 20, overflow: 'hidden', height: 220,
        background: 'var(--color-primary-10)',
      }}>
        {info?.image && (
          <img src={info.image} alt={day.destination}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            loading="lazy" />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }}/>
        {/* Day pill */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 20, padding: '4px 12px',
          fontSize: 11, fontWeight: 700, color: '#fff',
          letterSpacing: '0.08em', fontFamily: 'var(--font-body)',
        }}>DÍA {dayNumber}</div>
        {day.phase === 'individual' && (
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: 'var(--phase-bg)', color: 'var(--phase-color)',
            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 8,
          }}>Fase individual</div>
        )}
        {/* Big editorial destination name */}
        <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18 }}>
          <div style={{
            fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.05,
            fontFamily: 'var(--font-display)',
            textShadow: '0 2px 16px rgba(0,0,0,0.25)',
          }}>{day.destination}</div>
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.72)',
            marginTop: 5, fontFamily: 'var(--font-detail)',
          }}>
            {new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {day.country}
          </div>
        </div>
      </div>

      {/* Activities grouped by period */}
      <div style={{ padding: '16px 20px 0' }}>
        {activities.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-detail)' }}>
              No hay actividades para vos este día.
            </p>
          : <PeriodGroups activities={activities} />
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

const PERIOD_LABELS: Record<string, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  night:     'Noche',
}

function PeriodGroups({ activities }: { activities: Activity[] }) {
  const periods = ['morning', 'afternoon', 'night']
  const grouped: Record<string, Activity[]> = {}
  for (const a of activities) {
    if (!grouped[a.period]) grouped[a.period] = []
    grouped[a.period].push(a)
  }

  return (
    <div>
      {periods.filter(p => grouped[p]?.length).map(period => (
        <div key={period} style={{ marginBottom: 8 }}>
          <div style={{
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            paddingBottom: 6,
            marginBottom: 0,
          }}>
            {PERIOD_LABELS[period]}
          </div>
          {grouped[period].map(a => <ActivityCard key={a.id} activity={a} />)}
        </div>
      ))}
    </div>
  )
}

/* ── Activity Card ──────────────────────────────────────── */
function ActivityCard({ activity }: { activity: Activity }) {
  const doc = getDocForActivity(activity.id)
  const notes = activity.notes
  const [staticPreview, setStaticPreview] = useState<{ path: string; title: string } | null>(null)

  return (
    <>
      <div style={{
        display: 'flex',
        gap: 14,
        paddingTop: 16,
        paddingBottom: 18,
        borderBottom: '1px solid var(--color-primary-10)',
      }}>
        {/* Time column */}
        <div style={{
          flexShrink: 0,
          paddingTop: 2,
          minWidth: 42,
          textAlign: 'right',
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-detail)',
            opacity: 0.7,
          }}>
            {activity.time}
          </span>
        </div>

        {/* Dot */}
        <div style={{ flexShrink: 0, paddingTop: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--color-accent)',
            boxShadow: '0 0 0 2px var(--color-bg)',
          }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--color-text)',
            lineHeight: 1.3,
            marginBottom: activity.location ? 4 : 0,
          }}>
            {activity.title}
          </div>

          {activity.location && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12,
              color: 'var(--color-text-soft)',
              fontFamily: 'var(--font-detail)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {activity.location}
            </div>
          )}

          {notes && (
            <p style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: 1.55,
              color: 'var(--color-text-soft)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-detail)',
            }}>
              {notes}
            </p>
          )}

          {doc && (
            <button
              onClick={() => setStaticPreview({ path: doc.file, title: doc.title })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginTop: 8, padding: '4px 10px', borderRadius: 20,
                border: '1px solid var(--color-primary-20)',
                background: 'var(--color-primary-10)',
                fontSize: 11, fontWeight: 500, color: 'var(--color-primary)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {doc.title}
            </button>
          )}
        </div>
      </div>

      {staticPreview && (
        <StaticFilePreview
          filePath={staticPreview.path}
          title={staticPreview.title}
          onClose={() => setStaticPreview(null)}
        />
      )}
    </>
  )
}

/* ── Profile Sheet ──────────────────────────────────────── */
function ProfileSheet({ personId, personName, onClose }: {
  personId: string; personName: string; onClose: () => void
}) {
  const profile = useLiveQuery(
    () => db.personalProfiles.where('personId').equals(personId).first(),
    [personId]
  )
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <ProfileEditor personId={personId} profile={profile ?? null} onDone={() => setEditing(false)} onClose={onClose} />
  }

  const initials = personName.slice(0, 2).toUpperCase()

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
      <div
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          background: 'var(--color-surface)',
          borderRadius: '20px 20px 0 0',
          padding: '0 20px max(24px, env(safe-area-inset-bottom))',
          zIndex: 201, maxHeight: '88dvh', overflowY: 'auto',
        }}
      >
        {/* Drag handle — tap or swipe down to close */}
        <div
          onClick={onClose}
          style={{ padding: '14px 0 6px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          {profile?.facePhoto ? (
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img src={profile.facePhoto} alt={personName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, flexShrink: 0,
            }}>{initials}</div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, marginBottom: 2 }}>{personName}</h2>
            <p style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>
              {profile ? 'Perfil completado' : 'Perfil sin completar'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={{
              padding: '7px 14px', borderRadius: 20,
              border: '1.5px solid var(--color-primary)',
              background: 'transparent', color: 'var(--color-primary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>Editar</button>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--color-primary-10)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-text-soft)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Passports */}
        {profile?.passports && profile.passports.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Pasaportes ({profile.passports.length})</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.passports.map((p: Passport) => (
                <div key={p.id} style={{
                  padding: '12px 14px', background: 'var(--color-bg)',
                  borderRadius: 12, border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.country || 'País no especificado'}</div>
                  {p.number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>N° {p.number}</span>
                      <CopyButton text={p.number} label="Copiar" />
                    </div>
                  )}
                  {p.expiry && <div style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>Vence: {p.expiry}</div>}
                  {p.photoFront && (
                    <img src={p.photoFront} alt="Pasaporte" style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 120, objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insurance */}
        {profile?.insuranceFile && (
          <div style={{ marginBottom: 16 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Seguro médico</p>
            <div style={{ padding: '12px 14px', background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <img src={profile.insuranceFile} alt="Seguro" style={{ width: '100%', borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} />
            </div>
          </div>
        )}

        {/* Phones */}
        {(profile?.phoneNumber || profile?.emergencyPhone) && (
          <div style={{ marginBottom: 8 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Teléfonos</p>
            {profile.phoneNumber && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 10, border: '1px solid var(--color-border)', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-detail)' }}>{profile.phoneNumber}</span>
                <CopyButton text={profile.phoneNumber} />
              </div>
            )}
            {profile.emergencyPhone && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>Emergencia: {profile.emergencyPhone}</span>
                <CopyButton text={profile.emergencyPhone} />
              </div>
            )}
          </div>
        )}

        {!profile && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16, fontFamily: 'var(--font-detail)' }}>
              Todavía no cargaste tu información.
            </p>
            <button onClick={() => setEditing(true)} style={{
              padding: '12px 24px', background: 'var(--color-primary)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>Completar perfil</button>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Profile Editor ─────────────────────────────────────── */
function ProfileEditor({ personId, profile, onDone, onClose }: {
  personId: string; profile: any; onDone: () => void; onClose: () => void
}) {
  const [passports, setPassports] = useState<Passport[]>(profile?.passports ?? [])
  const [phone, setPhone] = useState(profile?.phoneNumber ?? '')
  const [emergency, setEmergency] = useState(profile?.emergencyPhone ?? '')
  const [insurance, setInsurance] = useState<string | undefined>(profile?.insuranceFile)
  const [facePhoto, setFacePhoto] = useState<string | undefined>(profile?.facePhoto)
  const [saving, setSaving] = useState(false)

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
  })

  const addPassport = () => {
    setPassports(prev => [...prev, { id: crypto.randomUUID(), country: '' }])
  }

  const updatePassport = (id: string, field: keyof Passport, value: string) => {
    setPassports(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const removePassport = (id: string) => {
    setPassports(prev => prev.filter(p => p.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { personId, passports, phoneNumber: phone || undefined, emergencyPhone: emergency || undefined, insuranceFile: insurance, facePhoto, updatedAt: new Date().toISOString() }
      const existing = await db.personalProfiles.where('personId').equals(personId).first()
      if (existing?.id) await db.personalProfiles.update(existing.id, data)
      else await db.personalProfiles.add(data as any)
      onDone()
    } finally { setSaving(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'var(--color-surface)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px max(80px, env(safe-area-inset-bottom))',
        zIndex: 201, maxHeight: '92dvh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3>Editar perfil</h3>
          <button onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 13 }}>Cancelar</button>
        </div>

        {/* Face photo */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>Foto de perfil</p>
        <label style={{ display: 'block', marginBottom: 20, textAlign: 'center', cursor: 'pointer' }}>
          {facePhoto ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={facePhoto} alt="foto" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
              background: 'var(--color-primary-10)', border: '2px dashed var(--color-primary-20)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize: 9, color: 'var(--color-primary)', fontFamily: 'var(--font-detail)' }}>Tu foto</span>
            </div>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (f) setFacePhoto(await toBase64(f)) }} />
        </label>

        {/* Passports */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>Pasaportes</p>
        {passports.map((p, idx) => (
          <div key={p.id} style={{ marginBottom: 14, padding: '14px', background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>Pasaporte {idx + 1}</span>
              <button onClick={() => removePassport(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: 12, fontFamily: 'var(--font-body)' }}>Eliminar</button>
            </div>
            {[
              { field: 'country' as const, label: 'País', placeholder: 'Argentina' },
              { field: 'number'  as const, label: 'Número', placeholder: 'AAA123456' },
              { field: 'expiry'  as const, label: 'Vencimiento', placeholder: '2029-12-31' },
            ].map(({ field, label, placeholder }) => (
              <div key={field} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-soft)', marginBottom: 4 }}>{label}</div>
                <input value={p[field] ?? ''} onChange={e => updatePassport(p.id, field, e.target.value)}
                  placeholder={placeholder} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, background: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-body)' }} />
              </div>
            ))}
          {(['photoFront', 'photoBack'] as const).map(field => (
            <div key={field} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-soft)' }}>
                {field === 'photoFront' ? 'Foto frente' : 'Foto dorso'}
              </div>
              {p[field] ? (
                <div style={{ position: 'relative' }}>
                  <img src={p[field]} alt={field} style={{ width: '100%', borderRadius: 8, maxHeight: 100, objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => updatePassport(p.id, field, '')}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', border: 'none',
                      cursor: 'pointer', color: '#fff', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ padding: '10px 12px', border: '1px dashed var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>
                    Tocá para agregar foto
                  </div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (f) updatePassport(p.id, field, await toBase64(f)) }} />
                </label>
              )}
            </div>
          ))}
          </div>
        ))}

        <button onClick={addPassport} style={{ width: '100%', padding: '10px', marginBottom: 20, border: '1.5px dashed var(--color-primary)', borderRadius: 10, background: 'transparent', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          + Agregar pasaporte
        </button>

        {/* Insurance */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>Seguro médico</p>
        <label style={{ display: 'block', marginBottom: 20, padding: '12px 14px', borderRadius: 12, border: '1px dashed var(--color-primary-20)', cursor: 'pointer' }}>
          {insurance ? <img src={insurance} alt="seguro" style={{ width: '100%', borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} /> : <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Tocá para agregar póliza</div>}
          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (f) setInsurance(await toBase64(f)) }} />
        </label>

        {/* Phones */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>Teléfonos</p>
        {[
          { label: 'Tu número', val: phone, set: setPhone },
          { label: 'Emergencia (opcional)', val: emergency, set: setEmergency },
        ].map(({ label, val, set }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-soft)', marginBottom: 4 }}>{label}</div>
            <input type="tel" value={val} onChange={e => set(e.target.value)} placeholder="+54 9 11 1234-5678" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-detail)' }} />
          </div>
        ))}

        <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', marginTop: 12, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>
    </>
  )
}
