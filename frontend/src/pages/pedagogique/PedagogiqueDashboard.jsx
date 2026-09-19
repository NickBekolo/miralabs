import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import { Home, Calendar, Settings, LogOut, Users, BookOpen, ClipboardList, FileText, CheckSquare, CalendarDays } from 'lucide-react'
import CalendrierEnseignant from './CalendrierEnseignant'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"
const TYPES_EVAL = ['DS','TP','Devoir','Interrogation','Examen','CCF']
const NAV = [
  { id:'calendrier', label:'Calendrier', icon:CalendarDays },
  { id:'accueil',  label:'Accueil',         icon:Home },
  { id:'notes',    label:'Saisie notes',    icon:ClipboardList },
  { id:'carnet',   label:'Carnet de notes', icon:ClipboardList },
  { id:'absences', label:'Absences',        icon:Users },
  { id:'devoirs',  label:'Devoirs',         icon:BookOpen },
  { id:'lecons',   label:'Cahier de texte', icon:FileText },
  { id:'appel',    label:"Faire l'appel",   icon:CheckSquare },
  { id:'edt',      label:'Emploi du temps', icon:Calendar },
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
    <div>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22,fontWeight:600,color:C.text,marginBottom:3 }}>Bonjour, {user?.firstName??'toi'}</h1>
        <p style={{ fontSize:12,color:C.hint }}>{today}</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16 }}>
        {[{label:"Cours aujourd'hui",value:cours.length,color:'#007AFF'},{label:'Notes saisies',value:notes.length,color:'#FF9500'},{label:'Devoirs créés',value:devoirs.length,color:'#34C759'}].map(s=>(
          <div key={s.label} style={{ background:C.surface,borderRadius:14,padding:'14px 16px' }}>
            <div style={{ fontSize:26,fontWeight:700,color:s.color,marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:11,color:C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
      <Card C={C} style={{ marginBottom:12 }}>
        <ST C={C}>Cours du jour</ST>
        {cours.length===0?<div style={{ color:C.hint,fontSize:13,textAlign:'center',padding:'12px 0' }}>Aucun cours</div>
        :cours.map((c,i)=>(
          <div key={c.id} style={{ display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:i<cours.length-1?`1px solid ${C.surface2}`:'none' }}>
            <div style={{ width:3,height:36,borderRadius:2,background:'#007AFF',flexShrink:0 }}/>
            <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:500,color:C.text }}>{c.matiere.nom}</div><div style={{ fontSize:11,color:C.muted }}>{c.salle} · {c.heureDebut}-{c.heureFin}</div></div>
          </div>
        ))}
      </Card>
      <Card C={C}>
        <ST C={C}>Actions rapides</ST>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
          {[{label:'Saisir des notes',Icon:ClipboardList,id:'notes',color:'#007AFF'},{label:'Saisir absences',Icon:Users,id:'absences',color:'#FF9500'},{label:'Créer un devoir',Icon:BookOpen,id:'devoirs',color:'#34C759'},{label:"Voir l'EDT",Icon:Calendar,id:'edt',color:'#AF52DE'}].map(a=>(
            <button key={a.id} onClick={()=>onNav(a.id)} style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:C.surface2,borderRadius:12,border:'none',cursor:'pointer',fontFamily:ft }}>
              <div style={{ width:32,height:32,borderRadius:8,background:`${a.color}20`,display:'flex',alignItems:'center',justifyContent:'center' }}><a.Icon size={16} color={a.color} strokeWidth={1.5}/></div>
              <span style={{ fontSize:12,fontWeight:500,color:C.text }}>{a.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

function NotesSection({ C }) {
  const [classes,setClasses]=useState([])
  const [eleves,setEleves]=useState([])
  const [matieres,setMatieres]=useState([])
  const [notes,setNotes]=useState([])
  const [classeId,setClasseId]=useState('')
  const [form,setForm]=useState({eleveId:'',matiereId:'',valeur:'',noteSur:'20',typeEvaluation:'',commentaire:''})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState(null)
  useEffect(()=>{
    api.get('/api/classes').then(r=>setClasses(r.data)).catch(()=>{})
    api.get('/api/notes').then(r=>setNotes(r.data)).catch(()=>{})
    api.get('/api/matieres').then(r=>setMatieres(r.data)).catch(()=>{})
  },[])
  useEffect(()=>{ if(!classeId){setEleves([]);return} api.get('/api/classes/'+classeId+'/eleves').then(r=>setEleves(r.data)).catch(()=>{}) },[classeId])
  const save=async()=>{
    if(!form.eleveId||!form.matiereId||!form.valeur)return
    setSaving(true);setMsg(null)
    try{
      await api.post('/api/notes',{eleveId:+form.eleveId,matiereId:+form.matiereId,valeur:+form.valeur,noteSur:+form.noteSur,typeEvaluation:form.typeEvaluation||null,commentaire:form.commentaire})
      setMsg({ok:true,text:'Note enregistrée'})
      setForm({eleveId:'',matiereId:'',valeur:'',noteSur:'20',typeEvaluation:'',commentaire:''})
      api.get('/api/notes').then(r=>setNotes(r.data))
    }catch{setMsg({ok:false,text:'Erreur.'})}
    finally{setSaving(false)}
  }
  return (
    <div>
      <h2 style={{ fontSize:20,fontWeight:600,color:C.text,marginBottom:20 }}>Saisie des notes</h2>
      <Card C={C} style={{ marginBottom:16 }}>
        <ST C={C}>Nouvelle note</ST>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          <div style={{ gridColumn:'1/-1' }}><Sel label="Classe" value={classeId} onChange={e=>setClasseId(e.target.value)}><option value="">Sélectionner une classe</option>{classes.map(cl=><option key={cl.id} value={cl.id}>{cl.name}</option>)}</Sel></div>
          <div style={{ gridColumn:'1/-1' }}><Sel label="Eleve *" value={form.eleveId} onChange={e=>setForm(f=>({...f,eleveId:e.target.value}))}><option value="">Sélectionner un élève</option>{eleves.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</Sel></div>
          <Sel label="Matiere *" value={form.matiereId} onChange={e=>setForm(f=>({...f,matiereId:e.target.value}))}><option value="">Matière</option>{matieres.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</Sel>
          <Sel label="Type" value={form.typeEvaluation} onChange={e=>setForm(f=>({...f,typeEvaluation:e.target.value}))}><option value="">Type</option>{TYPES_EVAL.map(t=><option key={t} value={t}>{t}</option>)}</Sel>
          <Sel label="Sur" value={form.noteSur} onChange={e=>setForm(f=>({...f,noteSur:e.target.value}))}>{[10,20].map(n=><option key={n} value={n}>/{n}</option>)}</Sel>
          <Inp label="Note *" type="number" min="0" max={form.noteSur} step="0.5" value={form.valeur} onChange={e=>setForm(f=>({...f,valeur:e.target.value}))} placeholder="0-20"/>
          <div style={{ gridColumn:'1/-1' }}><Inp label="Commentaire" value={form.commentaire} onChange={e=>setForm(f=>({...f,commentaire:e.target.value}))} placeholder="Commentaire..."/></div>
        </div>
        <Msg msg={msg}/>
        <Btn onClick={save} saving={saving} disabled={!form.eleveId||!form.matiereId||!form.valeur} C={C}/>
      </Card>
      <Card C={C}><ST C={C}>Notes recentes</ST>
        {notes.slice(0,5).map((n,i)=>{const s=Math.round((n.valeur/n.noteSur)*200)/10;return(
          <div key={n.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<4?`1px solid ${C.surface2}`:'none' }}>
            <div style={{ width:36,height:36,borderRadius:8,background:s<10?'rgba(255,59,48,0.1)':C.surface2,display:'flex',alignItems:'center',justifyContent:'center' }}><span style={{ fontSize:13,fontWeight:700,color:s<10?'#FF3B30':C.text }}>{s}</span></div>
            <div style={{ flex:1 }}><div style={{ fontSize:12,color:C.text }}>{n.eleve?.firstName} {n.eleve?.lastName}</div><div style={{ fontSize:11,color:C.muted }}>{n.matiere?.nom}</div></div>
          </div>
        )})}
      </Card>
    </div>
  )
}

function CarnetNotesSection({ C }) {
  const [notes,setNotes]=useState([])
  const [matieres,setMatieres]=useState([])
  const [loading,setLoading]=useState(true)
  const [fm,setFm]=useState('')
  const [ft2,setFt2]=useState('')
  const avg=arr=>arr.length?Math.round(arr.reduce((s,n)=>s+(n.valeur/n.noteSur)*20,0)/arr.length*10)/10:0
  useEffect(()=>{ Promise.all([api.get('/api/notes'),api.get('/api/matieres')]).then(([n,m])=>{setNotes(n.data);setMatieres(m.data)}).catch(()=>{}).finally(()=>setLoading(false)) },[])
  const filtrees=notes.filter(n=>(!fm||n.matiere?.id===parseInt(fm))&&(!ft2||n.typeEvaluation===ft2))
  const parMat={}
  filtrees.forEach(n=>{const k=n.matiere?.nom??'Sans matiere';if(!parMat[k])parMat[k]=[];parMat[k].push(n)})
  return (
    <div>
      <h2 style={{ fontSize:20,fontWeight:600,color:C.text,marginBottom:20 }}>Carnet de notes</h2>
      <Card C={C} style={{ marginBottom:16 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10 }}>
          <Sel label="Matiere" value={fm} onChange={e=>setFm(e.target.value)}><option value="">Toutes</option>{matieres.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</Sel>
          <Sel label="Type" value={ft2} onChange={e=>setFt2(e.target.value)}><option value="">Tous</option>{TYPES_EVAL.map(t=><option key={t} value={t}>{t}</option>)}</Sel>
          <div style={{ display:'flex',alignItems:'flex-end' }}><button onClick={()=>{setFm('');setFt2('')}} style={{ width:'100%',padding:'9px 12px',borderRadius:10,border:'none',background:C.surface2,color:C.muted,fontSize:13,cursor:'pointer',fontFamily:ft }}>Reset</button></div>
        </div>
      </Card>
      {loading?<div style={{ textAlign:'center',padding:32,color:C.hint }}>Chargement...</div>
      :Object.entries(parMat).map(([mat,mn])=>(
        <Card C={C} key={mat} style={{ marginBottom:12 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
            <div><div style={{ fontSize:15,fontWeight:700,color:C.text }}>{mat}</div><div style={{ fontSize:11,color:C.hint }}>{mn.length} note(s)</div></div>
            <div style={{ textAlign:'right' }}><div style={{ fontSize:22,fontWeight:700,color:avg(mn)<10?'#FF3B30':'#34C759' }}>{avg(mn)}/20</div></div>
          </div>
          <div style={{ borderRadius:10,overflow:'hidden',border:`1px solid ${C.surface2}` }}>
            <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',background:C.surface2,padding:'8px 12px' }}>
              {['Eleve','Note','Type','Commentaire'].map(h=><div key={h} style={{ fontSize:10,fontWeight:600,color:C.hint,textTransform:'uppercase' }}>{h}</div>)}
            </div>
            {mn.map(n=>{const s=Math.round((n.valeur/n.noteSur)*200)/10;return(
              <div key={n.id} style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',padding:'10px 12px',borderTop:`1px solid ${C.surface2}`,alignItems:'center' }}>
                <div style={{ fontSize:13,color:C.text }}>{n.eleve?.firstName} {n.eleve?.lastName}</div>
                <div style={{ fontSize:14,fontWeight:700,color:s<10?'#FF3B30':'#34C759' }}>{s}/20</div>
                <div>{n.typeEvaluation?<span style={{ fontSize:11,padding:'2px 8px',borderRadius:980,background:C.surface2,color:C.muted }}>{n.typeEvaluation}</span>:<span style={{ color:C.hint }}>-</span>}</div>
                <div style={{ fontSize:11,color:C.muted }}>{n.commentaire||'-'}</div>
              </div>
            )})}
          </div>
        </Card>
      ))}
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
      <h2 style={{ fontSize:20,fontWeight:600,color:C.text,marginBottom:20 }}>Absences</h2>
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
      <h2 style={{ fontSize:20,fontWeight:600,color:C.text,marginBottom:20 }}>Devoirs</h2>
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
  const [historique,setHistorique]=useState([])
  const [presences,setPresences]=useState([])
  const [detail,setDetail]=useState(null)
  const [appelDetail,setAppelDetail]=useState(null)

  useEffect(()=>{
    api.get('/api/classes').then(r=>setClasses(r.data)).catch(()=>{})
    api.get('/api/etablissement/parametres').then(r=>setSigActive(r.data.signatureNumeriqueActive)).catch(()=>{})
    api.get('/api/appels/historique').then(r=>setHistorique(r.data)).catch(()=>{})
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

  const toggle=id=>{if(appel)return;setStatuts(s=>{const c=s[id]||'present';return{...s,[id]:c==='present'?'absent':c==='absent'?'retard':'present'}})}

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
      setMsg({ok:true,text:sigActive?'Appel lance ! Code : '+r.data.codeSignature:'Appel lance !'})
      api.get('/api/appels/historique').then(r=>setHistorique(r.data)).catch(()=>{})
    }catch{setMsg({ok:false,text:'Erreur.'})}
    finally{setSaving(false)}
  }

  const terminer=async()=>{
    if(!appel)return
    const r=await api.patch('/api/appels/'+appel.id+'/terminer')
    setMsg({ok:true,text:'Appel termine. '+r.data.absencesCreees+' absence(s) creee(s).'})
    sessionStorage.removeItem('appelActif')
    setAppel(null)
    const s={};eleves.forEach(e=>s[e.id]='present');setStatuts(s)
    api.get('/api/appels/historique').then(r=>setHistorique(r.data)).catch(()=>{})
  }

  const COL={present:'#34C759',absent:'#FF3B30',retard:'#FF9500',signed:'#34C759',waiting:'#FF9500'}
  const LBL={present:'Present',absent:'Absent',retard:'Retard',signed:'Signe',waiting:'En attente'}

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:600,color:C.text,marginBottom:6}}>Faire l'appel</h2>
      <p style={{fontSize:12,color:C.hint,marginBottom:20}}>{sigActive?'Les eleves presants recevront une notification.':'Mode classique.'}</p>
      {msg&&<div style={{padding:'12px 16px',borderRadius:12,background:msg.ok?'rgba(52,199,89,0.1)':'rgba(255,59,48,0.1)',color:msg.ok?'#34C759':'#FF3B30',fontSize:13,marginBottom:16}}>{msg.text}</div>}

      {appel&&sigActive&&(
        <Card C={C} style={{marginBottom:16,textAlign:'center',background:'#1a1a2e'}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:8}}>Code signature</div>
          <div style={{fontSize:52,fontWeight:700,color:'#fff',letterSpacing:10,marginBottom:8}}>{appel.codeSignature}</div>
        </Card>
      )}

      <Card C={C} style={{marginBottom:12}}>
        <Sel label="Classe *" value={classeId} onChange={e=>setClasseId(e.target.value)}>
          <option value="">Selectionner une classe</option>
          {classes.map(cl=><option key={cl.id} value={cl.id}>{cl.name}</option>)}
        </Sel>
      </Card>

      {eleves.length>0&&(
        <>
          {appel&&(
            <Card C={C} style={{marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Signatures</div>
              {eleves.map(e=>{
                const s=statuts[e.id]||'waiting'
                return (
                  <div key={e.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${C.surface2}`}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:COL[s]||'#999',flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,color:C.text}}>{e.firstName} {e.lastName}</span>
                    <span style={{fontSize:12,fontWeight:600,color:COL[s]||'#999'}}>{LBL[s]}</span>
                    {s==='signed'&&<button onClick={()=>{const p=presences.find(x=>String(x.eleve?.id)===String(e.id));setDetail(p||null)}} style={{fontSize:11,padding:'3px 8px',borderRadius:8,border:'none',background:C.surface2,color:C.muted,cursor:'pointer',fontFamily:ft}}>Detail</button>}
                  </div>
                )
              })}
            </Card>
          )}

          {!appel&&(
            <Card C={C} style={{marginBottom:12,padding:0,overflow:'hidden'}}>
              <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.surface2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:13,fontWeight:600,color:C.text}}>{eleves.length} eleves</span>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>setStatuts(Object.fromEntries(eleves.map(e=>[e.id,'present'])))} style={{fontSize:11,padding:'4px 10px',borderRadius:8,border:'none',background:'rgba(52,199,89,0.1)',color:'#34C759',cursor:'pointer',fontFamily:ft}}>Tous presents</button>
                  <button onClick={()=>setStatuts(Object.fromEntries(eleves.map(e=>[e.id,'absent'])))} style={{fontSize:11,padding:'4px 10px',borderRadius:8,border:'none',background:'rgba(255,59,48,0.1)',color:'#FF3B30',cursor:'pointer',fontFamily:ft}}>Tous absents</button>
                </div>
              </div>
              {eleves.map((e,i)=>{const s=statuts[e.id]||'present';return(
                <div key={e.id} onClick={()=>toggle(e.id)} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',borderBottom:i<eleves.length-1?`1px solid ${C.surface2}`:'none',cursor:'pointer'}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:(COL[s]||'#999')+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:COL[s]||'#999',flexShrink:0}}>{e.firstName?.[0]}{e.lastName?.[0]}</div>
                  <div style={{flex:1,fontSize:14,fontWeight:600,color:C.text}}>{e.firstName} {e.lastName}</div>
                  <div style={{display:'flex',borderRadius:980,overflow:'hidden',border:`1px solid ${C.surface2}`}}>
                    {['present','absent','retard'].map(opt=>(
                      <button key={opt} onClick={ev=>{ev.stopPropagation();setStatuts(ss=>({...ss,[e.id]:opt}))}}
                        style={{padding:'4px 10px',border:'none',cursor:'pointer',fontSize:12,fontWeight:s===opt?700:400,background:s===opt?(COL[opt]||'#999'):'transparent',color:s===opt?'#fff':C.muted,fontFamily:ft}}>
                        {opt==='present'?'P':opt==='absent'?'A':'R'}
                      </button>
                    ))}
                  </div>
                </div>
              )})}
            </Card>
          )}

          {!appel
            ?<button onClick={lancer} disabled={saving||!classeId} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:C.text,color:C.bg,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:ft,opacity:saving||!classeId?0.5:1,marginBottom:16}}>
              {saving?'Lancement...':'Lancer l appel'}
            </button>
            :<button onClick={terminer} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:'#FF3B30',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:ft,marginBottom:16}}>
              Terminer l appel
            </button>
          }

          {historique.length>0&&(
            <Card C={C}>
              <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Historique ({historique.length})</div>
              {historique.map((a,i)=>(
                <div key={a.id} onClick={()=>api.get('/api/appels/'+a.id).then(r=>setAppelDetail(r.data)).catch(()=>{})}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<historique.length-1?`1px solid ${C.surface2}`:'none',cursor:'pointer'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:C.text}}>Appel #{a.id} — {a.dateHeure}</div>
                    <div style={{fontSize:11,color:C.muted}}>{a.nbPresents} presants · {a.nbAbsents} absents · {a.nbSignes} signes</div>
                  </div>
                  <span style={{fontSize:11,padding:'2px 8px',borderRadius:980,background:a.statut==='termine'?'rgba(52,199,89,0.1)':'rgba(255,149,0,0.1)',color:a.statut==='termine'?'#34C759':'#FF9500'}}>
                    {a.statut==='termine'?'Termine':'En cours'}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {detail&&(
        <div onClick={()=>setDetail(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bg,borderRadius:20,padding:24,maxWidth:420,width:'90%'}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>{detail?.eleve?.firstName} {detail?.eleve?.lastName}</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Signe a {detail?.signedAt ? new Date(new Date().toDateString()+' '+detail.signedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : ''}</div>
            {detail?.signatureImage
              ?<img src={(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')+detail.signatureImage} alt="Signature" style={{width:'100%',borderRadius:12,border:`1px solid ${C.surface2}`,background:'#fff'}}/>
              :<div style={{padding:24,textAlign:'center',color:C.hint,fontSize:13}}>Aucune image</div>
            }
            <button onClick={()=>setDetail(null)} style={{width:'100%',marginTop:16,padding:10,borderRadius:10,border:'none',background:C.text,color:C.bg,cursor:'pointer',fontFamily:ft}}>Fermer</button>
          </div>
        </div>
      )}

      {appelDetail&&(
        <div onClick={()=>setAppelDetail(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bg,borderRadius:20,padding:24,maxWidth:480,width:'90%',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>Appel #{appelDetail.id}</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>{appelDetail.dateHeure}</div>
            {(appelDetail.presences||[]).map((p,i)=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:i<(appelDetail.presences.length-1)?`1px solid ${C.surface2}`:'none'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:p.signed?'#34C759':p.statut==='absent'?'#FF3B30':'#FF9500',flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:C.text}}>{p.eleve?.firstName} {p.eleve?.lastName}</div>
                  {p.signedAt&&<div style={{fontSize:11,color:C.muted}}>Signe a {p.signedAt ? new Date(new Date().toDateString()+' '+p.signedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : ''}</div>}
                </div>
                <span style={{fontSize:12,fontWeight:600,color:p.signed?'#34C759':p.statut==='absent'?'#FF3B30':'#FF9500'}}>{p.signed?'Signe':p.statut==='absent'?'Absent':'En attente'}</span>
                {p.signatureImage&&<button onClick={()=>setDetail(p)} style={{fontSize:11,padding:'3px 8px',borderRadius:8,border:'none',background:C.surface2,color:C.muted,cursor:'pointer',fontFamily:ft}}>Image</button>}
              </div>
            ))}
            <button onClick={()=>setAppelDetail(null)} style={{width:'100%',marginTop:16,padding:10,borderRadius:10,border:'none',background:C.text,color:C.bg,cursor:'pointer',fontFamily:ft}}>Fermer</button>
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
  const pages={
    accueil:<AccueilSection cours={coursDuJour} notes={notes} devoirs={devoirs} C={C} user={user} onNav={setActive}/>,
    notes:<NotesSection C={C}/>,
    carnet:<CarnetNotesSection C={C}/>,
    absences:<AbsencesSection C={C}/>,
    devoirs:<DevoirsSection C={C}/>,
    lecons:<LeconsSection C={C}/>,
    appel:<AppelSection C={C}/>,
    edt:<EdtSection cours={cours} C={C}/>,
    calendrier:<CalendrierEnseignant/>,
    params:<div style={{ color:C.text,padding:20 }}>Parametres</div>,
  }
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:'flex',height:'100vh',fontFamily:ft,background:C.bg,overflow:'hidden' }}>
        <div style={{ width:isMobile?0:200,flexShrink:0,background:C.sidebar,display:isMobile?'none':'flex',flexDirection:'column',padding:'18px 10px' }}>
          <div style={{ fontSize:15,fontWeight:700,color:C.text,padding:'4px 12px',marginBottom:20 }}>Miralabs.</div>
          <nav style={{ flex:1,overflowY:'auto' }}>
            {NAV.map(({id,label,icon:Icon})=>{
              const a=active===id
              return <div key={id} onClick={()=>setActive(id)} style={{ display:'flex',alignItems:'center',gap:9,padding:'8px 12px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:a?500:400,color:a?C.text:C.muted,background:a?C.surface2:'transparent',marginBottom:1 }} onMouseEnter={e=>{if(!a)e.currentTarget.style.background=C.surface}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background='transparent'}}><Icon size={15} strokeWidth={1.5}/>{label}</div>
            })}
          </nav>
          <div onClick={()=>{logout();navigate('/')}} style={{ display:'flex',alignItems:'center',gap:9,padding:'8px 12px',borderRadius:8,cursor:'pointer',fontSize:13,color:C.muted }} onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <LogOut size={15} strokeWidth={1.5}/>Deconnexion
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'28px 32px',background:C.bg }}>
          {pages[active]}
        </div>
      </div>
    </>
  )
}
