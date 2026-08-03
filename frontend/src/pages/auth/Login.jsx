import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useThemeStore } from '../../store/ThemeStore'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const sf = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif"

export default function Login() {
  const navigate  = useNavigate()
  const dark      = useThemeStore(s => s.darkMode)
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const bg      = dark ? '#0a0a0a' : '#ffffff'
  const text    = dark ? '#ffffff' : '#0a0a0a'
  const muted   = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
  const inputBg = dark ? '#111111' : '#f9f9f9'
  const border  = dark ? '#2a2a2a' : '#e5e5e5'

  const login = async () => {
    if (!email.trim() || !pass.trim()) { setError('Remplis tous les champs.'); return }
    setLoading(true); setError('')
    try {
      const r = await api.post('/api/auth/login', { email, password: pass })
      localStorage.setItem('token', r.data.token)
      localStorage.setItem('user', JSON.stringify(r.data.user))
      const roles = r.data.user?.roles || []
      if (roles.includes('ROLE_SUPER_ADMIN_PLATEFORME')) navigate('/platform/dashboard')
      else if (roles.includes('ROLE_SUPER_ADMIN')) navigate('/superadmin/dashboard')
      else if (roles.includes('ROLE_DIRECTEUR')) navigate('/directeur/dashboard')
      else if (roles.includes('ROLE_ADMIN')) navigate('/admin/dashboard')
      else if (roles.includes('ROLE_TEACHER')) navigate('/enseignant/home')
      else navigate('/student/dashboard')
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily:sf, background:bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
      <div style={{ width:'100%', maxWidth:380 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:28, fontWeight:500, color:text, letterSpacing:'-1px' }}>Miralabs.</div>
          <div style={{ fontSize:14, color:muted, marginTop:6 }}>Connecte-toi à ton compte</div>
        </div>

        {/* Champs */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Email"
            style={{ width:'100%', border:`1.5px solid ${border}`, background:'#fff', borderRadius:980, padding:'14px 20px', fontSize:15, fontFamily:sf, color:text, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = dark?'#555':'#aaa'}
            onBlur={e => e.target.style.borderColor = border}
          />

          {/* Mot de passe */}
          <div style={{ position:'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Mot de passe"
              style={{ width:'100%', border:`1.5px solid ${border}`, background:'#fff', borderRadius:980, padding:'14px 20px', fontSize:15, fontFamily:sf, color:text, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = dark?'#555':'#aaa'}
              onBlur={e => e.target.style.borderColor = border}
            />
            <button onClick={() => setShowPw(s => !s)} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
              {showPw ? <EyeOff size={17} color={muted} strokeWidth={1.8}/> : <Eye size={17} color={muted} strokeWidth={1.8}/>}
            </button>
          </div>

          {/* Mot de passe oublié */}
          <div style={{ textAlign:'right' }}>
            <span style={{ fontSize:13, color:muted, cursor:'pointer' }}>Mot de passe oublié ?</span>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{ fontSize:13, color:'#FF3B30', textAlign:'center' }}>
              {error}
            </div>
          )}

          {/* Bouton */}
          <button onClick={login} disabled={loading}
            style={{ width:'100%', padding:'14px 0', fontSize:15, fontWeight:500, fontFamily:sf, color:dark?'#0a0a0a':'#ffffff', background:dark?'#ffffff':'#0a0a0a', border:'none', borderRadius:980, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginTop:4, transition:'opacity 0.2s' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

        </div>
      </div>
    </div>
  )
}
