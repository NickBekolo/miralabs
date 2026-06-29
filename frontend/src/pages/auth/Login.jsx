import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const sf = '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [debug, setDebug] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setDebug('Envoi en cours...')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      setDebug('Reponse : ' + JSON.stringify(res.data))
      login(res.data.user, res.data.token)
      const roles = res.data.user.roles
      if (roles.includes('ROLE_ADMIN')) navigate('/superadmin/dashboard')
      else if (roles.includes('ROLE_PROF')) navigate('/enseignant/home')
      else if (roles.includes('ROLE_PARENT')) navigate('/parent/dashboard')
      else navigate('/student/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erreur inconnue'
      setDebug('Erreur : ' + msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: sf, background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '52px' }}>
          <div style={{ fontSize: '30px', fontWeight: '600', color: '#0a0a0a', marginBottom: '6px' }}>Miralabs.</div>
          <div style={{ fontSize: '15px', color: '#9ca3af' }}>Connecte-toi a ton espace</div>
        </div>
        {debug && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#0369a1', wordBreak: 'break-all' }}>
            {debug}
          </div>
        )}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <input type="email" placeholder="Adresse email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '16px 18px', fontSize: '16px', fontFamily: sf, color: '#0a0a0a', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '16px 18px', fontSize: '16px', fontFamily: sf, color: '#0a0a0a', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf, fontWeight: '600', color: '#fff', background: loading ? '#555' : '#0a0a0a', border: 'none', borderRadius: '980px', cursor: 'pointer', boxSizing: 'border-box' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
