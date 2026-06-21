import { useState } from 'react'

const sf = '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setError('')
    setDone(true)
  }

  return (
    <div style={{
      fontFamily: sf,
      background: '#fff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {!done ? (
          <>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '30px', fontWeight: '600', letterSpacing: '-1.4px', color: '#0a0a0a', marginBottom: '8px' }}>
                Nouveau mot de passe
              </div>
              <div style={{ fontSize: '15px', color: '#9ca3af', letterSpacing: '-0.2px', lineHeight: '1.6' }}>
                Choisis un nouveau mot de passe pour ton compte.
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fafafa', border: '1px solid #e5e5e5',
                borderLeft: '3px solid #0a0a0a', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '20px',
                fontSize: '13px', color: '#0a0a0a', letterSpacing: '-0.1px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: '12px' }}>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '16px 18px', fontSize: '16px',
                    fontFamily: sf, color: '#0a0a0a', background: '#f9f9f9',
                    border: '1px solid #e5e5e5', borderRadius: '14px', outline: 'none',
                    letterSpacing: '-0.2px', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0a0a0a'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#f9f9f9' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '16px 18px', fontSize: '16px',
                    fontFamily: sf, color: '#0a0a0a', background: '#f9f9f9',
                    border: '1px solid #e5e5e5', borderRadius: '14px', outline: 'none',
                    letterSpacing: '-0.2px', boxSizing: 'border-box',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0a0a0a'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#f9f9f9' }}
                />
              </div>

              {/* Indicateur force mot de passe */}
              {password.length > 0 && (
                <div style={{ marginBottom: '24px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: password.length >= i * 3 ? '#0a0a0a' : '#f0f0f0',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {password.length < 4 ? 'Trop court' : password.length < 8 ? 'Moyen' : password.length < 12 ? 'Bien' : 'Fort'}
                  </div>
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf,
                  fontWeight: '600', color: '#fff', background: '#0a0a0a', border: 'none',
                  borderRadius: '980px', cursor: 'pointer', letterSpacing: '-0.3px',
                  transition: 'background 0.2s, transform 0.1s', boxSizing: 'border-box',
                  marginTop: password.length > 0 ? '0' : '20px',
                }}
                onMouseEnter={e => e.target.style.background = '#222'}
                onMouseLeave={e => e.target.style.background = '#0a0a0a'}
                onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.target.style.transform = 'scale(1)'}
              >
                Réinitialiser
              </button>

            </form>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: '#f9f9f9', border: '1px solid #e5e5e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', marginBottom: '24px',
              }}>
                ✓
              </div>
              <div style={{ fontSize: '30px', fontWeight: '600', letterSpacing: '-1.4px', color: '#0a0a0a', marginBottom: '8px' }}>
                Mot de passe mis à jour
              </div>
              <div style={{ fontSize: '15px', color: '#9ca3af', letterSpacing: '-0.2px', lineHeight: '1.6' }}>
                Ton mot de passe a été réinitialisé avec succès.
              </div>
            </div>

            <a href="/login">
              <button style={{
                width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf,
                fontWeight: '600', color: '#fff', background: '#0a0a0a', border: 'none',
                borderRadius: '980px', cursor: 'pointer', letterSpacing: '-0.3px',
                boxSizing: 'border-box',
              }}>
                Se connecter
              </button>
            </a>
          </>
        )}

      </div>
    </div>
  )
}