import { useState, useRef, useEffect } from 'react'
import { StickyNoteCheck, Sparkles, X } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function Signature({ onClose }) {
  const [step,    setStep]    = useState('code')
  const [code,    setCode]    = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState(null)
  const [appel,   setAppel]   = useState(null)
  const canvasRef = useRef(null)
  const inputRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()]
  const drawing   = useRef(false)

  useEffect(() => { inputRefs[0].current?.focus() }, [])

  useEffect(() => {
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

  const verifyCode = async () => {
    if (code.join('').length < 6) return
    setLoading(true); setMsg(null)
    try { setStep('sign') }
    catch { setMsg('Code invalide.') }
    finally { setLoading(false) }
  }

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] ?? e
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    drawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0a0a0a'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
  }

  const stopDraw = () => { drawing.current = false }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  const submitSignature = async () => {
    if (!appel) { setMsg('Aucun appel en cours.'); return }
    setLoading(true); setMsg(null)
    try {
      const canvas = canvasRef.current
      const imageData = canvas.toDataURL('image/png')
      await api.post(`/api/appels/signer`, {
        code: code.join(''),
        signature: imageData,
      })
      setStep('done')
    } catch {
      setMsg('Erreur lors de la signature.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:'36px 32px', width:'100%', maxWidth:420, boxShadow:'0 32px 80px rgba(0,0,0,0.18)', fontFamily:ft, position:'relative' }}>

        {/* Bouton fermer */}
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:30, height:30, borderRadius:'50%', background:'#f5f5f5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={15} color="#666" strokeWidth={2}/>
        </button>

        {/* ÉTAPE 1 — Code */}
        {step === 'code' && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#000000ff', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:8 }}>Présence</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#0a0a0a', letterSpacing:'-0.5px', marginBottom:6 }}>Signer l'appel</div>
              <div style={{ fontSize:14, color:'#000000ff' }}>Saisissez le code affiché par votre professeur</div>
            </div>

            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:24 }}>
              {code.map((c, i) => (
                <input key={i} ref={inputRefs[i]}
                  value={c}
                  onChange={e => handleCodeInput(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  maxLength={1}
                  style={{ width:48, height:56, textAlign:'center', fontSize:24, fontWeight:700, fontFamily:ft, color:'#0a0a0a', background:'#f9f9f9', border:`2px solid ${c?'#0a0a0a':'#e5e5e5'}`, borderRadius:14, outline:'none', textTransform:'uppercase', transition:'border 0.2s' }}
                />
              ))}
            </div>

            {msg && <div style={{ textAlign:'center', fontSize:13, color:'#FF3B30', marginBottom:12 }}>{msg}</div>}

            <button onClick={verifyCode} disabled={code.join('').length < 6 || loading}
              style={{ width:'100%', padding:'15px 0', borderRadius:980, border:'none', background:code.join('').length===6?'#0a0a0a':'#f0f0f0', color:code.join('').length===6?'#fff':'#aaa', fontSize:15, fontWeight:600, cursor:code.join('').length===6?'pointer':'default', fontFamily:ft, transition:'all 0.2s' }}>
              {loading ? 'Vérification...' : 'Continuer'}
            </button>

            {appel && (
              <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#000000ff' }}>
                {appel.enseignant} · {appel.cours}
              </div>
            )}
          </>
        )}

        {/* ÉTAPE 2 — Signature */}
        {step === 'sign' && (
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#0a0a0a', letterSpacing:'-0.5px', marginBottom:6 }}>Votre signature</div>
              <div style={{ fontSize:14, color:'#000000ff' }}>Tracez votre signature dans la zone ci-dessous</div>
            </div>

            <div style={{ position:'relative', marginBottom:20 }}>
              <canvas ref={canvasRef} width={432} height={180}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ width:'100%', height:180, background:'#f9f9f9', borderRadius:16, border:'2px solid #e5e5e5', cursor:'crosshair', display:'block', touchAction:'none' }}
              />
              <button onClick={clearCanvas}
                style={{ position:'absolute', top:10, right:10, background:'#fff', border:'1px solid #e5e5e5', borderRadius:8, padding:'4px 12px', fontSize:12, color:'#666', cursor:'pointer', fontFamily:ft }}>
                Effacer
              </button>
            </div>

            {msg && <div style={{ textAlign:'center', fontSize:13, color:'#FF3B30', marginBottom:12 }}>{msg}</div>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep('code')}
                style={{ flex:1, padding:'14px 0', borderRadius:980, border:'1.5px solid #e5e5e5', background:'#fff', color:'#000000ff', fontSize:14, cursor:'pointer', fontFamily:ft }}>
                Retour
              </button>
              <button onClick={submitSignature} disabled={loading}
                style={{ flex:2, padding:'14px 0', borderRadius:980, border:'none', background:'#0a0a0a', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:ft, opacity:loading?0.7:1 }}>
                {loading ? 'Envoi...' : 'Confirmer'}
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 3 — Succès */}
        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20 }}>
              <StickyNoteCheck size={52} color="#0a0a0a" strokeWidth={1.5}/>
              <Sparkles size={20} color="#0a0a0a" strokeWidth={1.5}/>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:'#0a0a0a', letterSpacing:'-0.5px', marginBottom:8 }}>Présence confirmée !</div>
            <div style={{ fontSize:14, color:'#9ca3af', marginBottom:28 }}>Votre émargement a bien été enregistré.</div>
            <button onClick={onClose}
              style={{ padding:'14px 32px', borderRadius:980, border:'none', background:'#0a0a0a', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
              Fermer
            </button>
          </div>
        )}

        {/* ÉTAPE erreur */}
        {step === 'error' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:22, fontWeight:700, color:'#ff0d00ff', letterSpacing:'-0.5px', marginBottom:8 }}>Erreur</div>
            <div style={{ fontSize:14, color:'#9ca3af', marginBottom:28 }}>{msg}</div>
            <button onClick={() => setStep('code')}
              style={{ padding:'14px 32px', borderRadius:980, border:'none', background:'#0a0a0a', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
