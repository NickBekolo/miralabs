import { useRef } from 'react'
import { useChart } from '../../hooks/useChart'
import { NOTES_DATA } from '../../data/teacher.data'
import { Button } from '../ui/Button'

/**
 * Graphique interactif d'évolution des moyennes.
 * SVG avec courbe de Bézier et tooltip au survol.
 */
export function NotesChart({ onOpenModal }) {
  const svgRef = useRef(null), vlRef  = useRef(null), hpRef  = useRef(null)
  const ttRef  = useRef(null), ttLRef = useRef(null), ttVRef = useRef(null)

  useChart(
    { svgRef, vlRef, hpRef, ttRef, ttLRef, ttVRef },
    { data: NOTES_DATA, W: 600, H: 115, maxVal: 20 }
  )

  return (
    <div style={{ background:'#f5f4f0', borderRadius:18, padding:'18px 20px' }}>

      {/* Barre de recherche décorative */}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'#fff',
        borderRadius:10, padding:'9px 14px', marginBottom:14,
        boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize:14, color:'#86868b' }}>🔍</span>
        <span style={{ fontSize:13, color:'#3d3d3f' }}>Voir l'évolution des notes ce semestre</span>
      </div>

      {/* Titre + bouton */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:2 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.3px' }}>
            Moyennes & évolution des notes
          </div>
          <div style={{ fontSize:11, color:'#86868b', marginTop:2, marginBottom:12 }}>
            Semestre 1 · 4 classes · 87 apprenants
          </div>
        </div>
        <Button variant="ghost" onClick={onOpenModal} style={{ fontSize:11, padding:'5px 13px' }}>
          Voir plus ›
        </Button>
      </div>

      {/* SVG */}
      <div style={{ position:'relative' }}>
        <svg ref={svgRef} viewBox="0 0 600 115" preserveAspectRatio="none"
          style={{ width:'100%', height:128, overflow:'visible' }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#1d1d1f"/>
              <stop offset="100%" stopColor="#1d1d1f" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0, 40, 80, 115].map(y => (
            <line key={y} x1="0" y1={y} x2="600" y2={y}
              stroke="#d8d6d0" strokeWidth="1" strokeDasharray="4,4"/>
          ))}
          <text x="0" y="-2" fontSize="9" fill="#aeaeb2">20</text>
          <text x="0" y="38" fontSize="9" fill="#aeaeb2">13</text>
          <text x="0" y="78" fontSize="9" fill="#aeaeb2">6</text>
          <path id="area" fill="url(#g1)" opacity="0.1"/>
          <path id="crv"  fill="none" stroke="#1d1d1f" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round"/>
          <line ref={vlRef} x1="0" y1="0" x2="0" y2="115"
            stroke="#aeaeb2" strokeWidth="1" opacity="0"/>
          <circle ref={hpRef} r="4" fill="#fff" stroke="#1d1d1f" strokeWidth="2" opacity="0"/>
        </svg>

        {/* Tooltip */}
        <div ref={ttRef} style={{ position:'absolute', background:'#fff', borderRadius:12,
          padding:'10px 14px', boxShadow:'0 4px 18px rgba(0,0,0,0.12)', pointerEvents:'none',
          opacity:0, transition:'opacity 0.12s', zIndex:20, minWidth:120 }}>
          <div ref={ttLRef} style={{ fontSize:10, color:'#86868b', marginBottom:4 }}/>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span ref={ttVRef} style={{ background:'#1d1d1f', color:'#fff',
              borderRadius:6, padding:'2px 8px', fontSize:13, fontWeight:700 }}/>
            <span style={{ fontSize:11 }}>/20</span>
          </div>
        </div>

        {/* Labels X */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
          {NOTES_DATA.map(d => (
            <span key={d.label} style={{ fontSize:10, color:'#aeaeb2' }}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
