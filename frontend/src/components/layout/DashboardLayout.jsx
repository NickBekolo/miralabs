import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { ChevronLeft, ChevronRight, Bell, Moon, Sun, LogOut, ChevronUp, ChevronDown, Settings, Menu } from 'lucide-react'

import AvatarUser from '../shared/AvatarUser'
import ProfilContent from '../profil/ProfilContent'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function DashboardLayout({ nav, children, role, defaultActive }) {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const [active, setActive]         = useState(defaultActive || nav[0]?.id || 'accueil')
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(()=>{ const fn=()=>setIsMobile(window.innerWidth<768); window.addEventListener('resize',fn); return()=>window.removeEventListener('resize',fn) },[])
  const [profileOpen, setProfileOpen] = useState(false)
  const [showProfil, setShowProfil] = useState(false)

  const logout = () => { sessionStorage.clear(); sessionStorage.clear(); window.location.href='/' }

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
        {!collapsed && <div style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.8px', color:C.text, fontFamily:ft }}>Miralabs.</div>}
        <button onClick={() => setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, marginLeft:collapsed?'auto':0, padding:4 }}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
        {nav.map(({ id, label, icon:Icon }) => {
          const isActive = active === id
          return (
            <button key={id} data-nav={id} onClick={() => { setActive(id); setMobileOpen(false) }}
              style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'9px 12px', borderRadius:8, border:'none', background:isActive?C.surface2:'transparent', color:isActive?C.text:C.muted, fontSize:13, fontWeight:isActive?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background=C.surface)}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background='transparent')}>
              <Icon size={18} strokeWidth={1.8} color={isActive?C.text:C.muted}/>
              {!collapsed && <span style={{fontWeight:400}}>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Profil */}
      <div style={{ borderTop:`1px solid ${C.surface2}`, paddingTop:12, position:'relative' }}>
        <button onClick={() => setProfileOpen(s=>!s)}
          style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'space-between', gap:8, padding:collapsed?'10px 0':'10px 12px', borderRadius:10, border:'none', background:profileOpen?C.surface2:'transparent', cursor:'pointer', fontFamily:ft, width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={30}/>
            {!collapsed && (
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize:11, color:C.muted }}>{role}</div>
              </div>
            )}
          </div>
          {!collapsed && (profileOpen ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>)}
        </button>

        {profileOpen && !collapsed && (
          <div style={{ position:'absolute', bottom:'100%', left:0, right:0, background:C.bg, borderRadius:14, border:`1px solid ${C.surface2}`, padding:8, marginBottom:6, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:100 }}>
            <div style={{ padding:'10px 12px', marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize:11, color:C.muted }}>{role}</div>
            </div>
            <div style={{ height:1, background:C.surface2, margin:'4px 0' }}/>
            <button onClick={() => { setShowProfil(true); setProfileOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, border:'none', background:'none', color:C.text, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={16}/>
              Mon profil
            </button>
            <button onClick={() => { setActive('params'); setProfileOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, border:'none', background:'none', color:C.text, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <Settings size={15} color={C.muted}/>
              Paramètres
            </button>
            <div style={{ height:1, background:C.surface2, margin:'4px 0' }}/>
            <button onClick={toggleDarkMode}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:8, border:'none', background:'none', color:C.text, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {darkMode ? <Sun size={15} color={C.muted}/> : <Moon size={15} color={C.muted}/>}
                Thème
              </div>
              <span style={{ fontSize:11, color:C.muted, background:C.surface2, padding:'2px 8px', borderRadius:20 }}>{darkMode?'Sombre':'Clair'}</span>
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, border:'none', background:'none', color:C.text, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <div style={{ width:15, height:15, borderRadius:'50%', background:'linear-gradient(135deg, #007AFF, #FF3B9A)', flexShrink:0 }}/>
              Personnalisation
            </button>
            <div style={{ height:1, background:C.surface2, margin:'4px 0' }}/>
            <button onClick={logout}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,59,48,0.06)'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <LogOut size={15}/>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const activeItem = nav.find(n => n.id === active)

  return (
    <>
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>

      {/* Sidebar desktop */}
      {!isMobile && <div style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, padding:'18px 10px', height:'100vh', transition:'width 0.25s ease', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <SidebarContent/>
      </div>}

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex' }}>
          <div style={{ width:240, background:C.sidebar, padding:'18px 10px', height:'100vh', display:'flex', flexDirection:'column' }}>
            <SidebarContent/>
          </div>
          <div onClick={() => setMobileOpen(false)} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
        </div>
      )}

      {/* Contenu */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:active==='edt'?'none':`1px solid ${C.surface2}`, flexShrink:0 }}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>{isMobile&&<button onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',cursor:'pointer',color:C.text,display:'flex',alignItems:'center'}}><Menu size={20}/></button>}<div style={{ fontSize:16, fontWeight:600, color:C.text }}>{activeItem?.label}</div></div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={18} color={C.muted} strokeWidth={1.5}/>
            <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={30}/>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {children(active, C)}
        </div>
      </div>
    </div>

    {/* Panneau profil */}
    {showProfil && (
      <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
        <div onClick={() => setShowProfil(false)} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
        <div style={{ width:480, background:C.bg, height:'100vh', overflowY:'auto', borderLeft:`1px solid ${C.surface2}`, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
            <div style={{ fontSize:16, fontWeight:600, color:C.text }}>Mon profil</div>
            <button onClick={() => setShowProfil(false)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:20 }}>✕</button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:24 }}>
            <ProfilContent C={C} onClose={() => setShowProfil(false)}/>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
