import { useState, useEffect } from 'react'

const sf = '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, "Inter", "Helvetica Neue", sans-serif'

const niveaux = [
  { id: 'collegien', label: 'collégien' },
  { id: 'lyceen', label: 'lycéen' },
  { id: 'etudiant', label: 'étudiant' },
  { id: 'parent', label: "parent d'élève" },
  { id: 'teacher', label: 'professeur' },
]

const classesSecondaire = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'terminale']
const filieresSecondaire = ['A', 'C', 'D', 'TI', 'autre']

const filieresSup = {
  'licence': ['1ère année', '2ème année', '3ème année'],
  'master': ['1ère année', '2ème année'],
  'doctorat': ['1ère année', '2ème année', '3ème année et +'],
  'bts / dut': ['1ère année', '2ème année'],
  'grande école': ['1ère année', '2ème année', '3ème année', '4ème année', '5ème année et +'],
}

const etablissements = [
  'lycée jean hyppolite — jonzac',
  'lycée victor hugo — paris',
  'collège albert camus — bordeaux',
  'lycée marie curie — versailles',
  'collège jules ferry — lyon',
  'lycée pasteur — strasbourg',
  'collège jean moulin — nantes',
  'lycée condorcet — paris',
  'ipssi — paris',
  'université paris-saclay',
  'université de bordeaux',
  'iut de lyon',
]

function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {children}
    </div>
  )
}

// Groupe de chips : si sélectionné, n'affiche que l'élu
function ChipGroup({ items, selected, onSelect, label: groupLabel }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const chip = (sel) => ({
    padding: '11px 18px', borderRadius: '980px',
    border: `1.5px solid ${sel ? '#0a0a0a' : '#e5e5e5'}`,
    background: sel ? '#0a0a0a' : '#fff',
    color: sel ? '#fff' : '#0a0a0a',
    fontSize: '15px', fontFamily: sf, fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.2s ease',
    letterSpacing: '-0.2px', whiteSpace: 'nowrap',
  })

  const displayed = selected ? [selected] : items

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      marginBottom: '20px',
    }}>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', marginBottom: '12px', letterSpacing: '-0.1px' }}>
        {groupLabel}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {displayed.map(i => (
          <button
            key={i}
            style={chip(selected === i)}
            onClick={() => selected === i ? onSelect(null) : onSelect(i)}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  )
}

// Cards : si sélectionné, n'affiche que l'élu
function CardGroup({ items, selected, onSelect }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 0)
    return () => clearTimeout(t)
  }, [])

  const cardStyle = (sel) => ({
    padding: '18px 22px', borderRadius: '16px',
    border: `1.5px solid ${sel ? '#0a0a0a' : '#e5e5e5'}`,
    background: sel ? '#0a0a0a' : '#fff',
    color: sel ? '#fff' : '#0a0a0a',
    fontSize: '17px', fontFamily: sf, fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.2s ease',
    letterSpacing: '-0.3px', width: '100%',
    textAlign: 'left', boxSizing: 'border-box',
  })

  const displayed = selected ? items.filter(n => n.id === selected.id) : items

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {displayed.map(n => (
        <button
          key={n.id}
          style={cardStyle(selected?.id === n.id)}
          onClick={() => selected?.id === n.id ? onSelect(null) : onSelect(n)}
        >
          {n.label}
        </button>
      ))}
    </div>
  )
}

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(1)
  const [selectedNiveau, setSelectedNiveau] = useState(null)
  const [selectedClasse, setSelectedClasse] = useState(null)
  const [selectedFiliere, setSelectedFiliere] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedTypeEtab, setSelectedTypeEtab] = useState(null)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [selectedAnnee, setSelectedAnnee] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedEtab, setSelectedEtab] = useState(null)

  const isSecondaire = selectedNiveau?.id === 'collegien' || selectedNiveau?.id === 'lyceen'
  const isEtudiant = selectedNiveau?.id === 'etudiant'
  const isParent = selectedNiveau?.id === 'parent'
  const isTeacher = selectedNiveau?.id === 'teacher'

  const handleSelectNiveau = (n) => {
    setSelectedNiveau(n)
    setSelectedClasse(null); setSelectedFiliere(null); setSelectedSection(null)
    setSelectedTypeEtab(null); setSelectedCycle(null); setSelectedAnnee(null)
  }

  const canGoStep2 = (() => {
    if (!selectedNiveau) return false
    if (isSecondaire || isParent) return selectedClasse && selectedFiliere && selectedSection
    if (isEtudiant) return selectedTypeEtab && selectedCycle && selectedAnnee
    if (isTeacher) return true
    return false
  })()

  const canFinish = !!selectedEtab
  const filtered = etablissements.filter(e => e.toLowerCase().includes(search.toLowerCase()))

  const handleEtabSelect = (e) => {
    setSelectedEtab(e)
    if (isTeacher) {
      sessionStorage.setItem('onboardingDone', 'true')
      onFinish()
    }
  }

  const btn = (active) => ({
    width: '100%', padding: '16px', fontSize: '16px', fontFamily: sf,
    fontWeight: '700', color: '#fff',
    background: active ? '#0a0a0a' : '#e5e5e5',
    border: 'none', borderRadius: '980px',
    cursor: active ? 'pointer' : 'not-allowed',
    letterSpacing: '-0.3px', transition: 'background 0.2s',
    boxSizing: 'border-box',
  })

  const etabItem = (selected) => ({
    padding: '14px 18px', borderRadius: '14px',
    border: `1.5px solid ${selected ? '#0a0a0a' : '#e5e5e5'}`,
    background: selected ? '#0a0a0a' : '#fff',
    color: selected ? '#fff' : '#0a0a0a',
    fontSize: '14px', fontFamily: sf, fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.18s ease',
    letterSpacing: '-0.2px', marginBottom: '8px',
    width: '100%', textAlign: 'left', boxSizing: 'border-box',
  })

  const separator = (
    <div style={{ position: 'relative', margin: '24px -32px' }}>
      <div style={{ height: '1px', background: '#e5e5e5' }} />
      <div style={{
        position: 'absolute', top: '-16px', left: 0, right: 0, height: '32px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.85), rgba(255,255,255,0))',
        backdropFilter: 'blur(3px)',
      }} />
    </div>
  )

  return (
    <div style={{
      fontFamily: sf, background: '#fff', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: '48px 32px 32px', maxWidth: '480px',
      margin: '0 auto', boxSizing: 'border-box',
    }}>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '44px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i <= step ? '#0a0a0a' : '#f0f0f0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* ── ÉTAPE 1 ── */}
      {step === 1 && (
        <>
          <FadeIn delay={0}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                à propos de toi
              </div>
              <div style={{ fontSize: '34px', fontWeight: '700', letterSpacing: '-2px', color: '#0a0a0a', lineHeight: '1.1' }}>
                qui es-tu ?
              </div>
            </div>
          </FadeIn>

          <CardGroup items={niveaux} selected={selectedNiveau} onSelect={handleSelectNiveau} />

          {selectedNiveau && (
            <FadeIn key={selectedNiveau.id} delay={0}>
              {separator}
            </FadeIn>
          )}

          {(isSecondaire || isParent) && (
            <div key={selectedNiveau.id + '-sec'}>
              <ChipGroup
                key="classe"
                label="ta classe"
                items={classesSecondaire}
                selected={selectedClasse}
                onSelect={(v) => { setSelectedClasse(v); setSelectedFiliere(null); setSelectedSection(null) }}
              />
              {selectedClasse && (
                <ChipGroup
                  key="filiere"
                  label="ta filière"
                  items={filieresSecondaire}
                  selected={selectedFiliere}
                  onSelect={(v) => { setSelectedFiliere(v); setSelectedSection(null) }}
                />
              )}
              {selectedFiliere && (
                <ChipGroup
                  key="section"
                  label="ta section"
                  items={['francophone', 'anglophone']}
                  selected={selectedSection}
                  onSelect={setSelectedSection}
                />
              )}
            </div>
          )}

          {isEtudiant && (
            <div key="etudiant">
              <ChipGroup
                label="type d'établissement"
                items={['public', 'privé']}
                selected={selectedTypeEtab}
                onSelect={(v) => { setSelectedTypeEtab(v); setSelectedCycle(null); setSelectedAnnee(null) }}
              />
              {selectedTypeEtab && (
                <ChipGroup
                  key={selectedTypeEtab}
                  label="ton cycle"
                  items={Object.keys(filieresSup)}
                  selected={selectedCycle}
                  onSelect={(v) => { setSelectedCycle(v); setSelectedAnnee(null) }}
                />
              )}
              {selectedCycle && (
                <ChipGroup
                  key={selectedCycle}
                  label="ton année"
                  items={filieresSup[selectedCycle]}
                  selected={selectedAnnee}
                  onSelect={setSelectedAnnee}
                />
              )}
            </div>
          )}

          {isTeacher && (
            <FadeIn key="teacher" delay={80}>
              <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '700', lineHeight: '1.7' }}>
                tu seras connecté directement à ton établissement.
              </div>
            </FadeIn>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '36px' }}>
            <button disabled={!canGoStep2} onClick={() => setStep(2)} style={btn(canGoStep2)}>
              continuer
            </button>
          </div>
        </>
      )}

      {/* ── ÉTAPE 2 ── */}
      {step === 2 && (
        <>
          <FadeIn delay={0}>
            <button onClick={() => setStep(1)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', color: '#9ca3af', fontFamily: sf,
              fontWeight: '700', padding: '0', marginBottom: '28px', textAlign: 'left',
            }}>
              ← retour
            </button>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                ton établissement
              </div>
              <div style={{ fontSize: '34px', fontWeight: '700', letterSpacing: '-2px', color: '#0a0a0a', lineHeight: '1.1' }}>
                {isTeacher ? 'où enseignes-tu ?' : 'où étudies-tu ?'}
              </div>
              {isTeacher && (
                <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '700', marginTop: '8px', lineHeight: '1.6' }}>
                  tu seras redirigé vers la connexion de ton établissement.
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="rechercher un établissement..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 18px', fontSize: '15px',
                fontFamily: sf, color: '#0a0a0a', background: '#f9f9f9',
                border: '1px solid #e5e5e5', borderRadius: '14px', outline: 'none',
                letterSpacing: '-0.2px', boxSizing: 'border-box', marginBottom: '14px',
                fontWeight: '700', transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#0a0a0a'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#e5e5e5'; e.target.style.background = '#f9f9f9' }}
            />
          </FadeIn>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', fontWeight: '700', paddingTop: '24px' }}>
                aucun établissement trouvé
              </div>
            ) : (
              filtered.map((e, idx) => (
                <FadeIn key={e} delay={idx * 40}>
                  <button style={etabItem(selectedEtab === e)} onClick={() => handleEtabSelect(e)}>
                    {e}
                  </button>
                </FadeIn>
              ))
            )}
          </div>

          {!isTeacher && (
            <button disabled={!canFinish} onClick={onFinish} style={btn(canFinish)}>
              {"c'est parti →"}
            </button>
          )}
        </>
      )}
    </div>
  )
}