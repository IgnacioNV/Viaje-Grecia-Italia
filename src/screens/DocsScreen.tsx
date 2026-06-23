import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { IconStamp } from '../components/ui/IconStamp'
import { db } from '../db/dexie'
import seedDocs from '../data/documents.seed.json'
import type { SeedDocument, DocumentType, LocalDocument } from '../types'
import type { IconName } from '../components/ui/IconStamp'

const SEED = seedDocs as SeedDocument[]

const TYPE_ICON: Record<string, IconName> = {
  ticket:      'ticket',
  passport:    'passport',
  reservation: 'reservation',
  voucher:     'document',
  other:       'document',
}

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'ticket', label: 'Ticket / Entrada' },
  { value: 'reservation', label: 'Reserva' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'other', label: 'Otro' },
]

interface DocsScreenProps {
  personId: string
}

export function DocsScreen({ personId }: DocsScreenProps) {
  const [showUpload, setShowUpload] = useState(false)

  const localDocs = useLiveQuery(() => db.localDocuments.toArray(), []) ?? []

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Maleta digital</p>
        <h1 style={{ fontSize: 28 }}>Documentos</h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-detail)' }}>
          Todo offline · {SEED.length + localDocs.length} archivos guardados
        </p>
      </div>

      {/* Seed docs */}
      <div style={{ padding: '16px 16px 0' }}>
        <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 8 }}>Documentos del viaje</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SEED.map(doc => (
            <DocRow key={doc.id} title={doc.title} type={doc.type}
              subtitle={`Compartido · Grupo`} badge="Oficial" />
          ))}
        </div>
      </div>

      {/* Local docs */}
      {localDocs.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <p className="eyebrow" style={{ padding: '0 4px', marginBottom: 8 }}>Mis documentos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {localDocs.map(doc => (
              <DocRow key={doc.id} title={doc.title}
                type={doc.type as DocumentType}
                subtitle={`Solo en tu teléfono`} badge="Tuyo" />
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowUpload(true)}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
          zIndex: 50,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Upload Sheet */}
      {showUpload && (
        <UploadSheet personId={personId} onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}

function DocRow({ title, type, subtitle, badge }: {
  title: string; type: DocumentType; subtitle: string; badge: 'Oficial' | 'Tuyo'
}) {
  return (
    <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconStamp icon={TYPE_ICON[type] ?? 'docs'} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-soft)', marginTop: 2, fontFamily: 'var(--font-detail)' }}>{subtitle}</div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700,
        padding: '3px 8px', borderRadius: 8,
        background: badge === 'Oficial' ? 'rgba(194,98,46,0.10)' : 'rgba(34,139,34,0.10)',
        color: badge === 'Oficial' ? 'var(--color-primary)' : '#228B22',
        flexShrink: 0,
      }}>
        {badge}
      </span>
    </div>
  )
}

function UploadSheet({ personId, onClose }: { personId: string; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentType>('other')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!title || !file) return
    setSaving(true)
    try {
      const b64 = await fileToBase64(file)
      await db.localDocuments.add({
        ownerPersonId: personId,
        title,
        type,
        fileBase64: b64,
        createdAt: new Date().toISOString(),
      } as LocalDocument)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
      }} />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'var(--color-surface)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px max(20px, env(safe-area-inset-bottom))',
        zIndex: 201,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--color-border)',
          margin: '0 auto 20px',
        }} />

        <h3 style={{ marginBottom: 16 }}>Subir documento</h3>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed var(--color-primary-20)`,
            borderRadius: 12,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 16,
            background: file ? 'var(--color-primary-10)' : 'transparent',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
              ✓ {file.name}
            </p>
          ) : (
            <>
              <IconStamp icon="upload" size={40} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, color: 'var(--color-text-soft)' }}>
                Tocá para elegir foto o PDF
              </p>
            </>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Nombre del documento"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 10, fontSize: 14,
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            marginBottom: 10, outline: 'none',
          }}
        />

        {/* Type */}
        <select
          value={type}
          onChange={e => setType(e.target.value as DocumentType)}
          style={{
            width: '100%', padding: '12px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 10, fontSize: 14,
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            marginBottom: 12, outline: 'none',
          }}
        >
          {DOC_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <p style={{
          fontSize: 11, color: 'var(--color-text-muted)',
          marginBottom: 16, lineHeight: 1.5,
        }}>
          📱 Este archivo se guarda solo en tu teléfono. No se sube a ningún servidor.
        </p>

        <button
          onClick={handleSave}
          disabled={!title || !file || saving}
          style={{
            width: '100%', padding: '14px',
            background: !title || !file ? 'var(--color-border)' : 'var(--color-primary)',
            color: '#fff', border: 'none',
            borderRadius: 12, fontSize: 15, fontWeight: 600,
            cursor: !title || !file ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar documento'}
        </button>
      </div>
    </>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
