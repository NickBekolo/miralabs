import { useState } from 'react'
import MoyenneChart from '../../../components/charts/MoyenneChart'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,sans-serif'

const C = {
  bg:     '#F2F2F2',
  card:   '#fff',
  border: '#E5E7EB',
  text:   '#111111',
  muted:  '#8A8A8A',
  faint:  '#F5F5F5',
  red:    '#ff0000',
}

const DATASETS = {
  general: {
    label: 'Moyenne générale',
    points: [
      { label:'8 sept',  val:12.8, classe:11.6, rang:6  },
      { label:'22 sept', val:13.4, classe:11.9, rang:5  },
      { label:'20 oct',  val:9.6,  classe:11.9, rang:15 },
      { label:'4 nov',   val:8.8,  classe:11.7, rang:18 },
      { label:'24 nov',  val:10.4, classe:12.0, rang:12 },
      { label:'8 déc',   val:12.1, classe:12.1, rang:8  },
      { label:'12 jan',  val:13.0, classe:12.2, rang:5  },
      { label:'9 fév',   val:14.0, classe:12.4, rang:3  },
      { label:'16 avr',  val:14.0, classe:12.5, rang:3  },
      { label:'15 juin', val:14.2, classe:12.4, rang:3  },
    ],
  },
  maths: {
    label: 'Mathématiques',
    points: [
      { label:'8 sept',  val:11.0, classe:10.8, rang:9  },
      { label:'20 oct',  val:9.0,  classe:10.5, rang:14 },
      { label:'8 déc',   val:13.0, classe:11.2, rang:6  },
      { label:'15 juin', val:14.0, classe:11.4, rang:3  },
    ],
  },
  physique: {
    label: 'Physique-Chimie',
    points: [
      { label:'2 oct',   val:13.5, classe:12.0, rang:5 },
      { label:'9 fév',   val:16.0, classe:12.8, rang:1 },
      { label:'15 juin', val:16.0, classe:13.0, rang:1 },
    ],
  },
  francais: {
    label: 'Français',
    points: [
      { label:'15 sept', val:12.0, classe:11.5, rang:7  },
      { label:'4 nov',   val:8.0,  classe:11.0, rang:20 },
      { label:'26 jan',  val:11.5, classe:11.8, rang:10 },
      { label:'15 juin', val:12.0, classe:11.9, rang:9  },
    ],
  },
}

const COURS = [
  { name:"Traitement de l'information", meta:'Bât. 10 · Baptiste V.', time:'10:15', annule:false },
  { name:'Physique-Chimie',             meta:'Labo 1 · Mme Martin',   time:'13:30', annule:false },
  { name:'Anglais',                     meta:'Bât. 9 · Pullen A.',    time:'15:30', annule:true  },
  { name:'Mathématiques',               meta:'Salle A12 · M. Dupont', time:'17:00', annule:false },
]

const DEVOIRS = [
  { title:'Exercices polynômes', sub:'Mathématiques', date:'23/06', urgent:true  },
  { title:'Dissertation',        sub:'Français',      date:'25/06', urgent:false },
  { title:'Compte-rendu TP',     sub:'Physique',      date:'28/06', urgent:false },
]

const NOTES = [
  { score:16, matiere:'Physique-Chimie',  type:'TP noté',     date:'9 juin',  low:false },
  { score:14, matiere:'Mathématiques',    type:'Évaluation',  date:'12 juin', low:false },
  { score:8,  matiere:'Français',         type:'Dissertation', date:'15 juin', low:true  },
]

const ACTU = [
  { tag:'Établissement', tagRed:false, title:'Réunion parents-professeurs', sub:'Vendredi 13 juin à 17h', time:'Il y a 2h' },
  { tag:'Urgent',        tagRed:true,  title:'Sortie pédagogique annulée',  sub:'Rattrapage à venir',     time:'Hier'      },
  { tag:'Calendrier',    tagRed:false, title:'Inscriptions examens ouvertes',sub:"Jusqu'au 30 juin",      time:'Il y a 2j' },
]

const BOOKS = [
  { title:'Fonctions polynômes',    color:'#1e3a5f' },
  { title:'Solutions aqueuses',     color:'#9f1239' },
  { title:'Probabilités',           color:'#4a1942' },
  { title:'Circuits électriques',   color:'#1a3c34' },
  { title:'Pression hydrostatique', color:'#7c2d12' },
  { title:'Second degré',           color:'#374151' },
  { title:'Boyle-Mariotte',         color:'#1e3a5f' },
  { title:'Histoire coloniale',     color:'#713f12' },
]

const ABSENCES = [11, 20]
const TODAY    = 23

/* ─── Calendrier assiduité ─────────────────────── */
function CalendrierAssiduite() {
  const jours = ['L','M','M','J','V','S','D']
  const offset = 0
  const totalDays = 30
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px 18px', fontFamily:ft }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.text }}>Assiduité</span>
        <span style={{ fontSize:10, fontWeight:700, color:C.red }}>2 absences</span>
      </div>
      <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>Juin 2026</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {jours.map(j => (
          <div key={j} style={{ fontSize:8, color:C.muted, textAlign:'center', fontWeight:600, padding:'1px 0' }}>{j}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`}/>
          const isWeekend = (i % 7 === 5 || i % 7 === 6)
          const isAbsent  = ABSENCES.includes(d)
          const isToday   = d === TODAY
          const isPast    = d < TODAY && !isWeekend
          let bg = 'transparent', color = '#EBEBEB'
          if (isToday)       { bg = C.text; color = '#fff' }
          else if (isAbsent) { bg = C.red;  color = '#fff' }
          else if (isPast)   { bg = '#F8F8F8'; color = C.text }
          return (
            <div key={d} style={{
              aspectRatio:'1', borderRadius:5, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:9, fontWeight:600, background:bg, color,
            }}>{d}</div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        {[{ bg:C.red, label:'Absent' },{ bg:C.text, label:"Aujourd'hui" }].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:3, fontSize:9, color:C.muted }}>
            <div style={{ width:7, height:7, borderRadius:3, background:l.bg }}/>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Sections ─────────────────────────────────── */
function SectionHeader({ title, link }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
      <span style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:ft }}>{title}</span>
      {link && <span style={{ fontSize:11, color:C.muted, cursor:'pointer', fontFamily:ft }}>{link}</span>}
    </div>
  )
}

function CoursSection() {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px 18px', fontFamily:ft }}>
      <SectionHeader title="Cours du jour" link="Voir tout ›"/>
      {COURS.map((c, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 0', borderBottom: i < COURS.length-1 ? `1px solid ${C.faint}` : 'none',
        }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color: c.annule ? C.muted : C.text }}>{c.name}</div>
            <div style={{ fontSize:10, color:C.muted }}>{c.meta}</div>
          </div>
          <span style={{
            padding:'3px 10px', borderRadius:980, fontSize:10, fontWeight:700,
            border: c.annule ? '1px solid rgba(255,0,0,0.3)' : `1px solid ${C.border}`,
            color:  c.annule ? C.red : C.text,
            background: c.annule ? 'rgba(255,0,0,0.06)' : C.card,
          }}>
            {c.annule ? 'Annulé' : c.time}
          </span>
        </div>
      ))}
    </div>
  )
}

function DevoirsSection() {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px 18px', fontFamily:ft }}>
      <SectionHeader title="Devoirs à rendre" link="Voir tout ›"/>
      {DEVOIRS.map((d, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'flex-start', gap:8,
          padding:'8px 0', borderBottom: i < DEVOIRS.length-1 ? `1px solid ${C.faint}` : 'none',
        }}>
          <div style={{ minWidth:32 }}>
            {d.urgent && <div style={{ fontSize:9, fontWeight:700, color:C.red }}>URGENT</div>}
            <div style={{ fontSize:9, color:C.muted, marginTop: d.urgent ? 1 : 2 }}>{d.date}</div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{d.title}</div>
            <div style={{ fontSize:10, color:C.muted }}>{d.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NotesSection() {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px 18px', fontFamily:ft }}>
      <SectionHeader title="Notes récentes" link="Voir tout ›"/>
      {NOTES.map((n, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 0', borderBottom: i < NOTES.length-1 ? `1px solid ${C.faint}` : 'none',
        }}>
          <span style={{
            fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:7, flexShrink:0,
            background: n.low ? 'rgba(255,0,0,0.05)' : '#F8F8F8',
            border: n.low ? `1px solid ${C.red}` : `1px solid ${C.border}`,
            color: n.low ? C.red : C.text,
          }}>{n.score}/20</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{n.matiere}</div>
            <div style={{ fontSize:10, color:C.muted }}>{n.type}</div>
          </div>
          <div style={{ fontSize:10, color:C.muted, flexShrink:0 }}>{n.date}</div>
        </div>
      ))}
    </div>
  )
}

function ActualitesSection() {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'16px 18px', fontFamily:ft }}>
      <SectionHeader title="Actualités" link="Voir tout ›"/>
      {ACTU.map((a, i) => (
        <div key={i} style={{
          padding:'8px 0', borderBottom: i < ACTU.length-1 ? `1px solid ${C.faint}` : 'none',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:9, fontWeight:600, color: a.tagRed ? C.red : C.muted, textTransform:'uppercase', letterSpacing:'0.3px' }}>{a.tag}</span>
            <span style={{ fontSize:9, color:'#AEAEB2' }}>{a.time}</span>
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:1 }}>{a.title}</div>
          <div style={{ fontSize:10, color:C.muted }}>{a.sub}</div>
        </div>
      ))}
    </div>
  )
}

function Library() {
  const [selected, setSelected] = useState(0)
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, overflow:'hidden', fontFamily:ft }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px 10px' }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Mes documents de cours</span>
        <button style={{
          fontSize:11, fontWeight:700, padding:'5px 14px', borderRadius:980,
          border:'none', background:C.text, color:'#fff', cursor:'pointer', fontFamily:ft,
        }}>+ Ajouter</button>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', padding:'0 18px', overflowX:'auto' }}>
        <div style={{
          width:140, flexShrink:0, height:200, borderRadius:'4px 0 0 4px',
          background: BOOKS[selected].color,
          display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'14px 12px 12px',
        }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)' }}>1ASSP1 · Cours</div>
          <div style={{ fontSize:14, fontWeight:800, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.25 }}>
            {BOOKS[selected].title}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end' }}>
          {BOOKS.map((b, i) => (
            <div key={i} onClick={() => setSelected(i)} style={{
              width: i === selected ? 32 : 26, height:200, background:b.color,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', flexShrink:0, transition:'width 0.2s',
              borderLeft:'1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{
                writingMode:'vertical-rl', transform:'rotate(180deg)',
                fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.7)',
                whiteSpace:'nowrap', overflow:'hidden', maxHeight:160,
              }}>{b.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height:14 }}/>
    </div>
  )
}

/* ─── Page principale ───────────────────────────── */
export default function HomeScreen() {
  const isMobile = window.innerWidth < 768

  return (
    <div style={{ fontFamily:ft, padding:'16px 12px 40px', background:C.bg, minHeight:'100vh' }}>

      {/* Salutation */}
      <div style={{ marginBottom:16 }}>
        <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.6px', color:C.text, marginBottom:3 }}>
          Bonjour, Ritah 👋
        </h1>
        <p style={{ fontSize:12, color:C.muted }}>Mardi 23 juin 2026 · 5 cours aujourd'hui</p>
      </div>

      {/* R1 : Courbe + Calendrier */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 200px', gap:12, marginBottom:12 }}>
        <MoyenneChart datasets={DATASETS} defaultKey="general"/>
        <CalendrierAssiduite/>
      </div>

      {/* R2 : Cours du jour + Devoirs */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 250px', gap:12, marginBottom:12 }}>
        <CoursSection/>
        <DevoirsSection/>
      </div>

      {/* R3 : Notes + Actualités */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
        <NotesSection/>
        <ActualitesSection/>
      </div>

      {/* Bibliothèque */}
      <Library/>
    </div>
  )
}