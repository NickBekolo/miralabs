import { useState } from 'react'
import { useThemeStore } from './ThemeStore'
import EmploiDuTemps from './EmploiDuTemps'
import Personnalisation from './Personnalisation'
import HomeScreen from './HomeScreen'

const NAV = [
  { id:'accueil',  label:'Accueil' },
  { id:'emploi',   label:'Emploi du temps' },
  { id:'notes',    label:'Notes' },
  { id:'assiduite',label:'Assiduité' },
]

export default function StudentDashboard({ isParent }) {
  const [active, setActive] = useState('accueil')
  const [tab, setTab] = useState('timetable') // 'timetable' | 'settings'
  const { font } = useThemeStore()

  // La page emploi du temps a sa propre navigation bottom
  if (active === 'emploi') {
    return (
      <div style={{ fontFamily: font, background:'#fff', minHeight:'100vh' }}>
        {/* Bouton retour */}
        <div style={{ position:'fixed', top:16, left:16, zIndex:200 }}>
          <button onClick={() => { setActive('accueil'); setTab('timetable') }} style={{ padding:'8px 16px', borderRadius:980, border:'2px solid #f0f0f0', background:'#fff', fontSize:14, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>
            ← retour
          </button>
        </div>

        {/* Contenu selon tab */}
        <div style={{ paddingTop: tab === 'timetable' ? 0 : 0 }}>
          {tab === 'timetable' ? <EmploiDuTemps /> : <Personnalisation />}
        </div>

        {/* Bottom tab bar */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, height:60, background:'#fff', borderTop:'2px solid #f0f0f0', display:'flex', zIndex:100 }}>
          {[
            { id:'timetable', label:'emploi du temps', icon:'📅' },
            { id:'settings',  label:'personnaliser',   icon:'🎨' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:3, cursor:'pointer', border:'none', background:'none', fontFamily:'inherit',
            }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              <span style={{ fontSize:11, fontWeight:900, color: tab === t.id ? '#1a1a1a' : '#ccc' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (active) {
      case 'accueil': return <HomeScreen />
      default: return (
        <div style={{ padding:32 }}>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:'-1px' }}>{NAV.find(n => n.id === active)?.label}</div>
          <div style={{ fontSize:15, color:'#888', marginTop:8 }}>en cours de construction</div>
        </div>
      )
    }
  }

  return (
    <div style={{ fontFamily: font, background:'#fff', minHeight:'100vh' }}>
      {/* Top nav */}
      <div style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', borderBottom:'1px solid #e5e5e5', position:'sticky', top:0, zIndex:200, padding:'0 20px' }}>
        <div style={{ maxWidth:960, margin:'0 auto', display:'flex', alignItems:'center', height:52, gap:4 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginRight:16 }}>
            <div style={{ width:24, height:24, background:'#0a0a0a', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>E</span>
            </div>
            <span style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.4px' }}>education.</span>
          </div>
          <div style={{ display:'flex', gap:2, flex:1, overflowX:'auto' }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setActive(n.id)} style={{
                padding:'6px 12px', borderRadius:8, border:'none',
                background: active === n.id ? '#0a0a0a' : 'transparent',
                color: active === n.id ? '#fff' : '#6b7280',
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                whiteSpace:'nowrap', transition:'all 0.18s',
              }}>{n.label}</button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'#0a0a0a', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, cursor:'pointer' }}>
              {isParent ? 'P' : 'R'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: active === 'accueil' ? '100%' : 960, margin:'0 auto' }}>
        {renderPage()}
      </div>
    </div>
  )
}