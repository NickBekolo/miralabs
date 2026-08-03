import { useState } from 'react'
import { StudentLayout }  from '../../components/layout/StudentLayout'
import ForYou             from './ForYou'
import Conversations      from './Conversations'
import Espaces            from './Espaces'
import EmploiDuTemps      from './EmploiDuTemps'
import Notes              from './Notes'
import Assiduite          from './Assiduite'
import MiraIA             from './MiraIA'
import Personnalisation   from './Personnalisation'

// Pages qui ont besoin de toute la hauteur sans padding
const FULL_HEIGHT_PAGES = ['conversations', 'espaces']

export default function StudentDashboard({ isParent }) {
  const [active, setActive] = useState('accueil')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const renderPage = () => {
    switch (active) {
      case 'accueil':       return <ForYou />
      case 'conversations': return <Conversations />
      case 'espaces':       return <Espaces />
      case 'notes':         return <Notes />
      case 'emploi':        return <EmploiDuTemps />
      case 'assiduite':     return <Assiduite />
      case 'revision':      return <MiraIA />
      case 'params':        return <Personnalisation />
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

