import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, ft } from '../../constants/theme'

export default function SelectEtablissement() {
  const navigate  = useNavigate()
  const [etabs,   setEtabs]   = useState([])
  const [search,  setSearch]  = useState('')
  const [selected,setSelected]= useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/platform/etablissements/public')
      .then(r => r.json())
      .then(data => setEtabs(Array.isArray(data) ? data : []))
      .catch(() => setEtabs([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? etabs.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase())
      )
    : etabs

  const handleNext = () => {
    if (!selected) return
    sessionStorage.setItem('selectedEtab', JSON.stringify(selected))
    navigate('/login')
  }

  return (
    <div style={{ fontFamily:ft, background:T.bg, minHeight:'100vh', display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px' }}>
        <button onClick={() => navigate(-1)}
          style={{ background:'none', border:'none', fontSize:15, fontWeight:500, color:T.hint, cursor:'pointer', fontFamily:ft }}>
          ‹ Retour
        </button>
        <span style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px', color:T.text }}>Miralabs.</span>
        <button onClick={handleNext}
          style={{ background:'none', border:'none', fontSize:15, fontWeight:600, color:T.accent, cursor: selected ? 'pointer' : 'not-allowed', fontFamily:ft, opacity: selected ? 1 : 0.3, pointerEvents: selected ? 'auto' : 'none' }}>
          Suivant ›
        </button>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'0 36px 140px', justifyContent:'center' }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:T.text, textAlign:'center', marginBottom:8, letterSpacing:'-0.3px' }}>
          Votre établissement
        </h2>
        <p style={{ fontSize:14, color:T.muted, textAlign:'center', lineHeight:1.5, marginBottom:36 }}>
          Choisissez l'établissement<br/>auquel vous appartenez.
        </p>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{ width:'100%', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 16px', fontSize:15, fontFamily:ft, outline:'none', color:T.text, marginBottom:12 }}
        />

        <div style={{ width:'100%' }}>
          {loading ? (
            <div style={{ textAlign:'center', color:T.hint, padding:'32px 0', fontSize:14 }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', color:T.hint, padding:'32px 0', fontSize:14 }}>Aucun établissement trouvé</div>
          ) : filtered.map((e, i) => {
            const isSel = selected?.id === e.id
            return (
              <button key={e.id} onClick={() => setSelected(isSel ? null : e)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', padding:'16px 18px',
                  border:'none', borderRadius:12, marginBottom:8,
                  borderTop: i === 0 ? `1px solid ${T.border}` : '12px solid',
                  borderBottom:`1px solid ${T.border}`,
                  cursor:'pointer', fontFamily:ft, textAlign:'left',
                  background: isSel ? T.accent : 'transparent',
                  transition:'background 0.15s',
                }}>
                <div>
                  <span style={{ fontSize:16, fontWeight:600, display:'block', marginBottom:3, color: isSel ? '#000' : T.text }}>
                    {e.name}
                  </span>
                  <span style={{ fontSize:13, display:'block', color: isSel ? 'rgba(0,0,0,0.5)' : T.muted }}>
                    {e.code}{e.adresse ? ` · ${e.adresse}` : ''}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, padding:'12px 24px 32px', background:T.bg, borderTop:`1px solid ${T.border}` }}>
        <button onClick={handleNext} disabled={!selected}
          style={{ width:'100%', padding:15, borderRadius:12, border:'none', fontSize:16, fontWeight:700, cursor: selected ? 'pointer' : 'not-allowed', fontFamily:ft, background: selected ? T.accent : T.surface2, color: selected ? '#000' : T.hint }}>
          Suivant
        </button>
      </div>
    </div>
  )
}
