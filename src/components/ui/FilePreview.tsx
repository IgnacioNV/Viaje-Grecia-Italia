import { useState } from 'react'
import { copyToClipboard } from '../../utils/clipboard'

/* ── Full-screen file preview ───────────────────────────── */
export function FilePreview({ src, onClose }: { src: string; onClose: () => void }) {
  const isPdf = src.startsWith('data:application/pdf')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      zIndex: 300, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px' }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 32px' }}>
        {isPdf
          ? <iframe src={src} style={{ width: '100%', height: '100%', borderRadius: 12, border: 'none' }} title="Documento" />
          : <img src={src} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain' }} />
        }
      </div>
    </div>
  )
}

/* ── Static file preview (from URL path, cached by SW) ─── */
export function StaticFilePreview({ filePath, title, onClose }: {
  filePath: string; title: string; onClose: () => void
}) {
  const isPdf = filePath.endsWith('.pdf')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      zIndex: 300, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{title}</span>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, padding: '0 16px 32px' }}>
        {isPdf
          ? <iframe src={filePath} style={{ width: '100%', height: '100%', borderRadius: 12, border: 'none' }} title={title} />
          : <img src={filePath} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain', margin: '0 auto', display: 'block' }} />
        }
      </div>
    </div>
  )
}

/* ── Copy button ────────────────────────────────────────── */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button onClick={handle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 14,
      border: `1px solid ${copied ? '#2d6a4f' : 'var(--color-primary-20)'}`,
      background: copied ? '#d8f3dc' : 'var(--color-primary-10)',
      color: copied ? '#2d6a4f' : 'var(--color-primary)',
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      fontFamily: 'var(--font-detail)',
      transition: 'all 0.2s ease',
    }}>
      {copied ? (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {label ?? 'Copiar'}
        </>
      )}
    </button>
  )
}
