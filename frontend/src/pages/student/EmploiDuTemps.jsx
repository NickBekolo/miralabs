import { useState } from 'react'
import { useThemeStore } from './ThemeStore'
import Course from './Course'

const JOURS = [
  { id:'lundi',    label:'lun.', date:25, hasClass:true,  isWeekend:false },
  { id:'mardi',    label:'mar.', date:26, hasClass:true,  isWeekend:false },
  { id:'mercredi', label:'mer.', date:27, hasClass:true,  isWeekend:false },
  { id:'jeudi',    label:'jeu.', date:28, hasClass:true,  isWeekend:false },
  { id:'vendredi', label:'ven.', date:29, hasClass:true,  isWeekend:false },
  { id:'samedi',   label:'sam.', date:30, hasClass:false, isWeekend:true  },
  { id:'dimanche', label:'dim.', date:31, hasClass:false, isWeekend:true  },
]

const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const DOW  = ['di','lu','ma','me','je','ve','sa']

const DATA = {
  lundi: [
    { t:'c', d:'08h00', f:'09h00', dur:'1h00', n:'mathématiques',     r:'bât. 2 salle 14', p:'m. dupont',    lb:'cours' },
    { t:'p', lb:'pause matinale', dur:'15 min' },
    { t:'c', d:'09h15', f:'10h15', dur:'1h00', n:'anglais',           r:'bât. 3 salle 6',  p:'m. smith',    lb:'annulé',         ann:1 },
    { t:'c', d:'10h15', f:'12h15', dur:'2h00', n:'physique-chimie',   r:'labo 1',          p:'mme martin',  lb:'travail pratique' },
    { t:'p', lb:'pause méridienne', dur:'1h 15 min' },
    { t:'c', d:'13h30', f:'15h30', dur:'2h00', n:'histoire-géo',      r:'bât. 4 amphi 2',  p:'mme koné',    lb:'cours magistral'  },
  ],
  mardi: [
    { t:'c', d:'08h00', f:'10h00', dur:'2h00', n:'mathématiques',     r:'amphi 1001',       p:'m. dupont',   lb:'cours magistral'  },
    { t:'p', lb:'pause matinale', dur:'15 min' },
    { t:'c', d:'10h15', f:'12h15', dur:'2h00', n:'développement web', r:'bât. 12 amphi 4',  p:'alexandre p.',lb:'cours magistral'  },
    { t:'p', lb:'pause méridienne', dur:'50 min' },
    { t:'c', d:'13h15', f:'14h15', dur:'1h00', n:'sae 203',           r:'bât. 10 salle 29', p:'alexandre p.',lb:'sae'              },
  ],
  mercredi: [
    { t:'c', d:'09h00', f:'11h00', dur:'2h00', n:'français',          r:'salle b4',         p:'m. leblanc',  lb:'travail dirigé',  td:1 },
    { t:'p', lb:'pause méridienne', dur:'1h 00' },
    { t:'c', d:'13h00', f:'15h00', dur:'2h00', n:'anglais',           r:'salle b3',         p:'mme barbara', lb:'annulé',          ann:1 },
  ],
  jeudi: [
    { t:'c', d:'08h30', f:'10h30', dur:'2h00', n:'physique-chimie',   r:'labo 1',           p:'mme martin',  lb:'travail pratique' },
    { t:'p', lb:'pause matinale', dur:'15 min' },
    { t:'c', d:'10h45', f:'12h45', dur:'2h00', n:'mathématiques',     r:'salle a12',        p:'m. dupont',   lb:'évaluation',      ev:1 },
    { t:'p', lb:'pause méridienne', dur:'1h 15 min' },
    { t:'c', d:'14h00', f:'16h00', dur:'2h00', n:'histoire-géo',      r:'salle c7',         p:'mme koné',    lb:'cours magistral'  },
  ],
  vendredi: [
    { t:'c', d:'08h00', f:'09h00', dur:'1h00', n:"traitement de l'information", r:'bât. 10 salle 16', p:'baptiste v.',  lb:'travail dirigé', td:1 },
    { t:'p', lb:'pause matinale', dur:'15 min' },
    { t:'c', d:'09h00', f:'10h00', dur:'1h00', n:'anglais',           r:'bât. 9 salle 6',   p:'pullen a.',   lb:'annulé',          ann:1 },
    { t:'c', d:'10h15', f:'12h15', dur:'2h00', n:'développement web', r:'bât. 12 amphi 4',  p:'alexandre p.',lb:'cours magistral'       },
    { t:'p', lb:'pause méridienne', dur:'1h 15 min' },
    { t:'c', d:'13h30', f:'15h30', dur:'2h00', n:'sae 203',           r:'bât. 10 salle 29', p:'alexandre p.',lb:'sae en td'             },
  ],
  samedi:   [],
  dimanche: [],
}

/* ── Helpers : adapter les données existantes au format Course.jsx ── */

const LABEL_MAP = {
  'cours':            'Cours',
  'cours magistral':  'Cours magistral',
  'travail dirigé':   'Travail dirigé',
  'travail pratique': 'Travail pratique',
  'évaluation':       'Évaluation',
  'sae':              'SAE',
  'sae en td':        'SAE en TD',
}

function formatLabel(lb) {
  return LABEL_MAP[lb] || (lb.charAt(0).toUpperCase() + lb.slice(1))
}

function capitalize(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatDuree(dur) {
  const m = dur.match(/^(\d+)h(\d{2})?$/)
  if (m) {
    const h = parseInt(m[1], 10)
    const mins = m[2] ? parseInt(m[2], 10) : 0
    if (mins === 0) return `${h} heure${h > 1 ? 's' : ''}`
    return `${h}h${m[2]}`
  }
  return dur
}

/* Couleur du petit point sous chaque onglet jour — catégorie, pas thème */
const DOT_COLORS = { eval:'#dc2626', td:'#1d4ed8', ann:'#dc2626', normal:'#16a34a' }
function dotColorFor(item) {
  if (item.ann) return DOT_COLORS.ann
  if (item.ev)  return DOT_COLORS.eval
  if (item.td)  return DOT_COLORS.td
  return DOT_COLORS.normal
}

function CalendarModal({ active, onSelect, onClose }) {
  const [calDate, setCalDate] = useState(new Date(2026, 4, 1))
  const m = calDate.getMonth()
  const y = calDate.getFullYear()
  const first = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const today = new Date()
  const prevDays = new Date(y, m, 0).getDate()

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:40, padding:30, width:'100%', maxWidth:380, fontFamily:'inherit' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <span style={{ fontSize:20, fontWeight:900 }}>{MOIS[m]} {y}</span>
          <div style={{ display:'flex', gap:8 }}>
            {['←','→'].map((a, i) => (
              <button key={i} onClick={() => setCalDate(d => { const nd = new Date(d); nd.setMonth(nd.getMonth() + (i ? 1 : -1)); return nd })}
                style={{ width:36, height:36, borderRadius:'50%', border:'2px solid #ebebeb', background:'#fff', cursor:'pointer', fontSize:16, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {DOW.map(d => <div key={d} style={{ textAlign:'center', fontSize:12, fontWeight:900, color:'#bbb', padding:'6px 0' }}>{d}</div>)}
          {Array.from({ length: first }, (_, i) => (
            <div key={'p'+i} style={{ textAlign:'center', padding:'10px 4px', fontSize:14, color:'#e0e0e0', fontWeight:900 }}>
              {prevDays - first + 1 + i}
            </div>
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1
            const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear()
            const j = JOURS.find(x => x.date === d)
            const isSel = j && j.id === active
            const dow = new Date(y, m, d).getDay()
            const isWE = dow === 0 || dow === 6
            return (
              <div key={d} onClick={() => { if (j && !j.isWeekend) { onSelect(j.id); onClose() } }}
                style={{
                  textAlign:'center', padding:'10px 4px', borderRadius:14,
                  fontSize:14, fontWeight:900, cursor: isWE ? 'default' : 'pointer',
                  background: isToday ? '#1a1a1a' : isSel ? '#fef9c3' : 'transparent',
                  color: isToday ? '#fff' : isSel ? '#92400e' : isWE ? '#ccc' : '#1a1a1a',
                  position:'relative',
                }}>
                {d}
                {!isWE && <span style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background: isToday ? '#fff' : '#1a1a1a', display:'block' }} />}
              </div>
            )
          })}
        </div>
        <button onClick={onClose} style={{ width:'100%', padding:14, borderRadius:980, border:'none', background:'#1a1a1a', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'inherit', marginTop:20 }}>
          fermer
        </button>
      </div>
    </div>
  )
}

export default function EmploiDuTemps() {
  const { colors, font } = useThemeStore()
  const tn = new Date()
  const tdn = tn.toLocaleDateString('fr-FR', { weekday:'long' }).toLowerCase()
  const todayId = JOURS.find(j => j.id === tdn)?.id || 'vendredi'
  const [active, setActive] = useState(todayId)
  const [search, setSearch] = useState('')
  const [calOpen, setCalOpen] = useState(false)

  const j = JOURS.find(x => x.id === active)
  const items = DATA[active] || []
  const filtered = search ? items.filter(x => x.t === 'p' || x.n.toLowerCase().includes(search.toLowerCase())) : items

  const s = { fontFamily: font }

  return (
    <div style={{ background:'#fff', minHeight:'100vh', padding:'36px 22px 80px', ...s }}>

      {/* Date */}
      <button onClick={() => setCalOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:10, marginBottom:6, fontFamily:'inherit' }}>
        <span style={{ fontSize:36, fontWeight:900, letterSpacing:'-1.5px', color:'#1a1a1a', lineHeight:1 }}>{active}</span>
        <span style={{ width:44, height:44, borderRadius:'50%', background:colors.today, color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900 }}>{j?.date || 29}</span>
        <span style={{ fontSize:36, fontWeight:900, letterSpacing:'-1.5px', color:'#1a1a1a', lineHeight:1 }}>mai</span>
      </button>
      <div style={{ fontSize:13, color:'#ccc', fontWeight:700, marginBottom:28 }}>appuie pour voir le calendrier</div>

      {/* Tabs jours */}
      <div style={{ display:'flex', gap:8, marginBottom:22, overflowX:'auto', paddingBottom:4 }}>
        {JOURS.map(jour => {
          const isToday = jour.id === todayId
          const isActive = jour.id === active
          const dotColors = !jour.isWeekend ? [...new Set((DATA[jour.id] || []).filter(x => x.t === 'c').map(dotColorFor))].slice(0, 3) : []
          return (
            <button
              key={jour.id}
              onClick={() => !jour.isWeekend && setActive(jour.id)}
              style={{
                padding:'10px 18px', borderRadius:980, fontSize:14, fontWeight:900,
                cursor: jour.isWeekend ? 'default' : 'pointer',
                fontFamily:'inherit',
                display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                border: '2.5px solid',
                borderColor: isToday ? colors.today : isActive ? colors.selBorder : jour.isWeekend ? '#f0f0f0' : '#d0d0d0',
                background: isToday ? colors.today : isActive ? colors.sel : jour.isWeekend ? '#fafafa' : '#fff',
                color: isToday ? '#fff' : isActive ? colors.selTxt : jour.isWeekend ? colors.we : '#1a1a1a',
                transition:'all 0.15s',
              }}>
              {jour.label}
              {dotColors.length > 0 && (
                <div style={{ display:'flex', gap:3 }}>
                  {dotColors.map((c, i) => (
                    <div key={i} style={{ width:5, height:5, borderRadius:'50%', background: isToday ? 'rgba(255,255,255,0.5)' : c }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Recherche */}
      <input
        type="text" placeholder="rechercher une matière..." value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width:'100%', padding:'24px 36px', borderRadius:9999, border:'2.5px solid #e8e8e8', background:'#f5f5f5', fontSize:20, fontWeight:700, color:'#1a1a1a', outline:'none', fontFamily:'inherit', marginBottom:32, display:'block', boxSizing:'border-box', transition:'all 0.2s' }}
      />

      <div style={{ textAlign:'center', fontSize:11, fontWeight:900, letterSpacing:2, textTransform:'uppercase', color:'#ddd', marginBottom:16 }}>arrivée</div>

      {/* Timeline */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', fontSize:16, fontWeight:900, color:'#ddd' }}>pas de cours ce jour</div>
        )}
        {filtered.map((item, i) => {
          if (item.t === 'p') return (
            <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ minWidth:66 }} />
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 26px', borderRadius:980, border:'2px solid #f0f0f0', background:'#fafafa' }}>
                <span style={{ fontSize:15, fontWeight:900, color:'#ccc' }}>{item.lb}</span>
                <span style={{ fontSize:14, fontWeight:700, color:'#ddd' }}>{item.dur}</span>
              </div>
            </div>
          )

          return (
            <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ minWidth:66, textAlign:'right', paddingTop:24, flexShrink:0 }}>
                <div style={{ fontSize:28, fontWeight:900, letterSpacing:'-1px', lineHeight:1, color:'#1a1a1a' }}>{item.d}</div>
                <div style={{ fontSize:14, fontWeight:700, color:'#ccc', marginTop:5 }}>{item.f}</div>
              </div>
              <div style={{ flex:1 }}>
                <Course
                  matiere={capitalize(item.n)}
                  professeur={capitalize(item.p)}
                  salle={capitalize(item.r)}
                  type={item.ann ? 'Cours' : formatLabel(item.lb)}
                  duree={formatDuree(item.dur)}
                  annule={!!item.ann}
                  raisonAnnulation="Professeur absent"
                />
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <div style={{ textAlign:'center', fontSize:11, fontWeight:900, letterSpacing:2, textTransform:'uppercase', color:'#ddd', marginTop:18 }}>sortie</div>
      )}

      {calOpen && <CalendarModal active={active} onSelect={setActive} onClose={() => setCalOpen(false)} />}
    </div>
  )
}