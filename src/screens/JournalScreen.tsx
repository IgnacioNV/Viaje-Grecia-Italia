import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexie'
import type { JournalEntry } from '../types'

const MOODS = ['☀️ Soleado', '🌊 Aventurero', '😴 Cansado', '🥰 Emocionado', '🍕 Bien comido']

interface JournalScreenProps {
  personId: string
}

export function JournalScreen({ personId }: JournalScreenProps) {
  const [composing, setComposing] = useState(false)

  const entries = useLiveQuery(
    () => db.journalEntries
      .where('authorId').equals(personId)
      .reverse()
      .toArray(),
    [personId]
  ) ?? []

  if (composing) {
    return (
      <ComposeEntry
        personId={personId}
        onSave={() => setComposing(false)}
        onCancel={() => setComposing(false)}
      />
    )
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Nuestro viaje, día a día</p>
        <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)' }}>Diario</h1>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          🔒 Solo visible para vos
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyJournal onNew={() => setComposing(true)} />
      ) : (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(entry => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setComposing(true)}
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
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
    </div>
  )
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  const date = new Date(entry.date)
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--card-radius)',
      border: `1.5px dashed var(--color-primary-20)`,
      padding: '14px 16px',
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--color-primary)',
        marginBottom: 4, fontFamily: 'var(--font-detail)',
      }}>
        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </div>
      {entry.mood && (
        <div style={{ fontSize: 11, color: 'var(--color-accent)', marginBottom: 6 }}>
          {entry.mood}
        </div>
      )}
      <p style={{
        fontSize: 14,
        color: 'var(--color-text)',
        fontFamily: 'var(--font-display)',
        lineHeight: 1.6,
        fontStyle: 'italic',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {entry.text}
      </p>
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
        padding: '12px 24px',
        background: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        Escribir primera entrada
      </button>
    </div>
  )
}

function ComposeEntry({ personId, onSave, onCancel }: {
  personId: string; onSave: () => void; onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [mood, setMood] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await db.journalEntries.add({
        authorId: personId,
        date: new Date().toISOString(),
        text: text.trim(),
        mood: mood || undefined,
      } as JournalEntry)
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen" style={{ padding: '20px' }}>
      <button onClick={onCancel} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--color-primary)', fontSize: 14, fontWeight: 500,
        marginBottom: 20, padding: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Cancelar
      </button>

      <p className="eyebrow" style={{ marginBottom: 4 }}>
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h2 style={{ marginBottom: 20 }}>¿Qué pasó hoy?</h2>

      {/* Text area */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Una mañana entre trulli. El blanco de la cal contra el cielo..."
        style={{
          width: '100%',
          minHeight: 200,
          padding: '14px',
          border: `1.5px dashed var(--color-primary-20)`,
          borderRadius: 12,
          fontSize: 15,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          lineHeight: 1.7,
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          resize: 'vertical',
          outline: 'none',
          marginBottom: 16,
        }}
      />

      {/* Mood chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => setMood(mood === m ? '' : m)} style={{
            padding: '6px 12px',
            borderRadius: 20,
            border: `1px solid ${mood === m ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: mood === m ? 'var(--color-primary-10)' : 'transparent',
            color: mood === m ? 'var(--color-primary)' : 'var(--color-text-soft)',
            fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!text.trim() || saving}
        style={{
          width: '100%', padding: '14px',
          background: !text.trim() ? 'var(--color-border)' : 'var(--color-primary)',
          color: '#fff', border: 'none',
          borderRadius: 12, fontSize: 15, fontWeight: 600,
          cursor: !text.trim() ? 'default' : 'pointer',
        }}
      >
        {saving ? 'Guardando...' : '📖 Guardar entrada'}
      </button>
    </div>
  )
}
