import { useState, useRef } from 'react'

const ft = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'

const ESPACES = [
  {
    id:1, name:'1ASSP1', type:'Classe', color:'#0f3460', icon:'🏫', members:28,
    membersList:[{ initials:'MD', color:'#1a1a2e' },{ initials:'MM', color:'#243b55' },{ initials:'AB', color:'#2d132c' },{ initials:'KL', color:'#16213e' }],
    canaux:[
      { id:1, name:'général',    unread:3, type:'chat' },
      { id:2, name:'devoirs',    unread:1, type:'devoirs_lecture' },
      { id:3, name:'ressources', unread:0, type:'chat' },
      { id:4, name:'annonces',   unread:2, type:'chat' },
    ],
    msgs:{
      1:[{ id:1, from:'M. Dupont', avatar:'MD', color:'#1a1a2e', me:false, text:'Bonjour à tous !', time:'09:15' }],
      3:[{ id:1, from:'M. Brun', avatar:'MB', color:'#16213e', me:false, text:'📎 manuel-histoire-ch3.pdf', time:'Lun' }],
      4:[{ id:1, from:'Administration', avatar:'LJ', color:'#1b262c', me:false, text:'📌 Réunion parents-professeurs le 13 juin.', time:'Lun' }],
    }
  },
  {
    id:2, name:'Maths — M. Dupont', type:'Matière', color:'#1a1a2e', icon:'📐', members:28,
    membersList:[{ initials:'MD', color:'#1a1a2e' },{ initials:'R', color:'#0f3460' },{ initials:'AB', color:'#2d132c' }],
    canaux:[
      { id:1, name:'cours',     unread:0, type:'chat' },
      { id:2, name:'devoirs',   unread:1, type:'devoirs_lecture' },
      { id:3, name:'entraide',  unread:0, type:'chat' },
    ],
    msgs:{
      1:[{ id:1, from:'M. Dupont', avatar:'MD', color:'#1a1a2e', me:false, text:'Chapitre 4 — Polynômes du second degré.', time:'Lun' }],
      3:[{ id:1, from:'Alice B.', avatar:'AB', color:'#2d132c', me:false, text:"Quelqu'un peut m'expliquer l'exercice 15 ?", time:'Auj.' }],
    }
  },
  {
    id:3, name:'Groupe Révision Maths', type:'Groupe d\'étude', color:'#2d132c', icon:'📖', members:4,
    membersList:[{ initials:'R', color:'#0f3460' },{ initials:'KL', color:'#2d132c' },{ initials:'AB', color:'#2d132c' }],
    canaux:[
      { id:1, name:'général',  unread:0, type:'chat' },
      { id:2, name:'séances',  unread:2, type:'seances' },
      { id:3, name:'objectifs',unread:0, type:'objectifs' },
    ],
    msgs:{ 1:[{ id:1, from:'Ritah', avatar:'R', color:'#0f3460', me:true, text:"On se retrouve samedi pour réviser ?", time:'Dim' }] }
  },
  {
    id:4, name:'Club Informatique', type:'Club', color:'#243b55', icon:'💻', members:12,
    membersList:[{ initials:'R', color:'#0f3460' },{ initials:'MD', color:'#1a1a2e' },{ initials:'AB', color:'#2d132c' },{ initials:'KL', color:'#16213e' }],
    canaux:[
      { id:1, name:'général', unread:2, type:'chat' },
      { id:2, name:'séances', unread:0, type:'seances' },
      { id:3, name:'projets', unread:0, type:'chat' },
    ],
    msgs:{ 1:[{ id:1, from:'M. Dupont', avatar:'MD', color:'#1a1a2e', me:false, text:'Prochain meetup vendredi à 17h.', time:'Mer' }] }
  },
]

const DEVOIRS_PROFS = {
  2: [
    { id:1, titre:'Exercices polynômes p.45-52', matiere:'Mathématiques', dateRendu:'15/07', urgent:true,  auteur:'M. Dupont', done:false },
    { id:2, titre:'Dissertation sur le romantisme', matiere:'Français', dateRendu:'20/07', urgent:false, auteur:'Mme Leclerc', done:false },
    { id:3, titre:'Compte-rendu TP électricité', matiere:'Physique-Chimie', dateRendu:'25/07', urgent:false, auteur:'Mme Martin', done:false },
  ],
  2: [
    { id:1, titre:'Exercices 12 à 18 page 45', matiere:'Mathématiques', dateRendu:'18/07', urgent:true, auteur:'M. Dupont', done:false },
  ]
}

// ─── Composants de base ───────────────────────────────────────

function GroupAvatar({ space, size=44, editable=false, onEdit }) {
  const members = space.membersList ?? []
  const n = Math.min(members.length, 4)
  const half = size / 2, pad = 1.5
  const layouts = {
    1:[{ x:0,y:0,w:size,h:size }],
    2:[{ x:0,y:0,w:half-pad,h:size },{ x:half+pad,y:0,w:half-pad,h:size }],
    3:[{ x:0,y:0,w:half-pad,h:size },{ x:half+pad,y:0,w:half-pad,h:half-pad },{ x:half+pad,y:half+pad,w:half-pad,h:half-pad }],
    4:[{ x:0,y:0,w:half-pad,h:half-pad },{ x:half+pad,y:0,w:half-pad,h:half-pad },{ x:0,y:half+pad,w:half-pad,h:half-pad },{ x:half+pad,y:half+pad,w:half-pad,h:half-pad }],
  }
  const layout = layouts[n] ?? layouts[4]
  return (
    <div style={{ width:size,height:size,borderRadius:14,overflow:'hidden',flexShrink:0,position:'relative',background:'#e0e0e0' }}>
      {members.slice(0,n).map((m,i) => {
        const l = layout[i]
        return <div key={i} style={{ position:'absolute',left:l.x,top:l.y,width:l.w,height:l.h,background:m.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.min(l.w,l.h)*0.35,fontWeight:700,color:'#fff' }}>{m.initials}</div>
      })}
      {editable && (
        <button onClick={onEdit} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      )}
    </div>
  )
}

function UserAvatar({ initials, color, size=30 }) {
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.3,fontWeight:700,color:'#fff',flexShrink:0 }}>
      {initials}
    </div>
  )
}

// ─── Canal devoirs (lecture seule — créé par les profs) ───────

function DevoirsLecture({ spaceId }) {
  const [devoirs, setDevoirs] = useState(
    DEVOIRS_PROFS[spaceId] ?? [
      { id:1, titre:'Exercices polynômes', matiere:'Mathématiques', dateRendu:'15/07', urgent:true, auteur:'M. Dupont', done:false },
      { id:2, titre:'Compte-rendu TP', matiere:'Physique-Chimie', dateRendu:'25/07', urgent:false, auteur:'Mme Martin', done:false },
    ]
  )

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 14px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#fff8e1', borderRadius:12, marginBottom:16, border:'1px solid #fde68a' }}>
        <span style={{ fontSize:14 }}>📝</span>
        <span style={{ fontSize:12, color:'#92400e' }}>Seuls les professeurs peuvent créer des devoirs dans ce canal.</span>
      </div>

      {devoirs.map(d => (
        <div key={d.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:'#fff',borderRadius:14,marginBottom:10,boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <input type="checkbox" checked={d.done} onChange={() => setDevoirs(ds => ds.map(x => x.id===d.id?{...x,done:!x.done}:x))}
            style={{ width:18,height:18,cursor:'pointer',flexShrink:0,accentColor:'#111' }}/>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:3 }}>
              <span style={{ fontSize:14,fontWeight:600,color:'#111',textDecoration:d.done?'line-through':'none' }}>{d.titre}</span>
              {d.urgent && <span style={{ fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:980,background:'rgba(255,85,85,0.1)',color:'#ff5555' }}>URGENT</span>}
            </div>
            <div style={{ fontSize:11,color:'#999' }}>{d.matiere} · Rendu le {d.dateRendu} · {d.auteur}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Canal séances (groupe d'étude) ──────────────────────────

function SeancesCanal({ space }) {
  const [seances, setSeances] = useState([
    {
      id:1, titre:'Révision fonctions polynômes', date:'Samedi 12 juillet', heure:'14h00', lieu:'Bibliothèque municipale',
      objectifs:['Revoir le chapitre 4','Faire les exercices 12-18','Préparer l\'interro'],
      lecon:'Fonctions polynômes — second degré',
      participants:[{ initials:'R', color:'#0f3460' },{ initials:'KL', color:'#2d132c' }],
      done:false,
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titre:'', date:'', heure:'', lieu:'', lecon:'', objectif:'' })
  const [objectifs, setObjectifs] = useState([])

  const addObjectif = () => {
    if (!form.objectif.trim()) return
    setObjectifs(o => [...o, form.objectif.trim()])
    setForm(f => ({...f, objectif:''}))
  }

  const createSeance = () => {
    if (!form.titre.trim()) return
    setSeances(s => [...s, {
      id: Date.now(), titre:form.titre, date:form.date, heure:form.heure,
      lieu:form.lieu, lecon:form.lecon, objectifs, participants:[{ initials:'R', color:'#0f3460' }], done:false
    }])
    setForm({ titre:'', date:'', heure:'', lieu:'', lecon:'', objectif:'' })
    setObjectifs([])
    setShowForm(false)
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 14px' }}>

      <button onClick={() => setShowForm(s=>!s)}
        style={{ display:'flex',alignItems:'center',gap:8,width:'100%',padding:'12px 14px',background:'#f5f5f5',border:'none',borderRadius:12,cursor:'pointer',fontFamily:ft,marginBottom:16,color:'#111',fontSize:13,fontWeight:500 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Créer une séance de révision
      </button>

      {showForm && (
        <div style={{ background:'#fff',borderRadius:16,padding:18,marginBottom:16,boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize:14,fontWeight:700,color:'#111',marginBottom:14 }}>Nouvelle séance</div>

          {/* Titre */}
          <div style={{ fontSize:11,color:'#999',marginBottom:4 }}>Titre *</div>
          <input value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="ex: Révision Maths — Polynômes"
            style={{ width:'100%',padding:'10px 12px',background:'#f5f5f5',border:'none',borderRadius:10,fontSize:13,color:'#111',outline:'none',fontFamily:ft,marginBottom:12,boxSizing:'border-box' }}/>

          {/* Date + heure */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11,color:'#999',marginBottom:4 }}>Date</div>
              <input value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} placeholder="ex: Samedi 12 juillet"
                style={{ width:'100%',padding:'10px 12px',background:'#f5f5f5',border:'none',borderRadius:10,fontSize:13,color:'#111',outline:'none',fontFamily:ft,boxSizing:'border-box' }}/>
            </div>
            <div>
              <div style={{ fontSize:11,color:'#999',marginBottom:4 }}>Heure</div>
              <input value={form.heure} onChange={e=>setForm(f=>({...f,heure:e.target.value}))} placeholder="ex: 14h00"
                style={{ width:'100%',padding:'10px 12px',background:'#f5f5f5',border:'none',borderRadius:10,fontSize:13,color:'#111',outline:'none',fontFamily:ft,boxSizing:'border-box' }}/>
            </div>
          </div>

          {/* Lieu */}
          <div style={{ fontSize:11,color:'#999',marginBottom:4 }}>Lieu</div>
          <input value={form.lieu} onChange={e=>setForm(f=>({...f,lieu:e.target.value}))} placeholder="ex: Bibliothèque, Salle 204..."
            style={{ width:'100%',padding:'10px 12px',background:'#f5f5f5',border:'none',borderRadius:10,fontSize:13,color:'#111',outline:'none',fontFamily:ft,marginBottom:12,boxSizing:'border-box' }}/>

          {/* Leçon */}
          <div style={{ fontSize:11,color:'#999',marginBottom:4 }}>Leçon à réviser</div>
          <input value={form.lecon} onChange={e=>setForm(f=>({...f,lecon:e.target.value}))} placeholder="ex: Chapitre 4 — Fonctions polynômes"
            style={{ width:'100%',padding:'10px 12px',background:'#f5f5f5',border:'none',borderRadius:10,fontSize:13,color:'#111',outline:'none',fontFamily:ft,marginBottom:12,boxSizing:'border-box' }}/>

          {/* Objectifs */}
          <div style={{ fontSize:11,color:'#999',marginBottom:4 }}>Objectifs</div>
          {objectifs.map((o,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 0' }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#111',flexShrink:0 }}/>
              <span style={{ fontSize:13,color:'#111',flex:1 }}>{o}</span>
              <button onClick={() => setObjectifs(os => os.filter((_,j)=>j!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:16,lineHeight:1 }}>×</button>
            </div>
          ))}
          <div style={{ display:'flex',gap:8,marginBottom:14 }}>
            <input value={form.objectif} onChange={e=>setForm(f=>({...f,objectif:e.target.value}))}
              onKeyDown={e=>e.key==='Enter'&&addObjectif()} placeholder="Ajouter un objectif..."
              style={{ flex:1,padding:'8px 12px',background:'#f5f5f5',border:'none',borderRadius:10,fontSize:13,color:'#111',outline:'none',fontFamily:ft }}/>
            <button onClick={addObjectif} style={{ padding:'8px 14px',background:'#111',color:'#fff',border:'none',borderRadius:10,fontSize:12,cursor:'pointer',fontFamily:ft }}>+</button>
          </div>

          <div style={{ display:'flex',gap:8 }}>
            <button onClick={()=>setShowForm(false)} style={{ flex:1,padding:11,borderRadius:10,border:'none',background:'#f5f5f5',color:'#999',fontSize:13,cursor:'pointer',fontFamily:ft }}>Annuler</button>
            <button onClick={createSeance} style={{ flex:1,padding:11,borderRadius:10,border:'none',background:'#111',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:ft }}>Créer</button>
          </div>
        </div>
      )}

      {/* Liste séances */}
      {seances.map(s => (
        <div key={s.id} style={{ background:'#fff',borderRadius:16,padding:'16px 18px',marginBottom:12,boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10 }}>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:'#111',marginBottom:3 }}>{s.titre}</div>
              <div style={{ fontSize:12,color:'#999' }}>📅 {s.date} {s.heure && `à ${s.heure}`}</div>
              {s.lieu && <div style={{ fontSize:12,color:'#999' }}>📍 {s.lieu}</div>}
            </div>
            <div style={{ display:'flex',gap:4 }}>
              {s.participants.slice(0,3).map((p,i) => <UserAvatar key={i} initials={p.initials} color={p.color} size={26}/>)}
            </div>
          </div>

          {s.lecon && (
            <div style={{ background:'#f0f4ff',borderRadius:10,padding:'8px 12px',marginBottom:10 }}>
              <div style={{ fontSize:11,color:'#6366f1',fontWeight:600,marginBottom:2 }}>📚 Leçon</div>
              <div style={{ fontSize:13,color:'#111' }}>{s.lecon}</div>
            </div>
          )}

          {s.objectifs.length > 0 && (
            <div>
              <div style={{ fontSize:11,color:'#999',fontWeight:600,marginBottom:6 }}>OBJECTIFS</div>
              {s.objectifs.map((o,i) => (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:'#111',flexShrink:0 }}/>
                  <span style={{ fontSize:13,color:'#333' }}>{o}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Canal objectifs ──────────────────────────────────────────

function ObjectifsCanal() {
  const [objectifs, setObjectifs] = useState([
    { id:1, texte:'Terminer le chapitre 4', fait:true },
    { id:2, texte:'Obtenir plus de 12/20 aux devoirs', fait:false },
    { id:3, texte:'Préparer l\'examen de juin', fait:false },
  ])
  const [input, setInput] = useState('')

  const add = () => {
    if (!input.trim()) return
    setObjectifs(o => [...o, { id:Date.now(), texte:input.trim(), fait:false }])
    setInput('')
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'16px 14px' }}>
      <div style={{ display:'flex',gap:8,marginBottom:16 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
          placeholder="Ajouter un objectif..."
          style={{ flex:1,padding:'10px 14px',background:'#f5f5f5',border:'none',borderRadius:12,fontSize:13,color:'#111',outline:'none',fontFamily:ft }}/>
        <button onClick={add} style={{ padding:'10px 16px',background:'#111',color:'#fff',border:'none',borderRadius:12,fontSize:13,cursor:'pointer',fontFamily:ft }}>+</button>
      </div>

      {objectifs.map(o => (
        <div key={o.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'#fff',borderRadius:12,marginBottom:8,boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <input type="checkbox" checked={o.fait} onChange={() => setObjectifs(os => os.map(x=>x.id===o.id?{...x,fait:!x.fait}:x))}
            style={{ width:18,height:18,cursor:'pointer',accentColor:'#111' }}/>
          <span style={{ fontSize:14,color:'#111',textDecoration:o.fait?'line-through':'none',flex:1 }}>{o.texte}</span>
          <button onClick={() => setObjectifs(os=>os.filter(x=>x.id!==o.id))} style={{ background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:18,lineHeight:1 }}>×</button>
        </div>
      ))}
    </div>
  )
}

// ─── Vue espace ───────────────────────────────────────────────

function SpaceView({ space, onBack }) {
  const [activeCanal, setActiveCanal] = useState(space.canaux[0])
  const [input, setInput] = useState('')
  const [msgs,  setMsgs]  = useState(space.msgs?.[space.canaux[0].id] ?? [])
  const fileRef = useRef(null)

  const changeCanal = (canal) => {
    setActiveCanal(canal)
    setMsgs(space.msgs?.[canal.id] ?? [])
  }

  const send = () => {
    if (!input.trim()) return
    setMsgs(m => [...m, { id:Date.now(),from:'Ritah',avatar:'R',color:'#0f3460',me:true,text:input.trim(),time:'Maintenant' }])
    setInput('')
  }

  const renderCanal = () => {
    if (activeCanal.type === 'devoirs_lecture') return <DevoirsLecture spaceId={space.id}/>
    if (activeCanal.type === 'seances')  return <SeancesCanal space={space}/>
    if (activeCanal.type === 'objectifs') return <ObjectifsCanal/>
    return (
      <>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:14 }}>
          {msgs.length===0
            ? <div style={{ textAlign:'center',color:'#bbb',fontSize:13,marginTop:40 }}>Aucun message dans #{activeCanal.name}</div>
            : msgs.map(msg => (
              <div key={msg.id} style={{ display:'flex',gap:10,alignItems:'flex-start',flexDirection:msg.me?'row-reverse':'row' }}>
                <UserAvatar initials={msg.avatar} color={msg.color}/>
                <div style={{ maxWidth:'75%' }}>
                  {!msg.me && <div style={{ fontSize:11,fontWeight:600,color:'#666',marginBottom:3 }}>{msg.from}</div>}
                  <div style={{ padding:'10px 14px',borderRadius:msg.me?'18px 18px 4px 18px':'18px 18px 18px 4px',background:msg.me?'#111':'#f5f5f5',color:msg.me?'#fff':'#111',fontSize:14,lineHeight:1.5 }}>{msg.text}</div>
                  <div style={{ fontSize:10,color:'#bbb',marginTop:3,textAlign:msg.me?'right':'left' }}>{msg.time}</div>
                </div>
              </div>
            ))
          }
        </div>
        <div style={{ padding:'10px 14px 16px',flexShrink:0,borderTop:'1px solid #f0f0f0' }}>
          <div style={{ background:'#f5f5f5',borderRadius:18,padding:'10px 12px',display:'flex',alignItems:'center',gap:10 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder={`Message dans #${activeCanal.name}...`}
              style={{ flex:1,border:'none',background:'transparent',fontSize:14,outline:'none',fontFamily:ft,color:'#111' }}/>
            <button onClick={send} style={{ width:32,height:32,borderRadius:'50%',background:input.trim()?'#111':'#ddd',border:'none',cursor:input.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
      <div style={{ flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderBottom:'1px solid #f0f0f0' }}>
          <button onClick={onBack} style={{ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#111',padding:'0 4px',lineHeight:1 }}>‹</button>
          <GroupAvatar space={space} size={34} editable={true} onEdit={() => fileRef.current?.click()}/>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:'#111' }}>{space.name}</div>
            <div style={{ fontSize:11,color:'#999' }}>{space.type} · {space.members} membres</div>
          </div>
        </div>
        <div style={{ display:'flex',gap:0,overflowX:'auto',borderBottom:'1px solid #f0f0f0',padding:'0 12px' }}>
          {space.canaux.map(canal => (
            <button key={canal.id} onClick={() => changeCanal(canal)}
              style={{ border:'none',background:'none',padding:'10px 12px',cursor:'pointer',fontFamily:ft,fontSize:13,fontWeight:activeCanal.id===canal.id?600:400,color:activeCanal.id===canal.id?'#111':'#999',borderBottom:activeCanal.id===canal.id?'2px solid #111':'2px solid transparent',whiteSpace:'nowrap',position:'relative' }}>
              # {canal.name}
              {canal.unread>0 && <span style={{ marginLeft:5,background:'#111',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:980 }}>{canal.unread}</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
        {renderCanal()}
      </div>
    </div>
  )
}

// ─── Liste des espaces ────────────────────────────────────────

function SpaceList({ espaces, onSelect }) {
  return (
    <div style={{ flex:1,overflowY:'auto' }}>
      {['Classe','Matière','Groupe d\'étude','Club'].map(type => {
        const list = espaces.filter(e => e.type===type)
        if (!list.length) return null
        return (
          <div key={type}>
            <div style={{ padding:'14px 16px 6px',fontSize:11,fontWeight:600,color:'#bbb',textTransform:'uppercase',letterSpacing:'0.6px' }}>{type}s</div>
            {list.map(space => {
              const totalUnread = space.canaux.reduce((s,c)=>s+c.unread,0)
              return (
                <div key={space.id} onClick={() => onSelect(space)}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer',borderBottom:'1px solid #f5f5f5' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f9f9f9'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <GroupAvatar space={space}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3 }}>
                      <span style={{ fontSize:14,fontWeight:600,color:'#111' }}>{space.name}</span>
                      {totalUnread>0 && <div style={{ background:'#111',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:980 }}>{totalUnread}</div>}
                    </div>
                    <div style={{ fontSize:12,color:'#999' }}>{space.members} membres · {space.canaux.length} canaux</div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function Espaces() {
  const [selected, setSelected] = useState(null)
  return (
    <div style={{ fontFamily:ft,height:'100%',display:'flex',flexDirection:'column',background:'inherit' }}>
      {selected ? (
        <SpaceView space={selected} onBack={() => setSelected(null)}/>
      ) : (
        <>
          <div style={{ padding:'16px 16px 12px',borderBottom:'1px solid #f0f0f0',flexShrink:0 }}>
            <h2 style={{ fontSize:22,fontWeight:700,color:'#111',letterSpacing:'-0.4px',margin:0 }}>Espaces</h2>
            <p style={{ fontSize:12,color:'#999',marginTop:3 }}>Classes, matières, groupes d'étude, clubs</p>
          </div>
          <SpaceList espaces={ESPACES} onSelect={setSelected}/>
        </>
      )}
    </div>
  )
}