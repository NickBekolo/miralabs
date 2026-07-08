import { useState, useEffect } from 'react'
import { AlignLeft, Bell, ChevronDown, Sparkles, BookOpen, Brain, Home, BarChart2, Calendar, Edit3 } from 'lucide-react'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,sans-serif'

const NAV_ITEMS = [
  { id:'accueil',   label:'Accueil',         icon:'⊞' },
  { id:'notes',     label:'Notes',            icon:'📊' },
  { id:'emploi',    label:'Emploi du temps',  icon:'📅' },
  { id:'assiduite', label:'Assiduité',        icon:'✅' },
  { id:'revision',  label:'Révision',         icon:'✦'  },
  { id:'params',    label:'Paramètres',       icon:'⚙'  },
]

// Tab bar mobile — seulement 4 items principaux
const TAB_ITEMS = [
  { id:'accueil',  label:'Accueil', lucide:<Home size={22} strokeWidth={2}/> },
  { id:'notes',    label:'Notes',   lucide:<BarChart2 size={22} strokeWidth={2}/> },
  { id:'emploi',   label:'EDT',     lucide:<Calendar size={22} strokeWidth={2}/> },
  { id:'revision', label:'Révision',lucide:<Edit3 size={22} strokeWidth={2}/> },
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

/* ─── Desktop : sidebar + topbar ─────────────── */
function DesktopLayout({ children, activePage, onNavChange, userName }) {
  return (
    <div style={{
      fontFamily: ft, background: '#F2F2F2', color: '#111111',
      WebkitFontSmoothing: 'antialiased', fontSize: 14,
      height: '100vh', display: 'flex', overflow: 'hidden',
    }}>
      <Sidebar activePage={activePage} onNavChange={onNavChange} userName={userName}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar/>
        <div style={{ flex:1, overflowY:'auto' }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── Mobile : header simple + tab bar en bas ── */
function MobileLayout({ children, activePage, onNavChange, userName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const PRODUCTS = [
    { label:'Mira',      icon:<Sparkles size={16}/> },
    { label:'MiraLearn', icon:<BookOpen size={16}/> },
    { label:'MiraIA',    icon:<Brain size={16}/>    },
  ]

  return (
    <div style={{
      fontFamily: ft, background: '#fff', color: '#111111',
      WebkitFontSmoothing: 'antialiased', height: '100vh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header mobile */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'13px 16px', background:'#fff',
        borderBottom:'1px solid #E5E7EB', flexShrink:0,
        position:'sticky', top:0, zIndex:100,
      }}>
        {/* Gauche : menu + Miralabs + chevron */}
        <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative' }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:ft }}
          >
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.4px', color:'#111111' }}>Miralabs.</span>
            <ChevronDown size={15} strokeWidth={2.5} color='#8A8A8A'
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
          </button>

          {/* Dropdown produits */}
          {dropdownOpen && (
            <div style={{
              position:'absolute', top:36, left:0,
              background:'#fff', border:'1px solid #E5E7EB', borderRadius:16,
              boxShadow:'0 8px 24px rgba(0,0,0,0.10)', padding:6, minWidth:160, zIndex:200,
            }}>
              {PRODUCTS.map(p => (
                <div key={p.label} onClick={() => setDropdownOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:600, color:'#111111',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ color:'#8A8A8A' }}>{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Droite : cloche + avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ position:'relative' }}>
            <button style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'#111111', padding:6 }}>
              <Bell size={20} strokeWidth={2}/>
            </button>
            <div style={{
              position:'absolute', top:5, right:5, width:7, height:7,
              borderRadius:'50%', background:'#ff0000', border:'1.5px solid #fff',
            }}/>
          </div>
          <div style={{
            width:32, height:32, borderRadius:10, background:'#111111',
            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:700, cursor:'pointer',
          }}>
            {userName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div style={{ flex:1, overflowY:'auto', paddingBottom:70 }}>
        {children}
      </div>

      {/* Tab bar en bas — sans bordures sur les items */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        background:'#fff', borderTop:'1px solid #E5E7EB',
        display:'flex', zIndex:100,
        paddingBottom:'env(safe-area-inset-bottom)',
      }}>
        {TAB_ITEMS.map(t => {
          const isActive = activePage === t.id
          return (
            <button
              key={t.id}
              onClick={() => onNavChange(t.id)}
              style={{
                flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:4, padding:'10px 0', cursor:'pointer',
                border:'none', background:'none', fontFamily:ft,
              }}
            >
              <span style={{ color: isActive ? '#111111' : '#AEAEB2', display:'flex' }}>
                {t.lucide}
              </span>
              <span style={{ fontSize:10, fontWeight:600, color: isActive ? '#111111' : '#AEAEB2' }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Sidebar desktop ─────────────────────────── */
function Sidebar({ activePage, onNavChange, userName }) {
  return (
    <div style={{
      width:200, background:'#fff', borderRight:'1px solid #E5E7EB',
      display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto',
    }}>
      <div style={{
        padding:'18px 16px 14px', borderBottom:'1px solid #f0f0f0',
        fontSize:15, fontWeight:700, letterSpacing:'-0.4px',
      }}>
        Miralabs.
      </div>
      <div style={{ padding:'10px 0 4px', flex:1 }}>
        {NAV_ITEMS.map(n => (
          <NavItem key={n.id} item={n} active={activePage === n.id} onClick={() => onNavChange(n.id)}/>
        ))}
      </div>
      <div style={{ padding:12, borderTop:'1px solid #f0f0f0' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:9,
          padding:'10px 12px', background:'#F8F8F8', borderRadius:12,
        }}>
          <div style={{
            width:30, height:30, borderRadius:'50%', background:'#111111',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:700, color:'#fff', flexShrink:0,
          }}>{userName.charAt(0)}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#111111' }}>{userName}</div>
            <div style={{ fontSize:11, color:'#8A8A8A' }}>Étudiant · 1ASSP1</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'7px 10px', cursor:'pointer', borderRadius:8,
      margin:'2px 8px', fontSize:13, fontWeight:500,
      background: active ? '#111111' : 'transparent',
      color: active ? '#fff' : '#6b7280',
      transition:'all 0.12s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f7' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <span style={{ fontSize:14, width:17, textAlign:'center' }}>{item.icon}</span>
      {item.label}
    </div>
  )
}

function Topbar() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 24px', background:'#fff', borderBottom:'1px solid #E5E7EB', flexShrink:0,
    }}>
      <div style={{ fontSize:13, color:'#8A8A8A' }}>Mardi 23 juin 2026 · 5 cours aujourd'hui</div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ position:'relative' }}>
          <span style={{ fontSize:18 }}>🔔</span>
          <div style={{
            position:'absolute', top:-1, right:-2, width:7, height:7,
            borderRadius:'50%', background:'#dc2626', border:'1.5px solid #fff',
          }}/>
        </div>
        <button style={{
          padding:'5px 12px', borderRadius:7, border:'none',
          background:'#111111', color:'#fff', fontSize:12, fontWeight:600,
          cursor:'pointer', fontFamily:ft,
        }}>Se déconnecter</button>
      </div>
    </div>
  )
}