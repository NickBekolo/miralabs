import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, Check } from 'lucide-react'
import { useThemeStore } from '../../store/ThemeStore'

const sf = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
const API = 'http://192.168.1.35:8000'

export default function SelectEtablissement() {
  const navigate = useNavigate()
  const dark = useThemeStore(s => s.darkMode)
  const bg = dark ? '#0a0a0a' : '#fff'
  const text = dark ? '#fff' : '#0a0a0a'
  const muted = dark ? '#888' : '#9ca3af'
  const border = dark ? '#2a2a2a' : '#f0f0f0'
  const surface = dark ? '#1a1a1a' : '#f9f9f9'
  const [step,      setStep]     = useState('ville')
  const [villes,    setVilles]   = useState([])
  const [etabs,     setEtabs]    = useState([])
  const [ville,     setVille]    = useState(null)
  const [search,    setSearch]   = useState('')
  const [loading,   setLoading]  = useState(true)
  const [selected,  setSelected] = useState(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('api_url')) { navigate('/login'); return }
    fetch(`${API}/api/public/villes`)
      .then(r => r.json())
      .then(d => setVilles(Array.isArray(d) ? d.filter(Boolean) : []))
      .catch(() => setVilles(['Jonzac', 'Paris', 'Douala', 'Yaoundé']))
      .finally(() => setLoading(false))
  }, [])

  const selectVille = (v) => {
    setAnimating(true)
    setVille(v); setSearch(''); setSelected(null); setLoading(true)
    fetch(`${API}/api/public/etablissements/ville/${encodeURIComponent(v)}`)
      .then(r => r.json())
      .then(d => setEtabs(Array.isArray(d) ? d : []))
      .catch(() => setEtabs([]))
      .finally(() => {
        setLoading(false)
        setTimeout(() => { setStep('etab'); setAnimating(false) }, 50)
      })
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
    <div style={{ fontFamily:sf, background:dark?'#0a0a0a':'#f5f5f5', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', boxSizing:'border-box' }}>

      <div style={{ background:bg, width:'100%', maxWidth:480, minHeight:'100vh', display:'flex', flexDirection:'column', boxSizing:'border-box' }}>
      {/* Header */}
      <div style={{ padding:'52px 24px 0', flexShrink:0 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:26, fontWeight:500, color:text, letterSpacing:'-0.5px' }}>Miralabs.</div>
        </div>

        {step === 'etab' && (
          <button onClick={() => { setStep('ville'); setSearch(''); setSelected(null) }}
            style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:dark?'rgba(255,255,255,0.6)':'#666', fontFamily:sf, fontSize:14, fontWeight:500, padding:0, marginBottom:24 }}>
            <ChevronLeft size={16} strokeWidth={2}/> Retour
          </button>
        )}

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:28, fontWeight:700, color:text, letterSpacing:'-0.5px', marginBottom:6 }}>
            {step === 'ville' ? 'Ta ville' : 'Ton établissement'}
          </div>
          <div style={{ fontSize:15, color:muted }}>
            {step === 'ville' ? 'Sélectionne la ville de ton école.' : `Établissements à ${ville}`}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10, background:dark?'#1a1a1a':'#f5f5f5', borderRadius:980, padding:'12px 18px', marginBottom:8 }}>
          <Search size={15} color="#9ca3af" strokeWidth={2} style={{ flexShrink:0 }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ border:'none', background:'transparent', fontSize:15, outline:'none', fontFamily:sf, color:text, width:'100%' }}/>
        </div>
      </div>

      {/* Liste */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 24px 120px', opacity:animating?0:1, transform:animating?'translateX(20px)':'translateX(0)', transition:'opacity 0.25s ease, transform 0.25s ease' }}>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:muted, fontSize:14 }}>Chargement...</div>

        ) : step === 'ville' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {fv.map(v => (
              <button key={v} onClick={() => selectVille(v)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', background:bg, border:`1.5px solid ${border}`, borderRadius:16, cursor:'pointer', fontFamily:sf, width:'100%', textAlign:'left', boxSizing:'border-box', transition:'border 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#2F2F2F'; e.currentTarget.style.background='#2F2F2F'; e.currentTarget.querySelector('span').style.color='#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=border; e.currentTarget.style.background=dark?'#1a1a1a':'#fff'; e.currentTarget.querySelector('span').style.color=text }}>
                <span style={{ fontSize:16, fontWeight:400, color:text }}>{v}</span>
              </button>
            ))}
          </div>

        ) : fe.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:muted, fontSize:14 }}>Aucun établissement trouvé</div>

        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {fe.map(e => {
              const sel = selected?.id === e.id
              return (
                <button key={e.id} onClick={() => setSelected(sel ? null : e)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'18px 20px', background:sel?(dark?'#2F2F2F':'#0a0a0a'):(dark?'#1a1a1a':'#f9f9f9'), border:'none', borderRadius:16, cursor:'pointer', fontFamily:sf, width:'100%', textAlign:'left', boxSizing:'border-box', transition:'all 0.25s ease' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:16, fontWeight:sel?600:400, color:sel?'#fff':text, transition:'all 0.2s' }}>{e.name}</div>
                    <div style={{ fontSize:13, color:sel?'rgba(255,255,255,0.6)':muted, marginTop:2 }}>{e.type}</div>
                  </div>
                  <div style={{ width:sel?28:0, height:28, borderRadius:'50%', background:dark?'#2F2F2F':'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden', opacity:sel?1:0, transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                    <Check size={14} color='#fff' strokeWidth={3}/>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bouton bas fixe */}
      {step === 'etab' && (
        <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, padding:'16px 24px 32px', background:`linear-gradient(to top, ${bg} 80%, transparent)`, boxSizing:'border-box' }}>
          <button onClick={confirm} disabled={!selected}
            style={{ width:'100%', padding:'16px 0', fontSize:16, fontWeight:600, fontFamily:sf, color:selected?'#fff':(dark?'#555':'#aaa'), background:selected?(dark?'#2F2F2F':'#0a0a0a'):(dark?'#2a2a2a':'#d1d1d1'), border:'none', borderRadius:980, cursor:selected?'pointer':'not-allowed', transition:'background 0.2s' }}>
            {selected ? `Continuer avec ${selected.name.split(' ').slice(0,3).join(' ')}` : 'Sélectionne un établissement'}
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
