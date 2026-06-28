import { useState, useEffect } from 'react'

/* ── Viewport zoom control ──────────────────────────────── */
const VIEWPORT_NO_ZOOM = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
const VIEWPORT_ZOOM    = 'width=device-width, initial-scale=1.0, viewport-fit=cover'

function enableZoom()  { document.querySelector('meta[name="viewport"]')?.setAttribute('content', VIEWPORT_ZOOM) }
function disableZoom() { document.querySelector('meta[name="viewport"]')?.setAttribute('content', VIEWPORT_NO_ZOOM) }
import { copyToClipboard } from '../../utils/clipboard'

/* ── Full-screen overlay wrapper ────────────────────────── */
function PreviewShell({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode
}) {
  useEffect(() => {
    enableZoom()
    return () => disableZoom()
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#111',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header — always visible */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#111',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.8)', fontSize: 13,
          fontFamily: 'var(--font-body)', fontWeight: 500,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginRight: 12,
        }}>
          {title}
        </span>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 20,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', flexShrink: 0,
          fontFamily: 'var(--font-body)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Cerrar
        </button>
      </div>

      {/* Content — fills all space between header and footer */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Big "Volver" bar at the bottom — for grandparents */}
      <button onClick={onClose} style={{
        width: '100%',
        padding: '18px',
        background: 'var(--color-primary)',
        border: 'none', cursor: 'pointer',
        color: '#fff', fontSize: 16, fontWeight: 700,
        fontFamily: 'var(--font-body)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        flexShrink: 0,
        paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver a la app
      </button>
    </div>
  )
}

/* ── Base64 PDF → blob URL ──────────────────────────────── */
function usePdfBlobUrl(src: string | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!src?.startsWith('data:application/pdf')) return
    const byteStr = atob(src.split(',')[1])
    const arr = new Uint8Array(byteStr.length)
    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i)
    const blob = new Blob([arr], { type: 'application/pdf' })
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [src])
  return url
}

/* ── Full-screen preview for base64 files ───────────────── */
export function FilePreview({ src, onClose }: { src: string; onClose: () => void }) {
  const isPdf = src.startsWith('data:application/pdf')
  const blobUrl = usePdfBlobUrl(isPdf ? src : null)

  if (isPdf) {
    return (
      <PreviewShell title="Documento" onClose={onClose}>
        {blobUrl
          ? <iframe src={blobUrl} style={{ width: '100%', flex: 1, border: 'none', display: 'block' }} title="Documento" />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              Cargando...
            </div>
        }
      </PreviewShell>
    )
  }

  return (
    <PreviewShell title="Imagen" onClose={onClose}>
      <img src={src} alt="Vista previa" style={{
        width: '100%', flex: 1,
        objectFit: 'contain', display: 'block',
        minHeight: 0,
      }} />
    </PreviewShell>
  )
}

/* ── Preview for static /public files (cached by SW) ────── */
export function StaticFilePreview({ filePath, title, onClose }: {
  filePath: string; title: string; onClose: () => void
}) {
  const isPdf = filePath.endsWith('.pdf')

  return (
    <PreviewShell title={title} onClose={onClose}>
      {isPdf
        ? <iframe src={filePath} style={{ width: '100%', flex: 1, border: 'none', display: 'block' }} title={title} />
        : <img src={filePath} alt={title} style={{
            width: '100%', height: '100%',
            objectFit: 'contain', display: 'block',
          }} />
      }
    </PreviewShell>
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
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      fontFamily: 'var(--font-detail)', transition: 'all 0.2s ease',
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
      border: '1px solid var(--color-primary-20)',
      background: 'var(--color-primary-10)',
      color: 'var(--color-primary)',
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      fontFamily: 'var(--font-detail)',
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {label ?? 'Descargar'}
    </button>
  )
}
