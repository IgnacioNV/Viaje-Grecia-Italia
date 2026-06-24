import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconStamp } from '../components/ui/IconStamp'
import { db } from '../db/dexie'
import seedDocs from '../data/documents.seed.json'
import type { SeedDocument, DocumentType, LocalDocument, PersonalProfile } from '../types'
import type { IconName } from '../components/ui/IconStamp'

const SEED = seedDocs as SeedDocument[]

const TYPE_ICON: Record<string, IconName> = {
  ticket: 'ticket', passport: 'passport',
  reservation: 'reservation', voucher: 'document', other: 'document',
}

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'ticket', label: 'Ticket / Entrada' },
  { value: 'reservation', label: 'Reserva' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'other', label: 'Otro' },
]

type Section = 'overview' | 'profile' | 'upload'

interface DocsScreenProps { personId: string }

export function DocsScreen({ personId }: DocsScreenProps) {
  const [section, setSection] = useState<Section>('overview')
  const localDocs = useLiveQuery(() => db.localDocuments.toArray(), []) ?? []

  const passport  = SEED.filter(d => d.type === 'passport')
  const tickets   = SEED.filter(d => d.type === 'ticket')
  const reservations = SEED.filter(d => d.type === 'reservation')
  const vouchers  = SEED.filter(d => ['voucher','other'].includes(d.type))

  if (section === 'profile') {
    return <ProfileSection personId={personId} onBack={() => setSection('overview')} />
  }
  if (section === 'upload') {
    return <UploadSection personId={personId} onBack={() => setSection('overview')} />
  }

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Maleta digital</p>
        <h1 style={{ fontSize: 28 }}>Documentos</h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-detail)' }}>
          Todo offline · {SEED.length + localDocs.length} archivos
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <ActionCard icon="passport" label="Mi perfil" sub="Pasaporte · Seguro · Tel."
            onClick={() => setSection('profile')} />
          <ActionCard icon="upload" label="Subir archivo" sub="Foto o PDF privado"
            onClick={() => setSection('upload')} />
        </div>

        {/* Secciones */}
        {[
          { label: 'Pasaportes', docs: passport, badge: 'Oficial' as const },
          { label: 'Tickets y entradas', docs: tickets, badge: 'Oficial' as const },
          { label: 'Reservas y hoteles', docs: reservations, badge: 'Oficial' as const },
          { label: 'Otros', docs: vouchers, badge: 'Oficial' as const },
          { label: 'Mis documentos', docs: localDocs.map(d => ({
              id: d.id!.toString(), source: 'local' as const,
              type: d.type as DocumentType, ownerPersonId: d.ownerPersonId,
              title: d.title, file: '', createdAt: d.createdAt,
            })), badge: 'Tuyo' as const },
        ].filter(s => s.docs.length > 0).map(({ label, docs, badge }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 8 }}>{label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.map((doc, i) => (
                <DocRow key={doc.id ?? i} title={doc.title}
                  type={doc.type} badge={badge}
                  subtitle={doc.ownerPersonId === 'group' ? 'Compartido · Grupo' : `De ${doc.ownerPersonId}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Action Card ────────────────────────────────────────── */
function ActionCard({ icon, label, sub, onClick }: {
  icon: IconName; label: string; sub: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 12px', background: 'var(--color-surface)',
      border: 'var(--card-border)', borderRadius: 'var(--card-radius)',
      boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'left',
    }}>
      <IconStamp icon={icon} size={36} style={{ marginBottom: 8 }} />
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-soft)', marginTop: 2, fontFamily: 'var(--font-detail)' }}>{sub}</div>
    </button>
  )
}

/* ── Doc Row ─────────────────────────────────────────────── */
function DocRow({ title, type, subtitle, badge }: {
  title: string; type: DocumentType; subtitle: string; badge: 'Oficial' | 'Tuyo'
}) {
  return (
    <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconStamp icon={TYPE_ICON[type] ?? 'document'} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-soft)', marginTop: 2, fontFamily: 'var(--font-detail)' }}>{subtitle}</div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, flexShrink: 0,
        background: badge === 'Oficial' ? 'rgba(194,98,46,0.10)' : 'rgba(34,139,34,0.10)',
        color: badge === 'Oficial' ? 'var(--color-primary)' : '#228B22',
      }}>{badge}</span>
    </div>
  )
}

/* ── Profile Section ────────────────────────────────────── */
function ProfileSection({ personId, onBack }: { personId: string; onBack: () => void }) {
  const profile = useLiveQuery(
    () => db.personalProfiles.where('personId').equals(personId).first(),
    [personId]
  )
  const [phone, setPhone] = useState('')
  const [emergency, setEmergency] = useState('')
  const [passportFront, setPassportFront] = useState<string | undefined>()
  const [passportBack, setPassportBack] = useState<string | undefined>()
  const [insurance, setInsurance] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Init from DB once
  if (profile !== undefined && !initialized) {
    setPhone(profile?.phoneNumber ?? '')
    setEmergency(profile?.emergencyPhone ?? '')
    setPassportFront(profile?.passportFront)
    setPassportBack(profile?.passportBack)
    setInsurance(profile?.insuranceFile)
    setInitialized(true)
  }

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const data: PersonalProfile = {
        personId, phoneNumber: phone || undefined,
        emergencyPhone: emergency || undefined,
        passportFront, passportBack, insuranceFile: insurance,
        updatedAt: new Date().toISOString(),
      }
      const existing = await db.personalProfiles.where('personId').equals(personId).first()
      if (existing?.id) await db.personalProfiles.update(existing.id, data)
      else await db.personalProfiles.add(data)
      onBack()
    } finally { setSaving(false) }
  }

  const FileInput = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
    <label style={{
      display: 'block', padding: '12px 14px', borderRadius: 12,
      border: '1px dashed var(--color-primary-20)',
      cursor: 'pointer', marginBottom: 10,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{label}</div>
      {value
        ? <img src={value} alt={label} style={{ width: '100%', borderRadius: 8, maxHeight: 160, objectFit: 'cover' }} />
        : <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Tocá para agregar foto o PDF</div>
      }
      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
        onChange={async e => { const f = e.target.files?.[0]; if (f) onChange(await toBase64(f)) }} />
    </label>
  )

  return (
    <div className="screen" style={{ padding: '20px' }}>
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
        Documentos
      </button>

      <h2 style={{ marginBottom: 4 }}>Mi perfil</h2>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20, fontFamily: 'var(--font-detail)' }}>
        Solo visible para vos · guardado en tu teléfono
      </p>

      {/* Pasaporte */}
      <p className="eyebrow" style={{ marginBottom: 10 }}>Pasaporte</p>
      <FileInput label="Frente del pasaporte" value={passportFront} onChange={setPassportFront} />
      <FileInput label="Dorso del pasaporte" value={passportBack} onChange={setPassportBack} />

      {/* Seguro */}
      <p className="eyebrow" style={{ margin: '16px 0 10px' }}>Seguro médico</p>
      <FileInput label="Póliza de seguro" value={insurance} onChange={setInsurance} />

      {/* Teléfonos */}
      <p className="eyebrow" style={{ margin: '16px 0 10px' }}>Teléfonos</p>
      {[
        { label: 'Tu número de teléfono', value: phone, setter: setPhone, required: true },
        { label: 'Teléfono de emergencia (opcional)', value: emergency, setter: setEmergency, required: false },
      ].map(({ label, value, setter, required }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
            {label} {!required && <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>· opcional</span>}
          </div>
          <input
            type="tel" value={value} onChange={e => setter(e.target.value)}
            placeholder="+54 9 11 1234-5678"
            style={{
              width: '100%', padding: '12px 14px',
              border: '1px solid var(--color-border)', borderRadius: 10,
              fontSize: 14, background: 'var(--color-bg)',
              color: 'var(--color-text)', outline: 'none',
              fontFamily: 'var(--font-detail)',
            }}
          />
        </div>
      ))}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: '14px', marginTop: 8,
        background: 'var(--color-primary)', color: '#fff',
        border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'var(--font-body)',
      }}>
        {saving ? 'Guardando...' : '✓ Guardar mi perfil'}
      </button>
    </div>
  )
}

/* ── Upload Section ─────────────────────────────────────── */
function UploadSection({ personId, onBack }: { personId: string; onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentType>('other')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!title || !file) return
    setSaving(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        await db.localDocuments.add({
          ownerPersonId: personId, title, type,
          fileBase64: reader.result as string,
          createdAt: new Date().toISOString(),
        } as LocalDocument)
        onBack()
      }
      reader.readAsDataURL(file)
    } finally { setSaving(false) }
  }

  return (
    <div className="screen" style={{ padding: '20px' }}>
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
        Documentos
      </button>

      <h2 style={{ marginBottom: 20 }}>Subir archivo</h2>

      <div onClick={() => inputRef.current?.click()} style={{
        border: '2px dashed var(--color-primary-20)', borderRadius: 12,
        padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
        marginBottom: 16,
        background: file ? 'var(--color-primary-10)' : 'transparent',
      }}>
        <input ref={inputRef} type="file" accept="image/*,.pdf"
          style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file
          ? <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>✓ {file.name}</p>
          : <>
            <IconStamp icon="upload" size={40} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>
              Tocá para elegir foto o PDF
            </p>
          </>
        }
      </div>

      <input type="text" placeholder="Nombre del documento" value={title}
        onChange={e => setTitle(e.target.value)} style={{
          width: '100%', padding: '12px 14px',
          border: '1px solid var(--color-border)', borderRadius: 10,
          fontSize: 14, background: 'var(--color-bg)',
          color: 'var(--color-text)', marginBottom: 10, outline: 'none',
          fontFamily: 'var(--font-body)',
        }} />

      <select value={type} onChange={e => setType(e.target.value as DocumentType)} style={{
        width: '100%', padding: '12px 14px',
        border: '1px solid var(--color-border)', borderRadius: 10,
        fontSize: 14, background: 'var(--color-bg)',
        color: 'var(--color-text)', marginBottom: 12, outline: 'none',
        fontFamily: 'var(--font-body)',
      }}>
        {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5, fontFamily: 'var(--font-detail)' }}>
        📱 Este archivo se guarda solo en tu teléfono.
      </p>

      <button onClick={handleSave} disabled={!title || !file || saving} style={{
        width: '100%', padding: '14px',
        background: !title || !file ? 'var(--color-border)' : 'var(--color-primary)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 15, fontWeight: 600,
        cursor: !title || !file ? 'default' : 'pointer',
        fontFamily: 'var(--font-body)',
      }}>
        {saving ? 'Guardando...' : 'Guardar documento'}
      </button>
    </div>
  )
}
