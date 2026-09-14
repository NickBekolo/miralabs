import { useState, useRef, useEffect } from 'react'
import { X, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function Signature({ onClose }) {
  const [code,         setCode]         = useState(['','','','','',''])
  const [loading,      setLoading]      = useState(false)
  const [msg,          setMsg]          = useState(null)
  const [appel,        setAppel]        = useState(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState(null)
  const [showCanvas,   setShowCanvas]   = useState(false)
  const [showPreview,  setShowPreview]  = useState(false)
  const [done,         setDone]         = useState(false)
  const canvasRef = useRef(null)
  const inputRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()]
  const drawing   = useRef(false)
  const baseUrl   = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  useEffect(() => { inputRefs[0].current?.focus() }, [])

  useEffect(() => {
    api.get('/api/me').then(r => {
      if (r.data.signatureUrl) { setHasSignature(true); setSignatureUrl(r.data.signatureUrl) }
    }).catch(()=>{})
    api.get('/api/appels/en-cours').then(r => {
      if (r.data.length > 0) { setAppel(r.data[0]); setCode(r.data[0].codeSignature.split('')) }
    }).catch(()=>{})
  }, [])

  const handleCodeInput = (val, i) => {
    const n = [...code]; n[i] = val.toUpperCase().slice(-1); setCode(n)
    if (val && i < 5) inputRefs[i+1].current?.focus()
  }
  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs[i-1].current?.focus()
  }
  const startDraw = (x, y) => {
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath(); ctx.moveTo(x, y)
  }
  const draw = (x, y) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y); ctx.strokeStyle = '#1d1d1f'
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke()
  }
  const endDraw = () => { drawing.current = false }
  const effacer = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }
  const signer = async () => {
    if (!appel) { setMsg('Aucun appel en cours.'); return }
    setLoading(true); setMsg(null)
    try {
      const payload = { code: code.join('') }
      if (showCanvas || !hasSignature) payload.signature = canvasRef.current.toDataURL('image/png')
      await api.post('/api/appels/signer', payload)
      setDone(true)
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Erreur lors de la signature.')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div style={{ fontFamily:ft, padding:'32px 24px 28px', textAlign:'center' }}>
      <div style={{ width:52, height:52, borderRadius:'50%', background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
        <Check size={26} color="#fff" strokeWidth={2.5}/>
      </div>
      <div style={{ fontSize:17, fontWeight:700, color:'#1d1d1f', marginBottom:6 }}>Présence confirmée</div>
      <div style={{ fontSize:14, color:'#6e6e73', marginBottom:24, lineHeight:1.5 }}>Votre émargement a bien été enregistré.</div>
      <button onClick={onClose} style={{ width:'100%', padding:'14px', borderRadius:14, background:'#1d1d1f', color:'#fff', border:'none', fontSize:15, fontWeight:600, cursor:'pointer' }}>
        Fermer
      </button>
    </div>
  )

  return (
    <div style={{ fontFamily:ft, padding:'20px 24px 24px', background:'#fff' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ width:48, height:48, borderRadius:14, border:'2px solid #1d1d1f', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ShieldCheck size={24} color="#1d1d1f" strokeWidth={1.5}/>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#aeaeb2', padding:4 }}>
          <X size={18}/>
        </button>
      </div>

      {/* Titre */}
      <div style={{ fontSize:18, fontWeight:700, color:'#1d1d1f', marginBottom:6, lineHeight:1.3 }}>
        Signez votre présence
      </div>
      <div style={{ fontSize:14, color:'#6e6e73', marginBottom:24, lineHeight:1.5 }}>
        {appel ? `Cours avec ${appel.enseignant}` : 'Chargement de l\'appel...'}
      </div>

      {/* Code */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#aeaeb2', letterSpacing:'0.5px', marginBottom:10 }}>Code de l'appel</div>
        <div style={{ display:'flex', gap:8 }}>
          {code.map((c2, i) => (
            <input key={i} ref={inputRefs[i]} value={c2}
              onChange={e => handleCodeInput(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              maxLength={1}
              style={{ flex:1, height:44, textAlign:'center', fontSize:18, fontWeight:700, borderRadius:8, border:'1.5px solid #e5e5ea', background:'#f5f5f7', color:'#1d1d1f', outline:'none', minWidth:0 }}
            />
          ))}
        </div>
      </div>

      {/* Signature */}
      {hasSignature && !showCanvas ? (
        <div style={{ background:'#f5f5f7', borderRadius:12, padding:'14px 16px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showPreview ? 10 : 0 }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#1d1d1f' }}>Signature enregistrée</div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <button onClick={() => setShowPreview(!showPreview)}
                style={{ fontSize:12, color:'#6e6e73', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                {showPreview ? <EyeOff size={13}/> : <Eye size={13}/>}
                {showPreview ? 'Masquer' : 'Voir'}
              </button>
              <button onClick={() => setShowCanvas(true)}
                style={{ fontSize:12, color:'#007AFF', background:'none', border:'none', cursor:'pointer' }}>
                Modifier
              </button>
            </div>
          </div>
          {showPreview && signatureUrl && (
            <img src={baseUrl + signatureUrl} alt="signature"
              style={{ width:'100%', height:60, objectFit:'contain', borderRadius:8, background:'#fff', border:'1px solid #e5e5ea' }}/>
          )}
        </div>
      ) : (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#aeaeb2', letterSpacing:'0.5px', textTransform:'uppercase' }}>
              {hasSignature ? 'Nouvelle signature' : 'Votre signature'}
            </div>
            <button onClick={effacer} style={{ fontSize:12, color:'#aeaeb2', background:'none', border:'none', cursor:'pointer' }}>Effacer</button>
          </div>
          <canvas ref={canvasRef} width={400} height={100}
            style={{ width:'100%', height:100, borderRadius:10, border:'1.5px solid #e5e5ea', background:'#fafafa', cursor:'crosshair', touchAction:'none', display:'block' }}
            onMouseDown={e => { const r = canvasRef.current.getBoundingClientRect(); startDraw(e.clientX-r.left, e.clientY-r.top) }}
            onMouseMove={e => { const r = canvasRef.current.getBoundingClientRect(); draw(e.clientX-r.left, e.clientY-r.top) }}
            onMouseUp={endDraw}
            onTouchStart={e => { e.preventDefault(); const r = canvasRef.current.getBoundingClientRect(); const t = e.touches[0]; startDraw(t.clientX-r.left, t.clientY-r.top) }}
            onTouchMove={e => { e.preventDefault(); const r = canvasRef.current.getBoundingClientRect(); const t = e.touches[0]; draw(t.clientX-r.left, t.clientY-r.top) }}
            onTouchEnd={endDraw}
          />
          {!hasSignature && (
            <div style={{ fontSize:11, color:'#aeaeb2', marginTop:6 }}>Sera enregistrée pour vos prochains émargements.</div>
          )}
        </div>
      )}

      {msg && <div style={{ color:'#dc2626', fontSize:12, marginBottom:12, textAlign:'center' }}>{msg}</div>}

      <button onClick={signer} disabled={loading}
        style={{ width:'100%', padding:'14px', borderRadius:14, background:'#1d1d1f', color:'#fff', border:'none', fontSize:15, fontWeight:600, cursor:'pointer', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'En cours...' : 'Confirmer ma présence'}
      </button>
    </div>
  )
}
