import { useState, useRef, useEffect } from 'react'
import { useThemeStore } from '../../store/ThemeStore'
import { ArrowUp, RotateCcw, Sparkles, Plus, Mic, Globe, Pencil } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const SUGGESTIONS = []

const SYSTEM_PROMPT = `Tu es Mira IA, l'assistant scolaire intelligent de Miralabs. Tu aides les élèves à réviser leurs cours, comprendre des concepts, faire des exercices et préparer leurs examens. Tu réponds toujours en français, de manière claire, pédagogique et encourageante. Tu t'adaptes au niveau lycée/collège.`

function UserMsg({ text, dark }) {
  const bg   = dark ? '#fff'     : '#0a0a0a'
  const col  = dark ? '#0a0a0a'  : '#fff'
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:28 }}>
      <div style={{ maxWidth:'72%', padding:'12px 18px', background:bg, color:col, borderRadius:18, fontSize:15, lineHeight:1.6, fontFamily:ft, fontWeight:400 }}>
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
  const [menuOpen, setMenuOpen] = useState(false)
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
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px',  flexShrink:0 }}>
          <div style={{ fontSize:18, fontWeight:500, color:text, letterSpacing:'-0.5px', fontFamily:ft }}>Mira IA.</div>
          {!isEmpty && (
            <button onClick={() => setMsgs([])}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${border}`, borderRadius:8, padding:'6px 12px', color:muted, cursor:'pointer', fontSize:13, fontFamily:ft }}>
              <RotateCcw size={13} strokeWidth={2}/> Nouveau
            </button>
          )}
        </div>

        {/* Zone messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 20px', background:dark?'#0a0a0a':'#fff' }}>
          {isEmpty ? (
            /* Écran vide style ChatGPT */
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:32 }}>
              <div style={{ textAlign:'center' }}>
  
                <div style={{ fontSize:22, fontWeight:400, color:text, letterSpacing:'-0.8px', marginBottom:6, fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" }}>Comment puis-je t'aider ?</div>
                <div style={{ fontSize:14, color:muted, fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" }}>Pose-moi une question sur tes cours</div>
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
        <div style={{ padding:'8px 16px 24px', flexShrink:0, background:bg }}>
          <div style={{ maxWidth:680, margin:'0 auto', position:'relative' }}>
            {/* Menu + */}
            {menuOpen && (
              <div style={{ position:'absolute', bottom:'100%', left:0, marginBottom:12, width:240, borderRadius:20, background:dark?'#1a1a1a':'#fff', boxShadow:'0 8px 30px rgba(0,0,0,0.15)', border:dark?'1px solid #2a2a2a':'1px solid #e5e5e5', overflow:'hidden', zIndex:10 }}>
                {[{key:'write',label:'Écrire ou modifier',Icon:Pencil},{key:'search',label:'Rechercher',Icon:Globe}].map(({key,label,Icon},i,arr)=>(
                  <button key={key} onClick={()=>setMenuOpen(false)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'none', border:'none', borderBottom:i<arr.length-1?'1px solid #f0f0f0':'none', cursor:'pointer', fontFamily:ft, fontSize:14, color:'#0a0a0a', textAlign:'left' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f9f9f9'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <Icon size={18} color="#666" strokeWidth={1.75}/>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px' }}>
              {/* Bouton + */}
              <button onClick={()=>setMenuOpen(o=>!o)}
                style={{ width:36, height:36, borderRadius:'50%', border:'none', background:menuOpen?'#e5e5e5':'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                onMouseEnter={e=>e.currentTarget.style.background='#f0f0f0'}
                onMouseLeave={e=>e.currentTarget.style.background=menuOpen?(dark?'#2a2a2a':'#e5e5e5'):'transparent'}>
                <Plus size={22} color="#0a0a0a" strokeWidth={2}/>
              </button>
              {/* Zone texte */}
              <div style={{ flex:1, display:'flex', alignItems:'center', background:dark?'#1a1a1a':'#fff', borderRadius:24, border:dark?'1.5px solid #2a2a2a':'1.5px solid #e0e0e0', paddingLeft:16, paddingRight:8, paddingTop:8, paddingBottom:8, boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                <input
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Demander à Mira IA..."
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:15, fontFamily:ft, color:dark?'#fff':'#0a0a0a' }}
                />
                <button style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Mic size={18} color="#888" strokeWidth={1.75}/>
                </button>
              </div>
              {/* Bouton envoyer */}
              <button onClick={()=>send()} disabled={!input.trim()||loading}
                style={{ width:36, height:36, borderRadius:'50%', border:'none', background:input.trim()&&!loading?'#007AFF':(dark?'#2a2a2a':'#e0e0e0'), cursor:input.trim()&&!loading?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                <ArrowUp size={17} color="#fff" strokeWidth={2.5}/>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
