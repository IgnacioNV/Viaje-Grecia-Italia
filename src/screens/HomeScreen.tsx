import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CopyButton, StaticFilePreview, FilePreview } from '../components/ui/FilePreview'
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
function getDocForActivity(actId: string, personId: string) {
  return DOCS.find(d => {
    if (d.linkedActivityId !== actId) return false
    if (d.ownerPersonIds?.length) return d.ownerPersonIds.includes(personId)
    return d.ownerPersonId === 'group' || d.ownerPersonId === personId
  })
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
      <div style={{ padding: `16px 20px ${(!info?.facts || info.facts.length === 0) ? '110px' : '0'}` }}>
        {activities.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-detail)' }}>
              No hay actividades para vos este día.
            </p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activities.map(a => <ActivityCard key={a.id} activity={a} personId={personId} />)}
            </div>
        }
      </div>

      {/* Cultural facts */}
      {info?.facts && info.facts.length > 0 && (
        <div style={{ padding: '20px 20px 110px' }}>
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
function ActivityCard({ activity, personId }: { activity: Activity; personId: string }) {
  const doc = getDocForActivity(activity.id, personId)
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
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-detail)',
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
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-detail)',
            }}>
              {notes}
            </p>
          )}

          {doc && (
            <button
              onClick={() => doc.link ? window.open(doc.link, '_blank') : setStaticPreview({ path: doc.file!, title: doc.title })}
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
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  const initials = personName.slice(0, 2).toUpperCase()

  return (
    <>
      {previewSrc && <FilePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
      <div
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          background: 'var(--color-surface)',
          borderRadius: '20px 20px 0 0',
          zIndex: 201, maxHeight: '88dvh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Drag handle — tap or swipe down to close */}
        <div
          onClick={onClose}
          style={{ padding: '14px 0 6px', display: 'flex', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-border)' }} />
        </div>
        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px max(100px, calc(env(safe-area-inset-bottom) + 80px))' }}>

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
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-primary-10)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-soft)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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
                    <button onClick={() => setPreviewSrc(p.photoFront!)} style={{ border: 'none', padding: 0, cursor: 'pointer', width: '100%', borderRadius: 8, overflow: 'hidden', display: 'block' }}>
                      <img src={p.photoFront} alt="Pasaporte" style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 120, objectFit: 'cover', display: 'block' }} />
                    </button>
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
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, fontFamily: 'var(--font-detail)' }}>
              Tu información todavía no fue cargada.
            </p>
          </div>
        )}
        </div>{/* end scrollable content */}
      </div>
    </>
  )
}

