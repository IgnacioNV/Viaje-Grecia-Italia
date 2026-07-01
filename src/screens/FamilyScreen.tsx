import { useState } from 'react'
import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconStamp } from '../components/ui/IconStamp'
import { CopyButton, FilePreview, DownloadButton } from '../components/ui/FilePreview'
import { db } from '../db/dexie'
import people from '../data/people.json'
import type { Person, Passport, PersonalProfile } from '../types'

const PEOPLE = people as Person[]

export function FamilyScreen() {
  const [selected, setSelected] = useState<Person | null>(null)

  if (selected) return <PersonDetail person={selected} onBack={() => setSelected(null)} />

  return (
    <div className="screen">
      <div style={{ padding: '20px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Familia Valcarce</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{PEOPLE.length} viajeros</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px' }}>
        {PEOPLE.map(person => (
          <button key={person.id} onClick={() => setSelected(person)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 4px', background: 'transparent',
            border: 'none', borderBottom: '1px solid var(--color-border)',
            borderRadius: 0, cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--color-primary-10)',
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

/* ── Info row ────────────────────────────────────────────── */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ fontSize: 13, color: 'var(--color-text)', textAlign: 'right' }}>
        {children}
      </div>
    </div>
  )
}

const Pending = () => (
  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 12, fontFamily: 'var(--font-detail)' }}>
    Sin cargar
  </span>
)

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

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
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
              background: 'var(--color-primary-10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12,
            }}>
              {person.name.charAt(0)}
            </div>
          )}
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{person.name}</h2>
          <div style={{
            padding: '3px 12px', borderRadius: 20, background: 'var(--color-primary-10)',
            fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-detail)',
          }}>{person.role}</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 110px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Personal data */}
        <section>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Datos personales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <InfoRow label="Fecha de nacimiento">
              {profile?.birthDate ?? <Pending />}
            </InfoRow>
            <InfoRow label="Teléfono">
              {profile?.phoneNumber
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {profile.phoneNumber} <CopyButton text={profile.phoneNumber} />
                  </span>
                : <Pending />}
            </InfoRow>
            <InfoRow label="Emergencia">
              {profile?.emergencyPhone
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {profile.emergencyPhone} <CopyButton text={profile.emergencyPhone} />
                  </span>
                : <Pending />}
            </InfoRow>
          </div>
        </section>

        {/* Passports */}
        <section>
          <p className="eyebrow" style={{ marginBottom: 10 }}>
            Pasaportes{passports.length > 0 ? ` (${passports.length})` : ''}
          </p>
          {passports.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-detail)' }}>
              Sin cargar
            </p>
          ) : passports.map((p, idx) => (
            <div key={p.id} style={{ marginBottom: 12, border: '1px solid var(--color-border)', borderRadius: 14, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: p.number || p.photoFront ? 10 : 0 }}>
                <IconStamp icon="passport" size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    Pasaporte{passports.length > 1 ? ` ${idx + 1}` : ''}{p.country ? ` · ${p.country}` : ''}
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

              {p.number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 48, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>N° {p.number}</span>
                  <CopyButton text={p.number} label="Copiar" />
                </div>
              )}

              {(p.photoFront || p.photoBack) && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {p.photoFront && (
                    <div style={{ flex: 1 }}>
                      <button onClick={() => setPreviewSrc(p.photoFront!)} style={{ width: '100%', border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', display: 'block' }}>
                        <img src={p.photoFront} alt="Frente" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Frente</span>
                        <DownloadButton src={p.photoFront} filename={`pasaporte-${person.name.toLowerCase().replace(' ', '-')}-frente.jpg`} label="Guardar" />
                      </div>
                    </div>
                  )}
                  {p.photoBack && (
                    <div style={{ flex: 1 }}>
                      <button onClick={() => setPreviewSrc(p.photoBack!)} style={{ width: '100%', border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', display: 'block' }}>
                        <img src={p.photoBack} alt="Dorso" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Dorso</span>
                        <DownloadButton src={p.photoBack} filename={`pasaporte-${person.name.toLowerCase().replace(' ', '-')}-dorso.jpg`} label="Guardar" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Insurance */}
        <section>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Seguro médico</p>
          {profile?.insuranceFile ? (
            <button onClick={() => setPreviewSrc(profile.insuranceFile!)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '12px 14px', border: '1px solid var(--color-border)',
              borderRadius: 14, background: 'var(--color-surface)', cursor: 'pointer', textAlign: 'left',
            }}>
              <IconStamp icon="shield" size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Póliza de seguro</div>
                <div style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>Tocá para ver</div>
              </div>
            </button>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-detail)' }}>Sin cargar</p>
          )}
        </section>

        {/* Individual flight */}
        {person.flightOrigin && (
          <section>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Vuelo propio</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 14 }}>
              <IconStamp icon="flight" size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Vuelo individual</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>{person.flightOrigin}</div>
              </div>
            </div>
          </section>
        )}
      </div>

      {previewSrc && <FilePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />}
    </div>
  )
}
