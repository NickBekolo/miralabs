import { useState, useRef, useEffect } from 'react'
import { useThemeStore } from '../../store/ThemeStore'
import { ArrowUp, RotateCcw, Sparkles, Plus, Mic, Globe, Pencil, ChevronDown, Cpu } from 'lucide-react'

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
  const [selectedModel, setSelectedModel] = useState('claude-haiku')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [convId, setConvId] = useState(null)
  const [contextMode, setContextMode] = useState('none') // none, web, docs
  const [convList, setConvList] = useState([])
  const [showConvList, setShowConvList] = useState(false)
  const token = sessionStorage.getItem('token')
  const MODELS = [
    { key:'claude-haiku',  label:'Claude Haiku',  provider:'anthropic', desc:'Rapide · Moins cher' },
    { key:'claude-sonnet', label:'Claude Sonnet', provider:'anthropic', desc:'Puissant · Anthropic' },
    { key:'gpt-4o-mini',   label:'GPT-4o Mini',   provider:'openai',    desc:'Rapide · Moins cher' },
    { key:'gpt-4o',        label:'GPT-4o',         provider:'openai',    desc:'Puissant · OpenAI' },
  ]
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

  // Charger la liste des conversations
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    fetch('/api/mira/conversations', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(setConvList).catch(() => {})
  }, [])

  // Sauvegarder/mettre à jour la conversation après chaque réponse
  const saveConv = async (newMsgs, model) => {
    const token = sessionStorage.getItem('token')
    if (!convId) {
      const title = newMsgs[0]?.text?.slice(0, 50) || 'Nouvelle conversation'
      const r = await fetch('/api/mira/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ messages: newMsgs, model, title })
      })
      const data = await r.json()
      setConvId(data.id)
      fetch('/api/mira/conversations', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(r => r.json()).then(setConvList).catch(() => {})
    } else {
      await fetch('/api/mira/conversations/' + convId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ messages: newMsgs, model })
      })
    }
  }

  const loadConv = async (id) => {
    const token = sessionStorage.getItem('token')
    const r = await fetch('/api/mira/conversations/' + id, { headers: { 'Authorization': 'Bearer ' + token } })
    const data = await r.json()
    setMsgs(data.messages || [])
    setSelectedModel(data.model || 'claude-haiku')
    setConvId(id)
    setShowConvList(false)
  }

  const deleteConv = async (id) => {
    const token = sessionStorage.getItem('token')
    await fetch('/api/mira/conversations/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })
    if (convId === id) { setMsgs([]); setConvId(null) }
    setConvList(l => l.filter(c => c.id !== id))
  }

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
      const token = sessionStorage.getItem('token')
      const res = await fetch('/api/mira', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+token },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: history,
          model: selectedModel,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        let errMsg = "Une erreur est survenue. Réessaie plus tard."
        try {
          const details = data.details ? JSON.parse(data.details) : null
          const apiMsg = details?.error?.message || ''
          if (apiMsg.includes('credit') || apiMsg.includes('balance')) {
            errMsg = "Crédits insuffisants sur le compte IA. Contacte l'administrateur."
          } else if (apiMsg.includes('key') || apiMsg.includes('auth')) {
            errMsg = "Clé API invalide. Contacte l'administrateur."
          } else if (data.error) {
            errMsg = data.error
          }
        } catch {}
        setMsgs(m => [...m, { role:'assistant', text: errMsg }])
        return
      }
      const reply = data.text || "Désolé, je n'ai pas pu répondre."
      const finalMsgs = [...newMsgs, { role:'assistant', text:reply }]
      setMsgs(finalMsgs)
      saveConv(finalMsgs, selectedModel)
    } catch(e) {
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
          <button onClick={() => setShowConvList(s=>!s)}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:10, border:`1px solid ${dark?'#333':'#e5e5ea'}`, background:'transparent', cursor:'pointer', fontSize:12, color:muted, fontFamily:ft }}>
            <RotateCcw size={13}/> Historique ({convList.length})
          </button>
          {!isEmpty && (
            <button onClick={() => { setMsgs([]); setConvId(null) }}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${border}`, borderRadius:8, padding:'6px 12px', color:muted, cursor:'pointer', fontSize:13, fontFamily:ft }}>
              <RotateCcw size={13} strokeWidth={2}/> Nouveau
            </button>
          )}
        </div>

        {/* Panneau historique */}
        {showConvList && (
          <div style={{ position:'absolute', top:60, left:0, right:0, zIndex:200, background:dark?'#111':'#fff', borderBottom:`1px solid ${dark?'#222':'#e5e5ea'}`, maxHeight:300, overflowY:'auto', padding:12 }}>
            {convList.length === 0 && <div style={{ color:muted, fontSize:13, padding:8 }}>Aucune conversation</div>}
            {convList.map(conv => (
              <div key={conv.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, marginBottom:4, background:convId===conv.id?(dark?'#1a1a1a':'#f5f5f5'):'transparent', cursor:'pointer' }}
                onClick={() => loadConv(conv.id)}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:text, fontWeight:500 }}>{conv.title}</div>
                  <div style={{ fontSize:11, color:muted }}>{conv.model} · {conv.updatedAt?.slice(0,10)}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteConv(conv.id) }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ff5555', fontSize:16, padding:'2px 6px' }}>×</button>
              </div>
            ))}
          </div>
        )}
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
                {[
                  {key:'none',    label:'Sans contexte',  desc:'Répond depuis sa connaissance', Icon:Sparkles, active: contextMode==='none'},
                  {key:'web',     label:'Internet',        desc:'Recherche sur le web avant de répondre', Icon:Globe, active: contextMode==='web'},
                  {key:'docs',    label:'Mes documents',   desc:'Utilise ta bibliothèque (RAG)', Icon:Pencil, active: contextMode==='docs'},
                ].map((item,i,arr) => (
                  <button key={item.key} onClick={()=>{ setContextMode(item.key); setMenuOpen(false) }}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:item.active?(dark?'#2a2a2a':'#f0f0f0'):'none', border:'none', borderBottom:i<arr.length-1?`1px solid ${dark?'#2a2a2a':'#f0f0f0'}`:'none', cursor:'pointer', fontFamily:ft, textAlign:'left' }}
                    onMouseEnter={e=>e.currentTarget.style.background=dark?'#2a2a2a':'#f9f9f9'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    <item.Icon size={18} color={dark?'#aaa':'#666'} strokeWidth={1.75}/>
                    <div>
                      <div style={{ fontSize:13, color:dark?'#fff':'#0a0a0a', fontWeight:500 }}>{item.label}</div>
                      <div style={{ fontSize:11, color:'#8e8e93', marginTop:2 }}>{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {/* Contexte actif */}
            {contextMode !== 'none' && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, padding:'4px 10px', borderRadius:20, background:dark?'#1a1a1a':'#f0f0f0', width:'fit-content' }}>
                {contextMode==='web' ? <Globe size={12} color='#007AFF'/> : <Pencil size={12} color='#a29bfe'/>}
                <span style={{ fontSize:11, color:contextMode==='web'?'#007AFF':'#a29bfe', fontFamily:ft }}>
                  {contextMode==='web' ? 'Internet activé' : 'Mes documents activés'}
                </span>
                <button onClick={()=>setContextMode('none')} style={{ background:'none', border:'none', cursor:'pointer', color:'#8e8e93', fontSize:14, lineHeight:1, padding:0 }}>×</button>
              </div>
            )}
            {/* Sélecteur modèle */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, position:'relative' }}>
              <button onClick={() => setShowModelPicker(s=>!s)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:20, border:`1px solid ${dark?'#333':'#e5e5ea'}`, background:dark?'#1a1a1a':'#f5f5f5', cursor:'pointer', fontSize:12, color:dark?'#ccc':'#555', fontFamily:ft }}>
                <Cpu size={12} color={dark?'#ccc':'#555'}/>
                <span>{MODELS.find(m=>m.key===selectedModel)?.label || 'Modèle'}</span>
                <ChevronDown size={11} color='#8e8e93'/>
              </button>
              {showModelPicker && (
                <div style={{ position:'absolute', bottom:'110%', left:0, background:dark?'#1C1C1E':'#fff', border:`1px solid ${dark?'#333':'#e5e5ea'}`, borderRadius:14, padding:6, zIndex:100, minWidth:200, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
                  {MODELS.map(m => (
                    <button key={m.key} onClick={() => { setSelectedModel(m.key); setShowModelPicker(false) }}
                      style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', width:'100%', padding:'8px 10px', borderRadius:8, border:'none', background:selectedModel===m.key?(dark?'#2C2C2E':'#f0f0f0'):'transparent', cursor:'pointer', marginBottom:2 }}>
                      <span style={{ fontSize:13, fontWeight:selectedModel===m.key?600:400, color:dark?'#fff':'#000', fontFamily:ft }}>{m.label}</span>
                      <span style={{ fontSize:11, color:'#8e8e93', fontFamily:ft }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px' }}>
              {/* Bouton + */}
              <button onClick={()=>setMenuOpen(o=>!o)}
                style={{ width:36, height:36, borderRadius:'50%', border:`1px solid ${dark?'#333':'#e5e5ea'}`, background:menuOpen?(dark?'#2a2a2a':'#e5e5e5'):(dark?'#1a1a1a':'#fff'), cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                onMouseEnter={e=>e.currentTarget.style.background=dark?'#2a2a2a':'#f0f0f0'}
                onMouseLeave={e=>e.currentTarget.style.background=menuOpen?(dark?'#2a2a2a':'#e5e5e5'):(dark?'#1a1a1a':'#fff')}>
                <Plus size={22} color={dark?'#fff':'#0a0a0a'} strokeWidth={2}/>
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
