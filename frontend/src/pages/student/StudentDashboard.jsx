import { useState } from 'react'
import { StudentLayout }  from '../../components/layout/StudentLayout'
import HomeScreen         from './home/index'
import EmploiDuTemps      from './EmploiDuTemps'
import Personnalisation   from './Personnalisation'
import Notes              from './Notes'

/**
 * StudentDashboard — tableau de bord étudiant.
 * Structure calquée sur la page enseignant :
 * layout avec sidebar + topbar, navigation entre les pages via sidebar.
 */
export default function StudentDashboard({ isParent }) {
  const [active, setActive] = useState('accueil')

  const renderPage = () => {
    switch (active) {
      case 'accueil':   return <HomeScreen />
      case 'emploi':    return <EmploiDuTemps />
      case 'notes':     return <Notes />
      case 'params':    return <Personnalisation />
      case 'assiduite': return <Placeholder title="Assiduité" />
      case 'revision':  return <Placeholder title="Révision avec Mira" />
      default:          return <Placeholder title="En construction" />
    }
  }

  return (
    <StudentLayout
      activePage={active}
      onNavChange={setActive}
      userName={isParent ? 'Parent' : 'Ritah'}
    >
      <div style={{ padding: '20px 24px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {renderPage()}
        </div>
      </div>
    </StudentLayout>
  )
}

function Placeholder({ title }) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', color: '#111111', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: '#8A8A8A' }}>En cours de construction</div>
    </div>
  )
}