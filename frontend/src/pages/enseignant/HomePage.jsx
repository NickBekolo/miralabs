/**
 * Page d'accueil du tableau de bord enseignant.
 * Assemble tous les composants — chaque import vient d'un fichier dédié.
 */
import { useState } from 'react'
import { MainLayout }         from '../../components/layout/MainLayout'
import { NotesChart }         from '../../components/charts/NotesChart'
import { MiniEDT }            from '../../components/timetable/MiniEDT'
import { Library }            from '../../components/library/Library'
import { GreetingSection }    from './sections/GreetingSection'
import { ActualitesSection }  from './sections/ActualitesSection'
import { OverviewSection }    from './sections/OverviewSection'
import { ClassesSection }     from './sections/ClassesSection'
import { TachesSection }      from './sections/TachesSection'
import { StatsModal }         from './modals/StatsModal'
import { CreateDocModal }     from './modals/CreateDocModal'
import { INITIAL_BOOKS }      from '../../data/teacher.data'

export default function HomePage() {
  const [books, setBooks]         = useState(INITIAL_BOOKS)
  const [showStats, setShowStats] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <MainLayout userName="Dr Mandeng">
      <div style={{ padding:'20px 24px 48px' }}>
        <div style={{ maxWidth:1060, margin:'0 auto' }}>

          {/* Salutation */}
          <GreetingSection name="Mme Mandeng" nbCours={5} nbTaches={5} />

          {/* Ligne 1 : graphique + actualités | EDT */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:16, marginBottom:16 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <NotesChart onOpenModal={() => setShowStats(true)} />
              <ActualitesSection />
            </div>
            <MiniEDT />
          </div>

          {/* Ligne 2 : overview | classes | tâches */}
          <div style={{ display:'grid', gridTemplateColumns:'265px 1fr 215px', gap:16, marginBottom:16 }}>
            <OverviewSection />
            <ClassesSection />
            <TachesSection />
          </div>

          {/* Bibliothèque */}
          <Library books={books} onCreateDoc={() => setShowCreate(true)} />

        </div>
      </div>

      {/* Modals */}
      {showStats  && <StatsModal    onClose={() => setShowStats(false)} />}
      {showCreate && <CreateDocModal onClose={() => setShowCreate(false)}
        onCreate={doc => setBooks(prev => [doc, ...prev])} />}
    </MainLayout>
  )
}
