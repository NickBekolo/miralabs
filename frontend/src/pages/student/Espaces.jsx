import { useState, useRef, useEffect } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { Hash, Users, Book, ChevronRight, Send, ArrowLeft, MessageSquare } from 'lucide-react'
import ThreadModal from './ThreadModal'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const ESPACES = [
  {
    id:1, name:'1ASSP1', type:'Classe', members:28,
    canaux:[
      { id:1, name:'général',    unread:3 },
      { id:2, name:'devoirs',    unread:1 },
      { id:3, name:'ressources', unread:0 },
      { id:4, name:'annonces',   unread:2 },
    ],
    msgs:{ 1:[{ id:1, from:'M. Dupont', me:false, text:'Bonjour à tous !', time:'09:15' }] }
  },
  {
    id:2, name:'Maths — M. Dupont', type:'Matière', members:28,
    canaux:[
      { id:1, name:'cours',    unread:0 },
      { id:2, name:'devoirs',  unread:1 },
      { id:3, name:'entraide', unread:0 },
    ],
    msgs:{ 1:[{ id:1, from:'M. Dupont', me:false, text:'Chapitre 4 — Polynômes du second degré.', time:'Lun' }] }
  },
  {
    id:3, name:'Groupe Révision Maths', type:"Équipe", members:4,
    canaux:[
      { id:1, name:'général',   unread:0 },
      { id:2, name:'séances',   unread:2 },
      { id:3, name:'objectifs', unread:0 },
    ],
    msgs:{ 1:[{ id:1, from:'Ritah', me:true, text:'On se retrouve samedi pour réviser ?', time:'Dim' }] }
  },
]

function TypeIcon({ type, color, size=16 }) {
  if (type === 'Classe')       return <Users size={size} color={color} strokeWidth={1.8}/>
  if (type === 'Matière')      return <Book size={size} color={color} strokeWidth={1.8}/>
  return <Users size={size} color={color} strokeWidth={1.8}/>
}

export default function Espaces() {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const [espaceId,  setEspaceId]  = useState(null)
  const [canalId,   setCanalId]   = useState(null)
  const [input,     setInput]     = useState('')
  const [messages,  setMessages]  = useState({})
  const [showCanaux, setShowCanaux] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const bottomRef = useRef(null)

  const espace = ESPACES.find(e => e.id === espaceId)
  const canal  = espace?.canaux.find(c => c.id === canalId)
  const msgs   = messages[`${espaceId}-${canalId}`] || espace?.msgs?.[canalId] || []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = () => {
    if (!input.trim() || !espace || !canal) return
    const key = `${espaceId}-${canalId}`
    setMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] || espace.msgs?.[canalId] || []), { id: Date.now(), from:'Vous', me:true, text:input.trim(), time:'Maintenant' }]
    }))
    setInput('')
  }

  const bg     = C.bg
  const text   = C.text
  const muted  = C.muted
  const border = C.surface2

  // Vue liste espaces
  if (!espaceId) return (
    <div style={{ fontFamily:ft, background:bg, minHeight:'100%', color:text, padding:'20px 16px' }}>
      <div style={{ fontSize:22, fontWeight:400, color:text, letterSpacing:'-0.8px', marginBottom:8, fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" }}>Espaces</div>
      <div style={{ fontSize:13, color:'#8e8e93', marginBottom:20, padding:'10px 14px', background:'rgba(142,142,147,0.1)', borderRadius:10 }}>Cette section est en cours de développement. Certaines fonctionnalités peuvent ne pas être disponibles.</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {ESPACES.map(e => {
          const totalUnread = e.canaux.reduce((a, c) => a + c.unread, 0)
          return (
            <button key={e.id} onClick={() => { setEspaceId(e.id); setCanalId(e.canaux[0].id); setShowCanaux(false) }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:C.surface, border:`1px solid ${border}`, borderRadius:16, cursor:'pointer', textAlign:'left', fontFamily:ft, width:'100%', transition:'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=C.surface2}
              onMouseLeave={e => e.currentTarget.style.borderColor=border}>
              <div style={{ width:44, height:44, borderRadius:12, background:text, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <TypeIcon type={e.type} color={bg} size={20}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600, color:text, marginBottom:3 }}>{e.name}</div>
                <div style={{ fontSize:12, color:muted }}>{e.type} · {e.members} membres</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {totalUnread > 0 && (
                  <span style={{ width:20, height:20, borderRadius:'50%', background:'#FF3B30', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {totalUnread}
                  </span>
                )}
                <ChevronRight size={16} color={muted} strokeWidth={2}/>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Vue canaux
  if (showCanaux || !canalId) return (
    <div style={{ fontFamily:ft, background:bg, minHeight:'100%', color:text }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px', borderBottom:`1px solid ${border}` }}>
        <button onClick={() => setEspaceId(null)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:muted }}>
          <ArrowLeft size={20} strokeWidth={2}/>
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:text }}>{espace.name}</div>
          <div style={{ fontSize:12, color:muted }}>{espace.members} membres</div>
        </div>
      </div>
      <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ fontSize:11, fontWeight:600, color:muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8, paddingLeft:4 }}>Canaux</div>
        {espace.canaux.map(c => (
          <button key={c.id} onClick={() => { setCanalId(c.id); setShowCanaux(false) }}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:c.id===canalId?C.surface2:'transparent', border:'none', borderRadius:10, cursor:'pointer', textAlign:'left', fontFamily:ft, width:'100%' }}>
            <Hash size={15} color={muted} strokeWidth={2}/>
            <span style={{ flex:1, fontSize:14, fontWeight:500, color:text }}>{c.name}</span>
            {c.unread > 0 && (
              <span style={{ width:18, height:18, borderRadius:'50%', background:'#FF3B30', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  // Vue messages
  return (
    <div style={{ fontFamily:ft, background:bg, height:'100%', display:'flex', flexDirection:'column', color:text }}>
      {/* Header canal */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:`1px solid ${border}`, flexShrink:0 }}>
        <button onClick={() => setShowCanaux(true)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:muted }}>
          <ArrowLeft size={20} strokeWidth={2}/>
        </button>
        <Hash size={16} color={muted} strokeWidth={2}/>
        <div style={{ flex:1 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:13, color:muted }}>#</span>
              <span style={{ fontSize:15, fontWeight:700, color:text }}>{canal?.name}</span>
            </div>
            <div style={{ fontSize:11, color:muted, marginTop:1 }}>{espace.name}</div>
          </div>
        </div>
        <button onClick={() => setShowCanaux(true)}
          style={{ display:'flex', alignItems:'center', gap:6, background:C.surface, border:`1px solid ${border}`, borderRadius:980, padding:'6px 12px', cursor:'pointer', fontFamily:ft, fontSize:12, fontWeight:600, color:text }}>
          <Hash size={13} strokeWidth={2} color={muted}/>
          Canaux
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
        {msgs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:muted, fontSize:14 }}>Aucun message dans #{canal?.name}</div>
        ) : msgs.map(m => (
          <div key={m.id} style={{ display:'flex', gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:text, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:bg, flexShrink:0 }}>
              {m.from?.[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                <span style={{ fontSize:14, fontWeight:700, color:text }}>{m.me?'Vous':m.from}</span>
                <span style={{ fontSize:12, color:muted }}>{m.time}</span>
              </div>
              <p style={{ margin:0, fontSize:14, lineHeight:1.55, color:m.me?text:C.muted }}>{m.text}</p>
              {!m.me && (
                <button onClick={() => setSelectedPost({ author:{name:m.from}, postedAt:m.time, type:'text', content:m.text })}
                  style={{ background:'none', border:'none', fontSize:12, fontWeight:600, color:muted, cursor:'pointer', padding:'4px 0 0', fontFamily:ft }}>
                  Répondre
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Zone saisie */}
      <div style={{ padding:'10px 16px 20px', flexShrink:0, borderTop:`1px solid ${border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:C.surface, borderRadius:24, border:`1px solid ${border}`, padding:'8px 8px 8px 16px' }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder={`Message #${canal?.name}`}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:15, fontFamily:ft, color:text }}/>
          <button onClick={send} disabled={!input.trim()}
            style={{ width:34, height:34, borderRadius:'50%', border:'none', background:input.trim()?text:'transparent', cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', flexShrink:0 }}>
            <Send size={15} color={input.trim()?bg:muted} strokeWidth={2}/>
          </button>
        </div>
      </div>
      {selectedPost && <ThreadModal post={selectedPost} onClose={() => setSelectedPost(null)} reactions={[]} comments={[]}/>}
    </div>
  )
}
