import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import AvatarUser from '../shared/AvatarUser'
import Signature from '../../pages/student/Signature'
import ProfilMenu from '../../pages/student/ProfilMenu'
import {ChevronDown, ChevronUp, Menu, Sun, Moon, Settings as SettingsIcon, Plus, Home, BarChart2, Calendar, Edit3, Settings, Bell, MessageSquare, LayoutGrid, School, BookOpen, Sparkles, Trophy, ScanFace, Pencil, StickyNoteCheck, LogOut, CalendarDays } from 'lucide-react'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"

const NAV_ITEMS = [
  { id:'calendrier', label:'Calendrier',     icon:CalendarDays, color:'#FF3B30' },
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
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const [hasAppel,  setHasAppel]  = useState(false)
  const [showSign,  setShowSign]  = useState(false)
  const [signed,    setSigned]    = useState(false)
  const [showProfil, setShowProfil] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
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
          {!collapsed && <div style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.8px', color:C.text, fontFamily:ft }}>Miralabs.</div>}
          <button onClick={()=>setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:collapsed?'auto':0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
            </svg>
          </button>
        </div>
        <nav style={{ flex:1, borderTop:`1px solid ${C.surface2}`, borderBottom:`1px solid ${C.surface2}`, padding:'8px 0', marginBottom:8 }}>
          {NAV_ITEMS.map(({ id, label, icon:Icon, color:itemColor }) => {
            const active = activePage === id
            return (
              <div key={id} onClick={() => onNavChange(id)}
                style={{ display:'flex', alignItems:'center', justifyContent: collapsed?'center':'flex-start', gap:8, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:active?500:400, color:active?(itemColor||C.text):C.muted, background:active?C.surface2:'transparent', marginBottom:2, width:'100%' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <div style={{width:20,display:'flex',justifyContent:'center',flexShrink:0}}>
                <Icon size={20} strokeWidth={1.5} color={active ? (itemColor||C.text) : (C.bg === '#fff' ? '#555' : '#aaa')}/>
              </div>
              {!collapsed && <span style={{transition:'opacity 0.2s'}}>{label}</span>}
              {id==='conversations' && unreadMsg>0 && (
                <span style={{marginLeft:'auto',fontSize:10,fontWeight:700,color:'#FF3B30'}}>{unreadMsg}</span>
              )}
              </div>
            )
          })}
        </nav>
        <div style={{borderTop:`1px solid ${C.surface2}`,paddingTop:12,position:'relative'}}>
          <button onClick={()=>setProfileOpen(s=>!s)}
            style={{display:'flex',alignItems:'center',justifyContent:collapsed?'center':'space-between',gap:8,padding:collapsed?'10px 0':'10px 12px',borderRadius:10,border:'none',background:profileOpen?C.surface2:'transparent',cursor:'pointer',fontFamily:ft,width:'100%'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>
                {userName?.[0]??'R'}
              </div>
              {!collapsed&&<div style={{textAlign:'left'}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{userName}</div>
                <div style={{fontSize:11,color:C.muted}}>Étudiant</div>
              </div>}
            </div>
            {!collapsed&&(profileOpen?<ChevronUp size={14} color={C.muted}/>:<ChevronDown size={14} color={C.muted}/>)}
          </button>
          {profileOpen&&!collapsed&&(
            <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:C.bg,borderRadius:14,border:`1px solid ${C.surface2}`,padding:8,marginBottom:6,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',zIndex:100}}>
              <div style={{padding:'10px 12px',marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{userName}</div>
                <div style={{fontSize:11,color:C.muted}}>Étudiant</div>
              </div>
              <div style={{height:1,background:C.surface2,margin:'4px 0'}}/>
              <button onClick={()=>{setShowProfil(true);setProfileOpen(false)}}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:C.text,fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                Mon profil
              </button>
              <div style={{height:1,background:C.surface2,margin:'4px 0'}}/>
              <button onClick={()=>onNavChange('personnalisation')}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:C.text,fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <Settings size={15} color={C.muted}/>
                Paramètres
              </button>
              <div style={{height:1,background:C.surface2,margin:'4px 0'}}/>
              <button onClick={toggleDarkMode}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:C.text,fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {darkMode?<Sun size={15} color={C.muted}/>:<Moon size={15} color={C.muted}/>}
                  Thème
                </div>
                <span style={{fontSize:11,color:C.muted}}>{darkMode?'Clair':'Sombre'}</span>
              </button>
              <div style={{height:1,background:C.surface2,margin:'4px 0'}}/>
              <button onClick={()=>{sessionStorage.clear();window.location.reload()}}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:'#FF3B30',fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <LogOut size={15}/>
                Se déconnecter
              </button>
            </div>
          )}
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
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C            = darkMode ? DARK_THEME : LIGHT_THEME
  const { user }     = useAuth()
  const [menu, setMenu] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [showSign, setShowSign] = useState(false)
  const [hasAppel, setHasAppel] = useState(false)
  const [showProfil, setShowProfil] = useState(false)
  const [signed, setSigned] = useState(false)
  const [menuProfil, setMenuProfil] = useState(false)

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

          <div style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.8px', color:text, fontFamily:ft }}>Miralabs.</div>

          {/* Droite : Signer + Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
            {!signed && hasAppel && <button onClick={() => setShowSign(true)}
              style={{ background:'#FF3B30', border:'none', borderRadius:980, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:ft, transition:'all 0.2s' }}>
              Signer
            </button>}

          </div>
        </div>

        {/* Tabs */}
        
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
            <div style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.8px', color:text, marginBottom:32, fontFamily:ft }}>Miralabs.</div>
            {NAV_ITEMS.map(({ id, label, icon:Icon, color:iColor }) => (
              <div key={id} onClick={() => { onNavChange(id); setMenu(false) }}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', cursor:'pointer', color: activePage===id ? text : muted, fontWeight: activePage===id ? 600 : 400, fontSize:16, borderBottom:`1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}` }}>
                <Icon size={18} strokeWidth={1.5} color={activePage===id ? (iColor||text) : muted}/>{label}
              </div>
            ))}
            <div style={{marginTop:'auto',paddingTop:16,borderTop:`1px solid ${darkMode?'rgba(255,255,255,0.06)':'#f0f0f0'}`}}>
              {/* Avatar + nom */}
              <div onClick={()=>setMenuProfil(v=>!v)} style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,cursor:'pointer',position:'relative'}}>
                <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={36}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:text}}>{userName}</div>
                  <div style={{fontSize:11,color:muted}}>Étudiant</div>
                </div>
                {menuProfil && (
                  <div onClick={e=>e.stopPropagation()} style={{position:'absolute',bottom:'100%',left:0,right:0,background:bg,borderRadius:14,border:`1px solid ${darkMode?'rgba(255,255,255,0.1)':'#f0f0f0'}`,padding:8,marginBottom:6,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',zIndex:300}}>
                    <div style={{padding:'10px 12px',marginBottom:4}}>
                      <div style={{fontSize:13,fontWeight:700,color:text}}>{userName}</div>
                      <div style={{fontSize:11,color:muted}}>Étudiant</div>
                    </div>
                    <div style={{height:1,background:darkMode?'rgba(255,255,255,0.1)':'#f0f0f0',margin:'4px 0'}}/>
                    <button onClick={()=>{setShowProfil(true);setMenuProfil(false);setMenu(false)}}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:text,fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}>
                      <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={16}/>
                      Mon profil
                    </button>
                    <button onClick={()=>{onNavChange('personnalisation');setMenu(false)}}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:text,fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}>
                      <Settings size={15} color={muted}/>
                      Paramètres
                    </button>
                    <div style={{height:1,background:darkMode?'rgba(255,255,255,0.1)':'#f0f0f0',margin:'4px 0'}}/>
                    <button onClick={toggleDarkMode}
                      style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:text,fontSize:13,cursor:'pointer',fontFamily:ft,width:'100%'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        {darkMode?<Sun size={15} color={muted}/>:<Moon size={15} color={muted}/>}
                        Thème
                      </div>
                      <span style={{fontSize:11,color:muted,background:darkMode?'rgba(255,255,255,0.1)':'#f0f0f0',padding:'2px 8px',borderRadius:20}}>{darkMode?'Sombre':'Clair'}</span>
                    </button>
                    <div style={{height:1,background:darkMode?'rgba(255,255,255,0.1)':'#f0f0f0',margin:'4px 0'}}/>
                    <button onClick={()=>{sessionStorage.clear();window.location.href='/'}}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:'#FF3B30',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:ft,width:'100%'}}>
                      <LogOut size={15}/>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
              {/* Thème */}
              <div onClick={toggleDarkMode} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',cursor:'pointer',borderBottom:`1px solid ${darkMode?'rgba(255,255,255,0.06)':'#f0f0f0'}`}}>
                <div style={{display:'flex',alignItems:'center',gap:12,color:text,fontSize:14}}>
                  {darkMode?<Sun size={18} strokeWidth={1.5}/>:<Moon size={18} strokeWidth={1.5}/>}
                  Thème
                </div>
                <span style={{fontSize:11,color:muted,background:darkMode?'rgba(255,255,255,0.1)':'#f0f0f0',padding:'2px 8px',borderRadius:20}}>{darkMode?'Sombre':'Clair'}</span>
              </div>
              {/* Déconnexion */}
              <div onClick={()=>{sessionStorage.clear();window.location.href='/'}}
                style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',cursor:'pointer',color:'#FF3B30',fontSize:14,marginTop:4}}>
                <LogOut size={18} strokeWidth={1.5}/>Déconnexion
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}