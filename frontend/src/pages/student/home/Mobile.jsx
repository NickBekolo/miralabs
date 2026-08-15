import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../../store/ThemeStore'
import api from '../../../services/api'
import MoyenneChart from '../../../components/charts/MoyenneChart'

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

function avg(notes) {
  if (!notes.length) return 0
  const total = notes.reduce((s, n) => s + (n.valeur / n.noteSur) * 20, 0)
  return Math.round((total / notes.length) * 10) / 10
}

function buildDatasets(notes) {
  return {
    general: {
      label: 'Moyenne générale',
      points: notes.map(n => ({
        label: n.createdAt,
        val: Math.round((n.valeur / n.noteSur) * 200) / 10,
        classe: 12, rang: 1,
      })),
    }
  }
}

export default function Mobile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME

  const [notes,   setNotes]   = useState([])
  const [cours,   setCours]   = useState([])
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/notes'),
      api.get('/api/cours/today'),
      api.get('/api/notifications'),
    ]).then(([n, c, nt]) => {
      setNotes(n.data)
      setCours(c.data)
      setNotifs(nt.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const moyenne  = avg(notes)
  const datasets = buildDatasets(notes)

  return (
    <div style={{ fontFamily:ft, background:C.bg, color:C.text, paddingBottom:20, minHeight:'100%' }}>

      {/* Salutation */}
      <div style={{ padding:'16px 16px 4px' }}>
        <div style={{ fontSize:20, fontWeight:600, color:C.text, letterSpacing:'-0.3px' }}>
          Bonjour, {user?.firstName ?? 'toi !'}
        </div>
        <div style={{ fontSize:12, color:C.hint, marginTop:2 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
        </div>
      </div>

      {/* Carte moyenne */}
      <div style={{ margin:'12px 16px', background:C.surface, borderRadius:20, padding:'10px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:12, color:C.hint, marginBottom:2 }}>Moyenne générale</div>
            <div style={{ fontSize:11, color:C.hint }}>2025 à 2026</div>
          </div>
          <div style={{ fontSize:28, fontWeight:700, color:C.text, letterSpacing:'-0.8px' }}>
            {moyenne}<span style={{ fontSize:14, color:C.muted }}>/20</span>
          </div>
        </div>
        {notes.length > 0 && <MoyenneChart datasets={datasets} defaultKey="general"/>}
      </div>

      {/* Cours du jour */}
      <div style={{ padding:'0 16px', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Aujourd'hui</span>
          <button onClick={() => navigate('/student/edt')}
            style={{ fontSize:12, color:C.muted, background:C.surface, border:'none', padding:'5px 12px', borderRadius:980, cursor:'pointer', fontFamily:ft }}>
            Voir l'EDT →
          </button>
        </div>

        {loading ? (
          <div style={{ background:C.surface, borderRadius:16, padding:16, fontSize:12, color:C.hint }}>Chargement...</div>
        ) : cours.length === 0 ? (
          <div style={{ background:C.surface, borderRadius:16, padding:16, fontSize:12, color:C.hint, textAlign:'center' }}>Aucun cours aujourd'hui</div>
        ) : cours.map((c) => (
          <div key={c.id} style={{
            background: c.isAnnule ? 'rgba(255,85,85,0.06)' : C.surface,
            border: c.isAnnule ? '1px solid rgba(255,85,85,0.2)' : 'none',
            borderRadius:16, padding:'14px 16px', marginBottom:8,
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, fontWeight:600, color: c.isAnnule ? '#ff5555' : '#4ade80' }}>
                {c.isAnnule ? 'Annulé · ' : ''}{c.heureDebut} → {c.heureFin}
              </span>
              <span style={{ fontSize:11, color:C.hint }}>Cours</span>
            </div>
            <div style={{ fontSize:16, fontWeight:700, color: c.isAnnule ? C.muted : C.text, marginBottom:4 }}>{c.matiere.nom}</div>
            <div style={{ fontSize:12, color:C.muted }}>
              Salle <strong style={{ color:C.text }}>{c.salle}</strong>
              {c.enseignant && <> · <strong style={{ color:C.text }}>{c.enseignant.firstName} {c.enseignant.lastName}</strong></>}
            </div>
          </div>
        ))}
      </div>

      {/* Notes récentes */}
      <div style={{ padding:'0 16px', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Dernières notes</span>
          <button onClick={() => navigate('/student/notes')}
            style={{ fontSize:12, color:C.muted, background:C.surface, border:'none', padding:'5px 12px', borderRadius:980, cursor:'pointer', fontFamily:ft }}>
            Voir tout →
          </button>
        </div>

        <div style={{ background:C.surface, borderRadius:16, overflow:'hidden' }}>
          {loading ? (
            <div style={{ padding:16, fontSize:12, color:C.hint }}>Chargement...</div>
          ) : notes.length === 0 ? (
            <div style={{ padding:16, fontSize:12, color:C.hint, textAlign:'center' }}>Aucune note</div>
          ) : notes.slice(0,4).map((n, i) => {
            const sur20 = Math.round((n.valeur / n.noteSur) * 200) / 10
            const low   = sur20 < 10
            return (
              <div key={n.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px',
                borderBottom: i < Math.min(notes.length,4)-1 ? `1px solid ${C.surface2}` : 'none',
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color: low ? '#ff5555' : C.text }}>{sur20}/20</div>
                  <div style={{ fontSize:12, color:C.muted }}>{n.matiere.nom}</div>
                  {n.commentaire && <div style={{ fontSize:11, color:C.hint }}>{n.commentaire}</div>}
                </div>
                <div style={{ fontSize:11, color:C.hint }}>{n.createdAt}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notifications */}
      {notifs.length > 0 && (
        <div style={{ padding:'0 16px', marginBottom:12 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>Actualités</div>
          <div style={{ background:C.surface, borderRadius:16, overflow:'hidden' }}>
            {notifs.slice(0,3).map((n, i) => (
              <div key={n.id} style={{
                padding:'12px 16px',
                borderBottom: i < Math.min(notifs.length,3)-1 ? `1px solid ${C.surface2}` : 'none',
              }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:2 }}>{n.title}</div>
                <div style={{ fontSize:11, color:C.muted }}>{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}