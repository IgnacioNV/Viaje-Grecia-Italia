import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconStamp } from '../components/ui/IconStamp'
import { FilePreview, StaticFilePreview, CopyButton } from '../components/ui/FilePreview'
import { db } from '../db/dexie'
import seedDocs from '../data/documents.seed.json'
import people from '../data/people.json'
import type { DocumentType, LocalDocument, SeedDocument } from '../types'
import type { IconName } from '../components/ui/IconStamp'

const SEED_DOCS = seedDocs as SeedDocument[]
const PEOPLE = people as { id: string; name: string }[]

// Fecha del evento — para calcular estado temporal
interface DocItem {
  id: string
  title: string
  sub: string
  detail: string
  icon: IconName
  eventDate?: string    // YYYY-MM-DD
  localId?: number      // set only for locally uploaded docs
  ownerPersonId?: string
  passportNumber?: string   // for copy button
  photoFront?: string       // for passport preview
  seedFilePath?: string     // for seed doc preview
}

const CATEGORY_DOCS: Record<string, DocItem[]> = {
  pasaportes: [],
  hoteles: [
    { id: 'h1', title: 'Hotel en Bari', sub: '21–25 jul · 4 noches', icon: 'reservation', eventDate: '2026-07-21',
      detail: 'Check-in: 21 jul a partir de 15:00\nCheck-out: 25 jul antes de 11:00\nConfirmación: pendiente de agregar' },
  ],
  transporte: [
    { id: 't1', title: 'Vuelo Buenos Aires → Bari', sub: 'Por confirmar · julio 2026', icon: 'flight', eventDate: '2026-07-21',
      detail: 'Vuelo de ida. Detalles pendientes.' },
    { id: 't2', title: 'Vuelo Bari → Buenos Aires', sub: 'Por confirmar · agosto 2026', icon: 'flight', eventDate: '2026-08-01',
      detail: 'Vuelo de regreso. Detalles pendientes.' },
    { id: 't3', title: 'Crucero MSC', sub: '25 jul – 1 ago · 7 noches', icon: 'anchor', eventDate: '2026-07-25',
      detail: 'Puerto de embarque: Bari\nRuta: Santorini → Atenas → Katakolo → Cefalonia → Corfú' },
  ],
  tickets: [
    { id: 'e1', title: 'Excursión Matera + Alberobello', sub: 'Día 3 · 23 jul · Salida 09:00', icon: 'ticket', eventDate: '2026-07-23',
      detail: 'Punto de encuentro: Corso Cavour\nRegreso: 19:00. Llevar agua y zapatillas.' },
    { id: 'e2', title: 'Excursión Valle de Itria', sub: 'Día 4 · 24 jul · Salida 08:30', icon: 'ticket', eventDate: '2026-07-24',
      detail: 'Punto de encuentro: Piazza Eroi del Mare\nPolignano · Ostuni · Locorotondo · Regreso 18:30' },
    { id: 'e3', title: 'Excursión Santorini', sub: 'Día 7 · 27 jul · Contratada', icon: 'ticket', eventDate: '2026-07-27',
      detail: 'Excursión ya contratada. Llevar protector solar y agua.' },
    { id: 'e4', title: 'Excursión Atenas', sub: 'Día 8 · 28 jul · Contratada', icon: 'ticket', eventDate: '2026-07-28',
      detail: 'Acrópolis y Partenón. Excursión ya contratada.' },
    { id: 'e5', title: 'Excursión Olimpia', sub: 'Día 9 · 29 jul · Contratada', icon: 'ticket', eventDate: '2026-07-29',
      detail: 'Archaeological Site of Olympia. Excursión ya contratada.' },
    { id: 'e6', title: 'Melissani Cave', sub: 'Día 10 · 30 jul · Reservada', icon: 'ticket', eventDate: '2026-07-30',
      detail: 'Excursión reservada con traslado. Evita filas.' },
  ],
}

type DocStatus = 'upcoming' | 'today' | 'past'

function getDocStatus(eventDate?: string): DocStatus {
  if (!eventDate) return 'upcoming'
  const today = new Date().toISOString().split('T')[0]
  if (eventDate === today) return 'today'
  if (eventDate < today) return 'past'
  return 'upcoming'
}

type DocSection = 'overview' | 'category' | 'profile' | 'upload'
type CategoryKey = 'pasaportes' | 'hoteles' | 'transporte' | 'tickets'

const CATEGORY_LABELS: Record<CategoryKey, { label: string; icon: IconName }> = {
  pasaportes: { label: 'Pasaportes',  icon: 'passport' },
  hoteles:    { label: 'Hoteles',     icon: 'reservation' },
  transporte: { label: 'Transporte',  icon: 'flight' },
  tickets:    { label: 'Tickets',     icon: 'ticket' },
}

interface DocsScreenProps { personId: string }

export function DocsScreen({ personId }: DocsScreenProps) {
  const [section, setSection] = useState<DocSection>('overview')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('tickets')
  const localDocs = useLiveQuery(() => db.localDocuments.toArray(), []) ?? []
  const allProfiles = useLiveQuery(() => db.personalProfiles.toArray(), []) ?? []

  // Passports from all personal profiles
  const profilePassportDocs: DocItem[] = allProfiles.flatMap(profile => {
    const person = PEOPLE.find(p => p.id === profile.personId)
    return (profile.passports ?? []).map(passport => ({
      id: `pp-${profile.personId}-${passport.id}`,
      title: `Pasaporte${passport.country ? ` · ${passport.country}` : ''}`,
      sub: person?.name ?? profile.personId,
      icon: 'passport' as IconName,
      detail: [
        person?.name && `Titular: ${person.name}`,
        passport.country && `País: ${passport.country}`,
        passport.number && `N°: ${passport.number}`,
        passport.expiry && `Vence: ${passport.expiry}`,
      ].filter(Boolean).join('\n'),
      passportNumber: passport.number,
      photoFront: passport.photoFront,
    }))
  })

  // Seed docs as DocItems (for preview and category views)
  const seedDocItems: DocItem[] = SEED_DOCS.map(doc => ({
    id: doc.id,
    title: doc.title,
    sub: 'Compartido · Grupo',
    icon: (doc.type === 'ticket' ? 'ticket' : doc.type === 'reservation' ? 'reservation' : 'document') as IconName,
    detail: `Todos los integrantes · ${doc.createdAt}`,
    seedFilePath: doc.file,
  }))

  // Seed docs grouped by category
  const seedByCategory: Record<string, DocItem[]> = {
    pasaportes: seedDocItems.filter(d => SEED_DOCS.find(s => s.id === d.id)?.type === 'passport'),
    hoteles:    seedDocItems.filter(d => SEED_DOCS.find(s => s.id === d.id)?.type === 'reservation'),
    transporte: seedDocItems.filter(d => SEED_DOCS.find(s => s.id === d.id)?.type === 'voucher'),
    tickets:    seedDocItems.filter(d => SEED_DOCS.find(s => s.id === d.id)?.type === 'ticket'),
  }

  // Merge local docs into categories by type
  const localByCategory: Record<string, DocItem[]> = {
    pasaportes: localDocs.filter(d => d.type === 'passport').map(d => ({
      id: `local-${d.id}`, title: d.title, sub: 'Subido por vos', icon: 'passport' as IconName,
      detail: `Subido el ${new Date(d.createdAt).toLocaleDateString('es-ES')}`,
      localId: d.id, ownerPersonId: d.ownerPersonId,
    })),
    hoteles: localDocs.filter(d => d.type === 'reservation').map(d => ({
      id: `local-${d.id}`, title: d.title, sub: 'Subido por vos', icon: 'reservation' as IconName,
      detail: `Subido el ${new Date(d.createdAt).toLocaleDateString('es-ES')}`,
      localId: d.id, ownerPersonId: d.ownerPersonId,
    })),
    transporte: localDocs.filter(d => d.type === 'voucher').map(d => ({
      id: `local-${d.id}`, title: d.title, sub: 'Subido por vos', icon: 'flight' as IconName,
      detail: `Subido el ${new Date(d.createdAt).toLocaleDateString('es-ES')}`,
      localId: d.id, ownerPersonId: d.ownerPersonId,
    })),
    tickets: localDocs.filter(d => d.type === 'ticket').map(d => ({
      id: `local-${d.id}`, title: d.title, sub: 'Subido por vos', icon: 'ticket' as IconName,
      detail: `Subido el ${new Date(d.createdAt).toLocaleDateString('es-ES')}`,
      localId: d.id, ownerPersonId: d.ownerPersonId,
    })),
  }
  const otherLocalDocs = localDocs.filter(d => d.type === 'other')

  if (section === 'profile')  return <ProfileSection personId={personId} onBack={() => setSection('overview')} />
  if (section === 'upload')   return <UploadSection  personId={personId} onBack={() => setSection('overview')} />
  if (section === 'category') return (
    <CategoryView
      label={CATEGORY_LABELS[activeCategory].label}
      docs={[
        ...(activeCategory === 'pasaportes' ? profilePassportDocs : []),
        ...(seedByCategory[activeCategory] ?? []),
        ...CATEGORY_DOCS[activeCategory],
        ...(localByCategory[activeCategory] ?? []),
      ]}
      currentPersonId={personId}
      onBack={() => setSection('overview')}
    />
  )

  const allDocs: DocItem[] = [
    ...CATEGORY_DOCS.transporte,
    ...CATEGORY_DOCS.tickets,
    ...CATEGORY_DOCS.hoteles,
    ...seedDocItems,
  ].sort((a, b) => (a.eventDate ?? 'z') < (b.eventDate ?? 'z') ? -1 : 1)

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Maleta digital</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>Documentos</h1>

        {/* ── NIVEL 1: Acciones utilitarias — mínimas, sin card ── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
          {[
            { icon: 'passport' as IconName, label: 'Mi perfil', action: () => setSection('profile') },
            { icon: 'upload'   as IconName, label: 'Subir archivo', action: () => setSection('upload') },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 20,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-soft)',
              fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                color="var(--color-primary)">
                <IconSVG name={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>

        {/* ── NIVEL 2: Categorías — fondo soft, rol de navegación ── */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>Categorías</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map(key => {
            const { label, icon } = CATEGORY_LABELS[key]
            const count = (key === 'pasaportes' ? profilePassportDocs.length : 0)
              + (seedByCategory[key]?.length ?? 0)
              + CATEGORY_DOCS[key].length
              + (localByCategory[key]?.length ?? 0)
            return (
              <button key={key} onClick={() => { setActiveCategory(key); setSection('category') }} style={{
                padding: '14px 14px', textAlign: 'left', cursor: 'pointer',
                background: 'var(--color-primary-10)',
                border: 'none',
                borderRadius: 16, minHeight: 72,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <IconStamp icon={icon} size={28}
                  style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{label}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>
                  {count > 0 ? `${count} doc${count !== 1 ? 's' : ''}` : 'Sin documentos aún'}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── NIVEL 3: Documentos próximos — el contenido real ── */}
        <p className="eyebrow" style={{ color: 'var(--color-primary)', marginBottom: 12 }}>
          Próximos documentos
        </p>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allDocs.map(doc => <ExpandableRow key={doc.id} doc={doc} currentPersonId={personId} />)}

        {otherLocalDocs.length > 0 && (
          <>
            <p className="eyebrow" style={{ color: 'var(--color-primary)', marginTop: 8, marginBottom: 4 }}>
              Otros archivos
            </p>
            {otherLocalDocs.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 14px', background: 'var(--color-surface)',
                border: '1.5px solid var(--color-primary)', borderRadius: 16,
              }}>
                <IconStamp icon="document" size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>Solo en tu teléfono</div>
                </div>
                {doc.ownerPersonId === personId && (
                  <button
                    onClick={async () => { if (confirm(`Borrar "${doc.title}"?`)) await db.localDocuments.delete(doc.id!) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-text-muted)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setSection('upload')} style={{
        position: 'fixed', bottom: 132,
        right: 'max(20px, calc(50vw - 195px))',
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--color-primary)', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', boxShadow: '0 4px 20px rgba(27,63,166,0.35)', zIndex: 50,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}

/* ── Expandable row con estado temporal ─────────────────── */
function ExpandableRow({ doc, currentPersonId }: { doc: DocItem; currentPersonId?: string }) {
  const [open, setOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [staticPreview, setStaticPreview] = useState<{ path: string; title: string } | null>(null)
  const status = getDocStatus(doc.eventDate)
  const canDelete = !!(doc.localId && doc.ownerPersonId && doc.ownerPersonId === currentPersonId)
  const canPreview = !!(doc.localId || doc.seedFilePath)

  const statusConfig = {
    today:    { bg: 'var(--color-surface)',    border: '2px solid var(--color-accent)' },
    past:     { bg: 'rgba(0,0,0,0.03)',        border: '1px solid var(--color-border)' },
    upcoming: { bg: 'var(--color-surface)',    border: '1.5px solid var(--color-primary)' },
  }
  const cfg = statusConfig[status]

  const handlePreview = async () => {
    if (doc.seedFilePath) { setStaticPreview({ path: doc.seedFilePath, title: doc.title }); return }
    if (!doc.localId) return
    const localDoc = await db.localDocuments.get(doc.localId)
    if (localDoc?.fileBase64) setPreviewSrc(localDoc.fileBase64)
  }

  return (
    <>
      <div style={{ background: cfg.bg, border: cfg.border, borderRadius: 16, overflow: 'hidden', opacity: status === 'past' ? 0.55 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
          <button onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
            <IconStamp icon={doc.icon} size={36} style={status === 'past' ? { opacity: 0.5 } : {}} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: status === 'past' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>{doc.title}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)', marginTop: 2 }}>{doc.sub}</div>
            </div>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {status === 'today' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'var(--color-primary)', color: '#fff' }}>Hoy</span>
            )}
            {status === 'past' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            )}
            {canPreview && (
              <button onClick={handlePreview} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-primary)' }} title="Ver archivo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            )}
            {canDelete && (
              <button onClick={async e => { e.stopPropagation(); if (confirm(`Borrar "${doc.title}"?`)) await db.localDocuments.delete(doc.localId!) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                  <path d="M10,11v6"/><path d="M14,11v6"/>
                  <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
                </svg>
              </button>
            )}
            <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round"
                style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div style={{ padding: '12px 14px 14px 62px', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)', whiteSpace: 'pre-line', borderTop: '1px solid var(--color-border)' }}>
            {doc.detail}
            {doc.photoFront && (
              <img src={doc.photoFront} alt="Pasaporte" onClick={() => setPreviewSrc(doc.photoFront!)}
                style={{ width: '100%', borderRadius: 8, marginTop: 10, maxHeight: 120, objectFit: 'cover', cursor: 'pointer' }} />
            )}
            {doc.passportNumber && (
              <div style={{ marginTop: 10 }}>
                <CopyButton text={doc.passportNumber} label={`Copiar N° ${doc.passportNumber}`} />
              </div>
            )}
            {status === 'past' && (
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Este evento ya pasó. Podés seguir viendo el documento si lo necesitás.
              </div>
            )}
          </div>
        )}
      </div>

      {previewSrc && <FilePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />}
      {staticPreview && <StaticFilePreview filePath={staticPreview.path} title={staticPreview.title} onClose={() => setStaticPreview(null)} />}
    </>
  )
}



/* ── Inline SVG helper for utility buttons ──────────────── */
function IconSVG({ name }: { name: IconName }) {
  if (name === 'passport') return <><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="11" r="3"/><line x1="7" y1="7" x2="17" y2="7"/><line x1="7" y1="18" x2="17" y2="18"/></>
  if (name === 'upload')   return <><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/></>
  return null
}

/* ── Category detail view ───────────────────────────────── */
function CategoryView({ label, docs, currentPersonId, onBack }: {
  label: string
  docs: DocItem[]
  currentPersonId?: string
  onBack: () => void
}) {
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
      <h2 style={{ marginBottom: 20 }}>{label}</h2>
      {docs.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 40, fontFamily: 'var(--font-detail)' }}>
          Todavía no hay documentos en esta sección.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {docs.map(doc => <ExpandableRow key={doc.id} doc={doc} currentPersonId={currentPersonId} />)}
        </div>
      )}
    </div>
  )
}

/* ── Profile Section ────────────────────────────────────── */
function ProfileSection({ personId, onBack }: { personId: string; onBack: () => void }) {
  const profile = useLiveQuery(() => db.personalProfiles.where('personId').equals(personId).first(), [personId])
  const [phone, setPhone] = useState('')
  const [emergency, setEmergency] = useState('')
  const [passports, setPassports] = useState<any[]>([])
  const [insurance, setInsurance] = useState<string | undefined>()
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)

  if (profile !== undefined && !initialized) {
    setPhone(profile?.phoneNumber ?? '')
    setEmergency(profile?.emergencyPhone ?? '')
    setPassports(profile?.passports ?? [])
    setInsurance(profile?.insuranceFile)
    setInitialized(true)
  }

  const toBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
  })

  const addPassport = () => setPassports(prev => [...prev, { id: crypto.randomUUID(), country: '' }])
  const updatePassport = (id: string, field: string, value: string) =>
    setPassports(prev => prev.map((p: any) => p.id === id ? { ...p, [field]: value } : p))
  const removePassport = (id: string) => setPassports(prev => prev.filter((p: any) => p.id !== id))

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { personId, passports, phoneNumber: phone || undefined, emergencyPhone: emergency || undefined, insuranceFile: insurance, updatedAt: new Date().toISOString() }
      const existing = await db.personalProfiles.where('personId').equals(personId).first()
      if (existing?.id) await db.personalProfiles.update(existing.id, data)
      else await db.personalProfiles.add(data as any)
      onBack()
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100dvh', overflowY: 'auto', padding: '20px 20px 100px', background: 'var(--color-bg)' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 14, fontWeight: 500, marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        Documentos
      </button>
      <h2 style={{ marginBottom: 4 }}>Mi perfil</h2>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20, fontFamily: 'var(--font-detail)' }}>Solo visible para vos · guardado en tu teléfono</p>

      <p className="eyebrow" style={{ marginBottom: 10 }}>Pasaportes</p>
      {passports.map((p: any, idx: number) => (
        <div key={p.id} style={{ marginBottom: 12, padding: '14px', background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>Pasaporte {idx + 1}</span>
            <button onClick={() => removePassport(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: 12, fontFamily: 'var(--font-body)' }}>Eliminar</button>
          </div>
          {[
            { field: 'country', label: 'País', placeholder: 'Argentina' },
            { field: 'number',  label: 'Número', placeholder: 'AAA123456' },
            { field: 'expiry',  label: 'Vencimiento', placeholder: '2029-12-31' },
          ].map(({ field, label, placeholder }) => (
            <div key={field} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-soft)' }}>{label}</div>
              <input value={p[field] ?? ''} onChange={e => updatePassport(p.id, field, e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-body)' }} />
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
                      cursor: 'pointer', color: '#fff',
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

      <p className="eyebrow" style={{ marginBottom: 10 }}>Seguro médico</p>
      <label style={{ display: 'block', padding: '12px 14px', borderRadius: 12, border: '1px dashed var(--color-primary-20)', cursor: 'pointer', marginBottom: 20 }}>
        {insurance ? <img src={insurance} alt="seguro" style={{ width: '100%', borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} />
          : <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>Tocá para agregar póliza</div>}
        <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (f) setInsurance(await toBase64(f)) }} />
      </label>

      <p className="eyebrow" style={{ marginBottom: 10 }}>Teléfonos</p>
      {[{ label: 'Tu número', val: phone, set: setPhone }, { label: 'Emergencia (opcional)', val: emergency, set: setEmergency }].map(({ label, val, set }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-soft)' }}>{label}</div>
          <input type="tel" value={val} onChange={e => set(e.target.value)} placeholder="+54 9 11 1234-5678"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-detail)' }} />
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
    <div style={{ minHeight: '100dvh', overflowY: 'auto', padding: '20px 20px 100px', background: 'var(--color-bg)' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 14, fontWeight: 500, marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        Documentos
      </button>
      <h2 style={{ marginBottom: 20 }}>Subir archivo</h2>
      <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--color-primary-20)', borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: file ? 'var(--color-primary-10)' : 'transparent' }}>
        <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
        {file ? <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Seleccionado: {file.name}</p>
          : <><IconStamp icon="upload" size={40} style={{ margin: '0 auto 8px' }} /><p style={{ fontSize: 14, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>Tocá para elegir foto o PDF</p></>}
      </div>
      <input type="text" placeholder="Nombre del documento" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, background: 'var(--color-bg)', color: 'var(--color-text)', marginBottom: 10, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' as const }} />
      <select value={type} onChange={e => setType(e.target.value as DocumentType)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, background: 'var(--color-bg)', color: 'var(--color-text)', marginBottom: 12, outline: 'none', fontFamily: 'var(--font-body)' }}>
        <option value="ticket">Ticket / Entrada</option>
        <option value="reservation">Reserva</option>
        <option value="passport">Pasaporte</option>
        <option value="voucher">Voucher</option>
        <option value="other">Otro</option>
      </select>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 16, fontFamily: 'var(--font-detail)' }}>Este archivo se guarda solo en tu teléfono.</p>
      <button onClick={handleSave} disabled={!title || !file || saving} style={{ width: '100%', padding: '14px', background: !title || !file ? 'var(--color-border)' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !title || !file ? 'default' : 'pointer', fontFamily: 'var(--font-body)' }}>
        {saving ? 'Guardando...' : 'Guardar documento'}
      </button>
    </div>
  )
}
