import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { Home, Users, BookOpen, ClipboardList, BarChart2, Settings, LogOut, Calendar, ChevronRight, ChevronLeft, Bell } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const NAV = [
  { id:'accueil',     label:'Accueil',         icon:Home },
  { id:'resultats', label:'Résultats', icon:BarChart2 },
  { id:'enseignants', label:'Enseignants',     icon:BookOpen },
  { id:'assiduite', label:'Assiduité', icon:ClipboardList },
  { id:'edt',         label:'Emploi du temps', icon:Calendar },
  { id:'stats',       label:'Statistiques',    icon:BarChart2 },
  { id:'params',      label:'Paramètres',      icon:Settings },
]

function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width:44, height:26, borderRadius:13, background:value?'#0a0a0a':'#ccc', position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:value?19:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
  )
}

export default function DirecteurDashboard() {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const [active, setActive]       = useState('accueil')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href='/' }

  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase()

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo + toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
        {!collapsed && <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.4px', color:C.text }}>Miralabs.</div>}
        <button onClick={() => setCollapsed(s=>!s)}
          style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:collapsed?'auto':0, padding:4 }}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(({ id, label, icon:Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => { setActive(id); setMobileOpen(false) }}
              style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:10, padding:collapsed?'10px 0':'10px 12px', borderRadius:8, border:'none', background:isActive?C.surface2:'transparent', color:isActive?C.text:C.muted, fontSize:13, fontWeight:isActive?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background=C.surface)}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background='transparent')}>
              <Icon size={18} strokeWidth={1.8}/>
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bas sidebar */}
      <div style={{ borderTop:`1px solid ${C.surface2}`, paddingTop:12 }}>
        {/* Dark mode toggle */}
        {!collapsed ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', marginBottom:12 }}>
            <span style={{ fontSize:13, color:C.muted }}>Mode sombre</span>
            <Toggle value={darkMode} onChange={toggleDarkMode}/>
          </div>
        ) : (
          <button onClick={toggleDarkMode} style={{ display:'flex', justifyContent:'center', width:'100%', padding:'10px 0', background:'none', border:'none', cursor:'pointer', marginBottom:8 }}>
            <Toggle value={darkMode} onChange={()=>{}}/>
          </button>
        )}

        {/* Avatar + nom */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', marginBottom:8 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {initials}
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize:11, color:C.muted }}>Directeur</div>
            </div>
          )}
        </div>

        {/* Déconnexion */}
        <button onClick={logout}
          style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}>
          <LogOut size={16} strokeWidth={2}/>
          {!collapsed && 'Déconnexion'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>

      {/* Sidebar desktop */}
      <div className="sidebar-desktop" style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, padding:'18px 10px', height:'100vh', transition:'width 0.25s ease', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <SidebarContent/>
      </div>

      {/* Sidebar mobile overlay */}
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

        {/* Header */}
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setMobileOpen(true)} style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:C.text }} className="mobile-menu-btn">
              
            </button>
            <div style={{ fontSize:16, fontWeight:600, color:C.text }}>
              {NAV.find(n => n.id===active)?.label || 'Accueil'}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={18} color={C.muted} strokeWidth={1.5}/>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Page */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {active === 'accueil' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:'-0.4px', marginBottom:4 }}>Bonjour, {user?.firstName} </h1>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginBottom:24 }}>
                {[
                  { label:'Élèves', icon:Users, color:'#007AFF' },
                  { label:'Enseignants', icon:BookOpen, color:'#34C759' },
                  { label:'Classes', icon:ClipboardList, color:'#FF9500' },
                  { label:"Cours aujourd'hui", icon:Calendar, color:'#FF3B30' },
                ].map(({ label, icon:Icon, color }) => (
                  <div key={label} style={{ background:C.surface, borderRadius:14, padding:'18px 20px', border:`1px solid ${C.surface2}` }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                      <Icon size={18} color={color} strokeWidth={1.8}/>
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:C.text, letterSpacing:'-1px' }}>—</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {active !== 'accueil' && (
            <div style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.surface2}` }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:8 }}>En cours de développement</div>
              <div style={{ fontSize:13, color:C.muted }}>Cette section sera disponible prochainement.</div>
            </div>
          )}
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
