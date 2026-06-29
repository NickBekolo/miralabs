import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const sf = '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Inter", sans-serif'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div style={{ fontFamily: sf, background: '#f9f9f9', minHeight: '100vh', padding: '40px 32px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px' }}>Miralabs.</div>
            <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 2 }}>
              Bonjour, {user?.firstName} {user?.lastName}
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={{
            padding: '10px 20px', borderRadius: 980, border: '1px solid #e5e5e5',
            background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: sf
          }}>
            Déconnexion
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div onClick={() => navigate('/notes')} style={{
            background: '#0a0a0a', color: '#fff', borderRadius: 20, padding: 28,
            cursor: 'pointer', transition: 'transform 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>Consulter les notes des élèves</div>
          </div>

          <div onClick={() => navigate('/absences')} style={{
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: 20, padding: 28,
            cursor: 'pointer', transition: 'transform 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Absences</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>Gérer les absences</div>
          </div>
        </div>

      </div>
    </div>
  )
}
