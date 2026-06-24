import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexie'
import type { JournalEntry } from '../types'

const MOODS = [
  '☀️ Soleado', '🌊 Aventurero', '😴 Cansado', '🥰 Emocionado',
  '🍕 Bien comido', '🌧️ Nostálgico', '😌 Relajado', '🤩 Asombrado',
  '🥵 Mucho calor', '📸 Fotogénico', '💭 Pensativo', '🎉 Feliz',
  '🦶 Cansado de caminar', '🚢 En alta mar', '🏛️ Histórico',
]

interface JournalScreenProps { personId: string }

export function JournalScreen({ personId }: JournalScreenProps) {
  const [composing, setComposing] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)

  const entries = useLiveQuery(
    () => db.journalEntries.where('authorId').equals(personId).reverse().toArray(),
    [personId]
  ) ?? []

  if (composing || editing) {
    return (
      <ComposeEntry
        personId={personId}
        existing={editing ?? undefined}
        onDone={() => { setComposing(false); setEditing(null) }}
      />
    )
  }

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Nuestro viaje, día a día</p>
        <h1 style={{ fontSize: 28 }}>Diario</h1>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-detail)' }}>
          🔒 Solo visible para vos
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyJournal onNew={() => setComposing(true)} />
      ) : (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(entry => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onEdit={() => setEditing(entry)}
              onDelete={async () => {
                if (confirm('¿Borrar esta entrada?')) await db.journalEntries.delete(entry.id!)
              }}
            />
          ))}
        </div>
      )}

      <button onClick={() => setComposing(true)} style={{
        position: 'fixed', bottom: 88,
        right: 'max(20px, calc(50vw - 195px))',
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--color-primary)', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.20)', zIndex: 50,
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
      background: 'var(--color-surface)', borderRadius: 'var(--card-radius)',
      border: '1.5px dashed var(--color-primary-20)', padding: '14px 16px',
      position: 'relative',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--color-primary)',
          fontFamily: 'var(--font-detail)',
        }}>
          {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <button onClick={() => setShowActions(v => !v)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', padding: '0 0 0 8px',
          fontSize: 18, lineHeight: 1,
        }}>···</button>
      </div>

      {/* Actions dropdown */}
      {showActions && (
        <div style={{
          position: 'absolute', top: 36, right: 14,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 10,
        }}>
          <button onClick={() => { setShowActions(false); onEdit() }} style={{
            display: 'block', width: '100%', padding: '10px 18px',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--color-text)', textAlign: 'left',
            fontFamily: 'var(--font-body)',
          }}>✏️ Editar</button>
          <button onClick={() => { setShowActions(false); onDelete() }} style={{
            display: 'block', width: '100%', padding: '10px 18px',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, color: '#e53e3e', textAlign: 'left',
            fontFamily: 'var(--font-body)',
            borderTop: '1px solid var(--color-border)',
          }}>🗑️ Borrar</button>
        </div>
      )}

      {entry.mood && (
        <div style={{ fontSize: 11, color: 'var(--color-accent)', marginBottom: 6, fontFamily: 'var(--font-detail)' }}>
          {entry.mood}
        </div>
      )}

      <p style={{
        fontSize: 14, color: 'var(--color-text)', fontFamily: 'var(--font-detail)',
        lineHeight: 1.6, fontStyle: 'italic',
        display: '-webkit-box', WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {entry.text}
      </p>

      {entry.photoBase64 && (
        <img src={entry.photoBase64} alt="foto" style={{
          width: '100%', borderRadius: 10, marginTop: 10, objectFit: 'cover', maxHeight: 200,
        }} />
      )}
    </div>
  )
}

/* ── Compose / Edit Entry ───────────────────────────────── */
function ComposeEntry({ personId, existing, onDone }: {
  personId: string; existing?: JournalEntry; onDone: () => void
}) {
  const [text, setText] = useState(existing?.text ?? '')
  const [mood, setMood] = useState(existing?.mood ?? '')
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
        await db.journalEntries.update(existing.id, {
          text: text.trim(), mood: mood || undefined, photoBase64: photo,
        })
      } else {
        await db.journalEntries.add({
          authorId: personId, date: new Date().toISOString(),
          text: text.trim(), mood: mood || undefined, photoBase64: photo,
        } as JournalEntry)
      }
      onDone()
    } finally { setSaving(false) }
  }

  return (
    <div className="screen" style={{ padding: '20px' }}>
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
      <h2 style={{ marginBottom: 20 }}>{existing ? 'Editar entrada' : '¿Qué pasó hoy?'}</h2>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Una mañana entre trulli. El blanco de la cal contra el cielo..."
        style={{
          width: '100%', minHeight: 180, padding: '14px',
          border: '1.5px dashed var(--color-primary-20)', borderRadius: 12,
          fontSize: 15, fontFamily: 'var(--font-detail)', fontStyle: 'italic',
          lineHeight: 1.7, background: 'var(--color-surface)',
          color: 'var(--color-text)', resize: 'vertical', outline: 'none', marginBottom: 14,
        }}
      />

      {/* Mood chips */}
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        ¿Cómo fue el día?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => setMood(mood === m ? '' : m)} style={{
            padding: '6px 12px', borderRadius: 20,
            border: `1px solid ${mood === m ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: mood === m ? 'var(--color-primary-10)' : 'transparent',
            color: mood === m ? 'var(--color-primary)' : 'var(--color-text-soft)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-detail)',
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Photo */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 14px', borderRadius: 12,
        border: '1px dashed var(--color-primary-20)',
        cursor: 'pointer', marginBottom: 16,
        color: 'var(--color-primary)', fontSize: 13, fontWeight: 500,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        {photo ? '✓ Foto agregada — tocá para cambiar' : 'Agregar foto del día'}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
      </label>

      {photo && (
        <img src={photo} alt="preview" style={{
          width: '100%', borderRadius: 12, marginBottom: 16,
          objectFit: 'cover', maxHeight: 200,
        }} />
      )}

      <button onClick={handleSave} disabled={!text.trim() || saving} style={{
        width: '100%', padding: '14px',
        background: !text.trim() ? 'var(--color-border)' : 'var(--color-primary)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 15, fontWeight: 600, cursor: !text.trim() ? 'default' : 'pointer',
        fontFamily: 'var(--font-body)',
      }}>
        {saving ? 'Guardando...' : existing ? '✓ Guardar cambios' : '📖 Guardar entrada'}
      </button>
    </div>
  )
}

function EmptyJournal({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
      <h3 style={{ marginBottom: 8 }}>Tu diario está vacío</h3>
      <p style={{ color: 'var(--color-text-soft)', fontSize: 14, marginBottom: 24 }}>
        Escribí tu primera entrada.<br/>Solo vos la podés leer.
      </p>
      <button onClick={onNew} style={{
        padding: '12px 24px', background: 'var(--color-primary)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}>
        Escribir primera entrada
      </button>
    </div>
  )
}
