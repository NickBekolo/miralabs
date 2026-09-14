import { useState } from 'react'
import { StudentLayout }  from '../../components/layout/StudentLayout'
import ForYou             from './ForYou'
import HomeScreen         from './home'
import Conversations      from './Conversations'
import Espaces            from './Espaces'
import EmploiDuTemps      from './EmploiDuTemps'
import Notes              from './Notes'
import Assiduite          from './Assiduite'
import MiraIA             from './MiraIA'
import Profil from './Profil'
import Personnalisation   from './Personnalisation'

// Pages qui ont besoin de toute la hauteur sans padding
const FULL_HEIGHT_PAGES = ['conversations', 'espaces']

export default function StudentDashboard({ isParent, onSign }) {
  const [active, setActive] = useState('accueil')
  const user = JSON.parse(sessionStorage.getItem('user') || '{}')

  const renderPage = () => {
    switch (active) {
      case 'accueil':       return <HomeScreen onSign={onSign}/>
      case 'conversations': return <Conversations />
      case 'espaces':       return <Espaces />
      case 'notes':         return <Notes />
      case 'emploi':        return <EmploiDuTemps />
      case 'assiduite':     return <Assiduite />
      case 'revision':      return <MiraIA />
      case 'params':        return <Personnalisation />
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

