import { useRef, useState, useEffect, useCallback } from 'react'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,sans-serif'
const ftR = 'ui-rounded,"SF Pro Rounded",sans-serif'

const C = {
  bg:     '#fff',
  card:   '#F8F8F8',
  border: '#E5E7EB',
  text:   '#111111',
  muted:  '#8A8A8A',
  faint:  '#F0F0F0',
  red:    '#ff0000',
  green:  '#166534',
  curve:  '#E2451B',
}

/* ─── données mock ─────────────────────────────── */
const MOYENNE_DATA = [
  { label:'8 sept',  val:12.8 },
  { label:'22 sept', val:13.4 },
  { label:'20 oct',  val:9.6  },
  { label:'4 nov',   val:8.8  },
  { label:'24 nov',  val:10.4 },
  { label:'8 déc',   val:12.1 },
  { label:'12 jan',  val:13.0 },
  { label:'9 fév',   val:14.0 },
  { label:'16 avr',  val:14.0 },
  { label:'15 juin', val:14.2 },
]

const COURS_AUJOURD_HUI = [
  {
    matiere: 'Physique-Chimie',
    type: 'TP',
    debut: '10:15',
    fin: '12:15',
    salle: 'Labo 1',
    prof: 'Mme Martin',
    etudiants: ['AA','BK','CM'],
    nbTotal: 27,
    statut: 'en-cours', // 'normal' | 'en-cours' | 'annule'
  },
  {
    matiere: 'Mathématiques',
    type: 'Cours',
    debut: '13:30',
    fin: '15:30',
    salle: 'A12',
    prof: 'M. Dupont',
    etudiants: ['DL','EN'],
    nbTotal: 27,
    statut: 'normal',
  },
  {
    matiere: 'Anglais',
    type: 'TD',
    debut: '15:30',
    fin: '16:30',
    salle: 'Bât. 9',
    prof: 'Pullen A.',
    etudiants: [],
    nbTotal: 0,
    statut: 'annule',
  },
]

const NOTES = [
  { score:16, matiere:'Physique-Chimie',  type:'TP noté',     date:'9 juin',  low:false },
  { score:14, matiere:'Mathématiques',    type:'Évaluation',  date:'12 juin', low:false },
  { score:8,  matiere:'Français',         type:'Dissertation', date:'15 juin', low:true  },
]

const AV_COLORS = ['#1d4ed8','#16a34a','#9333ea','#ea580c','#0891b2']

/* ─── Courbe interactive ────────────────────────── */
const W = 390, H = 120, SEUIL = 10

function toPts(data) {
  return data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: 15 + (H - 30) * (1 - d.val / 20),
    ...d,
  }))
}
function bezierPath(pts) {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], cx = (a.x + b.x) / 2
    d += ` C ${cx} ${a.y},${cx} ${b.y},${b.x} ${b.y}`
  }
  return d
}

function MoyenneCurve() {
  const svgRef    = useRef(null)
  const vlRef     = useRef(null)
  const ptRef     = useRef(null)
  const dragging  = useRef(false)
  const [current, setCurrent] = useState(null)
  const [active, setActive]   = useState(false)

  const pts  = toPts(MOYENNE_DATA)
  const last = pts[pts.length - 1]

  const closest = useCallback((mx) => {
    let c = pts[0], min = Infinity
    pts.forEach(p => { const d = Math.abs(p.x - mx); if (d < min) { min = d; c = p } })
    return c
  }, [])

  const applyPoint = useCallback((p) => {
    setCurrent(p)
    if (!vlRef.current || !ptRef.current) return
    vlRef.current.setAttribute('x1', p.x); vlRef.current.setAttribute('x2', p.x)
    vlRef.current.setAttribute('y1', 0);   vlRef.current.setAttribute('y2', H)
    ptRef.current.setAttribute('cx', p.x); ptRef.current.setAttribute('cy', p.y)
  }, [])

  const updateFromClientX = useCallback((clientX) => {
    const rect = svgRef.current.getBoundingClientRect()
    const mx   = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * W
    applyPoint(closest(mx))
  }, [closest, applyPoint])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onDown = e => { dragging.current = true; setActive(true); updateFromClientX(e.clientX); svg.setPointerCapture(e.pointerId) }
    const onMove = e => { if (dragging.current) updateFromClientX(e.clientX) }
    const onUp   = () => { dragging.current = false; setActive(false) }
    const onMM   = e => { setActive(true); updateFromClientX(e.clientX) }
    const onML   = () => { if (!dragging.current) setActive(false) }
    svg.addEventListener('pointerdown', onDown)
    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerup',   onUp)
    svg.addEventListener('pointercancel', onUp)
    svg.addEventListener('mousemove',   onMM)
    svg.addEventListener('mouseleave',  onML)
    return () => {
      svg.removeEventListener('pointerdown', onDown)
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerup',   onUp)
      svg.removeEventListener('pointercancel', onUp)
      svg.removeEventListener('mousemove',   onMM)
      svg.removeEventListener('mouseleave',  onML)
    }
  }, [updateFromClientX])

  const display = active && current ? current : last
  const color   = display.val >= SEUIL ? C.green : C.red

  return (
    <div style={{ background: C.bg, paddingTop: 12 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'0 10px', marginBottom:10 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:ft }}>Moyenne générale</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:ft }}>Sept 2025 → Juin 2026</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
            <span style={{ fontFamily:ftR, fontSize:30, fontWeight:800, letterSpacing:'-1.2px', color, lineHeight:1 }}>
              {display.val.toFixed(1)}
            </span>
            <span style={{ fontSize:14, color:C.muted, fontFamily:ft }}>/20</span>
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:ft }}>3ᵉ / 28</div>
        </div>
      </div>

      {/* SVG bord à bord */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width:'100%', height:'auto', aspectRatio:`${W}/${H}`, display:'block', overflow:'visible', cursor:'crosshair', touchAction:'none' }}
      >
        <line x1="0" y1="15"  x2={W} y2="15"  stroke="#F5F5F5" strokeWidth="1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke"/>
        <line x1="0" y1="60"  x2={W} y2="60"  stroke="#EBEBEB" strokeWidth="1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke"/>
        <line x1="0" y1="105" x2={W} y2="105" stroke="#F5F5F5" strokeWidth="1" strokeDasharray="3,3" vectorEffect="non-scaling-stroke"/>

        <path d={bezierPath(pts)} fill="none" stroke={C.curve} strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>

        {/* Points intermédiaires */}
        {pts.slice(0, -1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={C.curve} opacity={0.35} vectorEffect="non-scaling-stroke"/>
        ))}

        {/* Ligne verticale drag */}
        <line ref={vlRef} x1="0" y1="0" x2="0" y2={H}
          stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"
          vectorEffect="non-scaling-stroke" opacity={active ? 1 : 0}
          style={{ transition:'opacity 0.15s' }}/>

        {/* Point drag */}
        <circle ref={ptRef} r="7" fill={C.curve} stroke="#fff" strokeWidth="3"
          vectorEffect="non-scaling-stroke" opacity={active ? 1 : 0}
          style={{ transition:'opacity 0.15s' }}/>

        {/* Point "en direct" pulsant */}
        {!active && (
          <>
            <circle cx={last.x} cy={last.y} r="7" fill="none" stroke={C.curve} strokeWidth="2" vectorEffect="non-scaling-stroke">
              <animate attributeName="r" values="7;16;7" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx={last.x} cy={last.y} r="7" fill={C.curve} vectorEffect="non-scaling-stroke"/>
          </>
        )}
      </svg>

      {/* Axe X */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px 0', fontFamily:ft }}>
        {['Sept','Oct','Déc','Fév','Avr','Juin'].map(m => (
          <span key={m} style={{ fontSize:10, color:C.muted }}>{m}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── Avatars étudiants ──────────────────────── */
function Avatars({ list, total }) {
  if (!list.length) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <div style={{ display:'flex' }}>
        {list.map((initials, i) => (
          <div key={i} style={{
            width:22, height:22, borderRadius:'50%', border:'2px solid #fff',
            background: AV_COLORS[i % AV_COLORS.length],
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:8, fontWeight:700, color:'#fff',
            marginLeft: i === 0 ? 0 : -6,
          }}>{initials}</div>
        ))}
        <div style={{
          width:22, height:22, borderRadius:'50%', border:'2px solid #fff',
          background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:8, fontWeight:700, color:C.muted, marginLeft:-6,
        }}>+{total - list.length}</div>
      </div>
      <span style={{ fontSize:11, color:C.muted, fontFamily:ft }}>{total} apprenants</span>
    </div>
  )
}

/* ─── Carte cours ────────────────────────────── */
function CoursCard({ cours }) {
  const isEnCours = cours.statut === 'en-cours'
  const isAnnule  = cours.statut === 'annule'

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${isAnnule ? 'rgba(255,0,0,0.25)' : C.border}`,
      borderRadius: 20, padding:'13px 14px', marginBottom:8, fontFamily:ft,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <div>
          <div style={{
            fontSize:11, fontWeight:700, marginBottom:4,
            color: isEnCours ? '#166534' : isAnnule ? C.red : C.muted,
          }}>
            {isEnCours && '● En cours · '}{isAnnule && 'Annulé · '}{cours.debut} → {cours.fin}
          </div>
          <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.3px', color: isAnnule ? '#AEAEB2' : C.text }}>
            {cours.matiere}
          </div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color: isAnnule ? C.red : C.muted }}>
          {cours.type}
        </div>
      </div>

      {/* Méta */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
          <span style={{ color: isAnnule ? '#AEAEB2' : C.muted }}>Salle</span>
          <span style={{ fontWeight:600, color: isAnnule ? '#AEAEB2' : C.text }}>{cours.salle}</span>
          <span style={{ color: isAnnule ? '#AEAEB2' : C.muted, marginLeft:8 }}>Prof</span>
          <span style={{ fontWeight:600, color: isAnnule ? '#AEAEB2' : C.text }}>{cours.prof}</span>
        </div>
        {!isAnnule && <Avatars list={cours.etudiants} total={cours.nbTotal}/>}
      </div>
    </div>
  )
}

/* ─── Page complète ──────────────────────────── */
export default function HomeScreenMobile() {
  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:ft }}>

      {/* Courbe bord à bord */}
      <MoyenneCurve/>

      {/* Séparateur */}
      <div style={{ height:1, background:C.border, margin:'12px 0 0' }}/>

      {/* EDT */}
      <div style={{ padding:'14px 10px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text, letterSpacing:'-0.3px' }}>Aujourd'hui</span>
          <button style={{
            fontSize:12, fontWeight:600, color:C.text, background:'#F2F2F2',
            padding:'5px 14px', borderRadius:980, border:'none', cursor:'pointer', fontFamily:ft,
          }}>
            Voir l'EDT →
          </button>
        </div>
        {COURS_AUJOURD_HUI.map((c, i) => <CoursCard key={i} cours={c}/>)}
      </div>

      {/* Notes récentes */}
      <div style={{ padding:'14px 10px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text, letterSpacing:'-0.3px' }}>Dernières notes</span>
          <button style={{
            fontSize:12, fontWeight:600, color:C.text, background:'#F2F2F2',
            padding:'5px 14px', borderRadius:980, border:'none', cursor:'pointer', fontFamily:ft,
          }}>
            Voir tout →
          </button>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'2px 12px' }}>
          {NOTES.map((n, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'12px 0', borderBottom: i < NOTES.length-1 ? `1px solid ${C.faint}` : 'none',
            }}>
              <span style={{ fontSize:14, fontWeight:800, letterSpacing:'-0.5px', color: n.low ? C.red : C.text, flexShrink:0 }}>
                {n.score}/20
              </span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{n.matiere}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{n.type}</div>
              </div>
              <div style={{ fontSize:11, color:C.muted, flexShrink:0 }}>{n.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}