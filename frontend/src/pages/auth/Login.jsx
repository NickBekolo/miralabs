import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { useThemeStore } from '../../store/ThemeStore'
import api from '../../services/api'

const sf = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function Login() {
  const navigate  = useNavigate()
  const dark      = useThemeStore(s => s.darkMode)
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const bg     = dark ? '#0a0a0a' : '#ffffff'
  const text   = dark ? '#ffffff' : '#0a0a0a'
  const muted  = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
  const inputBg = dark ? '#111' : '#fff'
  const border  = dark ? '#2a2a2a' : '#e5e5e5'

  const login = async () => {
    if (!email.trim() || !pass.trim()) { setError('Remplis tous les champs.'); return }
    setLoading(true); setError('')
    try {
      const etab = JSON.parse(localStorage.getItem('etablissement') || '{}')
      const r = await api.post('/api/auth/login', { email: email.trim(), password: pass, etablissementId: etab?.id ?? null })
      localStorage.setItem('token', r.data.token)
      localStorage.setItem('user', JSON.stringify(r.data.user))
      const roles = r.data.user?.roles || []
      if (roles.includes('ROLE_SUPER_ADMIN_PLATEFORME')) navigate('/platform/dashboard')
      else if (roles.includes('ROLE_SUPER_ADMIN'))       navigate('/superadmin/dashboard')
      else if (roles.includes('ROLE_DIRECTEUR'))         navigate('/directeur/dashboard')
      else if (roles.includes('ROLE_ADMIN'))             navigate('/admin/dashboard')
      else if (roles.includes('ROLE_TEACHER'))           navigate('/enseignant/home')
      else navigate('/student/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message
      if (msg) setError(msg)
      else setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        input:focus { outline: none !important; box-shadow: none !important; border-color: #2F2F2F !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px ${inputBg} inset !important; -webkit-text-fill-color: ${dark?'#fff':'#0a0a0a'} !important; }
      `}</style>
    <div style={{ fontFamily:sf, background:bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
      <div style={{ width:'100%', maxWidth:380 }}>

        {/* Bouton retour */}
        <button onClick={() => { localStorage.removeItem('api_url'); localStorage.removeItem('etablissement'); navigate('/') }}
          style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:text, fontFamily:sf, fontSize:14, fontWeight:500, padding:0, marginBottom:24 }}>
          <ChevronLeft size={16} strokeWidth={2}/> Retour
        </button>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:28, fontWeight:500, color:text, letterSpacing:'-0.5px' }}>Miralabs.</div>
          <div style={{ fontSize:14, color:muted, marginTop:6 }}>Connecte-toi à ton compte</div>
        </div>

        {/* Champs */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Email"
            style={{ width:'100%', boxSizing:'border-box', border:`1.5px solid ${border}`, background:inputBg, borderRadius:980, padding:'14px 20px', fontSize:15, fontFamily:sf, color:dark?'#fff':'#0a0a0a', outline:'none' }}
            onFocus={e=>e.target.style.border='1.5px solid #2F2F2F'}
            onBlur={e=>e.target.style.border=`1.5px solid ${border}`}/>

          <div style={{ position:'relative' }}>
            <input type={showPw?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Mot de passe"
              style={{ width:'100%', boxSizing:'border-box', border:`1.5px solid ${border}`, background:inputBg, borderRadius:980, padding:'14px 48px 14px 20px', fontSize:15, fontFamily:sf, color:dark?'#fff':'#0a0a0a', outline:'none' }}
              onFocus={e=>e.target.style.border='1.5px solid #2F2F2F'}
              onBlur={e=>e.target.style.border=`1.5px solid ${border}`}/>
            <button onClick={()=>setShowPw(s=>!s)}
              style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex' }}>
              {showPw ? <EyeOff size={17} color={muted}/> : <Eye size={17} color={muted}/>}
            </button>
          </div>

          <div style={{ textAlign:'right' }}>
            <a href="/forgot-password" style={{ fontSize:13, color:muted, textDecoration:'none' }}>Mot de passe oublié ?</a>
          </div>

          {error && <div style={{ color:'#FF3B30', fontSize:13, textAlign:'center' }}>{error}</div>}

          <button onClick={login} disabled={loading}
            style={{ width:'100%', padding:'14px 0', fontSize:15, fontWeight:500, fontFamily:sf, color:dark?'#0a0a0a':'#fff', background:dark?'#fff':'#0a0a0a', border:'none', borderRadius:980, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
