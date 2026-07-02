import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'

const sf = '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'

export default function ChangePassword() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const email     = location.state?.email ?? ''

  const [step,     setStep]    = useState(1) // 1 = envoyer email, 2 = saisir token+mdp
  const [token,    setToken]   = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [sent,     setSent]     = useState(false)

  // Étape 1 — déclencher l'envoi du lien
  const handleSendLink = async () => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
      setStep(2)
    } catch {
      setError("Impossible d'envoyer le lien. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 — changer le mot de passe avec le token reçu par email
  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/auth/reset-password', { token, password })
      navigate('/login', { state: { message: 'Mot de passe changé avec succès. Reconnectez-vous.' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Token invalide ou expiré.')
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

        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#0a0a0a', marginBottom: '6px', letterSpacing:'-0.5px' }}>
            Miralabs.
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#0a0a0a', marginBottom: '8px' }}>
            Changement de mot de passe requis
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
            Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant d'accéder à votre espace.
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #fecaca',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
            fontSize: '14px', color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        {/* Étape 1 — envoyer le lien */}
        {step === 1 && (
          <div>
            <div style={{ background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px', fontSize: '14px', color: '#374151' }}>
              Un lien de réinitialisation sera envoyé à :<br/>
              <strong style={{ color: '#0a0a0a' }}>{email}</strong>
            </div>
            <button
              onClick={handleSendLink} disabled={loading}
              style={btnStyle(loading)}
            >
              {loading ? 'Envoi...' : 'Recevoir le lien par email'}
            </button>
          </div>
        )}

        {/* Étape 2 — saisir token + nouveau mdp */}
        {step === 2 && (
          <form onSubmit={handleReset}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#166534' }}>
              ✓ Lien envoyé à {email}. Copiez le token depuis l'email et saisissez-le ci-dessous.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                placeholder="Token reçu par email"
                value={token} onChange={e => setToken(e.target.value)} required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="password" placeholder="Nouveau mot de passe"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="password" placeholder="Confirmer le mot de passe"
                value={confirm} onChange={e => setConfirm(e.target.value)} required
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? 'Enregistrement...' : 'Définir mon mot de passe'}
            </button>
          </form>
        )}
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

const btnStyle = (loading) => ({
  width: '100%', padding: '16px', fontSize: '16px',
  fontFamily: sf, fontWeight: '600', color: '#fff',
  background: loading ? '#555' : '#0a0a0a',
  border: 'none', borderRadius: '980px',
  cursor: loading ? 'not-allowed' : 'pointer',
  boxSizing: 'border-box',
})