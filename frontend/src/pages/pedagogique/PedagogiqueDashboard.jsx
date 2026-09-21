import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import AvatarUser from '../../components/shared/AvatarUser'
import { Home, Calendar, Settings, LogOut, Users, BookOpen, ClipboardList, FileText, CheckSquare, CalendarDays, ChevronDown, ChevronRight } from 'lucide-react'
import CalendrierEnseignant from './CalendrierEnseignant'
import PlanningWidget from './PlanningWidget'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"
const TYPES_EVAL = ['DS','TP','Devoir','Interrogation','Examen','CCF']
const NAV = [
  { id:'calendrier', label:'Emploi du temps', icon:CalendarDays },
  { id:'accueil',  label:'Accueil',         icon:Home },
  { id:'notes',    label:'Saisie notes',    icon:ClipboardList },
  { id:'carnet',   label:'Carnet de notes', icon:ClipboardList },
  { id:'absences', label:'Absences',        icon:Users },
  { id:'devoirs',  label:'Devoirs',         icon:BookOpen },
  { id:'lecons',   label:'Cahier de texte', icon:FileText },
  { id:'appel',    label:"Faire l'appel",   icon:CheckSquare },
  { id:'params',   label:'Paramètres',      icon:Settings },
]
function Card({ children, C, style={} }) { return <div style={{ background:C.surface, borderRadius:16, padding:18, ...style }}>{children}</div> }
function ST({ children, C }) { return <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:12 }}>{children}</div> }
function Inp({ label, ...p }) { return <div>{label&&<label style={{ fontSize:11,color:'#999',display:'block',marginBottom:4 }}>{label}</label>}<input {...p} style={{ width:'100%',padding:'9px 12px',background:'rgba(128,128,128,0.1)',border:'none',borderRadius:10,fontSize:13,outline:'none',fontFamily:ft,boxSizing:'border-box',...p.style }}/></div> }
function Sel({ label, children, ...p }) { return <div>{label&&<label style={{ fontSize:11,color:'#999',display:'block',marginBottom:4 }}>{label}</label>}<select {...p} style={{ width:'100%',padding:'9px 12px',background:'rgba(128,128,128,0.1)',border:'none',borderRadius:10,fontSize:13,outline:'none',fontFamily:ft,...p.style }}>{children}</select></div> }
function Msg({ msg }) { if(!msg)return null; return <div style={{ padding:'8px 12px',borderRadius:8,background:msg.ok?'rgba(52,199,89,0.1)':'rgba(255,59,48,0.1)',color:msg.ok?'#34C759':'#FF3B30',fontSize:12,marginTop:8 }}>{msg.text}</div> }
function Btn({ onClick, saving, disabled, label='Enregistrer', C }) {
  return <button onClick={onClick} disabled={saving||disabled} style={{ width:'100%',marginTop:14,padding:12,borderRadius:10,border:'none',background:C.text,color:C.bg,fontSize:13,fontWeight:600,cursor:saving||disabled?'default':'pointer',fontFamily:ft,opacity:saving||disabled?0.5:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>{saving&&<span style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.7s linear infinite',display:'inline-block' }}/>}{saving?'Enregistrement...':label}</button>
}

function AccueilSection({ cours, notes, devoirs, C, user, onNav }) {
  const today = new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Salutation */}
      <div>
        <div style={{fontSize:22,fontWeight:400,letterSpacing:'-0.8px',color:C.text,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>Bonjour, {user?.firstName??'toi'}</div>

        <div style={{fontSize:14,color:C.muted,marginTop:6,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>
          Vous avez <span style={{color:'#a29bfe',fontWeight:600}}>{cours.length} cours</span>, <span style={{color:'#a29bfe',fontWeight:600}}>{notes.length} notes</span> et <span style={{color:'#a29bfe',fontWeight:600}}>{devoirs.length} devoirs</span>
        </div>
      </div>

      {/* Planning */}
      <PlanningWidget C={C} onNav={onNav}/>



      {/* Actions rapides */}
      <div style={{background:C.surface,borderRadius:16,padding:'14px 16px',border:`1px solid ${C.surface2}`}}>
        <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>Actions rapides</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[
            {label:'Saisir des notes',nav:'notes',icon:'✏️'},
            {label:'Saisir absences',nav:'absences',icon:'👤'},
            {label:'Créer un devoir',nav:'devoirs',icon:'📝'},
            {label:"Voir l'EDT",nav:'calendrier',icon:'📅'},
          ].map(a=>(
            <button key={a.nav} onClick={()=>onNav(a.nav)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:12,background:C.bg,border:`1px solid ${C.surface2}`,cursor:'pointer',fontSize:12,fontWeight:500,color:C.text,textAlign:'left'}}>
              <span>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </div>


    </div>
  )
}

function NotesSection({ C, user }) {
  const [vue, setVue] = useState('sessions') // sessions | nouvelle | saisie
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [matieres, setMatieres] = useState([])
  const [eleves, setEleves] = useState([])
  const [sessionActive, setSessionActive] = useState(null)
  const [notesSession, setNotesSession] = useState({}) // {eleveId: {valeur, commentaire}}
  const [form, setForm] = useState({classeId:'',matiereId:'',typeEvaluation:'',noteSur:'20',dateSession:new Date().toISOString().split('T')[0]})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [detailSession, setDetailSession] = useState(null)
  const [detailNotes, setDetailNotes] = useState([])
  const ft2 = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
  const NOTE_C = v => v>=10?'#1d1d1f':'#FF3B30'
  const STATUT_C = {en_cours:'#FF9500',soumise:'#a29bfe',cloturee:'#8e8e93'}
  const STATUT_L = {en_cours:'En cours',soumise:'Soumise',cloturee:'Clôturée'}

  useEffect(()=>{
    api.get('/api/sessions-notes').then(r=>setSessions(r.data)).catch(()=>{})
    api.get('/api/classes').then(r=>setClasses(r.data)).catch(()=>{})
    api.get('/api/matieres').then(r=>setMatieres(r.data)).catch(()=>{})
  },[])

  useEffect(()=>{
    if(!form.classeId)return
    api.get('/api/classes/'+form.classeId+'/eleves').then(r=>setEleves(r.data)).catch(()=>{})
  },[form.classeId])

  const ouvrirDetail = async (s) => {
    setDetailSession(s)
    const r = await api.get('/api/sessions-notes/'+s.id+'/notes')
    setDetailNotes(r.data)
  }

  const creerSession = async () => {
    if(!form.classeId||!form.matiereId)return
    setSaving(true)
    try {
      const r = await api.post('/api/sessions-notes', {
        classeId: parseInt(form.classeId),
        matiereId: parseInt(form.matiereId),
        typeEvaluation: form.typeEvaluation||null,
        noteSur: parseInt(form.noteSur),
        dateSession: form.dateSession
      })
      setSessionActive(r.data)
      // Initialiser les notes à vide pour chaque élève
      const ns = {}
      eleves.forEach(e=>ns[e.id]={valeur:'',commentaire:''})
      setNotesSession(ns)
      setVue('saisie')
      api.get('/api/sessions-notes').then(r=>setSessions(r.data))
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  const ouvrirSession = async (session) => {
    setSessionActive(session)
    const r = await api.get('/api/classes/'+session.classe?.id+'/eleves')
    setEleves(r.data)
    const notesR = await api.get('/api/sessions-notes/'+session.id+'/notes')
    const ns = {}
    r.data.forEach(e=>{
      const noteExist = notesR.data.find(n=>n.eleve?.id===e.id)
      ns[e.id] = {valeur: noteExist?.valeur||'', commentaire: noteExist?.commentaire||'', noteId: noteExist?.id}
    })
    setNotesSession(ns)
    setVue('saisie')
  }

  const enregistrerNote = async (eleveId) => {
    const n = notesSession[eleveId]
    if(!n?.valeur)return
    try {
      await api.post('/api/notes', {
        eleveId: parseInt(eleveId),
        matiereId: sessionActive.matiere?.id,
        valeur: parseFloat(n.valeur),
        noteSur: sessionActive.noteSur,
        typeEvaluation: sessionActive.typeEvaluation,
        commentaire: n.commentaire||null,
        sessionId: sessionActive.id
      })
      setNotesSession(prev=>({...prev,[eleveId]:{...prev[eleveId],saved:true}}))
    } catch(e) { console.error(e) }
  }

  const soumettreSession = async () => {
    if(!sessionActive)return
    try {
      await api.patch('/api/sessions-notes/'+sessionActive.id+'/soumettre')
      setMsg({ok:true,text:'Session soumise'})
      api.get('/api/sessions-notes').then(r=>setSessions(r.data))
      setTimeout(()=>{setVue('sessions');setMsg(null)},2000)
    } catch(e) { console.error(e) }
  }

  const selStyle = {width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${C.surface2}`,background:C.surface,fontSize:14,outline:'none',fontFamily:ft2,color:C.text,appearance:'none',cursor:'pointer'}
  const inpStyle = {width:'100%',padding:'10px 12px',borderRadius:12,border:`1px solid ${C.surface2}`,background:C.surface,fontSize:14,outline:'none',fontFamily:ft2,color:C.text,boxSizing:'border-box'}

  // Modal détail session
  if (detailSession) return (
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:ft2}}>
      <div>
        <button onClick={()=>{setDetailSession(null);setDetailNotes([])}} style={{background:'none',border:'none',cursor:'pointer',color:C.text,fontSize:13,paddingLeft:0,marginBottom:8}}>← Retour</button>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:18,fontWeight:400,letterSpacing:'-0.5px',color:C.text}}>{detailSession.matiere?.nom} · {detailSession.classe?.name}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{detailSession.typeEvaluation||'Sans type'} · /{detailSession.noteSur} · {detailSession.dateSession} · {detailNotes.length} note(s)</div>
          </div>
          <div style={{padding:'4px 12px',borderRadius:999,background:STATUT_C[detailSession.statut]+'18',color:STATUT_C[detailSession.statut],fontSize:12,fontWeight:600}}>
            {STATUT_L[detailSession.statut]}
          </div>
        </div>
      </div>
      <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px 60px 1fr',padding:'10px 16px',borderBottom:`1px solid ${C.surface2}`,background:C.surface2}}>
          {['Élève','Note','Type','Commentaire'].map(h=>(
            <div key={h} style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.4px'}}>{h}</div>
          ))}
        </div>
        {detailNotes.length===0&&<div style={{padding:24,textAlign:'center',color:C.muted,fontSize:13}}>Aucune note saisie</div>}
        {detailNotes.map((n,i)=>{
          const pct = (n.valeur/n.noteSur)*20
          const nc = pct>=10?'#1d1d1f':'#FF3B30'
          return (
            <div key={n.id} style={{display:'grid',gridTemplateColumns:'1fr 80px 60px 1fr',padding:'12px 16px',borderBottom:i<detailNotes.length-1?`1px solid ${C.surface2}`:'none',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <AvatarUser genre={n.eleve?.genre} isActive={true} size={32}/>
                <div style={{fontSize:13,fontWeight:500,color:C.text}}>{n.eleve?.firstName} {n.eleve?.lastName}</div>
              </div>
              <div style={{fontSize:14,fontWeight:500,color:nc,fontFamily:ft2}}>{n.valeur}/{n.noteSur}</div>
              <div style={{fontSize:12,color:C.muted}}>{n.typeEvaluation||'—'}</div>
              <div style={{fontSize:12,color:C.muted}}>{n.commentaire||'—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )


  // Vue liste sessions
  if (vue==='sessions') return (
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:ft2}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>

        <button onClick={()=>setVue('nouvelle')} style={{padding:'8px 16px',borderRadius:12,background:'#1d1d1f',color:'#fff',border:'none',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:ft2}}>
          + Nouvelle session
        </button>
      </div>
      {msg&&<div style={{fontSize:13,color:msg.ok?'#34C759':'#FF3B30',fontWeight:500}}>{msg.text}</div>}
      {sessions.length===0 && (
        <div style={{textAlign:'center',color:C.muted,padding:40,fontSize:13}}>Aucune session. Créez votre première session de notes.</div>
      )}
      {sessions.length>0 && (
        <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
          {/* Header tableau */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 60px 90px 40px',gap:0,padding:'10px 16px',borderBottom:`1px solid ${C.surface2}`,background:C.surface2}}>
            {['Matière','Classe','Type','Sur','Statut',''].map(h=>(
              <div key={h} style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.4px'}}>{h}</div>
            ))}
          </div>
          {sessions.map((s,i)=>(
            <div key={s.id} onClick={()=>s.statut==='soumise'?ouvrirDetail(s):ouvrirSession(s)}
              style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 60px 90px 40px',gap:0,padding:'12px 16px',borderBottom:i<sessions.length-1?`1px solid ${C.surface2}`:'none',cursor:'pointer',alignItems:'center'}}
              onMouseEnter={e=>{if(s.statut!=='soumise')e.currentTarget.style.background=C.surface2}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.bg}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:C.text}}>{s.matiere?.nom}</div>
                <div style={{fontSize:11,color:C.muted}}>{s.dateSession}</div>
              </div>
              <div style={{fontSize:13,color:C.text}}>{s.classe?.name}</div>
              <div style={{fontSize:12,color:C.muted}}>{s.typeEvaluation||'—'}</div>
              <div style={{fontSize:12,color:C.muted}}>/{s.noteSur}</div>
              <div style={{padding:'3px 8px',borderRadius:999,background:STATUT_C[s.statut]+'18',color:STATUT_C[s.statut],fontSize:11,fontWeight:600,display:'inline-flex',width:'fit-content'}}>
                {STATUT_L[s.statut]}
              </div>
              <div>{s.statut!=='soumise'&&<ChevronRight size={14} color='#8e8e93'/>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )


  // Vue nouvelle session
  if (vue==='nouvelle') return (
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:ft2}}>
      <div>
        <button onClick={()=>setVue('sessions')} style={{background:'none',border:'none',cursor:'pointer',color:C.text,fontSize:13,paddingLeft:0,marginBottom:8}}>← Retour</button>
        <div style={{fontSize:18,fontWeight:400,letterSpacing:'-0.5px',color:C.text}}>Nouvelle session</div>
      </div>
      <div style={{background:C.surface,borderRadius:20,padding:18,border:`1px solid ${C.surface2}`}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.4px'}}>Classe *</div>
            <select value={form.classeId} onChange={e=>setForm(f=>({...f,classeId:e.target.value}))} style={selStyle}>
              <option value="">Choisir</option>
              {classes.map(cl=><option key={cl.id} value={cl.id}>{cl.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.4px'}}>Matière *</div>
            <select value={form.matiereId} onChange={e=>setForm(f=>({...f,matiereId:e.target.value}))} style={selStyle}>
              <option value="">Choisir</option>
              {matieres.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.4px'}}>Type</div>
            <select value={form.typeEvaluation} onChange={e=>setForm(f=>({...f,typeEvaluation:e.target.value}))} style={selStyle}>
              <option value="">Sans type</option>
              {TYPES_EVAL.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.4px'}}>Sur</div>
            <select value={form.noteSur} onChange={e=>setForm(f=>({...f,noteSur:e.target.value}))} style={selStyle}>
              {[10,20].map(n=><option key={n} value={n}>/{n}</option>)}
            </select>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.4px'}}>Date</div>
            <input type="date" value={form.dateSession} onChange={e=>setForm(f=>({...f,dateSession:e.target.value}))} style={inpStyle}/>
          </div>
        </div>
        {eleves.length>0&&<div style={{fontSize:13,color:C.muted,marginBottom:12}}>{eleves.length} élèves dans cette classe</div>}
        <button onClick={creerSession} disabled={saving||!form.classeId||!form.matiereId}
          style={{width:'100%',padding:13,borderRadius:14,background:'#1d1d1f',color:'#fff',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:ft2,opacity:saving||!form.classeId||!form.matiereId?0.4:1}}>
          {saving?'Création...':'Ouvrir la session de saisie'}
        </button>
      </div>
    </div>
  )

  // Vue saisie notes
  if (vue==='saisie') return (
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:ft2}}>
      <div>
        <button onClick={()=>setVue('sessions')} style={{background:'none',border:'none',cursor:'pointer',color:C.text,fontSize:13,paddingLeft:0,marginBottom:8}}>← Sessions</button>
        <div style={{fontSize:18,fontWeight:400,letterSpacing:'-0.5px',color:C.text}}>{sessionActive?.matiere?.nom} · {sessionActive?.classe?.name}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:2}}>{sessionActive?.typeEvaluation||'Sans type'} · /{sessionActive?.noteSur} · {sessionActive?.dateSession}</div>
      </div>
      {msg&&<div style={{fontSize:13,color:msg.ok?'#34C759':'#FF3B30',fontWeight:500}}>{msg.text}</div>}
      <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
        {eleves.map((e,i)=>{
          const n = notesSession[e.id]||{}
          const saved = n.saved
          return (
            <div key={e.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<eleves.length-1?'1px solid #f5f5f7':'none'}}>
              <AvatarUser genre={e.genre} isActive={true} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:C.text}}>{e.firstName} {e.lastName}</div>
              </div>
              <input type="number" min="0" max={sessionActive?.noteSur} step="0.5"
                value={n.valeur||''} onChange={ev=>setNotesSession(prev=>({...prev,[e.id]:{...prev[e.id],valeur:ev.target.value,saved:false}}))}
                placeholder="—"
                style={{width:60,padding:'6px 8px',borderRadius:8,border:`1px solid ${C.surface2}`,fontSize:14,fontWeight:500,textAlign:'center',outline:'none',fontFamily:ft2,color:n.valeur?(parseFloat(n.valeur)>=10?'#1d1d1f':'#FF3B30'):'#8e8e93'}}/>
              <button onClick={()=>enregistrerNote(e.id)} disabled={!n.valeur||saved}
                style={{padding:'6px 12px',borderRadius:8,background:'transparent',color:saved?'#34C759':'#1d1d1f',border:saved?'none':'1px solid #e5e5ea',fontSize:12,fontWeight:500,cursor:'pointer',opacity:!n.valeur?0.3:1}}>
                {saved?'✓ Sauvegardé':'Sauvegarder'}
              </button>
            </div>
          )
        })}
      </div>
      <button onClick={soumettreSession}
        style={{padding:13,borderRadius:14,background:'#a29bfe',color:'#fff',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:ft2}}>
        Soumettre à l'administrateur
      </button>
    </div>
  )

  return null
}


function CarnetNotesSection({ C, user }) {
  const [notes, setNotes] = useState([])
  const [filtreMatiere, setFiltreMatiere] = useState('')
  const [filtreType, setFiltreType] = useState('')

  const [collapsed, setCollapsed] = useState({})
  const [filtreOpen, setFiltreOpen] = useState({mat:true,type:true})
  const MAT_COLORS = {
    'Mathématiques':'#4F7CFF','Physique-Chimie':'#E85D5D','Français':'#8B5CF6',
    'Anglais':'#14B8A6','Histoire-Géographie':'#F59E0B'
  }
  const TYPE_COLORS = {
    'DS':'#4F7CFF','TP':'#8B5CF6','Devoir':'#14B8A6','Interrogation':'#F97316','Examen':'#E85D5D','CCF':'#16A34A'
  }
  const NOTE_COLOR = (v,s) => { const p=(v/s)*20; return p>=10?'#1d1d1f':'#FF3B30' }
  const AVATAR_COLORS = ['#4F7CFF','#E85D5D','#8B5CF6','#14B8A6','#F59E0B','#F97316']

  useEffect(()=>{ api.get('/api/notes').then(r=>{
    const mes = user?.id ? r.data.filter(n=>n.professeur?.id===user.id) : r.data
    setNotes(mes)
  }).catch(()=>{}) },[user?.id])

  const matieres = [...new Set(notes.map(n=>n.matiere?.nom).filter(Boolean))]
  const types = [...new Set(notes.map(n=>n.typeEvaluation||n.type).filter(Boolean))]

  const filtered = notes
    .filter(n=>!filtreMatiere||n.matiere?.nom===filtreMatiere)
    .filter(n=>!filtreType||(n.typeEvaluation||n.type)===filtreType)

  const byMatiere = matieres.filter(m=>!filtreMatiere||m===filtreMatiere).map(m=>({
    nom:m,
    notes:filtered.filter(n=>n.matiere?.nom===m),
    color:MAT_COLORS[m]||'#8e8e93'
  })).filter(g=>g.notes.length>0)

  const avg = ns => ns.length ? Math.round(ns.reduce((a,n)=>a+(n.valeur/n.noteSur)*20,0)/ns.length*10)/10 : 0

  const Chip = ({label, active, color, onClick}) => (
    <button onClick={onClick} style={{
      padding:'5px 12px',borderRadius:999,fontSize:12,fontWeight:500,cursor:'pointer',
      background:active?(color||'#1d1d1f'):'#fff',
      color:active?'#fff':'#6e6e73',
      border:active?'none':'1.5px solid #e5e5ea',
      transition:'all 0.15s'
    }}>{label}</button>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:ft}}>
      {/* Filtres */}
      <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,padding:'14px 16px'}}>
        <div style={{marginBottom:10}}>
          <div onClick={()=>setFiltreOpen(p=>({...p,mat:!p.mat}))} style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.5px'}}>Matière</div>
            {filtreOpen.mat?<ChevronDown size={13} color='#6e6e73'/>:<ChevronRight size={13} color='#6e6e73'/>}
          </div>
          {filtreOpen.mat&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <Chip label="Toutes" active={!filtreMatiere} color="#1d1d1f" onClick={()=>setFiltreMatiere('')}/>
            {matieres.map(m=><Chip key={m} label={m} active={filtreMatiere===m} color={MAT_COLORS[m]} onClick={()=>setFiltreMatiere(filtreMatiere===m?'':m)}/>)}
          </div>}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div>
            <div onClick={()=>setFiltreOpen(p=>({...p,type:!p.type}))} style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',marginBottom:8,marginTop:10}}>
              <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:'0.5px'}}>Type</div>
              {filtreOpen.type?<ChevronDown size={13} color='#6e6e73'/>:<ChevronRight size={13} color='#6e6e73'/>}
            </div>
            {filtreOpen.type&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <Chip label="Tous" active={!filtreType} color="#1d1d1f" onClick={()=>setFiltreType('')}/>
              {types.map(t=><Chip key={t} label={t} active={filtreType===t} color={TYPE_COLORS[t]} onClick={()=>setFiltreType(filtreType===t?'':t)}/>)}
            </div>}
          </div>
          <button onClick={()=>{setFiltreMatiere('');setFiltreType('')}}
            style={{display:'flex',alignItems:'center',gap:4,padding:'6px 14px',borderRadius:10,border:'none',background:'transparent',color:'#a29bfe',fontSize:12,cursor:'pointer',fontWeight:600}}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Cards matières */}
      {byMatiere.map(groupe=>{
        const moyenne = avg(groupe.notes)
        const avgColor = NOTE_COLOR(moyenne,20)
        return (
          <div key={groupe.nom} style={{background:C.surface,borderRadius:22,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
            {/* En-tête */}
            <div onClick={()=>setCollapsed(p=>({...p,[groupe.nom]:!p[groupe.nom]}))} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:groupe.color,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{groupe.nom}</div>
                  <div style={{fontSize:11,color:C.muted}}>{groupe.notes.length} note(s)</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{padding:'4px 14px',borderRadius:999,background:groupe.color,color:'#fff',fontSize:13,fontWeight:700,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>
                  {moyenne}/20
                </div>
                <div style={{color:C.muted}}>{collapsed[groupe.nom]?<ChevronRight size={16}/>:<ChevronDown size={16}/>}</div>
              </div>
            </div>
            {!collapsed[groupe.nom]&&<>
            <div style={{height:1,background:C.surface2}}/>
            {groupe.notes.map((n,i)=>{
              const nc = NOTE_COLOR(n.valeur,n.noteSur)
              const initiales = (n.eleve?.firstName?.[0]||'')+(n.eleve?.lastName?.[0]||'')
              const avatarColor = AVATAR_COLORS[(n.eleve?.id||0)%AVATAR_COLORS.length]
              return (
                <div key={n.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<groupe.notes.length-1?`1px solid ${C.surface2}`:'none',background:C.surface}}>
<AvatarUser genre={n.eleve?.genre} isActive={true} size={36}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>{n.eleve?.firstName} {n.eleve?.lastName}</div>
                    {n.commentaire&&<div style={{fontSize:11,color:C.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.commentaire}</div>}
                  </div>
                  {(n.typeEvaluation||n.type)&&<div style={{padding:'3px 8px',borderRadius:999,background:'transparent',border:`1px solid ${C.surface2}`,color:C.text,fontSize:11,fontWeight:500,flexShrink:0}}>{n.typeEvaluation||n.type}</div>}
                  <div style={{fontSize:16,fontWeight:400,color:NOTE_COLOR(n.valeur,n.noteSur),flexShrink:0,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",letterSpacing:'-0.3px'}}>{n.valeur}/{n.noteSur}</div>
                </div>
              )
            })}
            </>}
          </div>
        )
      })}
      {byMatiere.length===0&&<div style={{textAlign:'center',color:C.muted,padding:40,fontSize:13}}>Aucune note</div>}
    </div>
  )
}


function AbsencesSection({ C }) {
  const [classes,setClasses]=useState([])
  const [eleves,setEleves]=useState([])
  const [absences,setAbsences]=useState([])
  const [classeId,setClasseId]=useState('')
  const [form,setForm]=useState({eleveId:'',date:'',motif:'',isJustified:false})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState(null)
  useEffect(()=>{ api.get('/api/classes').then(r=>setClasses(r.data)).catch(()=>{}); api.get('/api/absences').then(r=>setAbsences(r.data)).catch(()=>{}) },[])
  useEffect(()=>{ if(!classeId){setEleves([]);return} api.get('/api/classes/'+classeId+'/eleves').then(r=>setEleves(r.data)).catch(()=>{}) },[classeId])
  const save=async()=>{
    if(!form.eleveId||!form.date)return
    setSaving(true)
    try{ await api.post('/api/absences',{eleveId:+form.eleveId,date:form.date,motif:form.motif,isJustified:form.isJustified}); setMsg({ok:true,text:'Absence enregistree'}); setForm({eleveId:'',date:'',motif:'',isJustified:false}); api.get('/api/absences').then(r=>setAbsences(r.data)) }
    catch{ setMsg({ok:false,text:'Erreur.'}) } finally{ setSaving(false) }
  }
  return (
    <div>

      <Card C={C} style={{ marginBottom:16 }}>
        <ST C={C}>Saisir une absence</ST>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div style={{ gridColumn:'1/-1' }}><Sel label="Classe" value={classeId} onChange={e=>setClasseId(e.target.value)}><option value="">Classe</option>{classes.map(cl=><option key={cl.id} value={cl.id}>{cl.name}</option>)}</Sel></div>
          <div style={{ gridColumn:'1/-1' }}><Sel label="Eleve *" value={form.eleveId} onChange={e=>setForm(f=>({...f,eleveId:e.target.value}))}><option value="">Eleve</option>{eleves.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</Sel></div>
          <Inp label="Date *" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          <Inp label="Motif" value={form.motif} onChange={e=>setForm(f=>({...f,motif:e.target.value}))} placeholder="Motif"/>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}><input type="checkbox" checked={form.isJustified} onChange={e=>setForm(f=>({...f,isJustified:e.target.checked}))}/><span style={{ fontSize:13,color:C.text }}>Justifiee</span></div>
        </div>
        <Msg msg={msg}/><Btn onClick={save} saving={saving} disabled={!form.eleveId||!form.date} C={C}/>
      </Card>
      <Card C={C}><ST C={C}>Recentes</ST>
        {absences.slice(0,6).map((a,i)=>(
          <div key={a.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<5?`1px solid ${C.surface2}`:'none' }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:a.isJustified?'#FF9500':'#FF3B30',flexShrink:0 }}/>
            <div style={{ flex:1 }}><div style={{ fontSize:12,color:C.text }}>{a.eleve?.firstName} {a.eleve?.lastName}</div><div style={{ fontSize:11,color:C.muted }}>{a.date}</div></div>
            <span style={{ fontSize:11,padding:'2px 8px',borderRadius:980,background:a.isJustified?'rgba(255,149,0,0.1)':'rgba(255,59,48,0.1)',color:a.isJustified?'#FF9500':'#FF3B30' }}>{a.isJustified?'Justifiee':'Non'}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

function DevoirsSection({ C }) {
  const [devoirs,setDevoirs]=useState([])
  const [matieres,setMatieres]=useState([])
  const [form,setForm]=useState({titre:'',description:'',dateRendu:'',matiereId:'',urgent:false})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState(null)
  useEffect(()=>{ api.get('/api/devoirs').then(r=>setDevoirs(r.data)).catch(()=>{}); api.get('/api/matieres').then(r=>setMatieres(r.data)).catch(()=>{}) },[])
  const save=async()=>{
    if(!form.titre||!form.dateRendu)return
    setSaving(true)
    try{ await api.post('/api/devoirs',{titre:form.titre,description:form.description,dateRendu:form.dateRendu,matiereId:+form.matiereId||null,urgent:form.urgent}); setMsg({ok:true,text:'Devoir cree'}); setForm({titre:'',description:'',dateRendu:'',matiereId:'',urgent:false}); api.get('/api/devoirs').then(r=>setDevoirs(r.data)) }
    catch{ setMsg({ok:false,text:'Erreur.'}) } finally{ setSaving(false) }
  }
  return (
    <div>

      <Card C={C} style={{ marginBottom:16 }}>
        <ST C={C}>Nouveau devoir</ST>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div style={{ gridColumn:'1/-1' }}><Inp label="Titre *" value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="Titre"/></div>
          <Sel label="Matiere" value={form.matiereId} onChange={e=>setForm(f=>({...f,matiereId:e.target.value}))}><option value="">Matiere</option>{matieres.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</Sel>
          <Inp label="Date rendu *" type="date" value={form.dateRendu} onChange={e=>setForm(f=>({...f,dateRendu:e.target.value}))}/>
          <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:11,color:'#999',display:'block',marginBottom:4 }}>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ width:'100%',padding:'9px 12px',background:'rgba(128,128,128,0.1)',border:'none',borderRadius:10,fontSize:13,outline:'none',fontFamily:ft,resize:'none',height:70,boxSizing:'border-box' }}/></div>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}><input type="checkbox" checked={form.urgent} onChange={e=>setForm(f=>({...f,urgent:e.target.checked}))}/><span style={{ fontSize:13,color:C.text }}>Urgent</span></div>
        </div>
        <Msg msg={msg}/><Btn onClick={save} saving={saving} disabled={!form.titre||!form.dateRendu} C={C}/>
      </Card>
      <Card C={C}><ST C={C}>A venir</ST>
        {devoirs.map((d,i)=>(
          <div key={d.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:i<devoirs.length-1?`1px solid ${C.surface2}`:'none' }}>
            <div style={{ flex:1 }}><span style={{ fontSize:13,color:C.text }}>{d.titre}</span>{d.urgent&&<span style={{ fontSize:10,padding:'1px 7px',borderRadius:980,background:'rgba(255,59,48,0.1)',color:'#FF3B30',marginLeft:6 }}>URGENT</span>}<div style={{ fontSize:11,color:C.muted }}>{d.matiere?.nom} · {d.dateRendu}</div></div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function LeconsSection({ C }) {
  const [lecons,setLecons]=useState([])
  const [matieres,setMatieres]=useState([])
  const [form,setForm]=useState({titre:'',contenu:'',objectifs:'',date:'',classe:'',matiereId:''})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState(null)
  const [view,setView]=useState('list')
  useEffect(()=>{ api.get('/api/lecons').then(r=>setLecons(r.data)).catch(()=>{}); api.get('/api/matieres').then(r=>setMatieres(r.data)).catch(()=>{}) },[])
  const save=async()=>{
    if(!form.titre||!form.date)return
    setSaving(true)
    try{ await api.post('/api/lecons',form); setMsg({ok:true,text:'Lecon creee'}); setForm({titre:'',contenu:'',objectifs:'',date:'',classe:'',matiereId:''}); api.get('/api/lecons').then(r=>setLecons(r.data)); setView('list') }
    catch{ setMsg({ok:false,text:'Erreur.'}) } finally{ setSaving(false) }
  }
  const del=async(id)=>{ await api.delete('/api/lecons/'+id); setLecons(l=>l.filter(x=>x.id!==id)) }
  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:600,color:C.text }}>Cahier de texte</h2>
        <button onClick={()=>setView(v=>v==='form'?'list':'form')} style={{ padding:'8px 16px',borderRadius:10,border:'none',background:C.text,color:C.bg,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:ft }}>{view==='form'?'Retour':'+ Nouvelle'}</button>
      </div>
      {view==='form'?(
        <Card C={C}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <div style={{ gridColumn:'1/-1' }}><Inp label="Titre *" value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="Titre"/></div>
            <Sel label="Matiere" value={form.matiereId} onChange={e=>setForm(f=>({...f,matiereId:e.target.value}))}><option value="">Matiere</option>{matieres.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</Sel>
            <Inp label="Classe" value={form.classe} onChange={e=>setForm(f=>({...f,classe:e.target.value}))} placeholder="1ASSP1"/>
            <div style={{ gridColumn:'1/-1' }}><Inp label="Date *" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:11,color:'#999',display:'block',marginBottom:4 }}>Contenu</label><textarea value={form.contenu} onChange={e=>setForm(f=>({...f,contenu:e.target.value}))} style={{ width:'100%',padding:'9px 12px',background:'rgba(128,128,128,0.1)',border:'none',borderRadius:10,fontSize:13,color:C.text,outline:'none',fontFamily:ft,resize:'vertical',height:80,boxSizing:'border-box' }}/></div>
            <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:11,color:'#999',display:'block',marginBottom:4 }}>Objectifs</label><textarea value={form.objectifs} onChange={e=>setForm(f=>({...f,objectifs:e.target.value}))} style={{ width:'100%',padding:'9px 12px',background:'rgba(128,128,128,0.1)',border:'none',borderRadius:10,fontSize:13,color:C.text,outline:'none',fontFamily:ft,resize:'vertical',height:60,boxSizing:'border-box' }}/></div>
          </div>
          <Msg msg={msg}/><Btn onClick={save} saving={saving} disabled={!form.titre||!form.date} label="Enregistrer" C={C}/>
        </Card>
      ):(
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {lecons.length===0?<Card C={C}><div style={{ textAlign:'center',padding:'24px 0',color:C.hint }}>Aucune lecon</div></Card>
          :lecons.map(l=>(
            <Card C={C} key={l.id}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8 }}>
                <div><div style={{ fontSize:14,fontWeight:600,color:C.text }}>{l.titre}</div><div style={{ fontSize:11,color:C.muted }}>{l.date} {l.classe&&`· ${l.classe}`}</div></div>
                <button onClick={()=>del(l.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#FF3B30',fontSize:20 }}>x</button>
              </div>
              {l.objectifs&&<div style={{ background:C.surface2,borderRadius:8,padding:'8px 12px',fontSize:12,color:C.muted }}>{l.objectifs}</div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AppelSection({ C }) {
  const [classes,setClasses]=useState([])
  const [eleves,setEleves]=useState([])
  const [classeId,setClasseId]=useState('')
  const [statuts,setStatuts]=useState({})
  const [appel,setAppel]=useState(null)
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState(null)
  const [sigActive,setSigActive]=useState(true)
  const [presences,setPresences]=useState([])
  const [detail,setDetail]=useState(null)
  const bg='#fff', border='#e5e5ea', text='#1d1d1f', muted='#8e8e93'
  const RED='#FF3B30', GREEN='#34C759', ORANGE='#FF9500'
  const COL={present:GREEN,absent:RED,retard:ORANGE,signed:GREEN,waiting:ORANGE}
  const LBL={present:'Présent',absent:'Absent',retard:'Retard',signed:'Signé',waiting:'En attente'}

  useEffect(()=>{
    api.get('/api/classes').then(r=>setClasses(r.data)).catch(()=>{})
    api.get('/api/etablissement/parametres').then(r=>setSigActive(r.data.signatureNumeriqueActive)).catch(()=>{})
    const saved=sessionStorage.getItem('appelActif')
    if(saved){try{const d=JSON.parse(saved);setAppel(d);if(d.classeId){setClasseId(String(d.classeId));api.get('/api/classes/'+d.classeId+'/eleves').then(r=>setEleves(r.data)).catch(()=>{})}}catch(e){}}
  },[])

  useEffect(()=>{ if(!classeId){setEleves([]);setStatuts({});return} api.get('/api/classes/'+classeId+'/eleves').then(r=>{setEleves(r.data);const s={};r.data.forEach(e=>s[e.id]='present');setStatuts(s)}).catch(()=>{}) },[classeId])

  useEffect(()=>{
    if(!appel)return
    const iv=setInterval(()=>{
      api.get('/api/appels/'+appel.id).then(r=>{
        const pl=r.data.presences??[]
        const ns={}
        pl.forEach(p=>{ns[p.eleve.id]=p.signed?'signed':(p.statut==='absent'?'absent':'waiting')})
        setPresences(pl)
        setStatuts(s=>({...s,...ns}))
      }).catch(()=>{})
    },3000)
    return()=>clearInterval(iv)
  },[appel])

  const toggle=id=>{if(appel)return;setStatuts(s=>{const cur=s[id]||'present';return{...s,[id]:cur==='present'?'absent':cur==='absent'?'retard':'present'}})}

  const lancer=async()=>{
    if(!classeId||!eleves.length)return
    setSaving(true)
    try{
      const absentsIds=eleves.filter(e=>statuts[e.id]==='absent').map(e=>e.id)
      const r=await api.post('/api/appels',{coursId:null,eleveIds:eleves.map(e=>e.id),absentsIds})
      const ad={...r.data,classeId}
      sessionStorage.setItem('appelActif',JSON.stringify(ad))
      setAppel(r.data)
      api.get('/api/appels/'+r.data.id).then(res=>setPresences(res.data.presences||[])).catch(()=>{})
      setMsg({ok:true,text:sigActive?'Appel lancé ! Code : '+r.data.codeSignature:'Appel lancé !'})
    }catch{setMsg({ok:false,text:'Erreur lors du lancement.'})}
    finally{setSaving(false)}
  }

  const terminer=async()=>{
    if(!appel)return
    const r=await api.patch('/api/appels/'+appel.id+'/terminer')
    setMsg({ok:true,text:'Appel terminé. '+r.data.absencesCreees+' absence(s) créée(s).'})
    sessionStorage.removeItem('appelActif')
    setAppel(null)
    const s={};eleves.forEach(e=>s[e.id]='present');setStatuts(s)
  }

  const nbPresents = eleves.filter(e=>['present','signed'].includes(statuts[e.id]||'present')).length
  const nbAbsents = eleves.filter(e=>statuts[e.id]==='absent').length
  const nbRetards = eleves.filter(e=>statuts[e.id]==='retard').length

  return (
    <div style={{fontFamily:ft,display:'flex',flexDirection:'column',gap:16,maxWidth:600}}>

      {/* Message */}
      {msg&&(
        <div style={{fontSize:13,color:'#a29bfe',fontWeight:500,padding:'4px 0'}}>
          {msg.text}
        </div>
      )}

      {/* Code signature */}
      {appel&&sigActive&&(
        <div style={{background:'#1a1a2e',borderRadius:20,padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:8,letterSpacing:'0.5px',textTransform:'uppercase'}}>Code signature</div>
          <div style={{fontSize:56,fontWeight:800,color:'#fff',letterSpacing:12,fontFamily:ft}}>{appel.codeSignature}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:8}}>Les élèves saisissent ce code dans leur app</div>
        </div>
      )}

      {/* Sélection classe */}
      {!appel&&(
        <div style={{background:C.surface,borderRadius:16,padding:'16px',border:`1px solid ${C.surface2}`}}>
          <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>Sélectionner une classe</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {classes.map(cl=>(
              <button key={cl.id} onClick={()=>setClasseId(String(cl.id))}
                style={{padding:'8px 16px',borderRadius:999,fontSize:13,fontWeight:500,cursor:'pointer',border:'none',
                  background:classeId===String(cl.id)?'#a29bfe':C.surface2,
                  color:classeId===String(cl.id)?'#fff':C.text,
                  transition:'all 0.15s'}}>
                {cl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats rapides */}
      {eleves.length>0&&(
        <div style={{background:C.surface,borderRadius:14,padding:'14px 16px',border:`1px solid ${C.surface2}`}}>
          <div style={{fontSize:14,color:C.text,fontFamily:"'Nunito',sans-serif"}}>
            <span style={{fontWeight:700,color:GREEN}}>{nbPresents} présent{nbPresents>1?'s':''}</span>,{' '}
            <span style={{fontWeight:700,color:RED}}>{nbAbsents} absent{nbAbsents>1?'s':''}</span>{nbRetards>0?<> et <span style={{fontWeight:700,color:ORANGE}}>{nbRetards} retard{nbRetards>1?'s':''}</span></>:''} sur {eleves.length} élèves.
          </div>
        </div>
      )}

      {/* Liste élèves */}
      {eleves.length>0&&(
        <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
          {/* En-tête */}
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${C.surface2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:14,fontWeight:600,color:C.text}}>{eleves.length} élèves</div>
            {!appel&&(
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setStatuts(Object.fromEntries(eleves.map(e=>[e.id,'present'])))}
                  style={{fontSize:11,padding:'5px 12px',borderRadius:8,border:`1px solid ${C.surface2}`,
                    background:eleves.every(e=>statuts[e.id]==='present')?'#34C759':C.surface2,
                    color:eleves.every(e=>statuts[e.id]==='present')?'#fff':C.text,
                    cursor:'pointer',fontWeight:500,transition:'all 0.15s'}}>
                  Tous présents
                </button>
                <button onClick={()=>setStatuts(Object.fromEntries(eleves.map(e=>[e.id,'absent'])))}
                  style={{fontSize:11,padding:'5px 12px',borderRadius:8,border:`1px solid ${C.surface2}`,
                    background:eleves.every(e=>statuts[e.id]==='absent')?'#FF3B30':C.surface2,
                    color:eleves.every(e=>statuts[e.id]==='absent')?'#fff':C.text,
                    cursor:'pointer',fontWeight:500,transition:'all 0.15s'}}>
                  Tous absents
                </button>
              </div>
            )}
          </div>
          {/* Élèves */}
          {eleves.map((e,i)=>{
            const s=statuts[e.id]||'present'
            const color=COL[s]||C.muted
            return (
              <div key={e.id} onClick={()=>toggle(e.id)}
                style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<eleves.length-1?`1px solid ${C.surface2}`:'none',cursor:appel?'default':'pointer',transition:'background 0.1s',background:C.surface}}
                onMouseEnter={e2=>{if(!appel)e2.currentTarget.style.background=''}}
                onMouseLeave={e2=>{e2.currentTarget.style.background=C.surface}}>
                {/* Avatar */}
<AvatarUser genre={e.genre} isActive={s==='present'||s==='signed'} size={40}/>
                {/* Nom */}
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.text}}>{e.firstName} {e.lastName}</div>
                  {!appel&&<div style={{fontSize:11,color:C.muted}}>Cliquer pour changer le statut</div>}
                </div>
                {/* Boutons statut style ChatGPT */}
                {!appel && (
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    {['present','absent','retard'].map(st=>(
                      <button key={st} onClick={ev=>{ev.stopPropagation();setStatuts(prev=>({...prev,[e.id]:st}))}}
                        style={{
                          padding:'5px 12px',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer',
                          border:s===st?'none':`1px solid ${C.surface2}`,
                          background:s===st?COL[st]:C.surface2,
                          color:s===st?'#fff':C.text,
                          transition:'all 0.15s'
                        }}>
                        {st==='present'?'Présent':st==='absent'?'Absent':'Retard'}
                      </button>
                    ))}
                  </div>
                )}
                {appel && (
                  <div style={{padding:'4px 12px',borderRadius:999,background:color+'15',color,fontSize:12,fontWeight:600,flexShrink:0}}>
                    {LBL[s]}
                  </div>
                )}
                {/* Bouton détail signature */}
                {appel&&s==='signed'&&(
                  <button onClick={ev=>{ev.stopPropagation();const p=presences.find(x=>String(x.eleve?.id)===String(e.id));setDetail(p||null)}}
                    style={{fontSize:11,padding:'4px 10px',borderRadius:8,border:`1px solid ${C.surface2}`,background:C.surface,color:C.muted,cursor:'pointer'}}>
                    Voir
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Boutons action */}
      {eleves.length>0&&(
        <div style={{display:'flex',gap:10}}>
          {!appel?(
            <button onClick={lancer} disabled={saving||!classeId}
              style={{flex:1,padding:'14px',borderRadius:14,background:'#a29bfe',color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:ft,opacity:saving?0.6:1}}>
              {saving?'Lancement...':'Lancer appel'}
            </button>
          ):(
            <button onClick={terminer}
              style={{flex:1,padding:'14px',borderRadius:14,background:RED,color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:ft}}>
              Terminer l'appel
            </button>
          )}
        </div>
      )}

      {/* Modal détail signature */}
      {detail&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:20}}>
          <div style={{background:C.surface,borderRadius:24,padding:24,maxWidth:360,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Signature de {detail.eleve?.firstName}</div>
            {detail.signatureImage&&<img src={(import.meta.env.VITE_API_URL||'http://127.0.0.1:8000')+detail.signatureImage} style={{width:'100%',borderRadius:12,border:`1px solid ${C.surface2}`}} alt="Signature"/>}
            <button onClick={()=>setDetail(null)} style={{width:'100%',marginTop:16,padding:12,borderRadius:12,background:'#f5f5f7',color:C.text,border:'none',fontSize:14,fontWeight:500,cursor:'pointer'}}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}


function EdtSection({ cours, C }) {
  const J=['Lundi','Mardi','Mercredi','Jeudi','Vendredi']
  const [j,setJ]=useState(Math.min((new Date().getDay()||1)-1,4))
  const pd={}; for(let i=1;i<=5;i++) pd[i]=cours.filter(c=>c.jourSemaine===i).sort((a,b)=>a.heureDebut.localeCompare(b.heureDebut))
  return (
    <div>
      <h2 style={{ fontSize:20,fontWeight:600,color:C.text,marginBottom:20 }}>Emploi du temps</h2>
      <div style={{ display:'flex',gap:6,marginBottom:16,overflowX:'auto' }}>
        {J.map((jj,i)=><button key={jj} onClick={()=>setJ(i)} style={{ padding:'7px 16px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:ft,fontSize:12,fontWeight:j===i?600:400,background:j===i?C.text:C.surface,color:j===i?C.bg:C.muted,flexShrink:0 }}>{jj}</button>)}
      </div>
      <Card C={C}>
        {(pd[j+1]??[]).length===0?<div style={{ color:C.hint,fontSize:13,textAlign:'center',padding:'24px 0' }}>Aucun cours</div>
        :(pd[j+1]??[]).map((c,i,a)=>(
          <div key={c.id} style={{ display:'flex',gap:12,alignItems:'center',padding:'12px 0',borderBottom:i<a.length-1?`1px solid ${C.surface2}`:'none' }}>
            <div style={{ width:3,height:40,borderRadius:2,background:'#007AFF',flexShrink:0 }}/>
            <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600,color:C.text }}>{c.matiere.nom}</div><div style={{ fontSize:11,color:C.muted }}>{c.heureDebut}-{c.heureFin}</div></div>
          </div>
        ))}
      </Card>
    </div>
  )
}

export default function EnseignantDashboard() {
  const {logout,user}=useAuth()
  const navigate=useNavigate()
  const darkMode=useThemeStore(s=>s.darkMode)
  const C=darkMode?DARK_THEME:LIGHT_THEME
  const [active,setActive]=useState('accueil')
  const [isMobile]=useState(window.innerWidth<768)
  const [cours,setCours]=useState([])
  const [devoirs,setDevoirs]=useState([])
  const [notes,setNotes]=useState([])
  useEffect(()=>{
    Promise.all([api.get('/api/cours/edt'),api.get('/api/devoirs'),api.get('/api/notes')])
      .then(([c,d,n])=>{setCours(c.data);setDevoirs(d.data);setNotes(n.data)})
      .catch(console.error)
  },[])
  const coursDuJour=cours.filter(c=>c.jourSemaine===(new Date().getDay()||1))
  const pages = {
    calendrier: <CalendrierEnseignant/>,
    accueil: <AccueilSection cours={coursDuJour} notes={notes} devoirs={devoirs} C={C} user={user} onNav={p=>document.querySelector(`[data-nav='${p}']`)?.click()}/>,
    notes: <NotesSection C={C} user={user}/>,
    carnet: <CarnetNotesSection C={C} user={user}/>,
    absences: <AbsencesSection C={C}/>,
    devoirs: <DevoirsSection C={C}/>,
    lecons: <LeconsSection C={C}/>,
    appel: <AppelSection C={C}/>,
    params: <div style={{color:C.text,padding:20}}>Paramètres</div>,
  }

  return (
    <DashboardLayout nav={NAV} role="Enseignant" defaultActive="calendrier">
      {(active, C) => pages[active] || <div style={{color:C.text}}>Page introuvable</div>}
    </DashboardLayout>
  )
}
