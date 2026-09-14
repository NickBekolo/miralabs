import { useState, useRef, useEffect } from 'react'
import { X, Check, PenLine, ShieldCheck } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function Signature({ onClose }) {
  const { user } = useAuth()
  const [step,    setStep]    = useState('code')
  const [code,    setCode]    = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState(null)
  const [appel,   setAppel]   = useState(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [showCanvas,   setShowCanvas]   = useState(false)
  const canvasRef = useRef(null)
  const inputRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()]
  const drawing   = useRef(false)

  useEffect(() => { inputRefs[0].current?.focus() }, [])

  useEffect(() => {
    // Vérifier si l'étudiant a une signature enregistrée
    api.get('/api/me').then(r => {
      if (r.data.signatureUrl) setHasSignature(true)
    }).catch(()=>{})

    // Charger l'appel en cours
    api.get('/api/appels/en-cours').then(r => {
      if (r.data.length > 0) {
        setAppel(r.data[0])
        const c = r.data[0].codeSignature.split('')
        setCode(c)
      }
    }).catch(()=>{})
  }, [])

  const handleCodeInput = (val, i) => {
    const newCode = [...code]
    newCode[i] = val.toUpperCase().slice(-1)
    setCode(newCode)
    if (val && i < 5) inputRefs[i+1].current?.focus()
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs[i-1].current?.focus()
  }

  const startDraw = (x, y) => {
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (x, y) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const endDraw = () => { drawing.current = false }

  const effacer = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const signer = async () => {
    if (!appel) { setMsg('Aucun appel en cours.'); return }
    setLoading(true); setMsg(null)
    try {
      const payload = { code: code.join('') }
      
      if (showCanvas || !hasSignature) {
        const canvas = canvasRef.current
        payload.signature = canvas.toDataURL('image/png')
      }

      await api.post(`/api/appels/signer`, payload)
      setStep('done')
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Erreur lors de la signature.')
    } finally { setLoading(false) }
  }

  const C = { bg:'#f5f5f7', surface:'#fff', text:'#1d1d1f', muted:'#6e6e73', hint:'#aeaeb2', surface2:'#e5e5ea' }

  if (step === 'done') return (
    <div style={{ fontFamily:ft, background:C.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Check size={32} color="#fff"/>
      </div>
      <div style={{ fontSize:18, fontWeight:500, color:C.text }}>Présence confirmée !</div>
      <div style={{ fontSize:13, color:C.muted }}>Votre émargement a bien été enregistré.</div>
      <button onClick={onClose} style={{ marginTop:8, padding:'10px 24px', borderRadius:10, background:'#111', color:'#fff', border:'none', fontSize:14, cursor:'pointer' }}>Fermer</button>
    </div>
  )

  return (
    <div style={{ fontFamily:ft, background:'#fff', padding:'24px 20px 20px' }}>
      <div style={{ maxWidth:'100%' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:500, color:C.text }}>Émargement</div>
            <div style={{ fontSize:12, color:C.muted }}>Signez votre présence</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}>
            <X size={20} color={C.muted}/>
          </button>
        </div>

        {/* Code */}
        <div style={{ background:C.surface, borderRadius:14, padding:'20px', marginBottom:16 }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Code de l'appel</div>
          <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
            {code.map((c2, i) => (
              <input key={i} ref={inputRefs[i]} value={c2}
                onChange={e => handleCodeInput(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                maxLength={1}
                style={{ width:40, height:48, textAlign:'center', fontSize:20, fontWeight:600, borderRadius:10, border:`1.5px solid ${C.surface2}`, background:C.bg, color:C.text, outline:'none' }}
              />
            ))}
          </div>
        </div>

        {/* Signature */}
        {hasSignature && !showCanvas ? (
          <div style={{ background:C.surface, borderRadius:14, padding:'16px 20px', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <ShieldCheck size={16} color="#22c55e"/>
              <div style={{ fontSize:13, color:C.text }}>Signature enregistrée</div>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Votre signature personnelle sera utilisée automatiquement.</div>
            <button onClick={() => setShowCanvas(true)} style={{ fontSize:12, color:'#007AFF', background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Utiliser une nouvelle signature
            </button>
          </div>
        ) : (
          <div style={{ background:C.surface, borderRadius:14, padding:'16px 20px', marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, color:C.text }}>Votre signature</div>
              <button onClick={effacer} style={{ fontSize:12, color:C.muted, background:'none', border:'none', cursor:'pointer' }}>Effacer</button>
            </div>
            <canvas ref={canvasRef} width={360} height={120}
              style={{ width:'100%', height:120, borderRadius:10, border:`1.5px solid ${C.surface2}`, background:'#fafafa', cursor:'crosshair', touchAction:'none' }}
              onMouseDown={e => { const r = canvasRef.current.getBoundingClientRect(); startDraw(e.clientX-r.left, e.clientY-r.top) }}
              onMouseMove={e => { const r = canvasRef.current.getBoundingClientRect(); draw(e.clientX-r.left, e.clientY-r.top) }}
              onMouseUp={endDraw}
              onTouchStart={e => { e.preventDefault(); const r = canvasRef.current.getBoundingClientRect(); const t = e.touches[0]; startDraw(t.clientX-r.left, t.clientY-r.top) }}
              onTouchMove={e => { e.preventDefault(); const r = canvasRef.current.getBoundingClientRect(); const t = e.touches[0]; draw(t.clientX-r.left, t.clientY-r.top) }}
              onTouchEnd={endDraw}
            />
            {!hasSignature && (
              <div style={{ fontSize:11, color:C.muted, marginTop:8 }}>Cette signature sera enregistrée pour vos prochains émargements.</div>
            )}
          </div>
        )}

        {msg && <div style={{ color:'#dc2626', fontSize:13, marginBottom:12, textAlign:'center' }}>{msg}</div>}

        <button onClick={signer} disabled={loading}
          style={{ width:'100%', padding:'14px', borderRadius:12, background:'#111', color:'#fff', border:'none', fontSize:15, fontWeight:500, cursor:'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Signature en cours...' : "Confirmer ma présence"}
        </button>
      </div>
    </div>
  )
}
