import { useState } from 'react'

const sf = '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
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

        {/* Retour */}
        <a href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: '#9ca3af', textDecoration: 'none',
          fontWeight: '500', marginBottom: '48px',
        }}>
          ← Retour
        </a>

        {!sent ? (
          <>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '30px', fontWeight: '600', letterSpacing: '-1.4px', color: '#0a0a0a', marginBottom: '8px' }}>
                Mot de passe oublié
              </div>
              <div style={{ fontSize: '15px', color: '#9ca3af', fontWeight: '400', letterSpacing: '-0.2px', lineHeight: '1.6' }}>
                Entre ton adresse email et on t'envoie un lien pour réinitialiser ton mot de passe.
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <button
                type="submit"
                style={{
                  width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf,
                  fontWeight: '600', color: '#fff', background: '#0a0a0a', border: 'none',
                  borderRadius: '980px', cursor: 'pointer', letterSpacing: '-0.3px',
                  transition: 'background 0.2s, transform 0.1s', boxSizing: 'border-box',
                }}
                onMouseEnter={e => e.target.style.background = '#222'}
                onMouseLeave={e => e.target.style.background = '#0a0a0a'}
                onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.target.style.transform = 'scale(1)'}
              >
                Envoyer le lien
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                
              }}>

              </div>
              <div style={{ fontSize: '30px', fontWeight: '600', letterSpacing: '-1.4px', color: '#0a0a0a', marginBottom: '8px' }}>
                Email envoyé
              </div>
              <div style={{ fontSize: '15px', color: '#9ca3af', letterSpacing: '-0.2px', lineHeight: '1.6' }}>
                Un lien de réinitialisation a été envoyé à <strong style={{ color: '#0a0a0a' }}>{email}</strong>. Vérifie ta boîte mail.
              </div>
            </div>

            <a href="/login">
              <button style={{
                width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf,
                fontWeight: '600', color: '#fff', background: '#0a0a0a', border: 'none',
                borderRadius: '980px', cursor: 'pointer', letterSpacing: '-0.3px',
                boxSizing: 'border-box', 
              }}>
                Retour à la connexion
              </button>
            </a>
          </>
        )}

      </div>
    </div>
  )
}