import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import Signature from '../../pages/student/Signature'
import ProfilMenu from '../../pages/student/ProfilMenu'
import {ChevronDown, Menu, Plus, Home, BarChart2, Calendar, Edit3, Settings, Bell, MessageSquare, LayoutGrid, School, BookOpen, Sparkles, Trophy, ScanFace, Pencil, StickyNoteCheck, LogOut } from 'lucide-react'

const ft = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'

const NAV_ITEMS = [
  { id:'accueil',   label:'Accueil',        icon:Home },
  { id:'notes',     label:'Notes',           icon:BarChart2 },
  { id:'emploi',    label:'Emploi du temps', icon:Calendar },
  { id:'conversations', label:'Messages',       icon:MessageSquare },
  { id:'espaces',       label:'Espaces',        icon:LayoutGrid },
  { id:'assiduite',     label:'Assiduité',       icon:Edit3 },
  { id:'revision',  label:'Mira',        icon:ScanFace },
  { id:'params',    label:'Paramètres',      icon:Settings },
]

const TAB_ITEMS = [
  { id:'accueil',       label:'Pour vous' },
  { id:'conversations', label:'Messages' },
  { id:'espaces', label:'Espaces' },
  { id:'notes',   label:'Vos notes' },
  { id:'emploi',  label:'Emploi du temps' },
  { id:'revision',label:'Mira' },
]

export function StudentLayout({ children, activePage, onNavChange, userName = 'Ritah' }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (isMobile) {
    return <MobileLayout activePage={activePage} onNavChange={onNavChange} userName={userName}>{children}</MobileLayout>
  }
  return <DesktopLayout collapsed={collapsed} setCollapsed={setCollapsed} activePage={activePage} onNavChange={onNavChange} userName={userName}>{children}</DesktopLayout>
}

// ─── Desktop ──────────────────────────────────────────────────

function DesktopLayout({ children, activePage, onNavChange, userName, collapsed, setCollapsed }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const [hasAppel,  setHasAppel]  = useState(false)
  const [showSign,  setShowSign]  = useState(false)
  const [signed,    setSigned]    = useState(false)
  const [showProfil, setShowProfil] = useState(false)
  const [unreadMsg, setUnreadMsg] = useState(0)

  useEffect(() => {
    const checkUnread = () => {
      Promise.all([
        api.get('/api/conversations'),
        api.get('/api/notifications')
      ]).then(([convR, notifR]) => {
        const convUnread = convR.data.reduce((acc, cv) => acc + (cv.unreadCount??0), 0)
        const groupUnread = notifR.data.filter(n => n.type==='groupe' && !n.isRead).length
        setUnreadMsg(convUnread + groupUnread)
      }).catch(()=>{})
    }
    checkUnread()
    const iv = setInterval(checkUnread, 10000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const check = () => api.get('/api/appels/en-cours').then(r => setHasAppel(r.data.length > 0)).catch(()=>{})
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ fontFamily:ft, background:C.bg, color:C.text, WebkitFontSmoothing:'antialiased', height:'100vh', display:'flex', overflow:'hidden' }}>
      <div style={{ width:collapsed?60:200, flexShrink:0, background:C.sidebar, display:'flex', flexDirection:'column', padding:collapsed?'18px 6px':'18px 10px', height:'100vh', transition:'width 0.25s ease', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, padding:'4px 12px' }}>
          {!collapsed && <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.4px', color:C.text }}>Miralabs.</div>}
          <button onClick={()=>setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:collapsed?'auto':0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
            </svg>
          </button>
        </div>
        <nav style={{ flex:1, borderTop:`1px solid ${C.surface2}`, borderBottom:`1px solid ${C.surface2}`, padding:'8px 0', marginBottom:8 }}>
          {NAV_ITEMS.map(({ id, label, icon:Icon }) => {
            const active = activePage === id
            return (
              <div key={id} onClick={() => onNavChange(id)}
                style={{ display:'flex', alignItems:'center', justifyContent: collapsed?'center':'flex-start', gap:8, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:active?500:400, color:active?C.text:C.muted, background:active?C.surface2:'transparent', marginBottom:2, width:'100%' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <div style={{width:20,display:'flex',justifyContent:'center',flexShrink:0}}>
                <Icon size={20} strokeWidth={1.5} color={active ? C.text : (C.bg === '#fff' ? '#555' : '#aaa')}/>
              </div>
              {!collapsed && <span style={{transition:'opacity 0.2s'}}>{label}</span>}
              {id==='conversations' && unreadMsg>0 && (
                <span style={{marginLeft:'auto',fontSize:10,fontWeight:700,color:'#FF3B30'}}>{unreadMsg}</span>
              )}
              </div>
            )
          })}
        </nav>
        <div style={{ padding:'8px 12px', borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div onClick={() => setShowProfil(true)} style={{ width:28, cursor:'pointer', height:28, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {userName?.[0] ?? 'R'}
              </div>
              {!collapsed && <div>
                <div style={{ fontSize:12, fontWeight:500, color:C.text }}>{userName}</div>
                <div style={{ fontSize:10, color:C.muted }}>Étudiant</div>
              </div>}
            </div>
            <button onClick={() => { sessionStorage.clear(); sessionStorage.clear(); window.location.reload() }}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#cc0000', fontSize:12, fontFamily:ft, padding:'4px 0', fontWeight:700 }}>
              <LogOut size={18} strokeWidth={2}/>
              {!collapsed && 'Déconnexion'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:48, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 20px', background:C.bg, borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
          {!signed && hasAppel && <button onClick={() => setShowSign(true)}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#FF3B30', border:'none', borderRadius:980, padding:'6px 14px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', marginRight:12, transition:'all 0.2s' }}>
            Signer
          </button>}
          {showSign && createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:36, width:'100%', maxWidth:440, overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <Signature onClose={() => { setShowSign(false); setSigned(true) }}/>
      </div>
    </div>,
    document.body
  )}
      {showProfil && <ProfilMenu onClose={() => setShowProfil(false)} onNavigate={(p) => { setShowProfil(false); onNavChange(p) }}/>}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <ScanFace size={20} strokeWidth={1.5} color={C.text}/>
            <Bell size={17} strokeWidth={1.5} color={C.text}/>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', background:C.bg, padding:'20px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Mobile style Sana ────────────────────────────────────────

function MobileLayout({ children, activePage, onNavChange, userName }) {
  const darkMode     = useThemeStore(s => s.darkMode)
  const C            = darkMode ? DARK_THEME : LIGHT_THEME
  const { user }     = useAuth()
  const [menu, setMenu] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [showSign, setShowSign] = useState(false)
  const [hasAppel, setHasAppel] = useState(false)
  const [showProfil, setShowProfil] = useState(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    const check = () => api.get('/api/appels/en-cours').then(r => setHasAppel(r.data.length > 0)).catch(()=>{})
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  const bg      = darkMode ? '#111' : '#ffffff'
  const cardBg  = darkMode ? '#1a1a1a' : '#f5f5f5'
  const text     = darkMode ? '#fff' : '#111'
  const muted    = darkMode ? 'rgba(255,255,255,0.4)' : '#999'
  const shadow   = darkMode ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.06)'
  const promptBg = darkMode ? '#1a1a1a' : '#fafafa'

  return (
    <div style={{ fontFamily:ft, background:C.bg, color:text, WebkitFontSmoothing:'antialiased', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'20px 24px 0', flexShrink:0, background:bg }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          {/* Menu hamburger gauche */}
          <button onClick={() => setMenu(m => !m)} style={{ background:'none', border:'none', cursor:'pointer', color:text, display:'flex', alignItems:'center', width:40 }}>
            <Menu size={22}/>
          </button>

          <div style={{ position:'relative' }}>
            <button onClick={() => setDropdown(d => !d)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', fontSize:18, fontWeight:700, cursor:'pointer', color:text, fontFamily:ft }}>
              Miralabs.
              <ChevronDown size={18} color={muted} style={{ transform: dropdown ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
            </button>
            {dropdown && (
              <div onClick={() => setDropdown(false)} style={{ position:'absolute', top:36, left:'50%', transform:'translateX(-50%)', background: darkMode ? '#1a1a1a' : '#fff', borderRadius:36, padding:8, minWidth:200, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:300 }}>
                {[{label:'Mira School',Icon:School,desc:'Gestion scolaire'},{label:'Mira Learn',Icon:BookOpen,desc:'Réseau collaboratif'},{label:'Mira IA',Icon:Sparkles,desc:'Assistant intelligent'},{label:'Mira Challenge',Icon:Trophy,desc:'Compétitions'}].map(({ label, Icon: PIcon, desc }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:14, cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#242424' : '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <PIcon size={18} strokeWidth={1.5} color={text}/>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:text }}>{label}</div>
                      <div style={{ fontSize:11, color:muted }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Droite : Signer + Profil */}
          <div style={{ display:'flex', alignItems:'center', gap:8, width:40, justifyContent:'flex-end' }}>
          {!signed && hasAppel && <button onClick={() => setShowSign(true)}
            style={{ background:'#FF3B30', border:'none', borderRadius:980, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:ft, transition:'all 0.2s' }}>
            Signer
          </button>}
          {/* Avatar */}
          <div onClick={() => setShowProfil(true)} style={{ width:32, height:32, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0, cursor:'pointer' }}>
            {user?.firstName?.[0] ?? userName?.[0] ?? 'R'}
          </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:24, overflowX:'auto', paddingBottom:2, background:bg }}>
          {TAB_ITEMS.map(tab => {
            const active = activePage === tab.id
            return (
              <button key={tab.id} onClick={() => onNavChange(tab.id)}
                style={{
                  border:'none', background:'none', fontSize: active ? 22 : 17,
                  color: active ? text : muted,
                  fontWeight: active ? 700 : 400,
                  whiteSpace:'nowrap', cursor:'pointer', fontFamily:ft,
                  padding:'0 0 8px',
                  
                }}>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div style={{ flex:1, overflowY:'auto', background:C.bg, padding:'12px 0' }}>
        {children}
      </div>



      {showSign && createPortal(
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'#fff', borderRadius:36, width:'100%', maxWidth:440, overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <Signature onClose={() => { setShowSign(false); setSigned(true) }}/>
          </div>
        </div>,
        document.body
      )}
      {/* Menu latéral */}
      {menu && (
        <div onClick={() => setMenu(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex' }}>
          <div onClick={e => e.stopPropagation()} style={{ width:260, background:bg, height:'100%', padding:'48px 20px 32px', display:'flex', flexDirection:'column' }}>
            <div style={{ fontSize:18, fontWeight:700, color:text, marginBottom:32 }}>Miralabs.</div>
            {NAV_ITEMS.map(({ id, label, icon:Icon }) => (
              <div key={id} onClick={() => { onNavChange(id); setMenu(false) }}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', cursor:'pointer', color: activePage===id ? text : muted, fontWeight: activePage===id ? 600 : 400, fontSize:16, borderBottom:`1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}` }}>
                <Icon size={18} strokeWidth={1.5}/>{label}
              </div>
            ))}
            <div onClick={() => { sessionStorage.clear(); sessionStorage.clear(); window.location.href='/' }}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', cursor:'pointer', color:'#FF3B30', fontSize:16, marginTop:8 }}>
              <LogOut size={18} strokeWidth={1.5}/>Déconnexion
            </div>
          </div>
        </div>
      )}
    </div>
  )
}