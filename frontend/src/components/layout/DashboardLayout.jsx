import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { ChevronLeft, ChevronRight, Bell, Moon, Sun, LogOut } from 'lucide-react'
import AvatarUser from '../shared/AvatarUser'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function DashboardLayout({ nav, children, role }) {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const [active, setActive]       = useState(nav[0]?.id || 'accueil')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href='/' }
  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase()

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
        {!collapsed && <div style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.8px', color:C.text, fontFamily:"-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>Miralabs.</div>}
        <button onClick={() => setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, marginLeft:collapsed?'auto':0, padding:4 }}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
        {nav.map(({ id, label, icon:Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => { setActive(id); setMobileOpen(false) }}
              style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'9px 12px', borderRadius:8, border:'none', background:isActive?C.surface2:'transparent', color:isActive?C.text:C.muted, fontSize:13, fontWeight:isActive?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background=C.surface)}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background='transparent')}>
              <Icon size={18} strokeWidth={1.8} color={isActive?C.text:C.muted}/>
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      <div style={{ borderTop:`1px solid ${C.surface2}`, paddingTop:12 }}>
        <button onClick={toggleDarkMode} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%', marginBottom:4 }}>
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          {!collapsed && (darkMode?'Mode clair':'Mode sombre')}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', marginBottom:8 }}>
          {!collapsed && <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={32}/>}
          {!collapsed && (
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize:11, color:C.muted }}>{role}</div>
            </div>
          )}
        </div>
        <button onClick={logout} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}>
          <LogOut size={16}/>{!collapsed && 'Déconnexion'}
        </button>
      </div>
    </div>
  )

  const activeItem = nav.find(n => n.id === active)

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>

      {/* Sidebar desktop */}
      <div style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, padding:'18px 10px', height:'100vh', transition:'width 0.25s ease', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <SidebarContent/>
      </div>

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
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn" style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:C.text, fontSize:18 }}>☰</button>
            <div style={{ fontSize:16, fontWeight:600, color:C.text }}>{activeItem?.label}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={18} color={C.muted} strokeWidth={1.5}/>
            <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={30}/>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {children(active, C)}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
