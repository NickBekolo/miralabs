import { useState, useRef, useEffect } from 'react'
import { useThemeStore } from '../../store/ThemeStore'

const ft = "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif"

const SUGGESTIONS = [
  'Explique-moi les fonctions polynômes',
  'Aide-moi à réviser la photosynthèse',
  'Crée un quiz sur la Révolution française',
  'Comment résoudre une équation du second degré ?',
]

function UserMsg({ text }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
      <div style={{
        maxWidth:'70%', padding:'12px 16px',
        background:'#2F2F2F', color:'#fff',
        borderRadius:18, fontSize:15, lineHeight:1.6,
        fontFamily:ft,
      }}>
        {text}
      </div>
    </div>
  )
}

function AssistantMsg({ text, loading }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (loading) { setDisplayed(''); setDone(false); return }
    let i = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(t => t + text[i])
        i++
      } else {
        clearInterval(interval)
        setDone(true)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [text, loading])

  return (
    <div style={{ display:'flex', gap:12, marginBottom:24, alignItems:'flex-start' }}>
      {/* Avatar Mira */}
      <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg, #10a37f, #1a7f64)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div style={{ flex:1 }}>
        {loading ? (
          <div style={{ display:'flex', gap:4, alignItems:'center', padding:'8px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#666', animation:`pulse 1.2s ease infinite ${i*0.2}s` }}/>
            ))}
          </div>
        ) : (
          <div style={{ fontSize:15, lineHeight:1.8, color:'#ececec', fontFamily:ft, whiteSpace:'pre-wrap' }}>
            {displayed}
            {!done && <span style={{ opacity:0.7, animation:'blink 1s step-end infinite' }}>▋</span>}
          </div>
        )}
      </div>
    </div>
  )
}

const MOCK_RESPONSES = {
  default: `Je suis **Mira IA**, ton assistant scolaire intelligent. Je peux t'aider à :

• **Réviser** tes cours et expliquer des concepts
• **Créer des quiz** personnalisés sur tes matières
• **Résoudre des exercices** étape par étape
• **Rédiger** des plans et dissertations

Pose-moi une question et je ferai de mon mieux pour t'aider ! 📚`,

  polynome: `Les **fonctions polynômes** sont des fonctions de la forme :

**f(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀**

Pour une fonction du **second degré** : f(x) = ax² + bx + c

**Discriminant :** Δ = b² - 4ac

• Si Δ > 0 → 2 racines réelles : x = (-b ± √Δ) / 2a
• Si Δ = 0 → 1 racine double : x = -b / 2a  
• Si Δ < 0 → pas de racine réelle

Tu veux que je te fasse des exercices ?`,
}

function getResponse(input) {
  const lower = input.toLowerCase()
  if (lower.includes('polynôme') || lower.includes('second degré')) return MOCK_RESPONSES.polynome
  return MOCK_RESPONSES.default
}

export default function MiraIA() {
  const [msgs,    setMsgs]    = useState([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const bg      = '#212121'
  const sidebar = '#171717'
  const text    = '#ececec'
  const muted   = '#8e8e8e'
  const inputBg = '#2F2F2F'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs, loading])

  const send = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setInput('')
    setMsgs(m => [...m, { role:'user', text:userText }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setMsgs(m => [...m, { role:'assistant', text:getResponse(userText) }])
  }

  const handleKey = (e) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const isEmpty = msgs.length === 0

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.3 } 50% { opacity:1 } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        .mira-input::placeholder { color:#8e8e8e }
        .mira-input:focus { outline:none }
        .suggestion-btn:hover { background:#2F2F2F !important }
      `}</style>

      <div style={{ display:'flex', height:'100%', background:bg, color:text, fontFamily:ft }}>

        {/* Sidebar historique */}
        <div style={{ width:260, flexShrink:0, background:sidebar, display:'flex', flexDirection:'column', padding:'16px 10px', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
          <button style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 12px', borderRadius:10, border:'none', background:'transparent', color:text, cursor:'pointer', fontSize:14, fontFamily:ft, marginBottom:16 }}
            onMouseEnter={e => e.currentTarget.style.background='#2F2F2F'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
            onClick={() => setMsgs([])}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouvelle conversation
          </button>

          <div style={{ fontSize:11, color:muted, padding:'6px 12px', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Aujourd'hui</div>

          {[
            'Révision Physique-Chimie',
            'Exercices polynômes',
            'Plan dissertation Français',
          ].map((h, i) => (
            <button key={i} style={{ display:'flex', width:'100%', padding:'10px 12px', borderRadius:10, border:'none', background:'transparent', color:muted, cursor:'pointer', fontSize:13, fontFamily:ft, textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.background='#2F2F2F'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              {h}
            </button>
          ))}
        </div>

        {/* Zone principale */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
            <span style={{ fontSize:15, fontWeight:600, color:text }}>Mira IA</span>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'24px 20%' }}>
            {isEmpty ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:32 }}>
                {/* Logo */}
                <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg, #10a37f, #1a7f64)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div style={{ fontSize:22, fontWeight:600, color:text }}>Comment puis-je vous aider ?</div>

                {/* Suggestions */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, width:'100%', maxWidth:600 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="suggestion-btn" onClick={() => { setInput(s); textareaRef.current?.focus() }}
                      style={{ padding:'14px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:text, cursor:'pointer', fontSize:13, fontFamily:ft, textAlign:'left', lineHeight:1.4, transition:'background 0.15s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {msgs.map((m, i) => (
                  m.role === 'user'
                    ? <UserMsg key={i} text={m.text}/>
                    : <AssistantMsg key={i} text={m.text}/>
                ))}
                {loading && <AssistantMsg text="" loading={true}/>}
                <div ref={bottomRef}/>
              </>
            )}
          </div>

          {/* Input ChatGPT style */}
          <div style={{ padding:'16px 20%', flexShrink:0 }}>
            <div style={{ background:inputBg, borderRadius:16, padding:'12px 12px 12px 16px', border:'1px solid rgba(255,255,255,0.1)' }}>
              <textarea
                ref={textareaRef}
                className="mira-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Pose une question à Mira IA..."
                rows={1}
                style={{ width:'100%', border:'none', background:'transparent', fontSize:15, fontFamily:ft, color:text, resize:'none', lineHeight:1.6, display:'block', marginBottom:8, maxHeight:200, overflowY:'auto' }}
              />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, color:muted }}
                    onMouseEnter={e => e.currentTarget.style.color=text}
                    onMouseLeave={e => e.currentTarget.style.color=muted}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>
                  <button style={{ background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:6, color:muted }}
                    onMouseEnter={e => e.currentTarget.style.color=text}
                    onMouseLeave={e => e.currentTarget.style.color=muted}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                  </button>
                </div>
                <button onClick={send} disabled={!input.trim() || loading}
                  style={{ width:34, height:34, borderRadius:8, border:'none', background:input.trim()&&!loading?'#fff':'rgba(255,255,255,0.15)', cursor:input.trim()&&!loading?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim()&&!loading?'#000':'#666'} strokeWidth="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ textAlign:'center', fontSize:11, color:muted, marginTop:8 }}>
              Mira IA peut faire des erreurs. Vérifiez les informations importantes.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}