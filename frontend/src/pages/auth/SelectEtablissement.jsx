import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

export default function SelectEtablissement() {
  const navigate  = useNavigate()
  const [etabs,    setEtabs]    = useState([])
  const [filtered, setFiltered] = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)

  // Charge les établissements depuis l'API publique
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/platform/etablissements/public').then(r => r.json()).then(data => data)
      .then(data => { setEtabs(Array.isArray(data) ? data : []); setFiltered(Array.isArray(data) ? data : []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filtre la recherche
  useEffect(() => {
    if (!search) { setFiltered(etabs); return }
    setFiltered(etabs.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, etabs])

  const handleNext = () => {
    if (!selected) return
    // Stocke l'établissement sélectionné pour la page de login
    sessionStorage.setItem('selectedEtab', JSON.stringify(selected))
    navigate('/login')
  }

  return (
    <div style={{ fontFamily:ft, background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background:'none', border:'none', fontSize:15, fontWeight:500, color:'#aaa', cursor:'pointer', fontFamily:ft }}
        >
          ‹ Retour
        </button>
        <span style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px', color:'#111' }}>Miralabs.</span>
        <button
          onClick={handleNext}
          style={{
            background:'none', border:'none', fontSize:15, fontWeight:600,
            color:'#111', cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily:ft, opacity: selected ? 1 : 0.3,
            pointerEvents: selected ? 'auto' : 'none',
          }}
        >
          Suivant ›
        </button>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'0 36px 140px', justifyContent:'center' }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#111', textAlign:'center', marginBottom:8, letterSpacing:'-0.3px' }}>
          Votre établissement
        </h2>
        <p style={{ fontSize:14, color:'#9ca3af', textAlign:'center', lineHeight:1.5, marginBottom:36 }}>
          Choisissez l'établissement<br/>auquel vous appartenez.
        </p>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{
            width:'100%', background:'#f2f2f2', border:'none', borderRadius:12,
            padding:'12px 16px', fontSize:15, fontFamily:ft, outline:'none',
            color:'#111', marginBottom:12,
          }}
        />

        {/* Liste */}
        <div style={{ width:'100%' }}>
          {loading ? (
            <div style={{ textAlign:'center', color:'#aaa', padding:'32px 0', fontSize:14 }}>
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', color:'#aaa', padding:'32px 0', fontSize:14 }}>
              Aucun établissement trouvé
            </div>
          ) : filtered.map((e, i) => {
            const isSelected = selected?.id === e.id
            return (
              <button
                key={e.id}
                onClick={() => setSelected(isSelected ? null : e)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', padding:'16px 18px',
                  border:'none',
                  borderTop: i === 0 ? '1px solid #f0f0f0' : 'none',
                  borderBottom:'1px solid #f0f0f0',
                  cursor:'pointer', fontFamily:ft, textAlign:'left',
                  background: isSelected ? '#111' : '#fff',
                  transition:'background 0.15s',
                }}
              >
                <div>
                  <span style={{ fontSize:16, fontWeight:600, display:'block', marginBottom:3, color: isSelected ? '#fff' : '#111' }}>
                    {e.name}
                  </span>
                  <span style={{ fontSize:13, display:'block', color: isSelected ? 'rgba(255,255,255,0.5)' : '#aaa' }}>
                    {e.code}{e.adresse ? ` · ${e.adresse}` : ''}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, padding:'12px 24px 32px', background:'#fff' }}>
        <button
          onClick={handleNext}
          disabled={!selected}
          style={{
            width:'100%', padding:15, borderRadius:12, border:'none',
            fontSize:16, fontWeight:700, cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily:ft, transition:'all 0.15s',
            background: selected ? '#111' : '#f2f2f2',
            color: selected ? '#fff' : '#aaa',
          }}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}