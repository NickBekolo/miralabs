import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const sf = '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'

export default function Absences() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [absences, setAbsences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/absences')
      .then(res => { setAbsences(res.data); setLoading(false) })
      .catch(() => { setError('Impossible de charger les absences.'); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ fontFamily: sf, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Chargement...</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer'
          }}>←</button>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', margin: 0 }}>Absences</h1>
        </div>

        <p style={{ color: '#6b7280', marginBottom: 24 }}>{user?.firstName} {user?.lastName}</p>

        {absences.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
            Aucune absence enregistrée.
          </div>
        ) : (
          absences.map(absence => (
            <div key={absence.id} style={{
              background: '#fff', borderRadius: 16, padding: 20, marginBottom: 12,
              borderLeft: `4px solid ${absence.justifiee ? '#059669' : '#dc2626'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{absence.date}</div>
                  {absence.heureDebut && (
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                      {absence.heureDebut} — {absence.heureFin}
                    </div>
                  )}
                  {absence.motif && (
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{absence.motif}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                  background: absence.justifiee ? '#d1fae5' : '#fee2e2',
                  color: absence.justifiee ? '#059669' : '#dc2626'
                }}>
                  {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
