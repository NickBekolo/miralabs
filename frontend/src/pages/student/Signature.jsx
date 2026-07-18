import { useState, useRef, useEffect } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function Signature({ onClose }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME

  const [step,    setStep]    = useState('code') // 'code' | 'sign' | 'done' | 'error'
  const [code,    setCode]    = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState(null)
  const [appel,   setAppel]   = useState(null)
  const canvasRef = useRef(null)
  const inputRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()]
  const drawing   = useRef(false)
  const lastPos   = useRef(null)

  // Focus premier champ
  useEffect(() => { inputRefs[0].current?.focus() }, [])

  // Vérifier appel en cours au chargement
  useEffect(() => {
    api.get('/api/appels/en-cours').then(r => {
      if (r.data.length > 0) {
        setAppel(r.data[0])
        // Pré-remplir le code
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
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputRefs[i-1].current?.focus()
    }
  }

  const verifyCode = async () => {
    const fullCode = code.join('')
    if (fullCode.length < 6) return
    setLoading(true); setMsg(null)
    try {
      // Vérifier si le code est valide en cherchant l'appel
      setStep('sign')
    } catch {
      setMsg({ ok:false, text:'Code invalide ou appel terminé.' })
    } finally { setLoading(false) }
  }

  // Canvas signature
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
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    lastPos.current = pos
  }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.strokeStyle = darkMode ? '#fff' : '#111'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const stopDraw = () => { drawing.current = false }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const submitSignature = async () => {
    const canvas = canvasRef.current
    const signature = canvas.toDataURL('image/png')
    const fullCode  = code.join('')
    setLoading(true)
    try {
      await api.post('/api/appels/signer', { code: fullCode, signature })
      setStep('done')
    } catch(e) {
      setMsg({ ok:false, text: e.response?.data?.error ?? 'Erreur lors de la signature.' })
      setStep('error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:C.bg, borderRadius:'24px 24px 0 0', padding:'24px 24px 48px', width:'100%', maxWidth:480, fontFamily:ft }}>

        {/* Handle */}
        <div style={{ width:40, height:4, background:C.surface2, borderRadius:2, margin:'0 auto 24px' }}/>

        {/* ÉTAPE 1 — Code */}
        {step === 'code' && (
          <>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>✏️</div>
              <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:6 }}>Signer l'appel</h2>
              <p style={{ fontSize:13, color:C.muted }}>Saisissez le code affiché par votre professeur</p>
            </div>

            {/* Code à 6 chiffres/lettres */}
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:24 }}>
              {code.map((c, i) => (
                <input key={i} ref={inputRefs[i]}
                  value={c} onChange={e => handleCodeInput(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  maxLength={1}
                  style={{
                    width:44, height:52, textAlign:'center', fontSize:22, fontWeight:700,
                    fontFamily:ft, color:C.text, background:C.surface,
                    border:`2px solid ${c?'#007AFF':C.border}`, borderRadius:12,
                    outline:'none', textTransform:'uppercase', transition:'border 0.15s'
                  }}/>
              ))}
            </div>

            {msg && <div style={{ textAlign:'center', fontSize:13, color:'#FF3B30', marginBottom:12 }}>{msg.text}</div>}

            <button onClick={verifyCode} disabled={code.join('').length < 6 || loading}
              style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:code.join('').length===6?'#007AFF':'#e0e0e0', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:ft, opacity:loading?0.6:1 }}>
              {loading ? 'Vérification...' : 'Continuer'}
            </button>

            {appel && (
              <div style={{ textAlign:'center', marginTop:12, fontSize:12, color:C.muted }}>
                Appel en cours — {appel.cours} · {appel.enseignant}
              </div>
            )}
          </>
        )}

        {/* ÉTAPE 2 — Signature */}
        {step === 'sign' && (
          <>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:6 }}>Signez ici</h2>
              <p style={{ fontSize:13, color:C.muted }}>Tracez votre signature dans la zone ci-dessous</p>
            </div>

            <div style={{ position:'relative', marginBottom:16 }}>
              <canvas ref={canvasRef} width={432} height={180}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ width:'100%', height:180, background:C.surface, borderRadius:14, border:`2px solid ${C.border}`, cursor:'crosshair', display:'block', touchAction:'none' }}/>
              <button onClick={clearCanvas}
                style={{ position:'absolute', top:8, right:8, background:C.surface2, border:'none', borderRadius:8, padding:'4px 10px', fontSize:12, color:C.muted, cursor:'pointer', fontFamily:ft }}>
                Effacer
              </button>
              <div style={{ position:'absolute', bottom:12, left:0, right:0, textAlign:'center', pointerEvents:'none' }}>
                <span style={{ fontSize:11, color:C.hint }}>Signez avec votre doigt ou votre souris</span>
              </div>
            </div>

            {msg && <div style={{ textAlign:'center', fontSize:13, color:'#FF3B30', marginBottom:12 }}>{msg.text}</div>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep('code')}
                style={{ flex:1, padding:12, borderRadius:12, border:'none', background:C.surface, color:C.muted, fontSize:14, cursor:'pointer', fontFamily:ft }}>
                Retour
              </button>
              <button onClick={submitSignature} disabled={loading}
                style={{ flex:2, padding:12, borderRadius:12, border:'none', background:'#007AFF', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:ft, opacity:loading?0.6:1 }}>
                {loading ? 'Envoi...' : '✓ Confirmer la présence'}
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 3 — Succès */}
        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:60, marginBottom:16 }}>✅</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:C.text, marginBottom:8 }}>Présence confirmée !</h2>
            <p style={{ fontSize:14, color:C.muted, marginBottom:28 }}>Votre émargement a été enregistré avec succès.</p>
            <button onClick={onClose}
              style={{ padding:'12px 32px', borderRadius:12, border:'none', background:C.text, color:C.bg, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
              Fermer
            </button>
          </div>
        )}

        {/* ÉTAPE erreur */}
        {step === 'error' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:60, marginBottom:16 }}>❌</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#FF3B30', marginBottom:8 }}>Erreur</h2>
            <p style={{ fontSize:14, color:C.muted, marginBottom:28 }}>{msg?.text}</p>
            <button onClick={() => setStep('code')}
              style={{ padding:'12px 32px', borderRadius:12, border:'none', background:C.text, color:C.bg, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}