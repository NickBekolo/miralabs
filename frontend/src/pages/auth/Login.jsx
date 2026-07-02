import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const sf = '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'

const ROLE_ROUTES = {
  ROLE_ADMIN:                '/superadmin/dashboard',
  ROLE_SUPER_ADMIN:          '/superadmin/dashboard',
  ROLE_DIRECTEUR:            '/directeur/dashboard',
  ROLE_DIRECTEUR_ADJOINT:    '/directeur/dashboard',
  ROLE_SERVICE_PEDAGOGIQUE:  '/pedagogique/dashboard',
  ROLE_CPE:                  '/cpe/dashboard',
  ROLE_SECRETARIAT:          '/secretariat/dashboard',
  ROLE_COMPTABILITE:         '/comptabilite/dashboard',
  ROLE_SURVEILLANT:          '/surveillant/dashboard',
  ROLE_TEACHER:              '/enseignant/home',
  ROLE_PARENT:               '/parent/dashboard',
  ROLE_STUDENT:              '/student/dashboard',
}

function getRedirectRoute(roles) {
  const priority = [
    'ROLE_ADMIN','ROLE_SUPER_ADMIN','ROLE_DIRECTEUR','ROLE_DIRECTEUR_ADJOINT',
    'ROLE_SERVICE_PEDAGOGIQUE','ROLE_CPE','ROLE_SECRETARIAT','ROLE_COMPTABILITE',
    'ROLE_SURVEILLANT','ROLE_TEACHER','ROLE_PARENT','ROLE_STUDENT',
  ]
  for (const role of priority) {
    if (roles.includes(role)) return ROLE_ROUTES[role]
  }
  return '/student/dashboard'
}

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res   = await api.post('/api/auth/login', { email, password })
      const user  = res.data.user
      const token = res.data.token

      login(user, token)

      // Si changement de mot de passe requis → page dédiée
      if (user.mustChangePassword) {
        navigate('/change-password', { state: { email: user.email } })
        return
      }

      navigate(getRedirectRoute(user.roles))
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: sf, background: '#fff', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '52px' }}>
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px', letterSpacing:'-0.5px' }}>
            Miralabs.
          </div>
          <div style={{ fontSize: '15px', color: '#9ca3af' }}>
            Connecte-toi à ton espace
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #fecaca',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
            fontSize: '14px', color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="email" placeholder="Adresse email"
              value={email} onChange={e => setEmail(e.target.value)} required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="password" placeholder="Mot de passe"
              value={password} onChange={e => setPassword(e.target.value)} required
              style={inputStyle}
            />
          </div>

          {/* Lien mot de passe oublié */}
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf,
              fontWeight: '600', color: '#fff',
              background: loading ? '#555' : '#0a0a0a',
              border: 'none', borderRadius: '980px', cursor: loading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box', transition: 'background 0.15s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '16px 18px', fontSize: '16px',
  fontFamily: sf, color: '#0a0a0a', background: '#f9f9f9',
  border: '1px solid #e5e5e5', borderRadius: '14px',
  outline: 'none', boxSizing: 'border-box',
}