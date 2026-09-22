import { useRef, useState, useEffect, useCallback } from 'react'
import { useThemeStore } from '../../store/ThemeStore'

const ft        = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,"Helvetica Neue",sans-serif'
const ftRounded = 'ui-rounded,"SF Pro Rounded","Nunito",sans-serif'

const W = 600, H = 110, PAD_L = 22, PAD_R = 10
const SEUIL = 10

function toPts(data) {
  const usable = W - PAD_L - PAD_R
  return data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * usable,
    y: H - (d.val / 20) * H,
    ...d,
  }))
}
function bezierPath(pts) {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], cur = pts[i]
    const cpx = (prev.x + cur.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${cur.y}, ${cur.x} ${cur.y}`
  }
  return d
}
function ordinal(n) { return n === 1 ? 'er' : 'e' }

export default function MoyenneChart({ datasets, defaultKey }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const PALETTE = {
    cardBg:    darkMode ? '#1c1c1e' : '#fff',
    border:    darkMode ? '#3a3a3c' : '#E5E7EB',
    shadow:    'rgba(0,0,0,0.05)',
    textMain:  darkMode ? '#fff' : '#111111',
    textMuted: darkMode ? '#8A8A8A' : '#8A8A8A',
    green:     '#166534',
    red:       '#ff0000',
    curve:     '#E2451B',
  }
  const keys = Object.keys(datasets)
  const initialKey = defaultKey && datasets[defaultKey] ? defaultKey : keys[0]

  const [activeKey, setActiveKey] = useState(initialKey)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [active, setActive]       = useState(false)

  const [current, setCurrent] = useState(() => {
    const pts = toPts(datasets[initialKey].points)
    return pts[pts.length - 1]
  })

  const svgRef       = useRef(null)
  const dragPointRef = useRef(null)
  const vlineRef     = useRef(null)
  const tooltipRef   = useRef(null)
  const dotsRef      = useRef(null)
  const draggingRef  = useRef(false)

  const pts  = toPts(datasets[activeKey].points)
  const last = pts[pts.length - 1]

  const applyPoint = useCallback((p) => {
    setCurrent(p)
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || !vlineRef.current || !dragPointRef.current || !tooltipRef.current) return
    vlineRef.current.setAttribute('x1', p.x)
    vlineRef.current.setAttribute('x2', p.x)
    vlineRef.current.setAttribute('y1', 0)
    vlineRef.current.setAttribute('y2', H)
    dragPointRef.current.setAttribute('cx', p.x)
    dragPointRef.current.setAttribute('cy', p.y)
    const px = (p.x / W) * rect.width
    const py = (p.y / H) * rect.height
    tooltipRef.current.style.left = `${px}px`
    tooltipRef.current.style.top  = `${py - 14}px`
  }, [])

  const closest = useCallback((mx) => {
    let c = pts[0], min = Infinity
    pts.forEach(p => { const d = Math.abs(p.x - mx); if (d < min) { min = d; c = p } })
    return c
  }, [pts])

  const updateFromClientX = useCallback((clientX) => {
    const rect = svgRef.current.getBoundingClientRect()
    const mx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * W
    applyPoint(closest(mx))
  }, [closest, applyPoint])

  useEffect(() => {
    const newPts = toPts(datasets[activeKey].points)
    if (dotsRef.current) {
      dotsRef.current.innerHTML = ''
      newPts.forEach(p => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 3)
        c.setAttribute('fill', PALETTE.curve); c.setAttribute('opacity', '0.1')
        dotsRef.current.appendChild(c)
      })
    }
    applyPoint(newPts[newPts.length - 1])
    setActive(false)
  }, [activeKey]) // eslint-disable-line

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onDown = e => { draggingRef.current = true; setActive(true); updateFromClientX(e.clientX); svg.setPointerCapture(e.pointerId) }
    const onMove = e => { if (draggingRef.current) updateFromClientX(e.clientX) }
    const onUp   = () => { draggingRef.current = false; setActive(false) }
    const onMouseMove  = e => { setActive(true); updateFromClientX(e.clientX) }
    const onMouseLeave = () => { if (!draggingRef.current) setActive(false) }

    svg.addEventListener('mousemove',    onMouseMove)
    svg.addEventListener('mouseleave',   onMouseLeave)
    svg.addEventListener('pointerdown',  onDown)
    svg.addEventListener('pointermove',  onMove)
    svg.addEventListener('pointerup',    onUp)
    svg.addEventListener('pointercancel',onUp)
    return () => {
      svg.removeEventListener('mousemove',    onMouseMove)
      svg.removeEventListener('mouseleave',   onMouseLeave)
      svg.removeEventListener('pointerdown',  onDown)
      svg.removeEventListener('pointermove',  onMove)
      svg.removeEventListener('pointerup',    onUp)
      svg.removeEventListener('pointercancel',onUp)
    }
  }, [updateFromClientX])

  const displayPoint = active ? current : last
  const color = displayPoint.val >= SEUIL ? PALETTE.green : PALETTE.red
  const total = displayPoint.total ?? 28

  return (
    <div style={{
      fontFamily: ft, width: '100%', borderRadius: 40,
      background: PALETTE.cardBg, padding: '24px 26px',
      border: `1px solid ${PALETTE.border}`,
      boxShadow: `0 1px 3px ${PALETTE.shadow}`,
      position: 'relative',
    }}>

      {/* Header : titre + score + rang */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <button onClick={() => setMenuOpen(o => !o)}
          style={{ display:'inline-flex', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:ft }}>
          <span style={{ fontSize:22, fontWeight:600, color:PALETTE.textMain, letterSpacing:'-0.4px' }}>
            {datasets[activeKey].label}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PALETTE.textMuted}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginTop:4, flexShrink:0, transform: menuOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {/* Score + rang empilés */}
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:3, justifyContent:'flex-end' }}>
            <span style={{ fontFamily:ftRounded, fontSize:34, fontWeight:800, letterSpacing:'-1.2px', color, lineHeight:1 }}>
              {displayPoint.val.toFixed(1)}
            </span>
            <span style={{ fontSize:15, fontWeight:500, color:PALETTE.textMuted }}>/20</span>
          </div>
          <div style={{ fontSize:12, color:PALETTE.textMuted, marginTop:3 }}>
            {displayPoint.rang}<sup style={{ fontSize:9 }}>{ordinal(displayPoint.rang)}</sup> / {total}
            {active && <span style={{ marginLeft:6, color:PALETTE.textMuted }}>· {current.label}</span>}
          </div>
        </div>
      </div>

      {/* Menu déroulant */}
      {menuOpen && (
        <div style={{
          position:'absolute', top:58, left:26, zIndex:10,
          background:'#fff', border:`1px solid ${PALETTE.border}`, borderRadius:20,
          boxShadow:'0 10px 28px rgba(0,0,0,0.1)', padding:8, minWidth:200,
        }}>
          {keys.map(k => (
            <div key={k} onClick={() => { setActiveKey(k); setMenuOpen(false) }}
              style={{ padding:'10px 14px', borderRadius:13, fontSize:13, fontWeight:600, cursor:'pointer',
                background: k === activeKey ? PALETTE.textMain : 'transparent',
                color: k === activeKey ? '#fff' : PALETTE.textMain }}
              onMouseEnter={e => { if (k !== activeKey) e.currentTarget.style.background = '#F8F8F8' }}
              onMouseLeave={e => { if (k !== activeKey) e.currentTarget.style.background = 'transparent' }}>
              {datasets[k].label}
            </div>
          ))}
        </div>
      )}

      {/* Graphique responsive */}
      <div style={{ position:'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width:'100%', height:'auto', aspectRatio:`${W}/${H}`, overflow:'visible', display:'block', cursor:'crosshair', touchAction:'none' }}
        >
          <line x1="0" y1="20"  x2={W} y2="20"  stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4,4" vectorEffect="non-scaling-stroke"/>
          <line x1="0" y1="65"  x2={W} y2="65"  stroke={PALETTE.border} strokeWidth="1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke"/>
          <line x1="0" y1="100" x2={W} y2="100" stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4,4" vectorEffect="non-scaling-stroke"/>
          <text x="0" y="16"  fontSize="10" fill="#AEAEB2">20</text>
          <text x="0" y="61"  fontSize="10" fill="#AEAEB2">10</text>
          <text x="0" y="96"  fontSize="10" fill="#AEAEB2">0</text>

          <path d={bezierPath(pts)} fill="none" stroke={PALETTE.curve} strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>

          <g ref={dotsRef}/>

          <line ref={vlineRef} x1="0" y1="0" x2="0" y2={H}
            stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            opacity={active ? 1 : 0} style={{ transition:'opacity 0.15s' }}/>

          {/* Cercle parfaitement rond grâce à non-scaling-stroke */}
          <circle ref={dragPointRef} r="4" fill={PALETTE.curve} stroke="#fff" strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            opacity={active ? 1 : 0} style={{ transition:'opacity 0.15s' }}/>
        </svg>

        {/* Infobulle flottante */}
        <div ref={tooltipRef} style={{
          position:'absolute', background:'#fff', border:`1px solid ${PALETTE.border}`,
          borderRadius:18, padding:'12px 16px', fontSize:13,
          pointerEvents:'none', whiteSpace:'nowrap',
          transform:'translate(-50%,-100%)',
          boxShadow:'0 8px 20px rgba(0,0,0,0.09)', minWidth:170, zIndex:5,
          opacity: active ? 1 : 0, transition:'opacity 0.15s',
        }}>
          <div style={{ fontSize:11, color:PALETTE.textMuted, fontWeight:500, marginBottom:6 }}>{current.label}</div>
          <div style={{ fontSize:18, fontWeight:800, color: current.val >= SEUIL ? PALETTE.green : PALETTE.red, marginBottom:8 }}>
            {current.val.toFixed(1)}/20
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:PALETTE.textMuted, padding:'4px 0', borderTop:'1px solid #F0F0F0' }}>
            <span>Moyenne de classe</span>
            <b style={{ color:PALETTE.textMain, fontWeight:700 }}>{current.classe.toFixed(1)}/20</b>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:PALETTE.textMuted, padding:'4px 0', borderTop:'1px solid #F0F0F0' }}>
            <span>Rang</span>
            <b style={{ color:PALETTE.textMain, fontWeight:700 }}>
              {current.rang}<sup>{ordinal(current.rang)}</sup> / {current.total ?? 28}
            </b>
          </div>
        </div>
      </div>

      {/* Axe X */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, padding:'0 2px' }}>
        <span style={{ fontSize:11, color:PALETTE.textMuted }}>{datasets[activeKey].points[0]?.label}</span>
        <span style={{ fontSize:11, color:PALETTE.textMuted }}>{datasets[activeKey].points[datasets[activeKey].points.length - 1]?.label}</span>
      </div>
      <div style={{ fontSize:11, color:'#AEAEB2', textAlign:'center', marginTop:8 }}>
        glisse sur la courbe
      </div>
    </div>
  )
}