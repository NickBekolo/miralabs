import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { Home, Users, AlertCircle, Shield, LogOut, ChevronLeft, ChevronRight, Bell, Moon, Sun } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function VieScolaireDashboard() {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const roles          = user?.roles || []
  const isCPE          = roles.includes('ROLE_CPE')
  const isSurveillant  = roles.includes('ROLE_SURVEILLANT')
  const [active, setActive]       = useState('accueil')
  const [collapsed, setCollapsed] = useState(false)
  const logout = () => { sessionStorage.clear(); sessionStorage.clear(); window.location.href='/' }

  const NAV = [
    { id:'accueil',    label:'Accueil',     icon:Home },
    { id:'absences',   label:'Absences',    icon:Users },
    ...(isCPE ? [{ id:'sanctions', label:'Sanctions', icon:Shield }] : []),
    ...(isSurveillant ? [{ id:'emargement', label:'Émargement', icon:AlertCircle }] : []),
  ]

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>
      <div style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, display:'flex', flexDirection:'column', padding:'18px 10px', transition:'width 0.25s ease', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
          {!collapsed && <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Miralabs.</div>}
          <button onClick={() => setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, marginLeft:collapsed?'auto':0 }}>
            {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
        </div>
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'9px 12px', borderRadius:8, border:'none', background:active===id?C.surface2:'transparent', color:active===id?C.text:C.muted, fontSize:13, fontWeight:active===id?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}>
              <Icon size={18} strokeWidth={1.8}/>{!collapsed && label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop:`1px solid ${C.surface2}`, paddingTop:12 }}>
          <button onClick={toggleDarkMode} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%', marginBottom:4 }}>
            {darkMode ? <Sun size={16}/> : <Moon size={16}/>}{!collapsed && (darkMode?'Mode clair':'Mode sombre')}
          </button>
          {!collapsed && <div style={{ paddingLeft:12, marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize:11, color:C.muted }}>{isCPE?'CPE':'Surveillant'}</div>
          </div>}
          <button onClick={logout} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}>
            <LogOut size={16}/>{!collapsed && 'Déconnexion'}
          </button>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:`1px solid ${C.surface2}` }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.text }}>Vie Scolaire</div>
          <Bell size={18} color={C.muted}/>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          <div style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.surface2}` }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:8 }}>Bienvenue, {user?.firstName}</div>
            <div style={{ fontSize:13, color:C.muted }}>Dashboard Vie Scolaire en cours de développement.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
