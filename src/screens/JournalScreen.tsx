import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexie'
import { exportJournalToPDF } from '../data/exportPdf'
import type { JournalEntry } from '../types'

const MOODS: { label: string; color: string }[] = [
  { label: 'Soleado',           color: '#F5A623' },
  { label: 'Aventurero',        color: '#1B3FA6' },
  { label: 'Cansado',           color: '#9B9B9B' },
  { label: 'Emocionado',        color: '#E8B84A' },
  { label: 'Bien comido',       color: '#C2622E' },
  { label: 'Nostálgico',        color: '#7B68EE' },
  { label: 'Relajado',          color: '#50C878' },
  { label: 'Asombrado',         color: '#00CED1' },
  { label: 'Mucho calor',       color: '#FF6B35' },
  { label: 'Fotogénico',        color: '#FF69B4' },
  { label: 'Pensativo',         color: '#708090' },
  { label: 'Feliz',             color: '#FFD700' },
  { label: 'Sin batería',       color: '#A0522D' },
  { label: 'En alta mar',       color: '#1A5FAA' },
  { label: 'Histórico',         color: '#8B7355' },
  { label: 'Caminé demasiado',  color: '#CD853F' },
]

interface JournalScreenProps { personId: string; personName: string }

export function JournalScreen({ personId, personName }: JournalScreenProps) {
  const [composing, setComposing] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [exporting, setExporting] = useState(false)

  const entries = useLiveQuery(
    () => db.journalEntries.where('authorId').equals(personId).reverse().toArray(),
    [personId]
  ) ?? []

  const TRIP_END = new Date('2026-08-02') // habilitado el día después del regreso
  const tripEnded = new Date() > TRIP_END

  const handleExport = async () => {
    if (entries.length === 0) return
    setExporting(true)
    try { await exportJournalToPDF(entries, personName) }
    finally { setExporting(false) }
  }

  if (composing || editing) {
    return <ComposeEntry personId={personId}
      existing={editing ?? undefined}
      onDone={() => { setComposing(false); setEditing(null) }} />
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Solo visible para vos</p>
            <h1 style={{ fontSize: 28 }}>Diario</h1>
          </div>
          {entries.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
              <button
                onClick={tripEnded ? handleExport : undefined}
                disabled={!tripEnded || exporting}
                title={tripEnded ? 'Descargar diario en PDF' : 'Disponible al terminar el viaje'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 20,
                  border: `1.5px solid ${tripEnded ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: 'transparent',
                  color: tripEnded ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontSize: 12, fontWeight: 600,
                  cursor: tripEnded ? 'pointer' : 'default',
                  fontFamily: 'var(--font-body)',
                  opacity: tripEnded ? 1 : 0.5,
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {exporting ? 'Generando...' : 'PDF'}
              </button>
              {!tripEnded && (
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-detail)' }}>
                  Disponible el 2 ago
                </span>
              )}
            </div>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, fontFamily: 'var(--font-detail)' }}>
          {entries.length === 0 ? 'Todavía no escribiste nada.' : `${entries.length} entrada${entries.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyJournal onNew={() => setComposing(true)} />
      ) : (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(entry => (
            <JournalCard key={entry.id} entry={entry}
              onEdit={() => setEditing(entry)}
              onDelete={async () => { if (confirm('Borrar esta entrada?')) await db.journalEntries.delete(entry.id!) }} />
          ))}
        </div>
      )}

      {/* FAB — higher to not touch navbar */}
      <button onClick={() => setComposing(true)} style={{
        position: 'fixed', bottom: 132,
        right: 'max(20px, calc(50vw - 195px))',
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--color-primary)', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', boxShadow: '0 4px 20px rgba(27,63,166,0.35)', zIndex: 50,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
    </div>
  )
}

/* ── Journal Card ───────────────────────────────────────── */
function JournalCard({ entry, onEdit, onDelete }: {
  entry: JournalEntry; onEdit: () => void; onDelete: () => void
}) {
  const date = new Date(entry.date)
  const [showActions, setShowActions] = useState(false)


  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: 16,
      border: '1.5px dashed var(--color-primary-20)', padding: '14px 16px', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-primary)', fontFamily: 'var(--font-detail)',
        }}>
          {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <button onClick={() => setShowActions(v => !v)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1, padding: '0 0 0 8px',
        }}>···</button>
      </div>

      {showActions && (
        <div style={{
          position: 'absolute', top: 36, right: 14,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 10,
        }}>
          <button onClick={() => { setShowActions(false); onEdit() }} style={{
            display: 'block', width: '100%', padding: '10px 18px',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--color-text)', textAlign: 'left', fontFamily: 'var(--font-body)',
          }}>Editar</button>
          <button onClick={() => { setShowActions(false); onDelete() }} style={{
            display: 'block', width: '100%', padding: '10px 18px',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, color: '#e53e3e', textAlign: 'left', fontFamily: 'var(--font-body)',
            borderTop: '1px solid var(--color-border)',
          }}>Borrar</button>
        </div>
      )}

      {(entry.moods?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {(entry.moods ?? []).map(m => {
            const moodColor = MOODS.find(x => x.label === m)?.color
            return (
              <span key={m} style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                background: moodColor ? `${moodColor}20` : 'var(--color-primary-10)',
                border: `1px solid ${moodColor ?? 'var(--color-primary)'}40`,
                fontSize: 11, fontWeight: 600,
                color: moodColor ?? 'var(--color-primary)',
                fontFamily: 'var(--font-detail)',
              }}>{m}</span>
            )
          })}
        </div>
      )}

      <p style={{
        fontSize: 14, color: 'var(--color-text)', fontFamily: 'var(--font-detail)',
        lineHeight: 1.6, fontStyle: 'italic',
        display: '-webkit-box', WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{entry.text}</p>

      {entry.photoBase64 && (
        <img src={entry.photoBase64} alt="foto" style={{
          width: '100%', borderRadius: 10, marginTop: 10, objectFit: 'cover', maxHeight: 200,
        }} />
      )}
    </div>
  )
}

/* ── Compose / Edit ─────────────────────────────────────── */
function ComposeEntry({ personId, existing, onDone }: {
  personId: string; existing?: JournalEntry; onDone: () => void
}) {
  const [text, setText] = useState(existing?.text ?? '')
  const [moods, setMoods] = useState<string[]>(existing?.moods ?? (existing?.mood ? [existing.mood] : []))
  const [photo, setPhoto] = useState<string | undefined>(existing?.photoBase64)
  const [saving, setSaving] = useState(false)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      if (existing?.id) {
        await db.journalEntries.update(existing.id, { text: text.trim(), moods, photoBase64: photo })
      } else {
        await db.journalEntries.add({
          authorId: personId, date: new Date().toISOString(),
          text: text.trim(), moods, photoBase64: photo,
        } as JournalEntry)
      }
      onDone()
    } finally { setSaving(false) }
  }

  return (
    /* Full-height scrollable container */
    <div style={{
      minHeight: '100dvh', overflowY: 'auto',
      padding: '20px 20px 40px',
      background: 'var(--color-bg)',
    }}>
      <button onClick={onDone} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--color-primary)', fontSize: 14, fontWeight: 500,
        marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        {existing ? 'Cancelar edición' : 'Cancelar'}
      </button>

      <p className="eyebrow" style={{ marginBottom: 4 }}>
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h2 style={{ marginBottom: 20 }}>{existing ? 'Editar entrada' : 'Qué pasó hoy?'}</h2>

      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Una mañana entre trulli. El blanco de la cal contra el cielo..."
        style={{
          width: '100%', minHeight: 160, padding: '14px',
          border: '1.5px dashed var(--color-primary-20)', borderRadius: 12,
          fontSize: 15, fontFamily: 'var(--font-detail)', fontStyle: 'italic',
          lineHeight: 1.7, background: 'var(--color-surface)',
          color: 'var(--color-text)', resize: 'none', outline: 'none', marginBottom: 14,
          boxSizing: 'border-box',
        }}
      />

      {/* Moods */}
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8,
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Cómo fue el día
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
        {MOODS.map(m => (
          <button key={m.label} onClick={() => setMoods(prev => prev.includes(m.label) ? prev.filter(x => x !== m.label) : [...prev, m.label])} style={{
            padding: '6px 12px', borderRadius: 20,
            border: `1.5px solid ${moods.includes(m.label) ? m.color : 'var(--color-border)'}`,
            background: moods.includes(m.label) ? `${m.color}18` : 'transparent',
            color: moods.includes(m.label) ? m.color : 'var(--color-text-soft)',
            fontSize: 12, fontWeight: moods.includes(m.label) ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font-detail)',
          }}>{m.label}</button>
        ))}
      </div>

      {/* Photo */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
        borderRadius: 12, border: '1px dashed var(--color-primary-20)',
        cursor: 'pointer', marginBottom: photo ? 10 : 18,
        color: 'var(--color-primary)', fontSize: 13, fontWeight: 500,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        {photo ? 'Foto agregada — tocá para cambiar' : 'Agregar foto del día'}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
      </label>

      {photo && (
        <img src={photo} alt="preview" style={{
          width: '100%', borderRadius: 12, marginBottom: 18,
          objectFit: 'cover', maxHeight: 200,
        }} />
      )}

      <button onClick={handleSave} disabled={!text.trim() || saving} style={{
        width: '100%', padding: '15px',
        background: !text.trim() ? 'var(--color-border)' : 'var(--color-primary)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 15, fontWeight: 600,
        cursor: !text.trim() ? 'default' : 'pointer',
        fontFamily: 'var(--font-body)',
        marginBottom: 20,
      }}>
        {saving ? 'Guardando...' : existing ? 'Guardar cambios' : 'Guardar entrada'}
      </button>
    </div>
  )
}

function EmptyJournal({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: 16 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-primary-20)" strokeWidth="1.2" strokeLinecap="round"
          style={{ margin: '0 auto', display: 'block' }}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/>
        </svg>
      </div>
      <h3 style={{ marginBottom: 8 }}>Tu diario está vacío</h3>
      <p style={{ color: 'var(--color-text-soft)', fontSize: 14, marginBottom: 24 }}>
        Escribí tu primera entrada.<br/>Solo vos la podés leer.
      </p>
      <button onClick={onNew} style={{
        padding: '12px 24px', background: 'var(--color-primary)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
      }}>Escribir primera entrada</button>
    </div>
  )
}
