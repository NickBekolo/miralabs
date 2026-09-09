import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'

const ft = '-apple-system,"SF Pro Display",BlinkMacSystemFont,sans-serif'

function moyenne(liste) {
  if (!liste.length) return 0
  const total = liste.reduce((s, n) => s + (n.valeur / n.noteSur) * 20, 0)
  return (total / liste.length).toFixed(1)
}

function moyenneGlobale(notes) {
  if (!notes.length) return 0
  const total = notes.reduce((s, n) => s + (n.valeur / n.noteSur) * 20, 0)
  return (total / notes.length).toFixed(1)
}

function couleur(moy) {
  if (moy >= 14) return '#22c55e'
  if (moy >= 10) return '#f59e0b'
  return '#ef4444'
}

function BarreHorizontale({ label, moy, notes, C }) {
  const [open, setOpen] = useState(false)
  const pct = Math.min((parseFloat(moy) / 20) * 100, 100)
  const col = couleur(parseFloat(moy))

  return (
    <div style={{ background:C.surface, borderRadius:14, padding:'14px 18px', marginBottom:10 }}>
      {/* Ligne matière */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{label}</div>
          <div style={{ fontSize:11, color:C.hint }}>{notes.length} note(s)</div>
        </div>
        <div style={{ fontSize:20, fontWeight:600, color:col, letterSpacing:'-0.5px' }}>
          {moy}<span style={{ fontSize:12, color:C.muted, fontWeight:400 }}>/20</span>
        </div>
      </div>

      {/* Barre horizontale */}
      <div style={{ background:C.surface2, borderRadius:999, height:8, marginBottom:10, overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${pct}%`, borderRadius:999,
          background:col, transition:'width 0.6s ease'
        }}/>
      </div>

      {/* Bouton voir détails */}
      <button onClick={() => setOpen(!open)} style={{
        background:'none', border:'none', cursor:'pointer',
        fontSize:11, color:C.muted, padding:0
      }}>
        {open ? '▲ Masquer' : '▼ Voir les notes'}
      </button>

      {/* Détail des notes */}
      {open && (
        <div style={{ marginTop:10 }}>
          {notes.map((note, i) => {
            const sur20 = Math.round((note.valeur / note.noteSur) * 200) / 10
            const col2 = couleur(sur20)
            return (
              <div key={note.id} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0', borderTop:`1px solid ${C.surface2}`
              }}>
                <div>
                  <div style={{ fontSize:12, color:C.muted }}>{note.createdAt}</div>
                  {note.commentaire && <div style={{ fontSize:11, color:C.hint, marginTop:2 }}>{note.commentaire}</div>}
                </div>
                <div style={{ fontSize:16, fontWeight:600, color:col2 }}>
                  {sur20}<span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>/20</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Notes() {
  const { user }  = useAuth()
  const darkMode  = useThemeStore(s => s.darkMode)
  const C         = darkMode ? DARK_THEME : LIGHT_THEME
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    api.get('/api/notes')
      .then(res => setNotes(res.data))
      .catch(() => setError('Impossible de charger les notes.'))
      .finally(() => setLoading(false))
  }, [])

  const grouped = notes.reduce((acc, note) => {
    const mat = note.matiere.nom
    if (!acc[mat]) acc[mat] = []
    acc[mat].push(note)
    return acc
  }, {})

  if (loading) return (
    <div style={{ fontFamily:ft, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.bg }}>
      <p style={{ color:C.hint, fontSize:13 }}>Chargement des notes...</p>
    </div>
  )

  if (error) return (
    <div style={{ fontFamily:ft, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.bg }}>
      <p style={{ color:'#dc2626', fontSize:13 }}>{error}</p>
    </div>
  )

  const moyGen = moyenneGlobale(notes)
  const colGen = couleur(parseFloat(moyGen))

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:'28px 20px', fontFamily:ft }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>

        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:500, letterSpacing:'-0.5px', color:C.text, marginBottom:3 }}>Notes</h1>
          <p style={{ fontSize:12, color:C.hint }}>{user?.firstName} {user?.lastName}</p>
        </div>

        {/* Moyenne générale */}
        {notes.length > 0 && (
          <div style={{ background:C.surface, borderRadius:14, padding:'20px', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:C.hint, marginBottom:3 }}>Moyenne générale</div>
                <div style={{ fontSize:13, color:C.muted }}>{notes.length} note(s) · {Object.keys(grouped).length} matière(s)</div>
              </div>
              <div style={{ fontSize:36, fontWeight:600, color:colGen, letterSpacing:'-1px' }}>
                {moyGen}<span style={{ fontSize:14, color:C.muted, fontWeight:400 }}>/20</span>
              </div>
            </div>
            <div style={{ background:C.surface2, borderRadius:999, height:10, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:`${Math.min((parseFloat(moyGen)/20)*100,100)}%`,
                borderRadius:999, background:colGen, transition:'width 0.8s ease'
              }}/>
            </div>
          </div>
        )}

        {/* Notes par matière */}
        {notes.length === 0 ? (
          <div style={{ background:C.surface, borderRadius:14, padding:32, textAlign:'center', color:C.hint, fontSize:13 }}>
            Aucune note pour le moment.
          </div>
        ) : (
          Object.entries(grouped).map(([matiere, liste]) => (
            <BarreHorizontale
              key={matiere}
              label={matiere}
              moy={moyenne(liste)}
              notes={liste}
              C={C}
            />
          ))
        )}
      </div>
    </div>
  )
}
