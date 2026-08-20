import { useEffect, useState } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useAuth } from '../../context/AuthContext'
import { User, Settings, Palette, LogOut, X } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function ProfilMenu({ onClose, onNavigate }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 10) }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose?.(), 250)
  }

  const go = (page) => {
    setVisible(false)
    setTimeout(() => { onClose?.(); onNavigate?.(page) }, 250)
  }

  const logout = () => {
    localStorage.clear(); sessionStorage.clear(); window.location.reload()
  }

  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase() || 'M'

  const items = [
    { icon: User,    label: 'Profil',          sub: 'Voir et modifier ton profil',   page: 'profil' },
    { icon: Palette, label: 'Personnalisation', sub: 'Thème, police, couleur',        page: 'params' },
    { icon: Settings,label: 'Paramètres',       sub: "Préférences de l'application",  page: 'profil' },
  ]

  return (
    <>
      <div onClick={handleClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(4px)', zIndex:500, opacity:visible?1:0, transition:'opacity 0.25s' }}/>
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:501, background:C.bg, borderRadius:'20px 20px 0 0', fontFamily:ft, transform:visible?'translateY(0)':'translateY(100%)', transition:'transform 0.28s cubic-bezier(0.32,0.72,0,1)' }}>

        <div style={{ width:36, height:4, borderRadius:2, background:C.surface2, margin:'12px auto 0' }}/>

        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'20px 20px 16px', borderBottom:`1px solid ${C.surface2}` }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, letterSpacing:'-0.3px' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize:13, color:C.muted }}>{user?.email}</div>
          </div>
          <button onClick={handleClose} style={{ marginLeft:'auto', width:28, height:28, borderRadius:'50%', background:C.surface, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} color={C.muted} strokeWidth={2}/>
          </button>
        </div>

        <div style={{ padding:'8px 12px' }}>
          {items.map(({ icon: Icon, label, sub, page }, i) => (
            <button key={i} onClick={() => go(page)}
              style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'12px 10px', background:'none', border:'none', borderRadius:12, cursor:'pointer', textAlign:'left', fontFamily:ft, transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background=C.surface}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{ width:36, height:36, borderRadius:10, background:C.surface, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={17} color={C.text} strokeWidth={1.8}/>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:500, color:C.text }}>{label}</div>
                <div style={{ fontSize:12, color:C.muted }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding:'0 12px 32px', borderTop:`1px solid ${C.surface2}` }}>
          <button onClick={logout}
            style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'12px 10px', background:'none', border:'none', borderRadius:12, cursor:'pointer', textAlign:'left', fontFamily:ft, marginTop:4 }}
            onMouseEnter={e => e.currentTarget.style.background=C.surface}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,59,48,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <LogOut size={17} color="#FF3B30" strokeWidth={1.8}/>
            </div>
            <div style={{ fontSize:15, fontWeight:500, color:'#FF3B30' }}>Déconnexion</div>
          </button>
        </div>
      </div>
    </>
  )
}
