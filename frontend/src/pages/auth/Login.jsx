import { useState } from 'react'

const sf = '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
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

        <div style={{ marginBottom: '52px' }}>
          <div style={{ fontSize: '30px', fontWeight: '600', letterSpacing: '-1.4px', color: '#0a0a0a', marginBottom: '6px' }}>
            Miralabs.
          </div>
          <div style={{ fontSize: '15px', color: '#9ca3af', fontWeight: '400', letterSpacing: '-0.2px' }}>
            Connecte-toi à ton espace
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '12px' }}>
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

          <div style={{ marginBottom: '8px' }}>
            <input
              type="password"
              placeholder="Mot de passe"
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

          <div style={{ textAlign: 'right', marginBottom: '28px' }}>
            <a href="/forgot-password" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', fontWeight: '500' }}>
              Mot de passe oublié ?
            </a>
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
            Se connecter
          </button>

        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          <span style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '500' }}>ou</span>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
        </div>

        <button
          style={{
            width: '100%', padding: '15px', fontSize: '15px', fontFamily: sf,
            fontWeight: '500', color: '#0a0a0a', background: '#fff',
            border: '1px solid #e5e5e5', borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', boxSizing: 'border-box',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          Pas encore de compte ?{' '}
          <a href="/register" style={{ color: '#0a0a0a', fontWeight: '600', textDecoration: 'none' }}>
            Créer un compte
          </a>
        </div>

      </div>
    </div>
  )
}