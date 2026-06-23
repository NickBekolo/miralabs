import { useState } from 'react'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,"Helvetica Neue",sans-serif'

/* ───────────────────────────────────────────────────────────
   Utilitaires conservés — utilisés ailleurs dans le projet
   (HomeScreen.jsx importe Colors, adj, subjectColor)
   ─────────────────────────────────────────────────────────── */

export const Colors = [
  "#C50017","#DA2400","#DD6B00","#E8901C","#E8B048",
  "#6BAE00","#37BB12","#12BB67","#26B290","#26ABB2",
  "#2DB9D8","#009EC5","#007FDA","#3A56D0","#7600CA",
  "#962DD8","#B300CA","#C50066","#DD004A","#DD0030"
]

export function adj(hex, factor) {
  if (!hex) return '#888'
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0,2), 16)
  const g = parseInt(h.slice(2,4), 16)
  const b = parseInt(h.slice(4,6), 16)
  const f = c => Math.min(255, Math.max(0, Math.round(factor > 0 ? c + (255-c)*factor : c + c*factor)))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours && minutes) return `${hours}h ${minutes} ${minutes > 1 ? 'mins' : 'min'}`
  if (hours) return `${hours} ${hours > 1 ? 'heures' : 'heure'}`
  return `${minutes} ${minutes > 1 ? 'mins' : 'min'}`
}

const _palette = {}
export function subjectColor(name) {
  const k = name.toLowerCase().trim()
  if (_palette[k]) return _palette[k]
  const used = Object.values(_palette)
  const avail = Colors.filter(c => !used.includes(c))
  const c = avail.length
    ? avail[Math.floor(Math.random() * avail.length)]
    : Colors[Math.floor(Math.random() * Colors.length)]
  _palette[k] = c
  return c
}

/* ───────────────────────────────────────────────────────────
   Palette Miralabs — nouvelle identité visuelle de la card
   ─────────────────────────────────────────────────────────── */

const PALETTE = {
  cardBg:    '#F8F8F8',
  textMain:  '#111111',
  textMuted: '#8A8A8A',
  border:    '#E5E7EB',
  shadow:    'rgba(0,0,0,0.05)',
}

const TYPE_COLORS = {
  'Devoir':            '#c2410c',
  'Travail dirigé':    '#1d4ed8',
  'TP noté':           '#1d4ed8',
  'Évaluation':        '#dc2626',
  'Cours':             '#16a34a',
  'Cours magistral':   '#16a34a',
  'Travail pratique':  '#16a34a',
  'SAE':               '#16a34a',
  'SAE en TD':         '#1d4ed8',
}

/**
 * Course — carte de cours Miralabs.
 * Remplace l'ancienne version (barre couleur + style Papillon).
 *
 * Props :
 *   matiere    : string                — ex: "Mathématiques"
 *   professeur : string                — ex: "Dr Vince"
 *   salle      : string                — ex: "Amphi 1"
 *   type       : string                — clé de TYPE_COLORS
 *   duree      : string                — ex: "2 heures"
 *   apprenants : { initials, color }[] — avatars (3 premiers affichés)
 *   nomsAffiches : string              — ex: "Atsama Abada, Alex Botegga"
 *   nbAutres   : number                — ex: 12
 *   annule     : boolean               — cours annulé (bordure rouge)
 *   raisonAnnulation : string          — ex: "Professeur absent"
 *   onVoir     : () => void            — callback clic badge
 */
export default function Course({
  matiere,
  professeur,
  salle,
  type = 'Cours',
  duree,
  apprenants = [],
  nomsAffiches,
  nbAutres = 0,
  annule = false,
  raisonAnnulation = 'Professeur absent',
  onVoir,
}) {
  const [active, setActive] = useState(false)
  const [hover, setHover]   = useState(false)
  const typeColor = TYPE_COLORS[type] || TYPE_COLORS['Cours']
  const showVoir = active || hover

  return (
    <div style={{
      fontFamily: ft,
      width: '100%',
      borderRadius: 40,
      background: PALETTE.cardBg,
      padding: '24px 26px',
      border: `${annule ? 1.5 : 1}px solid ${annule ? 'rgba(220,38,38,0.4)' : PALETTE.border}`,
      boxShadow: `0 1px 3px ${PALETTE.shadow}`,
      marginBottom: 16,
    }}>

      {/* Header : matière + raison + durée */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <div style={{ fontSize:22, fontWeight:600, color:PALETTE.textMain, letterSpacing:'-0.4px' }}>
            {matiere}
          </div>
          {annule && (
            <span style={{
              fontSize:12, fontWeight:600, color:'#dc2626',
              background:'rgba(220,38,38,0.08)',
              padding:'4px 12px', borderRadius:980,
            }}>
              {raisonAnnulation}
            </span>
          )}
        </div>
        <div style={{
          fontSize:13, fontWeight:700, color:PALETTE.textMuted,
          background:'#fff', border:`1px solid ${PALETTE.border}`,
          padding:'6px 16px', borderRadius:980,
        }}>
          {duree}
        </div>
      </div>

      {/* Chips professeur / salle */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10, marginBottom:20 }}>
        <Chip label="Professeur" value={professeur} />
        <span style={{ padding:'10px 16px', borderRadius:18, border:`1px solid ${PALETTE.border}`, background:'#fff', boxShadow:`0 1px 2px ${PALETTE.shadow}`, color:PALETTE.textMuted, fontWeight:500, fontSize:13 }}>
          et
        </span>
        <Chip label="Salle" value={salle} />
      </div>

      {/* Badge type — même style que Chip, inversion au hover/clic */}
      <div style={{ marginBottom:22 }}>
        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => { setActive(a => !a); onVoir?.() }}
          style={{
            padding:'10px 18px', borderRadius:18,
            fontSize:16, fontWeight:600,
            border:`1px solid ${showVoir ? typeColor : PALETTE.border}`,
            background: showVoir ? typeColor : '#fff',
            color: showVoir ? '#fff' : typeColor,
            boxShadow: showVoir ? '0 4px 14px rgba(0,0,0,0.08)' : `0 1px 2px ${PALETTE.shadow}`,
            cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap: showVoir ? 8 : 0,
            transition:'all 0.18s cubic-bezier(.4,0,.2,1)',
            fontFamily: ft,
            transform: showVoir ? 'translateY(-1px)' : 'none',
            whiteSpace:'nowrap',
          }}
        >
          <span>{type}</span>
          <span style={{
            width: showVoir ? 14 : 0, opacity: showVoir ? 1 : 0,
            overflow:'hidden', display:'inline-flex', alignItems:'center',
            transition:'width 0.2s, opacity 0.18s',
          }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 11.5L11.5 2.5M11.5 2.5H5M11.5 2.5V9"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
      </div>

      {/* Apprenants */}
      {apprenants.length > 0 && (
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ display:'flex' }}>
            {apprenants.slice(0, 3).map((a, i) => (
              <div key={i} style={{
                width:36, height:36, borderRadius:'50%',
                border:`3px solid ${PALETTE.cardBg}`,
                marginLeft: i === 0 ? 0 : -9,
                background: a.color, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:11,
              }}>
                {a.initials}
              </div>
            ))}
          </div>
          <p style={{ marginLeft:14, color:PALETTE.textMuted, fontSize:13, lineHeight:1.5 }}>
            <span style={{ fontWeight:500, color:PALETTE.textMain }}>{nomsAffiches}</span>
            {nbAutres > 0 && (
              <>
                <br/>et <span style={{ fontWeight:700, color:PALETTE.textMain }}>{nbAutres} autres apprenants</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Chip typographie mixte ── */
function Chip({ label, value }) {
  return (
    <div style={{
      padding:'10px 18px', borderRadius:18,
      border:`1px solid ${PALETTE.border}`, background:'#fff',
      boxShadow:`0 1px 2px ${PALETTE.shadow}`,
      display:'inline-flex', alignItems:'center',
    }}>
      <span style={{ fontSize:16, fontWeight:600, color:PALETTE.textMain }}>{label}</span>
      <span style={{ color:PALETTE.textMuted, marginLeft:6, fontSize:13 }}>est</span>
      <span style={{ fontWeight:600, color:PALETTE.textMain, marginLeft:6, fontSize:13 }}>{value}</span>
    </div>
  )
}