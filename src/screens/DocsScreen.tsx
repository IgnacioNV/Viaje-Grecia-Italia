import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconStamp } from '../components/ui/IconStamp'
import { db } from '../db/dexie'
import type { DocumentType, LocalDocument, PersonalProfile } from '../types'
import type { IconName } from '../components/ui/IconStamp'

// Secciones con datos hardcodeados del viaje
const HOTELS = [
  { id: 'h1', title: 'Hotel en Bari', sub: '21–25 jul · 4 noches', detail: 'Check-in: 21 jul a partir de 15:00\nCheck-out: 25 jul antes de 11:00\nConfirmación: pendiente de agregar', icon: 'reservation' as IconName },
]

const FLIGHTS = [
  { id: 'f1', title: 'Vuelo Buenos Aires → Bari', sub: 'Por confirmar · julio 2026', detail: 'Vuelo de ida. Detalles pendientes.', icon: 'flight' as IconName },
  { id: 'f2', title: 'Vuelo Bari → Buenos Aires', sub: 'Por confirmar · agosto 2026', detail: 'Vuelo de regreso. Detalles pendientes.', icon: 'flight' as IconName },
]

const CRUISE_INFO = [
  { id: 'c1', title: 'Crucero MSC', sub: '25 jul – 1 ago · 7 noches', detail: 'Puerto de embarque: Bari\nRuta: Santorini → Atenas → Katakolo → Cefalonia → Corfú\nConfirmación: pendiente de agregar', icon: 'anchor' as IconName },
]

const EXCURSIONS = [
  { id: 'e1', title: 'Excursión Matera + Alberobello', sub: 'Día 3 · 23 jul · Salida 09:00', detail: 'Punto de encuentro: Corso Cavour\nRegreso: 19:00. Llevar agua y zapatillas.', icon: 'ticket' as IconName },
  { id: 'e2', title: 'Excursión Valle de Itria', sub: 'Día 4 · 24 jul · Salida 08:30', detail: 'Punto de encuentro: Piazza Eroi del Mare\nPolignano · Ostuni · Locorotondo\nRegreso: 18:30', icon: 'ticket' as IconName },
  { id: 'e3', title: 'Excursión Santorini', sub: 'Día 7 · 27 jul · Contratada', detail: 'Excursión ya contratada. Llevar protector solar y agua.', icon: 'ticket' as IconName },
  { id: 'e4', title: 'Excursión Atenas', sub: 'Día 8 · 28 jul · Contratada', detail: 'Excursión ya contratada. Acrópolis y Partenón.', icon: 'ticket' as IconName },
  { id: 'e5', title: 'Excursión Olimpia', sub: 'Día 9 · 29 jul · Contratada', detail: 'Excursión ya contratada. Archaeological Site of Olympia.', icon: 'ticket' as IconName },
  { id: 'e6', title: 'Excursión Melissani Cave', sub: 'Día 10 · 30 jul · Reservada', detail: 'Excursión reservada con traslado. Evita filas.', icon: 'ticket' as IconName },
]

type DocSection = 'overview' | 'profile' | 'upload'

interface DocsScreenProps { personId: string }

export function DocsScreen({ personId }: DocsScreenProps) {
  const [section, setSection] = useState<DocSection>('overview')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const localDocs = useLiveQuery(() => db.localDocuments.toArray(), []) ?? []

  if (section === 'profile') return <ProfileSection personId={personId} onBack={() => setSection('overview')} />
  if (section === 'upload') return <UploadSection personId={personId} onBack={() => setSection('overview')} />

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id)

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Maleta digital</p>
        <h1 style={{ fontSize: 28 }}>Documentos</h1>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <ActionCard icon="passport" label="Mi perfil" sub="Pasaporte · Seguro · Tel." onClick={() => setSection('profile')} />
          <ActionCard icon="upload" label="Subir archivo" sub="Foto o PDF privado" onClick={() => setSection('upload')} />
        </div>

        {/* Hoteles y alojamiento */}
        <Section title="Hoteles y alojamiento">
          {HOTELS.map(item => (
            <InfoCard key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </Section>

        {/* Transportes */}
        <Section title="Transportes">
          {FLIGHTS.map(item => (
            <InfoCard key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => toggle(item.id)} />
          ))}
          {CRUISE_INFO.map(item => (
            <InfoCard key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </Section>

        {/* Tickets y excursiones */}
        <Section title="Tickets y excursiones">
          {EXCURSIONS.map(item => (
            <InfoCard key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </Section>

        {/* Mis documentos */}
        {localDocs.length > 0 && (
          <Section title="Mis documentos">
            {localDocs.map(doc => (
              <div key={doc.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconStamp icon="document" size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>
                    Solo en tu teléfono
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                  background: 'rgba(34,139,34,0.10)', color: '#228B22',
                }}>Tuyo</span>
              </div>
            ))}
          </Section>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setSection('upload')} style={{
        position: 'fixed', bottom: 108,
        right: 'max(20px, calc(50vw - 195px))',
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--color-primary)', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', boxShadow: '0 4px 20px rgba(27,63,166,0.35)', zIndex: 50,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}

/* ── Section wrapper ────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 8 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

/* ── Info Card (expandable) ─────────────────────────────── */
function InfoCard({ item, expanded, onToggle }: {
  item: { icon: IconName; title: string; sub: string; detail: string }
  expanded: boolean; onToggle: () => void
}) {
  return (
    <div className="card" style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconStamp icon={item.icon} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{item.title}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>{item.sub}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      {expanded && (
        <p style={{
          marginTop: 12, fontSize: 13, lineHeight: 1.6,
          color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)',
          whiteSpace: 'pre-line', paddingLeft: 48,
        }}>{item.detail}</p>
      )}
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

/* ── Profile Section ────────────────────────────────────── */
function ProfileSection({ personId, onBack }: { personId: string; onBack: () => void }) {
  const profile = useLiveQuery(() => db.personalProfiles.where('personId').equals(personId).first(), [personId])
  const [phone, setPhone] = useState('')
  const [emergency, setEmergency] = useState('')
  const [passportFront, setPassportFront] = useState<string | undefined>()
  const [passportBack, setPassportBack] = useState<string | undefined>()
  const [insurance, setInsurance] = useState<string | undefined>()
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)

  if (profile !== undefined && !initialized) {
    setPhone(profile?.phoneNumber ?? ''); setEmergency(profile?.emergencyPhone ?? '')
    setPassportFront(profile?.passportFront); setPassportBack(profile?.passportBack)
    setInsurance(profile?.insuranceFile); setInitialized(true)
  }

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const data: PersonalProfile = { personId, phoneNumber: phone || undefined, emergencyPhone: emergency || undefined, passportFront, passportBack, insuranceFile: insurance, updatedAt: new Date().toISOString() }
      const existing = await db.personalProfiles.where('personId').equals(personId).first()
      if (existing?.id) await db.personalProfiles.update(existing.id, data)
      else await db.personalProfiles.add(data)
      onBack()
    } finally { setSaving(false) }
  }

  const FileInput = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
    <label style={{ display: 'block', padding: '12px 14px', borderRadius: 12, border: '1px dashed var(--color-primary-20)', cursor: 'pointer', marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{label}</div>
      {value
        ? <img src={value} alt={label} style={{ width: '100%', borderRadius: 8, maxHeight: 160, objectFit: 'cover' }} />
        : <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Tocá para agregar foto o PDF</div>
      }
      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (f) onChange(await toBase64(f)) }} />
    </label>
  )

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto', padding: '20px 20px 40px', background: 'var(--color-bg)' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 14, fontWeight: 500, marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        Documentos
      </button>
      <h2 style={{ marginBottom: 4 }}>Mi perfil</h2>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20, fontFamily: 'var(--font-detail)' }}>Solo visible para vos · guardado en tu teléfono</p>

      <p className="eyebrow" style={{ marginBottom: 10 }}>Pasaporte</p>
      <FileInput label="Frente del pasaporte" value={passportFront} onChange={setPassportFront} />
      <FileInput label="Dorso del pasaporte" value={passportBack} onChange={setPassportBack} />

      <p className="eyebrow" style={{ margin: '16px 0 10px' }}>Seguro médico</p>
      <FileInput label="Póliza de seguro" value={insurance} onChange={setInsurance} />

      <p className="eyebrow" style={{ margin: '16px 0 10px' }}>Teléfonos</p>
      {[
        { label: 'Tu número', value: phone, setter: setPhone, req: true },
        { label: 'Emergencia', value: emergency, setter: setEmergency, req: false },
      ].map(({ label, value, setter, req }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
            {label} {!req && <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>· opcional</span>}
          </div>
          <input type="tel" value={value} onChange={e => setter(e.target.value)} placeholder="+54 9 11 1234-5678" style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontFamily: 'var(--font-detail)', boxSizing: 'border-box' }} />
        </div>
      ))}

      <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', marginTop: 8, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        {saving ? 'Guardando...' : 'Guardar mi perfil'}
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
        await db.localDocuments.add({ ownerPersonId: personId, title, type, fileBase64: reader.result as string, createdAt: new Date().toISOString() } as LocalDocument)
        onBack()
      }
      reader.readAsDataURL(file)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto', padding: '20px 20px 40px', background: 'var(--color-bg)' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 14, fontWeight: 500, marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        Documentos
      </button>
      <h2 style={{ marginBottom: 20 }}>Subir archivo</h2>

      <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--color-primary-20)', borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: file ? 'var(--color-primary-10)' : 'transparent' }}>
        <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file
          ? <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Seleccionado: {file.name}</p>
          : <><IconStamp icon="upload" size={40} style={{ margin: '0 auto 8px' }} /><p style={{ fontSize: 14, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>Tocá para elegir foto o PDF</p></>
        }
      </div>

      <input type="text" placeholder="Nombre del documento" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, background: 'var(--color-bg)', color: 'var(--color-text)', marginBottom: 10, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />

      <select value={type} onChange={e => setType(e.target.value as DocumentType)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, background: 'var(--color-bg)', color: 'var(--color-text)', marginBottom: 12, outline: 'none', fontFamily: 'var(--font-body)' }}>
        <option value="ticket">Ticket / Entrada</option>
        <option value="reservation">Reserva</option>
        <option value="passport">Pasaporte</option>
        <option value="voucher">Voucher</option>
        <option value="other">Otro</option>
      </select>

      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16, fontFamily: 'var(--font-detail)' }}>
        Este archivo se guarda solo en tu teléfono.
      </p>

      <button onClick={handleSave} disabled={!title || !file || saving} style={{ width: '100%', padding: '14px', background: !title || !file ? 'var(--color-border)' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !title || !file ? 'default' : 'pointer', fontFamily: 'var(--font-body)' }}>
        {saving ? 'Guardando...' : 'Guardar documento'}
      </button>
    </div>
  )
}
