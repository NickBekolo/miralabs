import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { Home, Users, Settings, LogOut, ChevronLeft, ChevronRight, Bell, Moon, Sun, Shield, Database, Activity } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const NAV = [
  { id:'accueil',      label:'Accueil',           icon:Home },
  { id:'utilisateurs', label:'Utilisateurs',       icon:Users },
  { id:'securite',     label:'Sécurité',           icon:Shield },
  { id:'base',         label:'Base de données',    icon:Database },
  { id:'logs',         label:'Activité système',   icon:Activity },
  { id:'params',       label:'Paramètres',         icon:Settings },
]

export default function SuperAdminDashboard() {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const [active, setActive]       = useState('accueil')
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href='/' }
  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase()

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>

      {/* Sidebar */}
      <div style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, display:'flex', flexDirection:'column', padding:'18px 10px', transition:'width 0.25s ease', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
          {!collapsed && <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.4px', color:C.text }}>Miralabs.</div>}
          <button onClick={() => setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, marginLeft:collapsed?'auto':0 }}>
            {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
        </div>

        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ id, label, icon:Icon }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => setActive(id)}
                style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'9px 12px', borderRadius:8, border:'none', background:isActive?C.surface2:'transparent', color:isActive?C.text:C.muted, fontSize:13, fontWeight:isActive?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background=C.surface)}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background='transparent')}>
                <Icon size={18} strokeWidth={1.8}/>
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
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {initials}
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize:11, color:C.muted }}>Responsable Informatique</div>
              </div>
            )}
          </div>
          <button onClick={logout} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}>
            <LogOut size={16}/>{!collapsed && 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.text }}>{NAV.find(n=>n.id===active)?.label}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={18} color={C.muted} strokeWidth={1.5}/>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>{initials}</div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {active === 'accueil' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:'-0.4px', marginBottom:4 }}>Bonjour, {user?.firstName} </h1>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16 }}>
                {[
                  { label:'Utilisateurs actifs', icon:Users, color:'#007AFF' },
                  { label:'Connexions aujourd\'hui', icon:Activity, color:'#34C759' },
                  { label:'Alertes sécurité', icon:Shield, color:'#FF3B30' },
                  { label:'Santé système', icon:Database, color:'#FF9500' },
                ].map(({ label, icon:Icon, color }) => (
                  <div key={label} style={{ background:C.surface, borderRadius:14, padding:'18px 20px', border:`1px solid ${C.surface2}` }}>
                    <Icon size={18} color={color} strokeWidth={1.8} style={{ marginBottom:12 }}/>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:C.text }}>—</div>
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
    </div>
  )
}
