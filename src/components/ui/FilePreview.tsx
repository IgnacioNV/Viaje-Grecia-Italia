import { useState } from 'react'
import { copyToClipboard } from '../../utils/clipboard'

/* ── Shared close bar ───────────────────────────────────── */
function CloseBar({ onClose, title }: { onClose: () => void; title?: string }) {
  return (
    <button onClick={onClose} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '16px 20px',
      background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'var(--font-detail)', textAlign: 'left', flex: 1 }}>
        {title ?? 'Tocá en cualquier lugar para cerrar'}
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
    </button>
  )
}

/* ── Full-screen preview for base64 files ───────────────── */
export function FilePreview({ src, onClose }: { src: string; onClose: () => void }) {
  const isPdf = src.startsWith('data:application/pdf')

  if (isPdf) {
    // On mobile, PDFs in iframes are unreliable. Open in native viewer via blob URL.
    const handleOpenPdf = () => {
      const byteStr = atob(src.split(',')[1])
      const arr = new Uint8Array(byteStr.length)
      for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i)
      const blob = new Blob([arr], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
        <CloseBar onClose={onClose} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', fontFamily: 'var(--font-detail)' }}>
            Documento PDF
          </p>
          <button onClick={handleOpenPdf} style={{
            padding: '12px 28px', background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Abrir PDF</button>
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
      <div onClick={e => e.stopPropagation()}>
        <CloseBar onClose={onClose} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px 32px', overflow: 'hidden' }}>
        <img src={src} alt="Vista previa" onClick={e => e.stopPropagation()}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10, display: 'block' }} />
      </div>
    </div>
  )
}

/* ── Preview for static /public files (cached by SW) ────── */
export function StaticFilePreview({ filePath, title, onClose }: {
  filePath: string; title: string; onClose: () => void
}) {
  const isPdf = filePath.endsWith('.pdf')

  if (isPdf) {
    const handleOpenPdf = () => window.open(filePath, '_blank')
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
        <CloseBar onClose={onClose} title={title} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', fontFamily: 'var(--font-detail)' }}>
            {title}
          </p>
          <button onClick={handleOpenPdf} style={{
            padding: '12px 28px', background: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Abrir PDF</button>
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
      <div onClick={e => e.stopPropagation()}>
        <CloseBar onClose={onClose} title={title} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px 32px', overflow: 'hidden' }}>
        <img src={filePath} alt={title} onClick={e => e.stopPropagation()}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10, display: 'block' }} />
      </div>
    </div>
  )
}

/* ── Copy button ────────────────────────────────────────── */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    const ok = await copyToClipboard(text)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  return (
    <button onClick={handle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 14,
      border: `1px solid ${copied ? '#2d6a4f' : 'var(--color-primary-20)'}`,
      background: copied ? '#d8f3dc' : 'var(--color-primary-10)',
      color: copied ? '#2d6a4f' : 'var(--color-primary)',
      fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-detail)',
      transition: 'all 0.2s ease',
    }}>
      {copied
        ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>Copiado</>
        : <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>{label ?? 'Copiar'}</>
      }
    </button>
  )
}

/* ── Download button ────────────────────────────────────── */
export function DownloadButton({ src, filename, label }: { src: string; filename: string; label?: string }) {
  const handle = () => {
    const a = document.createElement('a')
    a.href = src; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }
  return (
    <button onClick={handle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 14,
      border: '1px solid var(--color-primary-20)', background: 'var(--color-primary-10)',
      color: 'var(--color-primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-detail)',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {label ?? 'Descargar'}
    </button>
  )
}
