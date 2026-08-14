import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import { ChevronRight, Bell, BookOpen, ClipboardList, AlertTriangle, Calendar, MessageCircle } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

function Card({ subtitle, title, footer, onClick, urgent, C, icon: Icon }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div onClick={onClick}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ background:C.surface, borderRadius:20, padding:'18px 18px 16px', marginBottom:12, cursor:onClick?'pointer':'default', border:urgent?'1.5px solid rgba(255,85,85,0.25)':`1px solid ${C.bg==='#fff'?'#ebebeb':'#2a2a2a'}`, transform:pressed?'scale(0.98)':'scale(1)', transition:'transform 0.1s ease', boxShadow:C.bg==='#fff'?'0 2px 12px rgba(0,0,0,0.06)':'none' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:urgent?'rgba(255,85,85,0.12)':(C.bg==='#fff'?'#f0f0f0':'#2a2a2a'), display:'flex', alignItems:'center', justifyContent:'center' }}>
            {Icon && <Icon size={14} color={urgent?'#ff5555':C.muted} strokeWidth={2}/>}
          </div>
          <span style={{ fontSize:12, color:C.muted, fontWeight:500 }}>{subtitle}</span>
        </div>
        {onClick && <ChevronRight size={16} color={C.muted} strokeWidth={1.8}/>}
      </div>
      <div style={{ fontSize:20, fontWeight:700, lineHeight:1.25, color:C.text, letterSpacing:'-0.4px', marginBottom:14 }}>{title}</div>
      {footer}
    </div>
  )
}

function CourseFooter({ cours, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bg==='#fff'?'#f7f7f7':'#1e1e1e', borderRadius:12, padding:'10px 12px' }}>
      <div style={{ textAlign:'center', minWidth:44 }}>
        <div style={{ fontSize:10, fontWeight:700, color:cours.isAnnule?'#ff5555':'#007AFF', marginBottom:1 }}>{cours.isAnnule?'Annulé':'Auj.'}</div>
        <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{cours.heureDebut}</div>
      </div>
      <div style={{ width:1, height:28, background:C.bg==='#fff'?'#e5e5e5':'#333' }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{cours.matiere.nom}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{cours.salle}{cours.enseignant?` · ${cours.enseignant.firstName}`:''}</div>
      </div>
    </div>
  )
}

function NoteFooter({ note, C }) {
  const sur20 = Math.round((note.valeur / note.noteSur) * 200) / 10
  const low = sur20 < 10
  const color = low ? '#ff5555' : '#34C759'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bg==='#fff'?'#f7f7f7':'#1e1e1e', borderRadius:12, padding:'10px 12px' }}>
      <div style={{ width:44, height:44, borderRadius:10, background:low?'rgba(255,85,85,0.12)':'rgba(52,199,89,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:16, fontWeight:800, color }}>{sur20}</span>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{note.matiere.nom}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{note.commentaire||'Nouvelle note'}</div>
      </div>
      <div style={{ fontSize:11, fontWeight:600, color, background:low?'rgba(255,85,85,0.1)':'rgba(52,199,89,0.1)', padding:'3px 8px', borderRadius:980 }}>{low?'En dessous':'Au dessus'}</div>
    </div>
  )
}

function DevoirFooter({ devoir, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bg==='#fff'?'#f7f7f7':'#1e1e1e', borderRadius:12, padding:'10px 12px' }}>
      <div style={{ background:devoir.urgent?'rgba(255,85,85,0.12)':(C.bg==='#fff'?'#ebebeb':'#2a2a2a'), borderRadius:10, padding:'6px 10px', textAlign:'center', minWidth:52 }}>
        {devoir.urgent && <div style={{ fontSize:9, fontWeight:700, color:'#ff5555', marginBottom:1 }}>URGENT</div>}
        <div style={{ fontSize:12, fontWeight:700, color:devoir.urgent?'#ff5555':C.text }}>{devoir.dateRendu}</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{devoir.titre}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{devoir.matiere?.nom}</div>
      </div>
    </div>
  )
}

function NotifFooter({ notif, C }) {
  const isMsg = notif.type === 'message'
  const isGroupe = notif.type === 'groupe'
  const iconColor = isMsg ? '#FF3B30' : isGroupe ? '#007AFF' : C.muted
  const Icon = isMsg ? MessageCircle : Bell
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.bg==='#fff'?'#f7f7f7':'#1e1e1e', borderRadius:12, padding:'10px 12px' }}>
      <div style={{ width:36, height:36, borderRadius:10, background:isMsg?'rgba(255,59,48,0.1)':isGroupe?'rgba(0,122,255,0.1)':(C.bg==='#fff'?'#ebebeb':'#2a2a2a'), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={17} color={iconColor} strokeWidth={2}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{notif.title}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{notif.message}</div>
      </div>
    </div>
  )
}

export default function ForYou() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const darkMode = useThemeStore(s => s.darkMode)
  const C = darkMode ? DARK_THEME : LIGHT_THEME
  const [cours, setCours] = useState([])
  const [notes, setNotes] = useState([])
  const [devoirs, setDevoirs] = useState([])
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/cours/today'),
      api.get('/api/notes'),
      api.get('/api/devoirs'),
      api.get('/api/notifications'),
    ]).then(([c, n, d, nt]) => {
      setCours(c.data); setNotes(n.data); setDevoirs(d.data); setNotifs(nt.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding:24, color:C.muted, fontSize:13, fontFamily:ft }}>Chargement...</div>

  const cards = []
  const prochainCours = cours.find(c => !c.isAnnule) ?? cours[0]
  if (prochainCours) cards.push({ key:'cours', icon:Calendar, subtitle:'Emploi du temps', subtitleIcon:'calendar', title:prochainCours.isAnnule?`${prochainCours.matiere.nom} annulé`:'Prochain cours', footer:<CourseFooter cours={prochainCours} C={C}/>, urgent:prochainCours.isAnnule, onClick:() => navigate('/student/edt') })
  const devoirUrgent = devoirs.find(d => d.urgent)
  if (devoirUrgent) cards.push({ key:'devoir-urgent', icon:AlertTriangle, subtitle:'Devoir urgent', title:devoirUrgent.titre, footer:<DevoirFooter devoir={devoirUrgent} C={C}/>, urgent:true, onClick:null })
  const derniereNote = notes[0]
  if (derniereNote) { const sur20 = Math.round((derniereNote.valeur/derniereNote.noteSur)*200)/10; cards.push({ key:'note', icon:BookOpen, subtitle:'Dernière note', title:sur20<10?'Note à améliorer':'Nouvelle note reçue', footer:<NoteFooter note={derniereNote} C={C}/>, urgent:sur20<10, onClick:() => navigate('/student/notes') }) }
  const prochainDevoir = devoirs.find(d => !d.urgent)
  if (prochainDevoir) cards.push({ key:'devoir', icon:ClipboardList, subtitle:'À rendre bientôt', title:prochainDevoir.titre, footer:<DevoirFooter devoir={prochainDevoir} C={C}/>, urgent:false, onClick:null })
  notifs.filter(n => !n.isRead).slice(0,2).forEach(n => cards.push({ key:`notif-${n.id}`, icon:Bell, subtitle:'Notification', title:n.title, footer:<NotifFooter notif={n} C={C}/>, urgent:false, onClick:null }))
  cours.filter(c => c.isAnnule).forEach(c => cards.push({ key:`annule-${c.id}`, icon:AlertTriangle, subtitle:'Cours annulé', title:`${c.matiere.nom} annulé`, footer:<CourseFooter cours={c} C={C}/>, urgent:true, onClick:null }))

  return (
    <div style={{ fontFamily:ft, padding:'4px 0 32px' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, color:C.muted, fontWeight:500 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
        </div>
      </div>
      {cards.length===0 ? (
        <div style={{ background:C.surface, borderRadius:20, padding:'32px 24px', textAlign:'center', border:`1px solid ${C.bg==='#fff'?'#ebebeb':'#2a2a2a'}` }}>
          <div style={{ width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}><Zap size={24} color='#fff' strokeWidth={2}/></div>
          <div style={{ fontWeight:600, color:C.text, marginBottom:4 }}>Tout est à jour !</div>
          <div style={{ fontSize:13, color:C.muted }}>Aucune tâche urgente aujourd'hui.</div>
        </div>
      ) : cards.map(card => (
        <Card key={card.key} C={C} subtitle={card.subtitle} title={card.title} footer={card.footer} urgent={card.urgent} onClick={card.onClick} icon={card.icon}/>
      ))}
    </div>
  )
}
