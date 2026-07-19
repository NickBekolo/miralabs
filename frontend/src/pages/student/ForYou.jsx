import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import { ChevronDown } from 'lucide-react'

const ft = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'

function Card({ subtitle, title, footer, onClick, urgent, C }) {
  const bg     = C.surface
  const border = urgent ? '1.5px solid rgba(255,85,85,0.3)' : 'none'
  return (
    <div onClick={onClick}
      style={{
        background: bg, borderRadius:24, padding:'22px 22px 18px',
        marginBottom:-12, position:'relative', cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        border,
      }}>
      {/* Subtitle */}
      <div style={{ fontSize:13, color: C.muted, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
        {subtitle}
      </div>
      {/* Title */}
      <h2 style={{ fontSize:26, fontWeight:700, lineHeight:1.2, color:C.text, letterSpacing:'-0.5px', marginBottom:20 }}>
        {title}
      </h2>
      {/* Footer */}
      {footer}
    </div>
  )
}

function CourseFooter({ cours, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ background: C.bg === '#fff' ? '#f5f5f5' : '#2a2a2a', borderRadius:10, padding:'6px 10px', textAlign:'center', minWidth:52 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#ff5555', marginBottom:1 }}>
          {cours.isAnnule ? 'Annulé' : "Aujourd'hui"}
        </div>
        <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{cours.heureDebut}</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{cours.matiere.nom}</div>
        <div style={{ fontSize:13, color:C.muted }}>
          {cours.salle}{cours.enseignant ? ` · ${cours.enseignant.firstName} ${cours.enseignant.lastName}` : ''}
        </div>
      </div>
      <ChevronDown size={18} color={C.muted}/>
    </div>
  )
}

function NoteFooter({ note, C }) {
  const sur20 = Math.round((note.valeur / note.noteSur) * 200) / 10
  const low   = sur20 < 10
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:48, height:48, borderRadius:12, background: low ? 'rgba(255,85,85,0.1)' : (C.bg === '#fff' ? '#f5f5f5' : '#2a2a2a'), display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:15, fontWeight:700, color: low ? '#ff5555' : C.text }}>{sur20}</span>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{note.matiere.nom}</div>
        <div style={{ fontSize:13, color:C.muted }}>{note.commentaire}</div>
      </div>
      <ChevronDown size={18} color={C.muted}/>
    </div>
  )
}

function DevoirFooter({ devoir, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ background: C.bg === '#fff' ? '#f5f5f5' : '#2a2a2a', borderRadius:10, padding:'6px 10px', textAlign:'center', minWidth:52 }}>
        {devoir.urgent && <div style={{ fontSize:10, fontWeight:700, color:'#ff5555', marginBottom:1 }}>URGENT</div>}
        <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{devoir.dateRendu}</div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{devoir.titre}</div>
        <div style={{ fontSize:13, color:C.muted }}>{devoir.matiere?.nom}</div>
      </div>
      <ChevronDown size={18} color={C.muted}/>
    </div>
  )
}

function NotifFooter({ notif, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:48, height:48, borderRadius:12, background: C.bg === '#fff' ? '#f5f5f5' : '#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
        🔔
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{notif.title}</div>
        <div style={{ fontSize:13, color:C.muted }}>{notif.message}</div>
      </div>
    </div>
  )
}

export default function ForYou() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME

  const [cours,   setCours]   = useState([])
  const [notes,   setNotes]   = useState([])
  const [devoirs, setDevoirs] = useState([])
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/cours/today'),
      api.get('/api/notes'),
      api.get('/api/devoirs'),
      api.get('/api/notifications'),
    ]).then(([c, n, d, nt]) => {
      setCours(c.data)
      setNotes(n.data)
      setDevoirs(d.data)
      setNotifs(nt.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding:24, color:C.muted, fontSize:13, fontFamily:ft }}>Chargement...</div>
  )

  // Assemble les cartes par ordre de priorité
  const cards = []

  // Cours en cours ou prochain
  const prochainCours = cours.find(c => !c.isAnnule) ?? cours[0]
  if (prochainCours) {
    cards.push({
      key: 'cours',
      subtitle: '📅 Basé sur votre journée',
      title: prochainCours.isAnnule ? `${prochainCours.matiere.nom} est annulé` : `Prépare-moi\npour ce cours`,
      footer: <CourseFooter cours={prochainCours} C={C}/>,
      urgent: prochainCours.isAnnule,
      onClick: () => navigate('/student/edt'),
    })
  }

  // Dernier devoir urgent
  const devoirUrgent = devoirs.find(d => d.urgent)
  if (devoirUrgent) {
    cards.push({
      key: 'devoir-urgent',
      subtitle: '⚠️ Devoir urgent',
      title: `Rendre\n${devoirUrgent.titre}`,
      footer: <DevoirFooter devoir={devoirUrgent} C={C}/>,
      urgent: true,
      onClick: null,
    })
  }

  // Dernière note
  const derniereNote = notes[0]
  if (derniereNote) {
    const sur20 = Math.round((derniereNote.valeur / derniereNote.noteSur) * 200) / 10
    cards.push({
      key: 'note',
      subtitle: '📊 Dernière note reçue',
      title: sur20 < 10 ? `Note à améliorer\nen ${derniereNote.matiere.nom}` : `Voir ma\nnouvelle note`,
      footer: <NoteFooter note={derniereNote} C={C}/>,
      urgent: sur20 < 10,
      onClick: () => navigate('/student/notes'),
    })
  }

  // Prochain devoir (non urgent)
  const prochainDevoir = devoirs.find(d => !d.urgent)
  if (prochainDevoir) {
    cards.push({
      key: 'devoir',
      subtitle: '📝 À rendre bientôt',
      title: `Ne pas oublier\n${prochainDevoir.titre}`,
      footer: <DevoirFooter devoir={prochainDevoir} C={C}/>,
      urgent: false,
      onClick: null,
    })
  }

  // Notifications
  notifs.filter(n => !n.isRead).slice(0,2).forEach((n, i) => {
    cards.push({
      key: `notif-${n.id}`,
      subtitle: '🔔 Notification',
      title: n.title,
      footer: <NotifFooter notif={n} C={C}/>,
      urgent: false,
      onClick: null,
    })
  })

  // Cours annulés
  cours.filter(c => c.isAnnule).forEach(c => {
    cards.push({
      key: `annule-${c.id}`,
      subtitle: '❌ Cours annulé',
      title: `${c.matiere.nom}\nest annulé`,
      footer: <CourseFooter cours={c} C={C}/>,
      urgent: true,
      onClick: null,
    })
  })

  return (
    <div style={{ fontFamily:ft, paddingBottom:20 }}>
      {/* Salutation */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, color:C.hint }}>
          {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
        </div>
      </div>

      {/* Cards feed */}
      {cards.length === 0 ? (
        <div style={{ background:C.surface, borderRadius:24, padding:32, textAlign:'center', color:C.muted, fontSize:14 }}>
          Tout est à jour pour aujourd'hui 🎉
        </div>
      ) : cards.map(card => (
        <Card key={card.key} C={C} {...{...card, key:undefined}}
          title={card.title.split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && card.title.includes('\n') && <br/>}</span>
          ))}
        />
      ))}
    </div>
  )
}