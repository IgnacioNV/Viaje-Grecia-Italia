import itinerary from '../data/itinerary.json'
import type { Day } from '../types'

const DAYS = itinerary as Day[]

// Route stops with SVG coordinates (Italy-Greece regional map)
const STOPS = [
  { id: 'bari',       label: 'Bari',       x: 148, y: 178, days: [1,2,3,4,5,12] },
  { id: 'embark',     label: 'Embarque',   x: 148, y: 178, days: [5] },
  { id: 'santorini',  label: 'Santorini',  x: 310, y: 350, days: [7] },
  { id: 'athens',     label: 'Atenas',     x: 278, y: 298, days: [8] },
  { id: 'katakolo',   label: 'Katakolo',   x: 222, y: 295, days: [9] },
  { id: 'cephalonia', label: 'Cefalonia',  x: 204, y: 270, days: [10] },
  { id: 'corfu',      label: 'Corfú',      x: 174, y: 220, days: [11] },
]

const ROUTE_POINTS = [
  { x: 148, y: 178 }, // Bari
  { x: 174, y: 220 }, // Corfu (reverse — cruise goes Bari→...→Corfu→Bari)
  { x: 204, y: 270 }, // Cephalonia
  { x: 222, y: 295 }, // Katakolo
  { x: 278, y: 298 }, // Athens
  { x: 310, y: 350 }, // Santorini
]

function getTodayDayNumber(): number {
  const today = new Date().toISOString().split('T')[0]
  const idx = DAYS.findIndex(d => d.date === today)
  return idx >= 0 ? idx + 1 : 0
}

type Transport = 'walking' | 'train' | 'ship' | 'plane'

function getTransport(dayNum: number): Transport {
  if (dayNum === 0) return 'plane' // before trip
  const day = DAYS[dayNum - 1]
  if (!day) return 'plane'
  if (day.theme === 'cruise') return 'ship'
  const hasTrainActivity = day.activities.some(a => a.title.toLowerCase().includes('tren'))
  if (hasTrainActivity) return 'train'
  return 'walking'
}

function getCurrentPosition(dayNum: number): { x: number; y: number } {
  if (dayNum === 0 || dayNum <= 4) return { x: 148, y: 178 } // Bari
  if (dayNum === 5)  return { x: 148, y: 178 } // embarque
  if (dayNum === 6)  return { x: 220, y: 240 } // navegando
  if (dayNum === 7)  return { x: 310, y: 350 } // Santorini
  if (dayNum === 8)  return { x: 278, y: 298 } // Athens
  if (dayNum === 9)  return { x: 222, y: 295 } // Katakolo
  if (dayNum === 10) return { x: 204, y: 270 } // Cephalonia
  if (dayNum === 11) return { x: 174, y: 220 } // Corfu
  return { x: 148, y: 178 } // Bari (day 12 return)
}

const TransportIcon = ({ type, x, y }: { type: Transport; x: number; y: number }) => {
  const size = 22
  const half = size / 2
  const icons: Record<Transport, string> = {
    plane:   'M12 2L3 9.5H9L7 21.5L11.5 18l1 3.5L17 7H21z',
    ship:    'M3 17l2-8h14l2 8H3zM7 9V6h10v3M12 2v4',
    train:   'M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10l-2 2H6l-2-2zM9 20h6M8 12h8M8 8h8',
    walking: 'M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M6 20l4-8 2 2 2-4M14 7l-2 5',
  }
  return (
    <g transform={`translate(${x - half}, ${y - half})`}>
      <circle cx={half} cy={half} r={half + 2} fill="var(--color-primary)" opacity="0.15"/>
      <circle cx={half} cy={half} r={half - 1} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5"/>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
        stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={icons[type]}/>
      </svg>
    </g>
  )
}

export function MapScreen() {
  const todayDayNum = getTodayDayNumber()
  const transport = getTransport(todayDayNum)
  const pos = getCurrentPosition(todayDayNum)
  const currentDay = todayDayNum > 0 ? DAYS[todayDayNum - 1] : null

  const routeD = ROUTE_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px 0' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Nuestro recorrido</p>
        <h1 style={{ fontSize: 28 }}>El viaje</h1>
        {currentDay && (
          <p style={{ fontSize: 13, color: 'var(--color-text-soft)', marginTop: 4, fontFamily: 'var(--font-detail)' }}>
            Día {todayDayNum} · {currentDay.destination}
          </p>
        )}
      </div>

      {/* SVG MAP */}
      <div style={{ padding: '16px 12px 0', overflow: 'hidden' }}>
        <svg viewBox="0 0 390 420" style={{ width: '100%', borderRadius: 20, overflow: 'visible' }}>
          <defs>
            <linearGradient id="sea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B8D8F0"/>
              <stop offset="100%" stopColor="#7EB8DC"/>
            </linearGradient>
            <linearGradient id="land-italy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4C5A0"/>
              <stop offset="100%" stopColor="#C4B085"/>
            </linearGradient>
            <linearGradient id="land-greece" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CEC09A"/>
              <stop offset="100%" stopColor="#B8A878"/>
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.15"/>
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Sea background */}
          <rect width="390" height="420" fill="url(#sea)" rx="20"/>

          {/* Sea texture — subtle waves */}
          {[80,130,180,230,280,340].map(y =>
            <path key={y} d={`M10 ${y} Q60 ${y-8} 110 ${y} Q160 ${y+8} 210 ${y} Q260 ${y-8} 310 ${y} Q360 ${y+8} 390 ${y}`}
              fill="none" stroke="white" strokeWidth="0.8" opacity="0.25"/>
          )}

          {/* ── ITALY ── */}
          {/* Northern Italy / Alps */}
          <path d="M0 0 L200 0 L200 60 Q160 80 120 90 Q80 95 40 85 Q10 80 0 70 Z"
            fill="url(#land-italy)" filter="url(#shadow)"/>

          {/* Italian peninsula (simplified boot) */}
          <path d="
            M120 90 Q140 95 160 100 Q180 108 185 120
            Q188 140 185 160 Q182 175 175 188
            Q168 200 162 215 Q156 230 152 245
            Q148 258 144 268 Q138 280 130 285
            Q120 290 112 280 Q108 270 112 258
            Q116 245 120 235 Q124 222 124 210
            Q122 198 118 188 Q112 175 108 162
            Q102 148 100 132 Q98 115 102 100
            Q108 92 120 90 Z"
            fill="url(#land-italy)" filter="url(#shadow)"/>

          {/* Puglia (heel) */}
          <path d="M162 215 Q170 218 178 228 Q185 238 182 248
            Q178 256 168 258 Q158 258 152 248 Q148 238 152 228 Q156 220 162 215 Z"
            fill="#C8B48A"/>

          {/* Calabria toe */}
          <path d="M126 278 Q132 282 134 292 Q134 300 128 302
            Q120 302 116 294 Q114 285 118 280 Z"
            fill="#C8B48A"/>

          {/* Sicily */}
          <path d="M88 310 Q104 308 118 312 Q130 318 130 328
            Q128 338 116 342 Q100 344 88 338 Q76 330 78 320 Q82 312 88 310 Z"
            fill="url(#land-italy)" filter="url(#shadow)"/>

          {/* Sardinia */}
          <path d="M32 150 Q44 148 52 158 Q58 170 54 184
            Q50 196 40 198 Q28 198 22 186 Q18 174 22 162 Q26 152 32 150 Z"
            fill="url(#land-italy)" filter="url(#shadow)"/>

          {/* ── BALKANS / CROATIA ── */}
          <path d="M200 0 L390 0 L390 120 Q360 140 340 160
            Q320 180 315 200 Q310 220 312 240
            Q280 220 260 200 Q240 178 230 155
            Q218 130 210 108 Q202 85 200 60 Z"
            fill="#D8C8A8" filter="url(#shadow)"/>

          {/* ── GREECE ── */}
          {/* Mainland */}
          <path d="M230 155 Q248 162 260 178 Q272 195 274 215
            Q276 232 268 246 Q258 260 245 265
            Q232 268 222 260 Q210 250 208 235
            Q206 218 212 202 Q218 185 226 170
            Q228 162 230 155 Z"
            fill="url(#land-greece)" filter="url(#shadow)"/>

          {/* Peloponnese */}
          <path d="M222 260 Q232 262 240 272 Q246 282 242 294
            Q236 304 225 306 Q212 304 208 292 Q206 280 212 270
            Q216 262 222 260 Z"
            fill="url(#land-greece)" filter="url(#shadow)"/>

          {/* Corfu island */}
          <path d="M168 214 Q174 212 178 218 Q180 226 176 232
            Q172 236 167 232 Q163 226 164 220 Q166 216 168 214 Z"
            fill="#C8B888"/>

          {/* Cephalonia */}
          <path d="M198 264 Q206 262 210 268 Q212 276 207 282
            Q202 285 196 280 Q192 274 194 268 Z"
            fill="#C8B888"/>

          {/* Crete */}
          <path d="M248 376 Q272 370 300 372 Q316 375 320 384
            Q318 394 300 398 Q272 400 250 394 Q234 388 236 378 Z"
            fill="url(#land-greece)" filter="url(#shadow)"/>

          {/* Santorini */}
          <path d="M306 344 Q314 342 318 348 Q320 356 314 360
            Q308 362 304 356 Q302 348 306 344 Z"
            fill="#C0B080"/>

          {/* ── NORTH AFRICA ── */}
          <path d="M0 400 L390 400 L390 420 L0 420 Z"
            fill="#D0C090" opacity="0.6"/>

          {/* ── ROUTE LINE ── */}
          <path d={routeD} fill="none" stroke="var(--color-primary)"
            strokeWidth="2" strokeDasharray="6 4" opacity="0.7"/>

          {/* Animated dots on route */}
          {ROUTE_POINTS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3"
              fill="var(--color-accent)" opacity="0.8"/>
          ))}

          {/* ── CITY MARKERS ── */}
          {STOPS.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i).map(stop => {
            const isPast = todayDayNum > 0 && stop.days[stop.days.length-1] < todayDayNum
            const isCurrent = stop.days.includes(todayDayNum)
            return (
              <g key={stop.id}>
                <circle cx={stop.x} cy={stop.y} r={isCurrent ? 7 : 5}
                  fill={isCurrent ? 'var(--color-primary)' : isPast ? 'var(--color-accent)' : 'white'}
                  stroke={isCurrent ? 'white' : 'var(--color-primary)'}
                  strokeWidth={isCurrent ? 2 : 1.5} opacity="0.95"/>
                <text x={stop.x + 10} y={stop.y + 4}
                  fontSize="10" fill="var(--color-text)"
                  fontFamily="var(--font-detail)" fontWeight={isCurrent ? '700' : '400'}>
                  {stop.label}
                </text>
              </g>
            )
          })}

          {/* ── TRANSPORT ICON (current position) ── */}
          <TransportIcon type={transport} x={pos.x} y={pos.y} />

          {/* ── COMPASS ROSE ── */}
          <g transform="translate(348, 36)">
            <circle cx="0" cy="0" r="18" fill="white" opacity="0.85" stroke="var(--color-border)" strokeWidth="1"/>
            {[
              { label: 'N', x: 0, y: -12 },
              { label: 'S', x: 0, y: 14 },
              { label: 'E', x: 12, y: 3 },
              { label: 'O', x: -12, y: 3 },
            ].map(d => (
              <text key={d.label} x={d.x} y={d.y}
                textAnchor="middle" fontSize="7" fill="var(--color-primary)"
                fontFamily="var(--font-detail)" fontWeight="700">
                {d.label}
              </text>
            ))}
            <circle cx="0" cy="0" r="2" fill="var(--color-accent)"/>
          </g>

          {/* ── TITLE ── */}
          <text x="20" y="398" fontSize="10" fill="white" opacity="0.7" fontFamily="var(--font-detail)">
            Italia · Grecia · Julio 2026
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { color: 'var(--color-primary)', label: 'Destino actual' },
            { color: 'var(--color-accent)', label: 'Visitado' },
            { color: 'white', label: 'Próximo' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color,
                border: '1.5px solid var(--color-primary)' }}/>
              <span style={{ fontSize: 11, color: 'var(--color-text-soft)', fontFamily: 'var(--font-detail)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Transport legend */}
        <div style={{
          marginTop: 8, padding: '12px 14px',
          background: 'var(--color-surface)', borderRadius: 12,
          border: 'var(--card-border)',
          fontSize: 12, color: 'var(--color-text-soft)',
          fontFamily: 'var(--font-detail)',
        }}>
          {transport === 'ship' && '🚢 Crucero por el Mediterráneo'}
          {transport === 'train' && '🚂 Moviéndose en tren por Puglia'}
          {transport === 'walking' && '🚶 Explorando a pie'}
          {transport === 'plane' && '✈️ Volando hacia el destino'}
          {!currentDay && ' · El viaje arranca el 21 de julio'}
        </div>
      </div>
    </div>
  )
}
