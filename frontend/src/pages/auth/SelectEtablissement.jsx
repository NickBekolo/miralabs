import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, ChevronRight, ArrowLeft, School, Building2 } from 'lucide-react'

const sf = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"
const API = 'http://127.0.0.1:8000'

function FadeIn({ children, delay=0 }) {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t) }, [delay])
  return <div style={{ opacity:v?1:0, transform:v?'translateY(0)':'translateY(12px)', transition:'opacity 0.35s ease, transform 0.35s ease' }}>{children}</div>
}

export default function SelectEtablissement() {
  const navigate = useNavigate()
  const [step,    setStep]    = useState('ville')
  const [villes,  setVilles]  = useState([])
  const [etabs,   setEtabs]   = useState([])
  const [ville,   setVille]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('api_url')) { navigate('/login'); return }
    fetch(`${API}/api/public/villes`)
      .then(r => r.json())
      .then(d => setVilles(Array.isArray(d) ? d.filter(Boolean) : []))
      .catch(() => setVilles(['Jonzac','Paris','Douala','Yaoundé']))
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

  const btnStyle = (active) => ({
    width:'100%', padding:16, fontSize:16, fontFamily:sf, fontWeight:700,
    color:'#fff', background:active?'#0a0a0a':'#e5e5e5',
    border:'none', borderRadius:980, cursor:active?'pointer':'not-allowed',
    letterSpacing:'-0.3px', transition:'background 0.2s', boxSizing:'border-box',
  })

  return (
    <div style={{ background:'#fff', minHeight:'100vh' }}>
      <div style={{ fontFamily:sf, background:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', padding:'48px 28px 32px', boxSizing:'border-box' }}>

        {/* Progress */}
        <div style={{ display:'flex', gap:6, marginBottom:44 }}>
          {['ville','etab'].map((s,i) => (
            <div key={s} style={{ flex:1, height:3, borderRadius:2, background:i<=['ville','etab'].indexOf(step)?'#0a0a0a':'#f0f0f0', transition:'background 0.3s' }}/>
          ))}
        </div>

        {/* ÉTAPE 1 — Ville */}
        {step === 'ville' && (
          <>
            <FadeIn delay={0}>
              <div style={{ marginBottom:32 }}>
                <div style={{ fontSize:12, color:'#9ca3af', fontWeight:700, marginBottom:8, letterSpacing:'0.8px', textTransform:'uppercase' }}>bienvenue</div>
                <div style={{ fontSize:34, fontWeight:700, letterSpacing:'-2px', color:'#0a0a0a', lineHeight:1.1, marginBottom:12 }}>ta ville ?</div>
                <div style={{ fontSize:14, color:'#9ca3af', fontWeight:500 }}>Sélectionne la ville de ton établissement</div>
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f9f9f9', border:'1px solid #e5e5e5', borderRadius:14, padding:'12px 16px', marginBottom:24 }}>
                <Search size={16} color="#9ca3af" strokeWidth={2}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une ville..."
                  style={{ border:'none', background:'transparent', fontSize:15, outline:'none', fontFamily:sf, color:'#0a0a0a', width:'100%', fontWeight:500 }}/>
              </div>
            </FadeIn>

            {loading ? (
              <div style={{ textAlign:'center', padding:32, color:'#9ca3af', fontSize:14, fontWeight:700 }}>chargement...</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {fv.map((v, i) => (
                  <FadeIn key={v} delay={i*50}>
                    <button onClick={() => selectVille(v)}
                      style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 20px', background:'#fff', border:'1.5px solid #e5e5e5', borderRadius:16, cursor:'pointer', fontFamily:sf, width:'100%', textAlign:'left', transition:'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background='#0a0a0a'; e.currentTarget.style.borderColor='#0a0a0a'; Array.from(e.currentTarget.children).forEach(c => c.style.color='#fff') }}
                      onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e5e5e5'; Array.from(e.currentTarget.children).forEach(c => c.style.color='') }}>
                      <MapPin size={20} color="#9ca3af" strokeWidth={1.5} style={{ flexShrink:0 }}/>
                      <span style={{ fontSize:17, fontWeight:700, color:'#0a0a0a', flex:1, letterSpacing:'-0.3px' }}>{v}</span>
                      <ChevronRight size={16} color="#d1d5db" strokeWidth={2} style={{ flexShrink:0 }}/>
                    </button>
                  </FadeIn>
                ))}
              </div>
            )}
          </>
        )}

        {/* ÉTAPE 2 — Établissement */}
        {step === 'etab' && (
          <>
            <FadeIn delay={0}>
              <button onClick={() => { setStep('ville'); setSearch(''); setSelected(null) }}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#9ca3af', fontFamily:sf, fontWeight:700, padding:0, marginBottom:28, display:'flex', alignItems:'center', gap:6 }}>
                <ArrowLeft size={16} strokeWidth={2}/> retour
              </button>
              <div style={{ marginBottom:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <MapPin size={14} color="#9ca3af" strokeWidth={2}/>
                  <span style={{ fontSize:12, color:'#9ca3af', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase' }}>{ville}</span>
                </div>
                <div style={{ fontSize:34, fontWeight:700, letterSpacing:'-2px', color:'#0a0a0a', lineHeight:1.1 }}>ton établissement ?</div>
              </div>
            </FadeIn>

            <FadeIn delay={60}>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f9f9f9', border:'1px solid #e5e5e5', borderRadius:14, padding:'12px 16px', marginBottom:20 }}>
                <Search size={16} color="#9ca3af" strokeWidth={2}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un établissement..."
                  style={{ border:'none', background:'transparent', fontSize:15, outline:'none', fontFamily:sf, color:'#0a0a0a', width:'100%', fontWeight:500 }}/>
              </div>
            </FadeIn>

            {loading ? (
              <div style={{ textAlign:'center', padding:32, color:'#9ca3af', fontSize:14, fontWeight:700 }}>chargement...</div>
            ) : fe.length===0 ? (
              <div style={{ textAlign:'center', padding:32, color:'#9ca3af', fontSize:14, fontWeight:700 }}>aucun établissement trouvé</div>
            ) : (
              <div style={{ flex:1, overflowY:'auto', marginBottom:24 }}>
                {fe.map((e, i) => {
                  const sel = selected?.id === e.id
                  return (
                    <FadeIn key={e.id} delay={i*50}>
                      <button onClick={() => setSelected(sel ? null : e)}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px', borderRadius:16, border:`1.5px solid ${sel?'#0a0a0a':'#e5e5e5'}`, background:sel?'#0a0a0a':'#fff', cursor:'pointer', fontFamily:sf, width:'100%', textAlign:'left', marginBottom:10, transition:'all 0.18s ease', boxSizing:'border-box' }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:sel?'rgba(255,255,255,0.15)':'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {e.type==='lycee' ? <School size={20} color={sel?'#fff':'#666'} strokeWidth={1.5}/> : <Building2 size={20} color={sel?'#fff':'#666'} strokeWidth={1.5}/>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:15, fontWeight:700, color:sel?'#fff':'#0a0a0a', letterSpacing:'-0.3px', marginBottom:3 }}>{e.name}</div>
                          <div style={{ fontSize:12, color:sel?'rgba(255,255,255,0.55)':'#9ca3af', fontWeight:500 }}>{e.type} · {e.code}</div>
                        </div>
                        {sel && <ChevronRight size={16} color="rgba(255,255,255,0.5)" strokeWidth={2}/>}
                      </button>
                    </FadeIn>
                  )
                })}
              </div>
            )}

            <button onClick={confirm} disabled={!selected} style={btnStyle(!!selected)}>
              {"c'est parti →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}