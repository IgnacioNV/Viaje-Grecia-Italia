import { useState, useEffect, useRef } from 'react'
import { copyToClipboard } from '../../utils/clipboard'

/* ── Viewport zoom control ──────────────────────────────── */
const VP_NO_ZOOM = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
const VP_ZOOM    = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
function enableZoom()  { document.querySelector('meta[name="viewport"]')?.setAttribute('content', VP_ZOOM) }
function disableZoom() { document.querySelector('meta[name="viewport"]')?.setAttribute('content', VP_NO_ZOOM) }

/* ── PDF.js loader ──────────────────────────────────────── */
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

function usePdfJs(): any {
  const [lib, setLib] = useState<any>(null)
  useEffect(() => {
    if ((window as any).pdfjsLib) { setLib((window as any).pdfjsLib); return }
    const s = document.createElement('script')
    s.src = PDFJS_CDN
    s.onload = () => {
      const lib = (window as any).pdfjsLib
      lib.GlobalWorkerOptions.workerSrc = WORKER_CDN
      setLib(lib)
    }
    document.head.appendChild(s)
  }, [])
  return lib
}

/* ── PDF Viewer using PDF.js ────────────────────────────── */
function PDFViewer({ src, isUrl }: { src: string; isUrl?: boolean }) {
  const pdfjsLib = usePdfJs()
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
    const renderedRef = useRef(false)

  useEffect(() => {
    if (!pdfjsLib || !src || renderedRef.current) return
    renderedRef.current = true

    const renderPDF = async () => {
      try {
        setLoading(true)
        const container = containerRef.current
        if (!container) return

        let source: any
        if (isUrl) {
          source = { url: src }
        } else {
          // base64 → Uint8Array
          const base64 = src.split(',')[1]
          const binary = atob(base64)
          const arr = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
          source = { data: arr }
        }

        const pdf = await pdfjsLib.getDocument(source).promise
        container.innerHTML = ''

        const viewportWidth = container.clientWidth || window.innerWidth

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const scale = viewportWidth / page.getViewport({ scale: 1 }).width
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = '100%'
          canvas.style.display = 'block'
          canvas.style.marginBottom = i < pdf.numPages ? '8px' : '0'

          const ctx = canvas.getContext('2d')!
          await page.render({ canvasContext: ctx, viewport }).promise
          container.appendChild(canvas)
        }
        setLoading(false)
      } catch (e) {
        console.error('PDF render error:', e)
        setError(true)
        setLoading(false)
      }
    }

    renderPDF()
  }, [pdfjsLib, src, isUrl])

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, padding: 24 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', fontFamily: 'var(--font-detail)' }}>
          No se pudo mostrar el documento
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' as any, background: '#333', padding: '8px' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'var(--font-detail)' }}>
            Cargando documento...
          </p>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}

/* ── Shared shell ───────────────────────────────────────── */
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
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#111',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12,
        }}>
          {title}
        </span>
        <button onClick={onClose} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 20,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          fontFamily: 'var(--font-body)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Cerrar
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Big back button */}
      <button onClick={onClose} style={{
        width: '100%', padding: '18px',
        paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
        background: 'var(--color-primary)', border: 'none', cursor: 'pointer',
        color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-body)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver a la app
      </button>
    </div>
  )
}

/* ── FilePreview (base64) ───────────────────────────────── */
export function FilePreview({ src, onClose }: { src: string; onClose: () => void }) {
  const isPdf = src.startsWith('data:application/pdf')

  return (
    <PreviewShell title={isPdf ? 'Documento' : 'Imagen'} onClose={onClose}>
      {isPdf
        ? <PDFViewer src={src} isUrl={false} />
        : <img src={src} alt="Vista previa" style={{ width: '100%', flex: 1, objectFit: 'contain', display: 'block', minHeight: 0 }} />
      }
    </PreviewShell>
  )
}

/* ── StaticFilePreview (URL path) ───────────────────────── */
export function StaticFilePreview({ filePath, title, onClose }: {
  filePath: string; title: string; onClose: () => void
}) {
  const isPdf = filePath.endsWith('.pdf')

  return (
    <PreviewShell title={title} onClose={onClose}>
      {isPdf
        ? <PDFViewer src={filePath} isUrl={true} />
        : <img src={filePath} alt={title} style={{ width: '100%', flex: 1, objectFit: 'contain', display: 'block', minHeight: 0 }} />
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
      border: '1px solid var(--color-primary-20)', background: 'var(--color-primary-10)',
      color: 'var(--color-primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
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
