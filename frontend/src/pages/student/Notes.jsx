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

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:'28px 20px', fontFamily:ft }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:500, letterSpacing:'-0.5px', color:C.text, marginBottom:3 }}>Notes</h1>
          <p style={{ fontSize:12, color:C.hint }}>{user?.firstName} {user?.lastName}</p>
        </div>

        {/* Moyenne globale */}
        {notes.length > 0 && (
          <div style={{ background:C.surface, borderRadius:14, padding:'16px 20px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:11, color:C.hint, marginBottom:3 }}>Moyenne générale</div>
              <div style={{ fontSize:13, color:C.muted }}>{notes.length} note(s) · {Object.keys(grouped).length} matière(s)</div>
            </div>
            <div style={{ fontSize:32, fontWeight:500, color:C.text, letterSpacing:'-1px' }}>
              {moyenneGlobale(notes)}<span style={{ fontSize:14, color:C.muted }}>/20</span>
            </div>
          </div>
        )}

        {/* Notes par matière */}
        {notes.length === 0 ? (
          <div style={{ background:C.surface, borderRadius:14, padding:32, textAlign:'center', color:C.hint, fontSize:13 }}>
            Aucune note pour le moment.
          </div>
        ) : (
          Object.entries(grouped).map(([matiere, liste]) => {
            const moy = moyenne(liste)
            const low = parseFloat(moy) < 10
            return (
              <div key={matiere} style={{ background:C.surface, borderRadius:14, padding:'16px 20px', marginBottom:10 }}>
                {/* Header matière */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{matiere}</div>
                    <div style={{ fontSize:11, color:C.hint }}>{liste.length} note(s)</div>
                  </div>
                  <div style={{
                    fontSize:20, fontWeight:500,
                    color: low ? '#ff5555' : C.text,
                    letterSpacing:'-0.5px',
                  }}>
                    {moy}<span style={{ fontSize:12, color:C.muted }}>/20</span>
                  </div>
                </div>

                {/* Liste des notes */}
                {liste.map((note, i) => {
                  const sur20 = Math.round((note.valeur / note.noteSur) * 200) / 10
                  const isLow = sur20 < 10
                  return (
                    <div key={note.id} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'10px 0',
                      borderTop: `1px solid ${C.surface2}`,
                    }}>
                      <div>
                        <div style={{ fontSize:12, color:C.muted }}>{note.createdAt}</div>
                        {note.commentaire && (
                          <div style={{ fontSize:11, color:C.hint, marginTop:2 }}>{note.commentaire}</div>
                        )}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:C.hint }}>{note.valeur}/{note.noteSur}</span>
                        <span style={{
                          fontSize:16, fontWeight:500,
                          padding:'3px 10px', borderRadius:8,
                          background: isLow ? 'rgba(255,85,85,0.1)' : C.surface2,
                          color: isLow ? '#ff5555' : C.text,
                        }}>
                          {sur20}/20
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}