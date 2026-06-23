import type { CSSProperties, ReactElement } from 'react'

export type IconName =
  | 'home' | 'family' | 'document' | 'journal' | 'map'
  | 'flight' | 'ticket' | 'reservation' | 'passport'
  | 'pin' | 'upload' | 'plus' | 'anchor' | 'sun' | 'back'
  | 'shield' | 'camera' | 'restaurant' | 'add' | 'location' | 'docs'

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ICONS: Record<string, ReactElement> = {
  home: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1z"/>
    </svg>
  ),
  family: (
    <svg viewBox="0 0 24 24" {...S}>
      <circle cx="9" cy="6.5" r="2.5"/>
      <circle cx="16.5" cy="6" r="2"/>
      <path d="M2 21v-1.5A5.5 5.5 0 0 1 13 18v3"/>
      <path d="M16.5 10.5A4 4 0 0 1 21 14.5V21"/>
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>
  ),
  journal: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M2 4h4v16H2z"/>
      <path d="M6 4h13a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6"/>
      <line x1="10" y1="9" x2="16" y2="9"/>
      <line x1="10" y1="13" x2="14" y2="13"/>
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" {...S}>
      <polygon points="3,5 9,3 15,6 21,4 21,19 15,21 9,18 3,20"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  flight: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M13 2L4.5 13.5H10l-2 8.5 10.5-11H13z"/>
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M2 8a2 2 0 0 1 0 4v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-4V5a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/>
      <line x1="8" y1="4" x2="8" y2="20" strokeDasharray="2 2"/>
    </svg>
  ),
  reservation: (
    <svg viewBox="0 0 24 24" {...S}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <polyline points="9,16 11,18 15,14"/>
    </svg>
  ),
  passport: (
    <svg viewBox="0 0 24 24" {...S}>
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <circle cx="12" cy="11" r="3"/>
      <line x1="7" y1="7" x2="17" y2="7"/>
      <line x1="7" y1="18" x2="17" y2="18"/>
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" {...S}>
      <polyline points="16,6 12,2 8,6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
      <path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" {...S}>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  anchor: (
    <svg viewBox="0 0 24 24" {...S}>
      <circle cx="12" cy="5" r="3"/>
      <line x1="12" y1="8" x2="12" y2="22"/>
      <path d="M5 15h2a5 5 0 0 0 10 0h2"/>
      <line x1="5" y1="11" x2="19" y2="11"/>
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" {...S}>
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="4"/>
      <line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" {...S}>
      <polyline points="15,18 9,12 15,6"/>
    </svg>
  ),
  // aliases
  shield: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11C7.5 20.5 4 16 4 11V5z"/>
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  restaurant: (
    <svg viewBox="0 0 24 24" {...S}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  // map add/location to canonical names
  add:      <svg viewBox="0 0 24 24" {...S}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  location: <svg viewBox="0 0 24 24" {...S}><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  docs:     <svg viewBox="0 0 24 24" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
}

interface IconStampProps {
  icon: IconName
  size?: number
  style?: CSSProperties
  className?: string
}

export function IconStamp({ icon, size = 36, style, className }: IconStampProps) {
  const iconEl = ICONS[icon] ?? ICONS['document']
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--stamp-radius)',
        background: 'var(--stamp-bg)',
        border: 'var(--stamp-border)',
        boxShadow: 'var(--stamp-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--color-primary)',
        transition: 'border-radius 0.4s ease',
        ...style,
      }}
    >
      <div style={{ width: size * 0.52, height: size * 0.52 }}>
        {iconEl}
      </div>
    </div>
  )
}
