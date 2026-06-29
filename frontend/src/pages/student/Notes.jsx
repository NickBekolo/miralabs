import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import MoyenneChart from '../../components/charts/MoyenneChart'

const sf = '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/notes')
      .then(res => {
        setNotes(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Impossible de charger les notes.')
        setLoading(false)
      })
  }, [])

  const grouped = notes.reduce((acc, note) => {
    const mat = note.matiere.nom
    if (!acc[mat]) acc[mat] = []
    acc[mat].push(note)
    return acc
  }, {})

  const moyenne = (liste) => {
    if (!liste.length) return 0
    const total = liste.reduce((s, n) => s + (n.valeur / n.noteSur) * 20, 0)
    return (total / liste.length).toFixed(2)
  }

  if (loading) return (
    <div style={{ fontFamily: sf, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Chargement des notes...</p>
    </div>
  )

  if (error) return (
    <div style={{ fontFamily: sf, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#dc2626' }}>{error}</p>
    </div>
  )

  return (
    <div style={{ background: '#F2F2F2', minHeight: '100vh', padding: '32px 20px', fontFamily: sf }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Notes</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          {user?.firstName} {user?.lastName}
        </p>

        {notes.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
            Aucune note pour le moment.
          </div>
        ) : (
          Object.entries(grouped).map(([matiere, liste]) => (
            <div key={matiere} style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{matiere}</h2>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#0a0a0a' }}>{moyenne(liste)}/20</span>
              </div>
              {liste.map(note => (
                <div key={note.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderTop: '1px solid #f3f4f6'
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{note.createdAt}</div>
                    {note.commentaire && (
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{note.commentaire}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 18, fontWeight: 700,
                    color: note.valeur / note.noteSur >= 0.5 ? '#059669' : '#dc2626'
                  }}>
                    {note.valeur}/{note.noteSur}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
