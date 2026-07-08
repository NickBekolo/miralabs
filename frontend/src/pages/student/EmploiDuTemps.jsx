import { useState, useEffect } from 'react'
import { Course } from '../../components/student/Course'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'

const ft = '-apple-system,"SF Pro Display",BlinkMacSystemFont,sans-serif'

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi']
const COLORS_EDT = ['#1e3a5f','#9f1239','#4a1942','#1a3c34','#7c2d12','#374151','#713f12']

export default function EmploiDuTemps() {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME

  const [cours,   setCours]   = useState([])
  const [loading, setLoading] = useState(true)
  const [jourActif, setJourActif] = useState(
    Math.min((new Date().getDay() || 1) - 1, 4)
  )

  useEffect(() => {
    api.get('/api/cours/edt')
      .then(r => setCours(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Regroupe les cours par jour
  const parJour = {}
  for (let i = 1; i <= 5; i++) {
    parJour[i] = cours
      .filter(c => c.jourSemaine === i)
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
  }

  const coursDuJour = parJour[jourActif + 1] ?? []

  return (
    <div style={{ fontFamily:ft, padding:'16px 0 40px', background:C.bg, minHeight:'100vh', color:C.text }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.4px', color:C.text, marginBottom:3 }}>Emploi du temps</h1>
        <p style={{ fontSize:12, color:C.hint }}>Semaine en cours</p>
      </div>

      {/* Tabs jours */}
      <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto' }}>
        {JOURS.map((j, i) => (
          <button key={j} onClick={() => setJourActif(i)}
            style={{
              padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer',
              fontFamily:ft, fontSize:12, fontWeight: jourActif === i ? 600 : 400,
              background: jourActif === i ? C.text : C.surface,
              color: jourActif === i ? C.bg : C.muted,
              flexShrink:0,
            }}>
            {j}
          </button>
        ))}
      </div>

      {/* Cours du jour */}
      <div style={{ background:C.surface, borderRadius:14 }}>
        {loading ? (
          <div style={{ padding:24, textAlign:'center', fontSize:12, color:C.hint }}>Chargement...</div>
        ) : coursDuJour.length === 0 ? (
          <div style={{ padding:24, textAlign:'center', fontSize:12, color:C.hint }}>Aucun cours ce jour</div>
        ) : coursDuJour.map((c, i) => (
          <Course
            key={c.id}
            name={c.matiere.nom}
            meta={`${c.salle ?? ''}${c.enseignant ? ' · ' + c.enseignant.firstName + ' ' + c.enseignant.lastName : ''}`}
            time={`${c.heureDebut} - ${c.heureFin}`}
            annule={c.isAnnule}
            color={COLORS_EDT[i % COLORS_EDT.length]} C={C}
          />
        ))}
      </div>
    </div>
  )
}