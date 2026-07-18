import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import Signature from '../../pages/student/Signature'
import { ChevronDown, Menu, Plus, Home, BarChart2, Calendar, Edit3, Settings, Bell, MessageSquare, LayoutGrid, School, BookOpen, Sparkles, Trophy } from 'lucide-react'

const ft = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'

const NAV_ITEMS = [
  { id:'accueil',   label:'Accueil',        icon:Home },
  { id:'notes',     label:'Notes',           icon:BarChart2 },
  { id:'emploi',    label:'Emploi du temps', icon:Calendar },
  { id:'conversations', label:'Messages',       icon:MessageSquare },
  { id:'espaces',       label:'Espaces',        icon:LayoutGrid },
  { id:'assiduite',     label:'Assiduité',       icon:Edit3 },
  { id:'revision',  label:'Révision',        icon:Edit3 },
  { id:'params',    label:'Paramètres',      icon:Settings },
]

const TAB_ITEMS = [
  { id:'accueil',       label:'Pour vous' },
  { id:'conversations', label:'Messages' },
  { id:'espaces', label:'Espaces' },
  { id:'notes',   label:'Vos notes' },
  { id:'emploi',  label:'Emploi du temps' },
  { id:'revision',label:'Mira IA' },
]

export function StudentLayout({ children, activePage, onNavChange, userName = 'Ritah' }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (isMobile) {
    return <MobileLayout activePage={activePage} onNavChange={onNavChange} userName={userName}>{children}</MobileLayout>
  }
  return <DesktopLayout activePage={activePage} onNavChange={onNavChange} userName={userName}>{children}</DesktopLayout>
}

// ─── Desktop ──────────────────────────────────────────────────

function DesktopLayout({ children, activePage, onNavChange, userName }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const [hasAppel,  setHasAppel]  = useState(false)
  const [showSign,  setShowSign]  = useState(false)

  useEffect(() => {
    const check = () => api.get('/api/appels/en-cours').then(r => setHasAppel(r.data.length > 0)).catch(()=>{})
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ fontFamily:ft, background:C.bg, color:C.text, WebkitFontSmoothing:'antialiased', height:'100vh', display:'flex', overflow:'hidden' }}>
      <div style={{ width:200, flexShrink:0, background:C.sidebar, display:'flex', flexDirection:'column', padding:'18px 10px', height:'100vh' }}>
        <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.4px', color:C.text, padding:'4px 12px', marginBottom:24 }}>Miralabs.</div>
        <nav style={{ flex:1 }}>
          {NAV_ITEMS.map(({ id, label, icon:Icon }) => {
            const active = activePage === id
            return (
              <div key={id} onClick={() => onNavChange(id)}
                style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 12px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:active?500:400, color:active?C.text:C.muted, background:active?C.surface2:'transparent', marginBottom:1 }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <Icon size={15} strokeWidth={1.5}/>{label}
              </div>
            )
          })}
        </nav>
        <div style={{ padding:'8px 12px', borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:C.surface3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:C.text }}>
              {userName?.[0] ?? 'R'}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:500, color:C.text }}>{userName}</div>
              <div style={{ fontSize:10, color:C.muted }}>Étudiant</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:48, display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 20px', background:C.sidebar, flexShrink:0 }}>
          {hasAppel && (
            <button onClick={() => setShowSign(true)}
              style={{ background:'#FF3B30', border:'none', borderRadius:980, padding:'6px 14px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', marginRight:12 }}>
              ✏️ Signer
            </button>
          )}
          {showSign && <Signature onClose={() => { setShowSign(false); setHasAppel(false) }}/>}
          <Bell size={17} strokeWidth={1.5} color={C.muted}/>
        </div>
        <div style={{ flex:1, overflowY:'auto', background:C.bg }}>{children}</div>
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
    <div style={{ fontFamily:ft, background:'#ffffff', color:text, WebkitFontSmoothing:'antialiased', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'20px 24px 0', flexShrink:0, background:bg }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          {/* Menu */}
          <button onClick={() => setMenu(m => !m)} style={{ background:'none', border:'none', cursor:'pointer', color:text, display:'flex', alignItems:'center' }}>
            <Menu size={22}/>
          </button>

          <div style={{ position:'relative' }}>
            <button onClick={() => setDropdown(d => !d)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', fontSize:18, fontWeight:700, cursor:'pointer', color:text, fontFamily:ft }}>
              Miralabs.
              <ChevronDown size={18} color={muted} style={{ transform: dropdown ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
            </button>
            {dropdown && (
              <div onClick={() => setDropdown(false)} style={{ position:'absolute', top:36, left:'50%', transform:'translateX(-50%)', background: darkMode ? '#1a1a1a' : '#fff', borderRadius:20, padding:8, minWidth:200, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:300 }}>
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

          {/* Bouton signer */}
          {hasAppel && (
            <button onClick={() => setShowSign(true)}
              style={{ background:'#FF3B30', border:'none', borderRadius:980, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:ft, animation:'pulse 2s infinite' }}>
              ✏️ Signer
            </button>
          )}
          {/* Avatar */}
          <div style={{ width:32, height:32, borderRadius:'50%', background:cardBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:text }}>
            {user?.firstName?.[0] ?? userName?.[0] ?? 'R'}
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
      <div style={{ flex:1, overflowY:'auto', background:C.bg }}>
        {children}
      </div>

      {/* Barre Mira IA */}
      <div style={{ padding:'12px 24px 32px', flexShrink:0 }}>
        <div style={{ height:58, borderRadius:30, background:promptBg, display:'flex', alignItems:'center', padding:'0 18px', gap:12, boxShadow: darkMode ? 'none' : '0 -2px 10px rgba(0,0,0,0.05)' }}>
          <Plus size={20} color={muted}/>
          <input placeholder="Pose une question à Mira..."
            style={{ border:'none', outline:'none', width:'100%', background:'transparent', fontSize:16, color:text, fontFamily:ft }}/>
        </div>
      </div>

      {showSign && <Signature onClose={() => { setShowSign(false); setHasAppel(false) }}/>}
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
          </div>
        </div>
      )}
    </div>
  )
}