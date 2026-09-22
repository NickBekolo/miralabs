import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useState } from 'react'
import { StudentLayout }  from '../../components/layout/StudentLayout'
import ForYou             from './ForYou'
import HomeScreen         from './home'
import Calendrier         from './Calendrier'
import Conversations      from './Conversations'
import Espaces            from './Espaces'
import Notes              from './Notes'
import Assiduite          from './Assiduite'
import MiraIA             from './MiraIA'
import Profil from './Profil'

// Pages qui ont besoin de toute la hauteur sans padding
const FULL_HEIGHT_PAGES = ['conversations', 'espaces']


function ParamsEtudiant() {
  const darkMode = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C = darkMode ? DARK_THEME : LIGHT_THEME
  const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
  return (
    <div style={{padding:'20px 16px',fontFamily:ft,background:C.bg,minHeight:'100vh'}}>
      <div style={{fontSize:22,fontWeight:400,letterSpacing:'-0.8px',color:C.text,marginBottom:20}}>Paramètres</div>
      <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:`1px solid ${C.surface2}`}}>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:C.text}}>Mode sombre</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Changer l'apparence</div>
          </div>
          <button onClick={toggleDarkMode}
            style={{width:44,height:26,borderRadius:13,background:darkMode?'#a29bfe':'#e5e5ea',border:'none',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:'#fff',position:'absolute',top:2,left:darkMode?20:2,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard({ isParent, onSign }) {
  const [active, setActive] = useState('accueil')
  const user = JSON.parse(sessionStorage.getItem('user') || '{}')

  const renderPage = () => {
    switch (active) {
      case 'calendrier':    return <Calendrier/>
      case 'emploi':        return <Calendrier/>
      case 'accueil':       return <HomeScreen onSign={onSign} onNav={setActive}/>
      case 'conversations': return <Conversations />
      case 'espaces':       return <Espaces />
      case 'notes':         return <Notes />
      case 'assiduite':     return <Assiduite />
      case 'revision':      return <MiraIA />
      case 'params':        return <ParamsEtudiant/>
      case 'profil':        return <Profil onBack={() => setActive('accueil')} onNavigate={setActive}/>
      default:              return <ForYou />
    }
  }

  const fullHeight = FULL_HEIGHT_PAGES.includes(active)

  return (
    <StudentLayout
      activePage={active}
      onNavChange={setActive}
      userName={isParent ? 'Parent' : (user.firstName || 'Étudiant')}
    >
      {fullHeight
        ? renderPage()
        : renderPage()
      }
    </StudentLayout>
  )
}

