import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Signature from '../Signature'
import Actualites from '../Actualites'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../../store/ThemeStore'
import api from '../../../services/api'
import MoyenneChart from '../../../components/charts/MoyenneChart'
import Library from '../../../components/library/Library'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,sans-serif'


function avg(notes) {
  if (!notes.length) return 0
  const total = notes.reduce((s, n) => s + (n.valeur / n.noteSur) * 20, 0)
  return Math.round((total / notes.length) * 10) / 10
}

function buildDatasets(notes) {
  const byMatiere = {}
  notes.forEach(n => {
    const key = n.matiere.nom.toLowerCase().replace(/\s/g, '_')
    if (!byMatiere[key]) byMatiere[key] = { label: n.matiere.nom, points: [] }
    byMatiere[key].points.push({ label: n.createdAt, val: Math.round((n.valeur / n.noteSur) * 200) / 10, classe: 12, rang: 1 })
  })
  return {
    general: {
      label: 'Moyenne générale',
      points: notes.map(n => ({ label: n.createdAt, val: Math.round((n.valeur / n.noteSur) * 200) / 10, classe: 12, rang: 1 })),
    },
    ...byMatiere
  }
}

function SectionHeader({ title, link, onLink, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
      <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{title}</span>
      {link && <span onClick={onLink} style={{ fontSize:11, color:C.muted, cursor:onLink?'pointer':'default' }}>{link}</span>}
    </div>
  )
}

function Card({ children, C, style = {} }) {
  return (
    <div style={{ background:C.surface, borderRadius:16, padding:'16px 18px', boxShadow:C.bg==='#ffffff'?'0 2px 12px rgba(0,0,0,0.06)':'none', border:`1px solid ${C.surface2}`, ...style }}>
      {children}
    </div>
  )
}

function MoyenneSection({ notes, C }) {
  if (!notes.length) return (
    <Card C={C} style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
      <span style={{ fontSize:12, color:C.hint }}>Aucune note disponible</span>
    </Card>
  )
  return (
    <Card C={C}>
      <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:12 }}>
        <span style={{ fontSize:32, fontWeight:500, color:C.text, letterSpacing:'-1px' }}>{avg(notes)}</span>
        <span style={{ fontSize:13, color:C.muted }}>/20 · Moyenne générale</span>
      </div>
      <MoyenneChart datasets={buildDatasets(notes)} defaultKey="general"/>
    </Card>
  )
}

function AbsencesSection({ absences, loading, C }) {
  const today      = new Date().getDate()
  const absentDays = absences.map(a => new Date(a.date).getDate())
  const jours      = ['Lu','Ma','Me','Je','Ve','Sa','Di']
  return (
    <Card C={C}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.text }}>Assiduité</span>
        {absences.length > 0 && <span style={{ fontSize:10, color:C.red ?? '#ff5555' }}>{absences.length} absence(s)</span>}
      </div>
      <div style={{ fontSize:10, color:C.muted, marginBottom:8 }}>
        {new Date().toLocaleString('fr-FR', { month:'long', year:'numeric' })}
      </div>
      {loading ? (
        <div style={{ fontSize:11, color:C.hint }}>Chargement...</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {jours.map((j, idx) => (
            <div key={idx} style={{ fontSize:8, color:C.hint, textAlign:'center', fontWeight:500 }}>{j}</div>
          ))}
          {Array.from({ length:30 }, (_, i) => i + 1).map(d => {
            const isAbsent = absentDays.includes(d)
            const isToday  = d === today
            const isPast   = d < today
            let bg = 'transparent', color = C.hint
            if (isToday)       { bg = C.text;     color = C.bg }
            else if (isAbsent) { bg = C.red ?? '#ff5555'; color = '#fff' }
            else if (isPast)   { bg = C.surface2; color = C.muted }
            return (
              <div key={d} style={{ aspectRatio:'1', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:500, background:bg, color }}>
                {d}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function CoursSection({ cours, loading, C }) {
  return (
    <Card C={C}>
      <SectionHeader title="Cours du jour" link="Voir tout ›" C={C}/>
      {loading ? (
        <div style={{ fontSize:12, color:C.hint }}>Chargement...</div>
      ) : !cours.length ? (
        <div style={{ fontSize:12, color:C.hint }}>Aucun cours aujourd'hui</div>
      ) : cours.map((c, i) => (
        <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom: i < cours.length-1 ? `1px solid ${C.surface2}` : 'none' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:500, color: c.isAnnule ? C.muted : C.text }}>{c.matiere.nom}</div>
            <div style={{ fontSize:10, color:C.muted }}>{c.salle}{c.enseignant ? ` · ${c.enseignant.firstName} ${c.enseignant.lastName}` : ''}</div>
          </div>
          <span style={{ padding:'3px 10px', borderRadius:980, fontSize:10, fontWeight:500, background: c.isAnnule ? 'rgba(255,85,85,0.1)' : C.surface2, color: c.isAnnule ? (C.red ?? '#ff5555') : C.muted }}>
            {c.isAnnule ? 'Annulé' : `${c.heureDebut}`}
          </span>
        </div>
      ))}
    </Card>
  )
}

function DevoirsSection({ devoirs, loading, C }) {
  return (
    <Card C={C}>
      <SectionHeader title="Devoirs à rendre" link="Voir tout ›" C={C}/>
      {loading ? (
        <div style={{ fontSize:12, color:C.hint }}>Chargement...</div>
      ) : !devoirs.length ? (
        <div style={{ fontSize:12, color:C.hint }}>Aucun devoir à rendre</div>
      ) : devoirs.map((d, i) => (
        <div key={d.id} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 0', borderBottom: i < devoirs.length-1 ? `1px solid ${C.surface2}` : 'none' }}>
          <div style={{ minWidth:36 }}>
            {d.urgent && <div style={{ fontSize:9, fontWeight:600, color: C.red ?? '#ff5555' }}>URGENT</div>}
            <div style={{ fontSize:9, color:C.muted, marginTop: d.urgent ? 1 : 2 }}>{d.dateRendu}</div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:C.text }}>{d.titre}</div>
            <div style={{ fontSize:10, color:C.muted }}>{d.matiere?.nom}</div>
          </div>
        </div>
      ))}
    </Card>
  )
}

function NotesSection({ notes, loading, C }) {
  return (
    <Card C={C}>
      <SectionHeader title="Notes récentes" link="Voir tout ›" C={C}/>
      {loading ? (
        <div style={{ fontSize:12, color:C.hint }}>Chargement...</div>
      ) : !notes.length ? (
        <div style={{ fontSize:12, color:C.hint }}>Aucune note</div>
      ) : notes.slice(0,3).map((n, i) => {
        const sur20 = Math.round((n.valeur / n.noteSur) * 200) / 10
        const low   = sur20 < 10
        return (
          <div key={n.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom: i < 2 ? `1px solid ${C.surface2}` : 'none' }}>
            <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:7, flexShrink:0, background: low ? 'rgba(255,85,85,0.1)' : C.surface2, color: low ? (C.red ?? '#ff5555') : C.text }}>
              {sur20}/20
            </span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:500, color:C.text }}>{n.matiere.nom}</div>
              <div style={{ fontSize:10, color:C.muted }}>{n.commentaire}</div>
            </div>
            <div style={{ fontSize:10, color:C.hint }}>{n.createdAt}</div>
          </div>
        )
      })}
    </Card>
  )
}

function ActualitesSection({ notifs, loading, C, onSign, onShowActu }) {
  return (
    <Card C={C}>
      <SectionHeader title="Actualités" link="Voir tout ›" onLink={onShowActu} C={C}/>
      {loading ? (
        <div style={{ fontSize:12, color:C.hint }}>Chargement...</div>
      ) : !notifs.length ? (
        <div style={{ fontSize:12, color:C.hint }}>Aucune actualité</div>
      ) : notifs.slice(0,3).map((n, i) => (
        <div key={n.id} style={{ padding:'8px 0', borderBottom: i < 2 ? `1px solid ${C.surface2}` : 'none' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:9, fontWeight:600, color:C.muted, textTransform:'uppercase' }}>{n.type}</span>
            <span style={{ fontSize:9, color:C.hint }}>{n.createdAt}</span>
          </div>
          <div style={{ fontSize:12, fontWeight:500, color:n.type==='appel'?'#FF3B30':C.text, marginBottom:1 }}>{n.title}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ fontSize:10, color:C.muted, flex:1 }}>{n.message}</div>
            {n.type==='appel' && (
              <button onClick={() => onSign && onSign()}
                style={{ background:'#FF3B30', border:'none', borderRadius:980, padding:'5px 14px', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer', flexShrink:0 }}>
                Signer
              </button>
            )}
          </div>
        </div>
      ))}
    </Card>
  )
}



export default function HomeScreen() {
  const { user }    = useAuth()
  const darkMode    = useThemeStore(s => s.darkMode)
  const C           = darkMode ? DARK_THEME : LIGHT_THEME

  const [notes,    setNotes]    = useState([])
  const [absences, setAbsences] = useState([])
  const [notifs,   setNotifs]   = useState([])
  const [showSign, setShowSign]  = useState(false)
  const [showActu, setShowActu]   = useState(false)
  const [cours,    setCours]    = useState([])
  const [devoirs,  setDevoirs]  = useState([])
  const [loadN,    setLoadN]    = useState(true)
  const [loadA,    setLoadA]    = useState(true)
  const [loadNt,   setLoadNt]   = useState(true)
  const [loadC,    setLoadC]    = useState(true)
  const [loadD,    setLoadD]    = useState(true)

  useEffect(() => {
    api.get('/api/notes').then(r => setNotes(r.data)).catch(console.error).finally(() => setLoadN(false))
    api.get('/api/absences').then(r => setAbsences(r.data)).catch(console.error).finally(() => setLoadA(false))
    api.get('/api/notifications').then(r => setNotifs(r.data)).catch(console.error).finally(() => setLoadNt(false))
    api.get('/api/cours/today').then(r => setCours(r.data)).catch(console.error).finally(() => setLoadC(false))
    api.get('/api/devoirs').then(r => setDevoirs(r.data)).catch(console.error).finally(() => setLoadD(false))
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  return (
    <div style={{ fontFamily:ft, padding:'16px 0 40px', background:C.bg, minHeight:'100vh', color:C.text }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.4px', color:C.text, marginBottom:3 }}>
          Bonjour, {user?.firstName ?? 'toi'} 
        </h1>
        <p style={{ fontSize:12, color:C.hint }}>{today}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 200px', gap:8, marginBottom:8 }}>
        <MoyenneSection notes={notes} C={C}/>
        <AbsencesSection absences={absences} loading={loadA} C={C}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 250px', gap:8, marginBottom:8 }}>
        <CoursSection cours={cours} loading={loadC} C={C}/>
        <DevoirsSection devoirs={devoirs} loading={loadD} C={C}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <NotesSection notes={notes} loading={loadN} C={C}/>
        <ActualitesSection notifs={notifs} loading={loadNt} C={C} onSign={(notifId) => { if(notifId) sessionStorage.setItem('signed_'+notifId, '1'); setShowSign(true) }} onShowActu={() => setShowActu(true)}/>
      </div>

      <Library C={C}/>
      {showSign && createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:440, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <Signature onClose={() => setShowSign(false)}/>
      </div>
    </div>,
    document.body
  )}
      {showActu && <Actualites onClose={() => setShowActu(false)}/>}
    </div>
  )
}