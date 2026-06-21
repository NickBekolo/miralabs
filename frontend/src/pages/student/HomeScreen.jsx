import { useState } from 'react'
import { Colors, adj, subjectColor } from './Course'

const ft = '"Figtree", -apple-system, BlinkMacSystemFont, sans-serif'

const today = new Date()
const dOffset = offset => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + offset)
  return dt
}

const mockTasks = [
  { id:1, subject:'Mathématiques', description:'Exercices fonctions polynômes chapitre 4', dueDate:dOffset(1), done:false },
  { id:2, subject:'Français', description:"Dissertation sur l'argumentation écrite", dueDate:dOffset(2), done:true },
  { id:3, subject:'Physique-Chimie', description:'Compte-rendu TP solutions aqueuses', dueDate:dOffset(3), done:false },
]

const mockGrades = [
  { id:1, title:'Mathématiques', description:'Contrôle fonctions polynômes', score:14.5, outOf:20, date:dOffset(-2), hasMaxScore:false },
  { id:2, title:'Physique-Chimie', description:'TP solutions aqueuses', score:16, outOf:20, date:dOffset(-3), hasMaxScore:true },
  { id:3, title:'Histoire-Géo', description:'Interrogation décolonisation', score:15, outOf:20, date:dOffset(-4), hasMaxScore:false },
  { id:4, title:'Français', description:'Dissertation argumentation', score:12, outOf:20, date:dOffset(-5), hasMaxScore:false },
]

const mockSubjects = [
  { name:'Mathématiques', average:14.5, outOf:20 },
  { name:'Physique-Chimie', average:15.67, outOf:20 },
  { name:'Français', average:12.33, outOf:20 },
  { name:'Histoire-Géo', average:15, outOf:20 },
  { name:'Anglais', average:17, outOf:20 },
  { name:'EPS', average:18, outOf:20 },
]

const mockCours = [
  { debut:'09h00', fin:'11h00', name:'Mathématiques', room:'Bât. 2 salle 14', prof:'M. Dupont' },
  { debut:'11h20', fin:'12h20', name:'Physique-Chimie', room:'Labo 1', prof:'Mme Martin' },
]

const headerButtons = [
  { id:'cards', title:'Cartes', color:'#EE9F00', description:'2 cartes disponibles' },
  { id:'attendance', title:'Assiduité', color:'#D62B94', description:'2 absences ce mois' },
  { id:'menu', title:'Menu', color:'#7ED62B', description:'Voir le menu du jour' },
  { id:'chats', title:'Messages', color:'#2B7ED6', description:'3 conversations' },
]

const glass = {
  background:'rgba(255,255,255,0.72)',
  backdropFilter:'blur(20px) saturate(180%)',
  WebkitBackdropFilter:'blur(20px) saturate(180%)',
  border:'1px solid rgba(255,255,255,0.5)',
}

function UserProfile() {
  return (
    <div style={{ display:'flex', flexDirection:'row', alignItems:'center', gap:10, flex:1 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', background:'#0a0a0a', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, fontFamily:ft, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.3)', cursor:'pointer' }}>
        R
      </div>
      <div style={{ display:'flex', flexDirection:'column', padding:'6px 14px', borderRadius:980, background:'rgba(0,0,0,0.2)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:15, fontWeight:800, fontFamily:ft, color:'#fff', whiteSpace:'nowrap' }}>Ritah Mandeng</span>
          <span style={{ fontSize:14, color:'rgba(255,255,255,0.45)' }}>›</span>
        </div>
        <span style={{ fontSize:12, fontWeight:500, fontFamily:ft, color:'rgba(255,255,255,0.6)', whiteSpace:'nowrap' }}>Lycée Jean Hyppolite</span>
      </div>
    </div>
  )
}

function HomeTopBar() {
  return (
    <div style={{ padding:'16px 16px 10px', display:'flex', alignItems:'center', gap:16 }}>
      <UserProfile />
      <div style={{ display:'flex', gap:8 }}>
        {['T','R'].map((lbl, i) => (
          <div key={i} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.2)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor:'pointer', color:'rgba(255,255,255,0.8)', fontWeight:700, fontFamily:ft }}>
            {lbl}
          </div>
        ))}
      </div>
    </div>
  )
}

function HeaderButtons() {
  const rows = [headerButtons.slice(0,2), headerButtons.slice(2,4)]
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display:'flex', gap:8 }}>
          {row.map(btn => (
            <div key={btn.id} style={{ flex:1, ...glass, borderRadius:20, padding:14, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:14, flexShrink:0, background:btn.color+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:20, height:20, borderRadius:6, background:btn.color+'88' }} />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, fontFamily:ft, color:'#0a0a0a' }}>{btn.title}</div>
                <div style={{ fontSize:12, fontWeight:500, fontFamily:ft, color:'#888', marginTop:1 }}>{btn.description}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function HomeWidget({ title, children }) {
  return (
    <div style={{ ...glass, borderRadius:24, overflow:'hidden', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px 10px' }}>
        <span style={{ fontSize:16, fontWeight:800, fontFamily:ft, color:'#0a0a0a' }}>{title}</span>
        <button style={{ background:'rgba(0,0,0,0.06)', border:'none', borderRadius:980, padding:'5px 14px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:ft, color:'#555' }}>
          Afficher plus ›
        </button>
      </div>
      {children}
    </div>
  )
}

function CompactTask({ subject, description, dueDate, done, color, onToggle }) {
  const dateStr = dueDate.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' })
  return (
    <div style={{ background:color+'18', borderRadius:20, overflow:'hidden', border:`1px solid ${color}28`, flex:'1 1 150px', minWidth:150 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' }}>
        <div style={{ width:32, height:32, borderRadius:80, background:color+'50', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15, fontWeight:800, fontFamily:ft, color:adj(color,-0.3) }}>
          {subject.charAt(0)}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:700, fontFamily:ft, color:'#666', marginBottom:2 }}>{subject}</div>
          <div style={{ fontSize:13, fontWeight:500, fontFamily:ft, color:'#333', lineHeight:'1.4', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{description}</div>
          <div style={{ fontSize:12, fontWeight:600, fontFamily:ft, color:'#aaa', marginTop:3 }}>{dateStr}</div>
        </div>
        <div onClick={onToggle} style={{ width:24, height:24, borderRadius:80, flexShrink:0, border:`2px solid ${done ? color : '#ccc'}`, background: done ? color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.18s' }}>
          {done && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
        </div>
      </div>
    </div>
  )
}

function CompactGrade({ title, description, score, outOf, date, color, hasMaxScore }) {
  const dateStr = date.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })
  const trailingBg = hasMaxScore ? adj(color,-0.4) : adj(color,-0.4)+'18'
  const trailingFg = hasMaxScore ? '#fff' : adj(color,-0.4)
  return (
    <div style={{ width:200, height:136, borderRadius:24, flexShrink:0, background:'rgba(255,255,255,0.72)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:`1px solid ${adj(color,-0.7)}28`, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden', cursor:'pointer', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${color}14 0%,transparent 60%)`, borderRadius:24 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px 4px', position:'relative' }}>
        <div style={{ width:28, height:28, borderRadius:32, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14, fontWeight:800, fontFamily:ft, color:adj(color,-0.3) }}>
          {title.charAt(0)}
        </div>
        <div style={{ flex:1, fontSize:13, fontWeight:600, fontFamily:ft, color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
        <div style={{ fontSize:12, fontWeight:500, fontFamily:ft, color:'#888', whiteSpace:'nowrap' }}>{dateStr}</div>
      </div>
      <div style={{ padding:'2px 12px 12px', display:'flex', flexDirection:'column', gap:8, position:'relative' }}>
        <div style={{ fontSize:12, fontWeight:500, fontFamily:ft, color:'#444', lineHeight:'1.4', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{description}</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:2, padding:'5px 10px', borderRadius:32, background:trailingBg, alignSelf:'flex-start' }}>
          <span style={{ fontSize:14, fontWeight:700, fontFamily:ft, color:trailingFg }}>{score.toFixed(2)}</span>
          <span style={{ fontSize:12, fontWeight:600, fontFamily:ft, color:trailingFg+'99' }}>/{outOf}</span>
          {hasMaxScore && <span style={{ fontSize:12, marginLeft:2, color:trailingFg }}>♛</span>}
        </div>
      </div>
    </div>
  )
}

function SubjectRow({ name, average, outOf, color }) {
  return (
    <div style={{ background:color+'22', border:'1px solid #00000018', borderBottom:'none', padding:'8px 8px 36px', borderRadius:'22px 22px 0 0', marginBottom:-24, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:34, height:34, borderRadius:20, background:color+'50', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, fontFamily:ft, color:adj(color,-0.3), flexShrink:0 }}>
          {name.charAt(0)}
        </div>
        <div style={{ flex:1, fontSize:16, fontWeight:700, fontFamily:ft, color:color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:2, padding:'4px 10px', borderRadius:120, background:color+'25' }}>
          <span style={{ fontSize:15, fontWeight:700, fontFamily:ft, color:color }}>{average.toFixed(2)}</span>
          <span style={{ fontSize:12, fontWeight:600, fontFamily:ft, color:color+'DF', opacity:0.8 }}>/{outOf}</span>
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState(
    mockTasks.map(t => ({ ...t, color: subjectColor(t.subject) }))
  )
  const grades = mockGrades.map(g => ({ ...g, color: subjectColor(g.title) }))
  const subjects = mockSubjects.map(s => ({ ...s, color: subjectColor(s.name) }))
  const pending = tasks.filter(t => !t.done).length

  const toggleTask = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))

  return (
    <div style={{ background:'linear-gradient(160deg,#1a1a2e 0%,#2d2d44 40%,#1e1e30 100%)', minHeight:'100vh', fontFamily:ft }}>
      <HomeTopBar />
      <div style={{ padding:'8px 16px 56px' }}>
        <HeaderButtons />

        <HomeWidget title="Emploi du temps">
          <div style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:10 }}>
            {mockCours.map((c, i) => (
              <div key={i} style={{ display:'flex', gap:14, alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, fontFamily:ft, color:'#0a0a0a', letterSpacing:'-0.5px' }}>{c.debut}</div>
                  <div style={{ fontSize:12, color:'#888', fontWeight:500, fontFamily:ft }}>{c.fin}</div>
                </div>
                <div style={{ flex:1, background:'rgba(0,0,0,0.04)', borderRadius:14, padding:'12px 16px' }}>
                  <div style={{ fontSize:15, fontWeight:700, fontFamily:ft, marginBottom:2 }}>{c.name}</div>
                  <div style={{ fontSize:13, color:'#888', fontWeight:500, fontFamily:ft }}>{c.room} · {c.prof}</div>
                </div>
              </div>
            ))}
          </div>
        </HomeWidget>

        <HomeWidget title={`Devoirs${pending > 0 ? ` · ${pending} en attente` : ''}`}>
          <div style={{ display:'flex', gap:10, padding:'0 16px 16px', flexWrap:'wrap' }}>
            {tasks.map(t => (
              <CompactTask key={t.id} {...t} onToggle={() => toggleTask(t.id)} />
            ))}
          </div>
        </HomeWidget>

        <HomeWidget title="Nouvelles notes">
          <div style={{ display:'flex', gap:10, padding:'0 16px 16px', overflowX:'auto' }}>
            {grades.map(g => <CompactGrade key={g.id} {...g} />)}
          </div>
        </HomeWidget>

        <HomeWidget title="Moyennes">
          <div style={{ padding:'0 16px 40px', display:'flex', flexDirection:'column' }}>
            {subjects.map(s => <SubjectRow key={s.name} {...s} />)}
            <div style={{ height:24 }} />
          </div>
        </HomeWidget>
      </div>
    </div>
  )
}