import { useRef, useEffect } from 'react'
import { bezierPath, dataToPts } from '../../utils/chart.utils'

const ft        = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,"Helvetica Neue",sans-serif'
const ftRounded = 'ui-rounded,"SF Pro Rounded","Nunito",sans-serif'

const PALETTE = {
  cardBg:    '#fff',
  border:    '#E5E7EB',
  shadow:    'rgba(0,0,0,0.05)',
  textMain:  '#111111',
  textMuted: '#8A8A8A',
  green:     '#166534',
  red:       '#ef4444',
}

const W = 600, H = 110, PAD_L = 22, PAD_R = 10
const SEUIL = 10 // moyenne de passage sur 20

/**
 * MoyenneChart — carte "Moyenne générale" avec courbe d'évolution dans le temps.
 *
 * La courbe passe du vert forêt au rouge vif exactement au seuil de 10/20,
 * via un dégradé à coupure nette (pas de transition progressive).
 * Si `anneeEnCours` est vrai, le dernier point pulse comme un indicateur "en direct".
 *
 * Props :
 *   data : { label: string, val: number }[] — historique des moyennes (val sur 20),
 *          trié du plus ancien au plus récent. `label` est une date courte ("8 sept").
 *   anneeEnCours : boolean — affiche ou non le point qui pulse en fin de courbe (défaut: true)
 */
export default function MoyenneChart({ data, anneeEnCours = true }) {
  const svgRef         = useRef(null)
  const pathRef        = useRef(null)
  const dotsRef        = useRef(null)
  const pulseRingRef   = useRef(null)
  const liveDotRef     = useRef(null)
  const vlineRef       = useRef(null)
  const hoverPointRef  = useRef(null)
  const tooltipRef     = useRef(null)
  const ttLabelRef     = useRef(null)
  const ttValRef       = useRef(null)

  if (!data || data.length === 0) return null

  const pts  = dataToPts(data, { W, H, paddingLeft: PAD_L, paddingRight: PAD_R, maxVal: 20 })
  const last = pts[pts.length - 1]
  const lastColor = last.val >= SEUIL ? PALETTE.green : PALETTE.red

  useEffect(() => {
    const path = bezierPath(pts)
    pathRef.current.setAttribute('d', path)

    // Points intermédiaires (tous sauf le dernier, qui a son propre indicateur)
    dotsRef.current.innerHTML = ''
    pts.slice(0, -1).forEach(p => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      c.setAttribute('cx', p.x)
      c.setAttribute('cy', p.y)
      c.setAttribute('r', 2.5)
      c.setAttribute('fill', p.val >= SEUIL ? PALETTE.green : PALETTE.red)
      c.setAttribute('opacity', '0.55')
      dotsRef.current.appendChild(c)
    })

    // Point final
    if (anneeEnCours) {
      pulseRingRef.current.setAttribute('cx', last.x)
      pulseRingRef.current.setAttribute('cy', last.y)
      pulseRingRef.current.setAttribute('stroke', lastColor)
      liveDotRef.current.setAttribute('cx', last.x)
      liveDotRef.current.setAttribute('cy', last.y)
      liveDotRef.current.setAttribute('fill', lastColor)
    }

    const findClosest = mx => {
      let closest = pts[0], minDist = Infinity
      pts.forEach(p => { const d = Math.abs(p.x - mx); if (d < minDist) { minDist = d; closest = p } })
      return closest
    }

    const svg = svgRef.current
    const onMove = e => {
      const rect = svg.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * W
      const cl = findClosest(mx)
      const px = (cl.x / W) * rect.width
      const py = (cl.y / H) * rect.height

      vlineRef.current.setAttribute('x1', cl.x)
      vlineRef.current.setAttribute('x2', cl.x)
      vlineRef.current.setAttribute('opacity', '1')
      hoverPointRef.current.setAttribute('cx', cl.x)
      hoverPointRef.current.setAttribute('cy', cl.y)
      hoverPointRef.current.setAttribute('opacity', '1')
      hoverPointRef.current.setAttribute('stroke', cl.val >= SEUIL ? PALETTE.green : PALETTE.red)

      ttLabelRef.current.textContent = cl.label
      ttValRef.current.textContent = cl.val.toFixed(1)
      tooltipRef.current.style.left = `${px}px`
      tooltipRef.current.style.top = `${py}px`
      tooltipRef.current.style.opacity = '1'
    }
    const onLeave = () => {
      vlineRef.current.setAttribute('opacity', '0')
      hoverPointRef.current.setAttribute('opacity', '0')
      tooltipRef.current.style.opacity = '0'
    }

    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)
    return () => {
      svg.removeEventListener('mousemove', onMove)
      svg.removeEventListener('mouseleave', onLeave)
    }
  }, [data])

  return (
    <div style={{
      fontFamily: ft, width: '100%', borderRadius: 40,
      background: PALETTE.cardBg, padding: '24px 26px',
      border: `1px solid ${PALETTE.border}`,
      boxShadow: `0 1px 3px ${PALETTE.shadow}`,
    }}>
      {/* Header : titre + score actuel */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ fontSize:22, fontWeight:600, color:PALETTE.textMain, letterSpacing:'-0.4px' }}>
          Moyenne générale
        </div>
        <div style={{ fontFamily:ftRounded, fontSize:28, fontWeight:800, letterSpacing:'-1px', color:lastColor }}>
          {last.val.toFixed(1)}
          <span style={{ fontSize:16, fontWeight:500, color:PALETTE.textMuted }}>/20</span>
        </div>
      </div>
      <div style={{ fontSize:12, color:PALETTE.textMuted, marginBottom:18 }}>
        Évolution depuis la rentrée
      </div>

      {/* Graphique */}
      <div style={{ position:'relative' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} 140`} preserveAspectRatio="none"
          style={{ width:'100%', height:140, overflow:'visible', display:'block' }}>
          <defs>
            <linearGradient id="moyGradient" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={PALETTE.green}/>
              <stop offset="50%"  stopColor={PALETTE.green}/>
              <stop offset="50%"  stopColor={PALETTE.red}/>
              <stop offset="100%" stopColor={PALETTE.red}/>
            </linearGradient>
          </defs>

          <line x1="0" y1="20"  x2={W} y2="20"  stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4,4"/>
          <line x1="0" y1="65"  x2={W} y2="65"  stroke={PALETTE.border} strokeWidth="1" strokeDasharray="3,3"/>
          <line x1="0" y1="110" x2={W} y2="110" stroke="#F0F0F0" strokeWidth="1" strokeDasharray="4,4"/>
          <text x="0" y="16"  fontSize="10" fill="#AEAEB2">20</text>
          <text x="0" y="61"  fontSize="10" fill="#AEAEB2">10</text>
          <text x="0" y="106" fontSize="10" fill="#AEAEB2">0</text>

          <path ref={pathRef} fill="none" stroke="url(#moyGradient)" strokeWidth="3.5"
            strokeLinejoin="round" strokeLinecap="round"/>

          <g ref={dotsRef}/>

          {anneeEnCours && (
            <>
              <circle ref={pulseRingRef} r="5" fill="none" strokeWidth="2" opacity="0.7">
                <animate attributeName="r" values="5;15;5" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle ref={liveDotRef} r="5"/>
            </>
          )}

          <line ref={vlineRef} x1="0" y1="0" x2="0" y2="140" stroke="#AEAEB2" strokeWidth="1" opacity="0"/>
          <circle ref={hoverPointRef} r="5" fill="#fff" strokeWidth="2.5" opacity="0"/>
        </svg>

        {/* Tooltip */}
        <div ref={tooltipRef} style={{
          position:'absolute', background:PALETTE.textMain, color:'#fff',
          borderRadius:12, padding:'8px 12px', fontSize:12, fontWeight:600,
          pointerEvents:'none', opacity:0, transition:'opacity 0.12s',
          whiteSpace:'nowrap', transform:'translate(-50%,-130%)', zIndex:5,
        }}>
          <div ref={ttLabelRef} style={{ fontSize:10, color:'rgba(255,255,255,0.55)', marginBottom:2, fontWeight:500 }}/>
          <span ref={ttValRef}/>/20
        </div>
      </div>

      {/* Axe X */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, padding:'0 2px' }}>
        <span style={{ fontSize:11, color:PALETTE.textMuted }}>{data[0]?.label || 'Septembre'}</span>
        <span style={{ fontSize:11, color:PALETTE.textMuted }}>Aujourd'hui</span>
      </div>
    </div>
  )
}