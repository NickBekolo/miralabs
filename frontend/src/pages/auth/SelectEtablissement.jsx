import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, ChevronLeft } from 'lucide-react'

const sf = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
const API = 'http://192.168.1.35:8000'

export default function SelectEtablissement() {
  const navigate = useNavigate()
  const [step,     setStep]    = useState('ville')
  const [villes,   setVilles]  = useState([])
  const [etabs,    setEtabs]   = useState([])
  const [ville,    setVille]   = useState(null)
  const [search,   setSearch]  = useState('')
  const [loading,  setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('api_url')) { navigate('/login'); return }
    fetch(`${API}/api/public/villes`)
      .then(r => r.json())
      .then(d => setVilles(Array.isArray(d) ? d.filter(Boolean) : []))
      .catch(() => setVilles(['Jonzac', 'Paris', 'Douala', 'Yaoundé']))
      .finally(() => setLoading(false))
  }, [])

  const selectVille = (v) => {
    setVille(v); setSearch(''); setSelected(null); setLoading(true)
    fetch(`${API}/api/public/etablissements/ville/${encodeURIComponent(v)}`)
      .then(r => r.json())
      .then(d => setEtabs(Array.isArray(d) ? d : []))
      .catch(() => setEtabs([]))
      .finally(() => { setLoading(false); setStep('etab') })
  }

  const confirm = () => {
    if (!selected) return
    localStorage.setItem('api_url', selected.api_url)
    localStorage.setItem('etablissement', JSON.stringify(selected))
    navigate('/login')
  }

  const fv = villes.filter(v => v?.toLowerCase().includes(search.toLowerCase()))
  const fe = etabs.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ fontFamily:sf, background:'#fff', minHeight:'100vh', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', padding:'48px 24px 32px', boxSizing:'border-box' }}>

      {/* Titre */}
      <div style={{ marginBottom:32 }}>
        {step === 'etab' && (
          <button onClick={() => { setStep('ville'); setSearch(''); setSelected(null) }}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, color:'#9ca3af', fontFamily:sf, fontSize:14, fontWeight:600, padding:0, marginBottom:20 }}>
            <ChevronLeft size={16} strokeWidth={2}/> Retour
          </button>
        )}
        <div style={{ fontSize:28, fontWeight:800, color:'#0a0a0a', letterSpacing:'-0.5px', marginBottom:6 }}>
          {step === 'ville' ? 'Ta ville' : 'Ton établissement'}
        </div>
        <div style={{ fontSize:14, color:'#9ca3af' }}>
          {step === 'ville' ? 'Sélectionne la ville de ton école.' : `Établissements à ${ville}`}
        </div>
      </div>

      {/* Recherche */}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f5f5f5', border:'1.5px solid #ebebeb', borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
        <Search size={15} color="#9ca3af" strokeWidth={2} style={{ flexShrink:0 }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
          style={{ border:'none', background:'transparent', fontSize:15, outline:'none', fontFamily:sf, color:'#0a0a0a', width:'100%' }}/>
      </div>

      {/* Liste */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingBottom:16 }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:14 }}>Chargement...</div>
        ) : step === 'ville' ? (
          fv.map(v => (
            <button key={v} onClick={() => selectVille(v)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'16px', background:'#f9f9f9', border:'1.5px solid #ebebeb', borderRadius:14, cursor:'pointer', fontFamily:sf, width:'100%', textAlign:'left', boxSizing:'border-box' }}
              onMouseEnter={e => { e.currentTarget.style.background='#0a0a0a'; e.currentTarget.style.borderColor='#0a0a0a'; e.currentTarget.querySelectorAll('*').forEach(c=>c.style.color='#fff') }}
              onMouseLeave={e => { e.currentTarget.style.background='#f9f9f9'; e.currentTarget.style.borderColor='#ebebeb'; e.currentTarget.querySelectorAll('*').forEach(c=>c.style.color='') }}>
              <MapPin size={16} color="#9ca3af" strokeWidth={1.8} style={{ flexShrink:0 }}/>
              <span style={{ fontSize:15, fontWeight:600, color:'#0a0a0a', flex:1 }}>{v}</span>
            </button>
          ))
        ) : fe.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:14 }}>Aucun établissement trouvé</div>
        ) : (
          fe.map(e => {
            const sel = selected?.id === e.id
            return (
              <button key={e.id} onClick={() => setSelected(sel ? null : e)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'16px', background:sel?'#0a0a0a':'#f9f9f9', border:`1.5px solid ${sel?'#0a0a0a':'#ebebeb'}`, borderRadius:14, cursor:'pointer', fontFamily:sf, width:'100%', textAlign:'left', boxSizing:'border-box' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:sel?'#fff':'#0a0a0a', marginBottom:2 }}>{e.name}</div>
                  <div style={{ fontSize:12, color:sel?'rgba(255,255,255,0.5)':'#9ca3af' }}>{e.type}</div>
                </div>
                {sel && <span style={{ color:'#fff', fontSize:18 }}>✓</span>}
              </button>
            )
          })
        )}
      </div>

      {/* Bouton confirmer fixe en bas */}
      {step === 'etab' && (
        <div style={{ position:'sticky', bottom:0, background:'#fff', paddingTop:12, paddingBottom:'env(safe-area-inset-bottom, 16px)', marginTop:'auto' }}>
          <button onClick={confirm} disabled={!selected}
            style={{ width:'100%', padding:'16px 0', fontSize:16, fontWeight:700, fontFamily:sf, color:'#fff', background:selected?'#0a0a0a':'#d1d1d1', border:'none', borderRadius:14, cursor:selected?'pointer':'not-allowed', transition:'background 0.2s' }}>
            Continuer
          </button>
        </div>
      )}
    </div>
  )
}
