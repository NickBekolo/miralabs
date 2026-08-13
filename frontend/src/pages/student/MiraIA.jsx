import { useState, useRef, useEffect } from 'react'
import { useThemeStore } from '../../store/ThemeStore'
import { ArrowUp, RotateCcw, Sparkles } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const SUGGESTIONS = [
  'Explique-moi les fonctions polynômes',
  'Aide-moi à réviser la photosynthèse',
  'Crée un quiz sur la Révolution française',
  'Comment résoudre une équation du second degré ?',
]

const SYSTEM_PROMPT = `Tu es Mira IA, l'assistant scolaire intelligent de Miralabs. Tu aides les élèves à réviser leurs cours, comprendre des concepts, faire des exercices et préparer leurs examens. Tu réponds toujours en français, de manière claire, pédagogique et encourageante. Tu t'adaptes au niveau lycée/collège.`

function UserMsg({ text, dark }) {
  const bg   = dark ? '#fff'     : '#0a0a0a'
  const col  = dark ? '#0a0a0a'  : '#fff'
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:28 }}>
      <div style={{ maxWidth:'72%', padding:'12px 18px', background:bg, color:col, borderRadius:'18px 18px 4px 18px', fontSize:15, lineHeight:1.6, fontFamily:ft, fontWeight:400 }}>
        {text}
      </div>
    </div>
  )
}

function AssistantMsg({ text, loading, dark }) {
  const [displayed, setDisplayed] = useState('')
  const [done,      setDone]      = useState(false)
  const col = dark ? '#fff' : '#0a0a0a'

  useEffect(() => {
    if (loading) { setDisplayed(''); setDone(false); return }
    let i = 0
    setDisplayed('')
    setDone(false)
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(t => t + text[i]); i++ }
      else { clearInterval(iv); setDone(true) }
    }, 10)
    return () => clearInterval(iv)
  }, [text, loading])

  return (
    <div style={{ display:'flex', gap:12, marginBottom:28, alignItems:'flex-start' }}>
      {/* Avatar Mira */}
      <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#0a0a0a,#444)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
        <Sparkles size={14} color="#fff" strokeWidth={2}/>
      </div>
      <div style={{ flex:1 }}>
        {loading ? (
          <div style={{ display:'flex', gap:5, alignItems:'center', padding:'10px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:dark?'#555':'#ccc', animation:`miraPulse 1.2s ease infinite`, animationDelay:`${i*0.2}s` }}/>
            ))}
          </div>
        ) : (
          <div style={{ fontSize:15, lineHeight:1.8, color:col, fontFamily:ft, whiteSpace:'pre-wrap' }}>
            {displayed}
            {!done && <span style={{ animation:'miraBlink 1s step-end infinite' }}>▋</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MiraIA() {
  const dark = useThemeStore(s => s.darkMode)
  const [msgs,    setMsgs]    = useState([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)

  const bg      = dark ? '#0a0a0a' : '#fff'
  const text    = dark ? '#fff'    : '#0a0a0a'
  const muted   = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
  const inputBg = dark ? '#111'    : '#f5f5f5'
  const border  = dark ? '#2a2a2a' : '#e5e5e5'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs, loading])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
    }
  }, [input])

  const send = async (txt) => {
    const userText = (txt || input).trim()
    if (!userText || loading) return
    setInput('')
    const newMsgs = [...msgs, { role:'user', text:userText }]
    setMsgs(newMsgs)
    setLoading(true)

    try {
      const history = newMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1000,
          system: SYSTEM_PROMPT,
          messages: history,
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || "Désolé, je n'ai pas pu répondre."
      setMsgs(m => [...m, { role:'assistant', text:reply }])
    } catch {
      setMsgs(m => [...m, { role:'assistant', text:"Erreur de connexion. Vérifie ta connexion internet." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const isEmpty = msgs.length === 0

  return (
    <>
      <style>{`
        @keyframes miraPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes miraBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .mira-textarea::placeholder { color:${muted} }
        .mira-textarea:focus { outline:none }
        .mira-suggestion:hover { background:${dark?'#1a1a1a':'#f0f0f0'} !important }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:bg, fontFamily:ft }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:`1px solid ${border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,#0a0a0a,#444)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={13} color="#fff" strokeWidth={2}/>
            </div>
            <span style={{ fontSize:15, fontWeight:600, color:text }}>Mira IA</span>
          </div>
          {!isEmpty && (
            <button onClick={() => setMsgs([])}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${border}`, borderRadius:8, padding:'6px 12px', color:muted, cursor:'pointer', fontSize:13, fontFamily:ft }}>
              <RotateCcw size={13} strokeWidth={2}/> Nouveau
            </button>
          )}
        </div>

        {/* Zone messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 20px' }}>
          {isEmpty ? (
            /* Écran vide style ChatGPT */
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:32 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#0a0a0a,#444)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Sparkles size={24} color="#fff" strokeWidth={1.8}/>
                </div>
                <div style={{ fontSize:22, fontWeight:700, color:text, letterSpacing:'-0.5px', marginBottom:6 }}>Comment puis-je t'aider ?</div>
                <div style={{ fontSize:14, color:muted }}>Pose-moi une question sur tes cours</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, width:'100%', maxWidth:520 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="mira-suggestion" onClick={() => send(s)}
                    style={{ textAlign:'left', padding:'12px 14px', background:inputBg, border:`1px solid ${border}`, borderRadius:12, color:text, cursor:'pointer', fontSize:13, fontFamily:ft, lineHeight:1.4, transition:'background 0.15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:680, margin:'0 auto' }}>
              {msgs.map((m, i) => m.role === 'user'
                ? <UserMsg key={i} text={m.text} dark={dark}/>
                : <AssistantMsg key={i} text={m.text} dark={dark} loading={false}/>
              )}
              {loading && <AssistantMsg text="" dark={dark} loading={true}/>}
              <div ref={bottomRef}/>
            </div>
          )}
        </div>

        {/* Zone de saisie */}
        <div style={{ padding:'12px 20px 24px', flexShrink:0 }}>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <div style={{ background:inputBg, border:`1.5px solid ${border}`, borderRadius:16, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
              <textarea
                ref={textareaRef}
                className="mira-textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message Mira IA..."
                rows={1}
                style={{ background:'transparent', border:'none', resize:'none', fontSize:15, fontFamily:ft, color:text, lineHeight:1.5, maxHeight:180, width:'100%', boxSizing:'border-box' }}
              />
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  style={{ width:32, height:32, borderRadius:8, border:'none', background:input.trim()&&!loading?text:'transparent', cursor:input.trim()&&!loading?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                  <ArrowUp size={16} color={input.trim()&&!loading?bg:muted} strokeWidth={2.5}/>
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
