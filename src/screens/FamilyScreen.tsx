import { useState } from 'react'
import { CopyButton, FilePreview, DownloadButton } from '../components/ui/FilePreview'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconStamp } from '../components/ui/IconStamp'
import { db } from '../db/dexie'
import people from '../data/people.json'
import type { Person, Passport, PersonalProfile } from '../types'

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
          <button key={person.id} onClick={() => setSelected(person)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px', background: 'var(--color-surface)',
            border: 'var(--card-border)', borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--stamp-radius)',
              background: 'var(--color-primary-10)', border: 'var(--stamp-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0,
            }}>
              {person.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)' }}>{person.name}</div>
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

/* ── Person Detail ───────────────────────────────────────── */
function PersonDetail({ person, onBack }: { person: Person; onBack: () => void }) {
  const profile = useLiveQuery(
    () => db.personalProfiles.where('personId').equals(person.id).first(),
    [person.id]
  ) as PersonalProfile | undefined

  const passports: Passport[] = profile?.passports ?? []
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-primary)', fontSize: 14, fontWeight: 500,
          marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Todos los viajeros
        </button>

        {/* Avatar — facePhoto or initials */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          {profile?.facePhoto ? (
            <button onClick={() => setPreviewSrc(profile.facePhoto!)} style={{
              width: 80, height: 80, borderRadius: '50%', border: 'none',
              padding: 0, cursor: 'pointer', marginBottom: 12, overflow: 'hidden',
            }}>
              <img src={profile.facePhoto} alt={person.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--color-primary-10)', border: 'var(--stamp-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12,
            }}>
              {person.name.charAt(0)}
            </div>
          )}
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{person.name}</h2>
          <div style={{
            padding: '3px 12px', borderRadius: 20,
            background: 'var(--color-primary-10)',
            fontSize: 12, fontWeight: 600, color: 'var(--color-primary)',
            fontFamily: 'var(--font-detail)',
          }}>{person.role}</div>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Passports */}
        {passports.length > 0 && (
          <>
            <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 4 }}>
              Pasaportes ({passports.length})
            </p>
            {passports.map((p, idx) => (
              <div key={p.id} className="card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <IconStamp icon="passport" size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      Pasaporte {passports.length > 1 ? idx + 1 : ''}{p.country ? ` · ${p.country}` : ''}
                    </div>
                    {p.expiry && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>
                        Vence: {p.expiry}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#d8f3dc', color: '#2d6a4f' }}>
                    Listo
                  </span>
                </div>

                {/* Number + copy */}
                {p.number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 50 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>
                      N° {p.number}
                    </span>
                    <CopyButton text={p.number} label="Copiar N°" />
                  </div>
                )}

                {/* Photos + download */}
                {(p.photoFront || p.photoBack) && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {p.photoFront && (
                      <div style={{ flex: 1 }}>
                        <button onClick={() => setPreviewSrc(p.photoFront!)} style={{
                          width: '100%', border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', display: 'block',
                        }}>
                          <img src={p.photoFront} alt="Frente" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Frente</span>
                          <DownloadButton src={p.photoFront} filename={`pasaporte-${person.name.toLowerCase()}-frente.jpg`} label="Guardar" />
                        </div>
                      </div>
                    )}
                    {p.photoBack && (
                      <div style={{ flex: 1 }}>
                        <button onClick={() => setPreviewSrc(p.photoBack!)} style={{
                          width: '100%', border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', display: 'block',
                        }}>
                          <img src={p.photoBack} alt="Dorso" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Dorso</span>
                          <DownloadButton src={p.photoBack} filename={`pasaporte-${person.name.toLowerCase()}-dorso.jpg`} label="Guardar" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Insurance */}
        {profile?.insuranceFile && (
          <>
            <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 4 }}>Seguro médico</p>
            <button onClick={() => setPreviewSrc(profile.insuranceFile!)} className="card" style={{
              padding: '14px', display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', cursor: 'pointer', border: 'none', textAlign: 'left',
            }}>
              <IconStamp icon="shield" size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Póliza de seguro</div>
                <div style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>Tocá para ver</div>
              </div>
            </button>
          </>
        )}

        {/* Phones */}
        {(profile?.phoneNumber || profile?.emergencyPhone) && (
          <>
            <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 4 }}>Teléfonos</p>
            {profile?.phoneNumber && (
              <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconStamp icon="family" size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Teléfono</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>
                    {profile.phoneNumber}
                  </div>
                </div>
                <CopyButton text={profile.phoneNumber} />
              </div>
            )}
            {profile?.emergencyPhone && (
              <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconStamp icon="family" size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Emergencia</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>
                    {profile.emergencyPhone}
                  </div>
                </div>
                <CopyButton text={profile.emergencyPhone} />
              </div>
            )}
          </>
        )}

        {person.flightOrigin && (
          <>
            <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 4 }}>Vuelo propio</p>
            <div className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconStamp icon="flight" size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Vuelo individual</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>{person.flightOrigin}</div>
              </div>
            </div>
          </>
        )}

        {!profile && !person.flightOrigin && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 14, fontFamily: 'var(--font-detail)' }}>
              {person.name} todavía no cargó su información.
            </p>
          </div>
        )}
      </div>

      {previewSrc && <FilePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />}
    </div>
  )
}