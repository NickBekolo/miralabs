import { useState, useEffect, useRef } from 'react'
import { useThemeStore } from '../../store/ThemeStore'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { ft } from '../../constants/theme'
import MessageInputBar from '../../components/MessageInputBar'
import {
  Paperclip, Image, Camera, Mic, ChevronLeft,
  Send, Plus, X, Search
} from 'lucide-react'

const IMSG_BLUE   = '#007AFF'
const IMSG_GRAY   = '#E9E9EB'
const IMSG_GRAY_D = '#2C2C2E'
const TAPBACKS    = ['❤️','👍','👎','😂','😮','🙏']

function Avatar({ name='?', color='#007AFF', size=44, online=false }) {
  const initials = (name||'?').split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?'
  // Generate stable color from name
  const hue = Array.from(name||'').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  const bg = color !== '#007AFF' ? color : `hsl(${hue}, 65%, 52%)`
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:700, color:'#fff', letterSpacing:'-0.5px', flexShrink:0 }}>
        {initials}
      </div>
      {online && <div style={{ position:'absolute', bottom:1, right:1, width:Math.max(8,size*0.2), height:Math.max(8,size*0.2), borderRadius:'50%', background:'#34C759', border:'2px solid #fff' }}/>}
    </div>
  )
}

function GroupAvatar({ size=44, couleur='#007AFF', nom='G' }) {
  const s = size
  const bg = couleur || '#007AFF'
  return (
    <div style={{ position:'relative', flexShrink:0, width:s, height:s }}>
      {/* Fond principal */}
      <div style={{ width:s, height:s, borderRadius:'50%', background:bg, position:'absolute', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {/* Grille 2x2 de mini-avatars */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, padding:s*0.15 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:s*0.3, height:s*0.3, borderRadius:'50%', background:'rgba(255,255,255,0.85)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width={s*0.18} height={s*0.18} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="5" fill="rgba(0,0,0,0.3)"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="rgba(0,0,0,0.3)"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


function Bubble({ msg, dark, myColor, onTapback, sameAsPrev=false, sameAsNext=false }) {
  const [anim, setAnim] = useState(false)
  const [showTapbacks, setShowTapbacks] = useState(false)
  const pressTimer = useRef(null)
  useEffect(() => { const t = setTimeout(() => setAnim(true), 50); return () => clearTimeout(t) }, [])

  const sentBg    = dark ? '#fff' : '#111'
  const recvBg    = dark ? IMSG_GRAY_D : IMSG_GRAY
  const sentColor = dark ? '#111' : '#fff'
  const recvColor = dark ? '#fff' : '#000'

  const radius = msg.me
    ? (sameAsPrev && sameAsNext ? '22px 6px 6px 22px'
      : sameAsPrev ? '22px 6px 22px 22px'
      : sameAsNext ? '22px 22px 6px 22px'
      : '22px 22px 6px 22px')
    : (sameAsPrev && sameAsNext ? '6px 22px 22px 6px'
      : sameAsPrev ? '6px 22px 22px 22px'
      : sameAsNext ? '22px 22px 22px 6px'
      : '22px 22px 22px 6px')

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:msg.me?'flex-end':'flex-start', position:'relative' }}>
      <div
        onDoubleClick={() => setShowTapbacks(s=>!s)}
        onTouchStart={() => { pressTimer.current = setTimeout(() => setShowTapbacks(s=>!s), 500) }}
        onTouchEnd={() => clearTimeout(pressTimer.current)}
        onTouchMove={() => clearTimeout(pressTimer.current)}
        style={{
          padding:'10px 14px',
          borderRadius: radius,
          background: msg.me ? sentBg : recvBg,
          color: msg.me ? sentColor : recvColor,
          fontSize:16, lineHeight:1.5, letterSpacing:'-0.2px', fontWeight:400,
          opacity: anim ? 1 : 0,
          transform: anim ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(10px)',
          transition:'opacity 0.25s ease, transform 0.25s ease',
          cursor:'default', userSelect:'none', position:'relative',
          maxWidth:'100%', wordBreak:'break-word',
        }}>

        {msg.text}
        {msg.tapback && (
          <div style={{ position:'absolute', bottom:-16, right:msg.me?8:'auto', left:msg.me?'auto':8, fontSize:14, background:dark?'#2C2C2E':'#fff', borderRadius:980, padding:'3px 8px', boxShadow:`0 2px 8px rgba(0,0,0,0.2)`, border:`1px solid ${dark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.1)'}`, zIndex:10 }}>
            {msg.tapback}
          </div>
        )}
      </div>

      {showTapbacks && (
        <div style={{ display:'flex', gap:4, marginTop:6, background:dark?'#2C2C2E':'#fff', borderRadius:24, padding:'6px 10px', boxShadow:`0 4px 24px rgba(0,0,0,0.15)`, animation:'fadeIn 0.15s ease' }}>
          {TAPBACKS.map(t => (
            <button key={t} onClick={() => { onTapback(msg.id, t); setShowTapbacks(false) }}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, padding:'2px 4px', lineHeight:1, transition:'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.3)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TypingIndicator({ dark }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'10px 14px', borderRadius:'18px 18px 18px 6px', background:dark?IMSG_GRAY_D:IMSG_GRAY, width:56, marginBottom:8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:dark?'#8E8E93':'#999', animation:'bounce 1.2s infinite', animationDelay:`${i*0.2}s` }}/>
      ))}
    </div>
  )
}

function InputBar({ input, setInput, send, dark, replyTo, setReplyTo, contact }) {
  const inputRef = useRef(null)
  const [showPlus, setShowPlus] = useState(false)
  const bg   = dark ? '#000' : '#fff'
  const text = dark ? '#fff' : '#111'

  const actions = [
    { icon: Paperclip, label:'Fichier',        accept:'*',       color:'#007AFF' },
    { icon: Image,     label:'Galerie',         accept:'image/*', color:'#34C759' },
    { icon: Camera,    label:'Appareil photo',  accept:'image/*', color:'#FF9500', capture:'environment' },
    { icon: Mic,       label:'Audio',           accept:'audio/*', color:'#FF3B30' },
  ]

  return (
    <div style={{ padding:'8px 12px 24px', background:bg, flexShrink:0 }}>
      {/* Preview réponse */}
      {replyTo && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:dark?'#1C1C1E':'#f5f5f5', borderRadius:14, marginBottom:8, border:dark?'1px solid #2a2a2a':'1px solid #e5e5e5' }}>
          <div style={{ width:3, minHeight:36, borderRadius:2, background:'#007AFF', alignSelf:'stretch', flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:'#007AFF', fontWeight:700, marginBottom:3 }}>↩ {replyTo.from || contact?.name}</div>
            <div style={{ fontSize:13, color:dark?'rgba(255,255,255,0.7)':'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#8E8E93', padding:4, display:'flex', flexShrink:0 }}>
            <X size={16} strokeWidth={2}/>
          </button>
        </div>
      )}

      {/* Zone principale */}
      <div style={{
        background:dark?'#1C1C1E':'#fff',
        border:`1.5px solid ${dark?'#3A3A3C':'#E5E5EA'}`,
        borderRadius:24,
        padding:'10px 14px',
        boxShadow:dark?'none':'0 2px 16px rgba(0,0,0,0.06)',
        display:'flex', flexDirection:'column', gap:8,
      }}>
        {/* Input */}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
          placeholder="Message"
          style={{
            border:'none', background:'transparent',
            fontSize:15, fontFamily:ft, color:text,
            outline:'none', lineHeight:1.5, width:'100%',
            padding:0,
          }}
        />

        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {/* Bouton + */}
            <button
              onClick={() => setShowPlus(s=>!s)}
              style={{
                width:32, height:32, borderRadius:'50%', border:'none',
                background:showPlus?(dark?'#fff':'#111'):(dark?'#2C2C2E':'#F2F2F7'),
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s ease',
              }}>
              <Plus size={18} strokeWidth={2.5} color={showPlus?(dark?'#111':'#fff'):(dark?'#8E8E93':'#555')}/>
            </button>

            {/* Actions rapides si + ouvert */}
            {showPlus && actions.map(({ icon:Icon, label, accept, color, capture }) => (
              <label key={label} title={label}
                style={{ width:32, height:32, borderRadius:'50%', border:'none', background:dark?'#2C2C2E':'#F2F2F7', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.background=color+'22'}
                onMouseLeave={e => e.currentTarget.style.background=dark?'#2C2C2E':'#F2F2F7'}>
                <input type="file" accept={accept} capture={capture} style={{ display:'none' }} onChange={() => {}}/>
                <Icon size={17} strokeWidth={1.8} color={color}/>
              </label>
            ))}
          </div>

          {/* Bouton envoyer */}
          <button onClick={send} disabled={!input.trim()}
            style={{
              width:34, height:34, borderRadius:'50%', border:'none',
              background:input.trim()?(dark?'#fff':'#111'):(dark?'#2C2C2E':'#F2F2F7'),
              cursor:input.trim()?'pointer':'default',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s ease',
              flexShrink:0,
            }}>
            <Send size={16} strokeWidth={2.5} color={input.trim()?(dark?'#111':'#fff'):(dark?'#555':'#aaa')}/>
          </button>
        </div>
      </div>
    </div>
  )
}

function ChatView({ contact, onBack, dark, myColor, onSent }) {
  const [msgs, setMsgs]     = useState([])
  const [input, setInput]   = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const bottomRef = useRef(null)
  const bg   = dark ? '#000' : '#fff'
  const text = dark ? '#fff' : '#000'
  const sub  = dark ? '#8E8E93' : '#8E8E93'

  useEffect(() => {
    const convId = contact.convId || contact.id
    if (!convId) return
    api.get('/api/conversations/'+convId+'/messages').then(r => {
      setMsgs(r.data.map(m => ({ id:m.id, me:m.isMe, text:m.content, time:m.createdAt, from:m.sender?.firstName, tapback:m.tapback??null, replyTo:m.replyTo?{...m.replyTo, senderName:m.replyTo.senderName}:null })))
    }).catch(() => {})
  }, [contact.convId, contact.id])

  useEffect(() => {
    const convId = contact.convId || contact.id
    if (!convId) return
    const iv = setInterval(() => {
      api.get('/api/conversations/'+convId+'/messages').then(r => {
        setMsgs(prev => r.data.map(m => {
          const existing = prev.find(p => p.id === m.id)
          return { id:m.id, me:m.isMe, text:m.content, time:m.createdAt, from:m.sender?.firstName, tapback:m.tapback??existing?.tapback??null, replyTo:m.replyTo?{...m.replyTo}:(existing?.replyTo??null) }
        }))
      }).catch(() => {})
    }, 3000)
    return () => clearInterval(iv)
  }, [contact?.convId, contact?.id])

  const isAtBottom = useRef(true)
  const scrollRef = useRef(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 60
  }

  useEffect(() => {
    if (isAtBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior:'smooth' })
    }
  }, [msgs])

  const send = () => {
    if (!input.trim()) return
    const convId = contact.convId || contact.id
    const newMsg = { id:Date.now(), me:true, text:input.trim(), time:'Maintenant', tapback:null, replyTo }
    setMsgs(m => [...m, newMsg])
    setInput('')
    setReplyTo(null)
    if (convId) {
      api.post('/api/conversations/'+convId+'/messages', { content:newMsg.text, replyToId:replyTo?.id??null, replyToText:replyTo?.text??null }).then(() => {
        if (onSent) onSent()
      }).catch(() => {})
    }
  }

  const tapback = (msgId, emoji) => {
    const newEmoji = msgs.find(m=>m.id===msgId)?.tapback===emoji ? null : emoji
    setMsgs(m => m.map(msg => msg.id===msgId ? { ...msg, tapback:newEmoji } : msg))
    api.patch('/api/conversations/'+msgId+'/tapback', { tapback:newEmoji }).catch(() => {})
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:bg }}>
      {/* Header */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 16px 8px', flexShrink:0, position:'relative', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        <button onClick={onBack} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#007AFF', display:'flex', alignItems:'center', gap:2 }}>
          <ChevronLeft size={22} strokeWidth={2} color="#007AFF"/>
        </button>
        <Avatar name={contact.name??'?'} color={contact.color??'#007AFF'} size={36} online={contact.online}/>
        <div style={{ fontSize:13, fontWeight:600, color:text, marginTop:4 }}>{contact.name}</div>
        <div style={{ fontSize:11, color:sub }}>{contact.role}</div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} style={{ flex:1, overflowY:'auto', padding:'16px 12px' }}>
        {msgs.length === 0 && (
          <div style={{ textAlign:'center', color:sub, fontSize:13, marginTop:40 }}>Aucun message</div>
        )}
        {msgs.map((msg, i) => {
          const sameAsPrev = i > 0 && msgs[i-1].me === msg.me
          const nom = msg.me ? 'Vous' : (msg.from || contact.name)
          return (
            <div key={msg.id} style={{ display:'flex', gap:12, marginTop:sameAsPrev?4:20 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:dark?'#fff':'#111', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:dark?'#111':'#fff', flexShrink:0, visibility:sameAsPrev?'hidden':'visible' }}>
                {nom[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                {!sameAsPrev && (
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:dark?'#fff':'#111' }}>{nom}</span>
                    <span style={{ fontSize:11, color:sub }}>{msg.time}</span>
                  </div>
                )}
                {msg.replyTo && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6, padding:'6px 10px', background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)', borderRadius:10, borderLeft:'3px solid #007AFF' }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#007AFF', marginBottom:2 }}>{msg.replyTo.senderName||msg.replyTo.from}</div>
                      <div style={{ fontSize:12, color:sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>{msg.replyTo.text}</div>
                    </div>
                  </div>
                )}
                <p style={{ margin:'0 0 4px', fontSize:15, lineHeight:1.6, color:dark?'#e8e8e8':'#1a1a1a', wordBreak:'break-word' }}>{msg.text}</p>
                <button onClick={() => setReplyTo({ id:msg.id, text:msg.text, from:nom })}
                  style={{ background:'none', border:'none', fontSize:12, color:sub, cursor:'pointer', padding:0, fontFamily:ft }}>
                  Répondre
                </button>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>
      <MessageInputBar
          onSend={({ content, replyToId, replyToText }) => {
            const convId = contact?.convId || contact?.id
            if (!content.trim()) return
            const currentReplyTo = replyTo
            const newMsg = { id:Date.now(), me:true, text:content, time:'Maintenant', tapback:null, replyTo:currentReplyTo ? { text:currentReplyTo.text, senderName:currentReplyTo.from, from:currentReplyTo.from } : null }
            setMsgs(m => [...m, newMsg])
            setReplyTo(null)
            if (convId) api.post('/api/conversations/'+convId+'/messages', { content, replyToId, replyToText }).catch(()=>{})
          }}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
    </div>
  )
}

function NewConvPanel({ users, dark, onSelect }) {
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const bg   = dark ? '#1C1C1E' : '#f9f9f9'
  const text = dark ? '#fff' : '#000'
  const CATS = [
    { key:'tous',          label:'Tous' },
    { key:'enseignants',   label:'Enseignants' },
    { key:'administration',label:'Administration' },
    { key:'camarades',     label:'Camarades' },
  ]
  const filtered = users.filter(u => {
    const matchSearch = (u.firstName+' '+u.lastName).toLowerCase().includes(search.toLowerCase())
    const matchFiltre = filtre==='tous' ? true
      : filtre==='enseignants' ? u.roles?.includes('ROLE_TEACHER')
      : filtre==='administration' ? (u.roles?.includes('ROLE_ADMIN')||u.roles?.includes('ROLE_SUPER_ADMIN'))
      : !u.roles?.includes('ROLE_TEACHER') && !u.roles?.includes('ROLE_ADMIN')
    return matchSearch && matchFiltre
  })
  const color = u => u.roles?.includes('ROLE_TEACHER')?'#FF6B35':u.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF'
  const role  = u => u.roles?.includes('ROLE_TEACHER')?'Enseignant':u.roles?.includes('ROLE_ADMIN')?'Admin':'Camarade'
  return (
    <div style={{ background:bg, borderRadius:16, margin:'0 12px 12px', overflow:'hidden' }}>
      <div style={{ padding:'10px 14px', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:dark?'#2C2C2E':'#fff', borderRadius:12, padding:'8px 12px' }}>
          <Search size={14} color="#8E8E93" strokeWidth={2}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ border:'none', background:'transparent', fontSize:14, color:text, outline:'none', fontFamily:ft, flex:1 }}/>
        </div>
      </div>
      <div style={{ display:'flex', gap:6, padding:'10px 14px', overflowX:'auto', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        {CATS.map(cat=>(
          <button key={cat.key} onClick={()=>setFiltre(cat.key)}
            style={{ padding:'5px 14px', borderRadius:980, border:'none', cursor:'pointer', fontSize:12, fontWeight:filtre===cat.key?700:400, background:filtre===cat.key?dark?'#fff':'#111':dark?'#2C2C2E':'#e5e5e5', color:filtre===cat.key?dark?'#000':'#fff':dark?'#fff':'#000', whiteSpace:'nowrap', fontFamily:ft }}>
            {cat.label}
          </button>
        ))}
      </div>
      <div style={{ maxHeight:260, overflowY:'auto' }}>
        {filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:24, color:'#8E8E93', fontSize:13 }}>Aucun résultat</div>
        ) : filtered.map(u=>(
          <div key={u.id} onClick={()=>onSelect(u)}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#F2F2F7'}` }}
            onMouseEnter={e=>e.currentTarget.style.background=dark?'#2C2C2E':'#f0f0f0'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <Avatar name={u.firstName+' '+u.lastName} color={color(u)} size={38}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, color:text, fontWeight:500 }}>{u.firstName} {u.lastName}</div>
              <div style={{ fontSize:11, color:'#8E8E93' }}>{role(u)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactList({ contacts, onSelect, dark, myColor }) {
  const bg   = dark ? '#000' : '#fff'
  const text = dark ? '#fff' : '#000'
  const sub  = dark ? '#8E8E93' : '#8E8E93'
  const sep  = dark ? '#1C1C1E' : '#F2F2F7'
  return (
    <div style={{ flex:1, overflowY:'auto' }}>
      {contacts.length === 0 && (
        <div style={{ textAlign:'center', color:sub, fontSize:13, padding:32 }}>Aucune conversation</div>
      )}
      {contacts.map((c, i) => (
        <div key={c.id} onClick={() => onSelect(c)}
          style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', borderBottom:`0.5px solid ${sep}` }}
          onMouseEnter={e => e.currentTarget.style.background=dark?'#0A0A0A':'#F9F9F9'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <Avatar name={c.name??'?'} color={c.color??'#007AFF'} size={48} online={c.online}/>
            {c.unread>0 && <div style={{ position:'absolute', top:-2, right:-2, width:18, height:18, borderRadius:'50%', background:'#FF3B30', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>{c.unread}</div>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:15, fontWeight:c.unread>0?700:500, color:text }}>{c.name}</span>
              {c.time && <span style={{ fontSize:12, color:sub }}>{c.time}</span>}
            </div>
            <div style={{ fontSize:13, color:c.unread>0?text:sub, fontWeight:c.unread>0?600:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {c.unread>1 ? `${c.unread} nouveaux messages` : (c.last||'Nouvelle conversation')}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CreateGroupPanel({ users, dark, onCreated }) {
  const [nom, setNom]         = useState('')
  const [couleur, setCouleur] = useState('#007AFF')
  const [selected, setSelected] = useState([])
  const [search, setSearch]   = useState('')
  const [saving, setSaving]   = useState(false)
  const text = dark ? '#fff' : '#000'
  const sub  = dark ? '#8E8E93' : '#8E8E93'
  const COLORS = ['#007AFF','#34C759','#FF9500','#FF3B30','#AF52DE','#FF6B35','#5AC8FA','#FF2D55']

  const filtered = users.filter(u => (u.firstName+' '+u.lastName).toLowerCase().includes(search.toLowerCase()))
  const toggle = (u) => setSelected(s => s.find(x=>x.id===u.id) ? s.filter(x=>x.id!==u.id) : [...s, u])

  const create = async () => {
    if (!nom.trim() || selected.length === 0) return
    setSaving(true)
    try {
      const r = await api.post('/api/groupes', { nom:nom.trim(), couleur, membresIds:selected.map(u=>u.id) })
      onCreated({ id:r.data.id, nom:r.data.nom, couleur, membres:selected, isGroupe:true })
    } catch(e) {}
    setSaving(false)
  }

  return (
    <div style={{ background:dark?'#1C1C1E':'#f9f9f9', borderRadius:16, margin:'0 12px 12px', overflow:'hidden' }}>
      {/* Nom du groupe */}
      <div style={{ padding:'12px 14px', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Nom du groupe..."
          style={{ width:'100%', border:'none', background:dark?'#2C2C2E':'#fff', borderRadius:10, padding:'9px 12px', fontSize:14, color:text, outline:'none', fontFamily:ft, boxSizing:'border-box' }}/>
      </div>
      {/* Couleur */}
      <div style={{ padding:'10px 14px', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}`, display:'flex', gap:8 }}>
        {COLORS.map(col=>(
          <button key={col} onClick={()=>setCouleur(col)}
            style={{ width:24, height:24, borderRadius:'50%', background:col, border:couleur===col?`3px solid ${dark?'#fff':'#111'}`:'3px solid transparent', cursor:'pointer', flexShrink:0 }}/>
        ))}
      </div>
      {/* Membres sélectionnés */}
      {selected.length > 0 && (
        <div style={{ display:'flex', gap:8, padding:'8px 14px', overflowX:'auto', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
          {selected.map(u=>(
            <div key={u.id} onClick={()=>toggle(u)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', flexShrink:0 }}>
              <div style={{ position:'relative' }}>
                <Avatar name={u.firstName+' '+u.lastName} size={36}/>
                <div style={{ position:'absolute', top:-2, right:-2, width:14, height:14, borderRadius:'50%', background:'#FF3B30', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={8} color="#fff" strokeWidth={3}/>
                </div>
              </div>
              <span style={{ fontSize:9, color:sub, maxWidth:40, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.firstName}</span>
            </div>
          ))}
        </div>
      )}
      {/* Recherche membres */}
      <div style={{ padding:'10px 14px', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:dark?'#2C2C2E':'#fff', borderRadius:10, padding:'7px 12px' }}>
          <Search size={13} color="#8E8E93" strokeWidth={2}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ajouter des membres..."
            style={{ border:'none', background:'transparent', fontSize:13, color:text, outline:'none', fontFamily:ft, flex:1 }}/>
        </div>
      </div>
      <div style={{ maxHeight:200, overflowY:'auto' }}>
        {filtered.map(u => {
          const isSel = !!selected.find(x=>x.id===u.id)
          return (
            <div key={u.id} onClick={()=>toggle(u)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#F2F2F7'}`, background:isSel?(dark?'#2C2C2E':'#EEF4FF'):'transparent' }}>
              <Avatar name={u.firstName+' '+u.lastName} size={36}/>
              <div style={{ flex:1, fontSize:14, color:text }}>{u.firstName} {u.lastName}</div>
              {isSel && <div style={{ width:20, height:20, borderRadius:'50%', background:'#007AFF', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={12} color="#fff" strokeWidth={3}/></div>}
            </div>
          )
        })}
      </div>
      <div style={{ padding:'10px 14px' }}>
        <button onClick={create} disabled={!nom.trim()||selected.length===0||saving}
          style={{ width:'100%', padding:10, borderRadius:12, border:'none', background:nom.trim()&&selected.length>0?dark?'#fff':'#111':'#ccc', color:dark?'#111':'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:ft, opacity:saving?0.6:1 }}>
          {saving?'Création...':'Créer le groupe'}
        </button>
      </div>
    </div>
  )
}

function GroupChatView({ groupe, onBack, dark, myColor }) {
  const [msgs, setMsgs]   = useState([])
  const [input, setInput] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const bg   = dark ? '#000' : '#fff'
  const text = dark ? '#fff' : '#000'
  const sub  = dark ? '#8E8E93' : '#8E8E93'
  const bottomRef = useRef(null)

  useEffect(() => {
    // Marquer notifs groupe comme lues
    api.get('/api/notifications').then(r => {
      r.data.filter(n => n.type==='groupe' && !n.isRead && n.title?.includes(groupe?.nom||'')).forEach(n => {
        api.patch('/api/notifications/'+n.id+'/read').catch(()=>{})
      })
    }).catch(()=>{})
  }, [groupe?.id])

  useEffect(() => {
    api.get('/api/groupes/'+groupe.id+'/messages').then(r => setMsgs(r.data)).catch(()=>{})
    const iv = setInterval(() => {
      api.get('/api/groupes/'+groupe.id+'/messages').then(r => setMsgs(r.data)).catch(()=>{})
    }, 3000)
    return () => clearInterval(iv)
  }, [groupe.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = () => {
    if (!input.trim()) return
    const newMsg = { id:Date.now(), isMe:true, content:input.trim(), createdAt:'Maintenant', sender:{ firstName:'Vous' } }
    setMsgs(m => [...m, newMsg])
    setInput('')
    api.post('/api/groupes/'+groupe.id+'/messages', { content:newMsg.content }).catch(()=>{})
  }

  if (!groupe) return <div/>  
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:bg }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:'#007AFF', display:'flex' }}>
          <ChevronLeft size={22} strokeWidth={2} color="#007AFF"/>
        </button>
        <GroupAvatar size={40} couleur={groupe.couleur}/>
        <div>
          <div style={{ fontSize:15, fontWeight:600, color:text }}>{groupe?.nom??'Groupe'}</div>
          <div style={{ fontSize:11, color:sub }}>{groupe?.nbMembres ?? groupe?.membres?.length ?? 0} membres</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 12px' }}>
        {msgs.length === 0 && <div style={{ textAlign:'center', color:sub, fontSize:13, marginTop:40 }}>Aucun message</div>}
        {msgs.map((m, i) => {
          const sameAsPrev = i > 0 && msgs[i-1].isMe === m.isMe
          return (
            <div key={m.id} style={{ display:'flex', gap:12, marginTop:sameAsPrev?8:20 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:dark?'#fff':'#111', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:dark?'#111':'#fff', flexShrink:0, opacity:sameAsPrev?0:1 }}>
                {m.isMe ? 'V' : m.sender?.firstName?.[0]}
              </div>
              <div style={{ flex:1 }}>
                {!sameAsPrev && (
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:dark?'#fff':'#111' }}>{m.isMe?'Vous':m.sender?.firstName}</span>
                    <span style={{ fontSize:12, color:sub }}>{m.createdAt}</span>
                  </div>
                )}
                {m.replyTo && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:6, opacity:0.8 }}>
                    <div style={{ width:2, minHeight:24, borderRadius:2, background:'#007AFF', flexShrink:0 }}/>
                    <div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#007AFF' }}>{m.replyTo.senderName||m.replyTo.from}</span>
                      <div style={{ fontSize:12, color:dark?'rgba(255,255,255,0.6)':'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:240 }}>{m.replyTo.text}</div>
                    </div>
                  </div>
                )}
                {m.replyTo && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:6, opacity:0.8 }}>
                    <div style={{ width:2, minHeight:24, borderRadius:2, background:'#007AFF', flexShrink:0 }}/>
                    <div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#007AFF' }}>{m.replyTo.senderName||m.replyTo.from}</span>
                      <div style={{ fontSize:12, color:dark?'rgba(255,255,255,0.6)':'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:240 }}>{m.replyTo.text}</div>
                    </div>
                  </div>
                )}
                <p style={{ margin:0, fontSize:15, lineHeight:1.55, color:dark?'#dcdcdc':'#333', wordBreak:'break-word' }}>{m.content}</p>
                <button onClick={() => setReplyTo({ id:m.id, text:m.content, from:m.sender?.firstName })}
                  style={{ background:'none', border:'none', fontSize:12, fontWeight:600, color:sub, cursor:'pointer', padding:'4px 0 0', fontFamily:ft }}>
                  Répondre
                </button>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      <InputBar input={input} setInput={setInput} send={send} dark={dark} replyTo={replyTo} setReplyTo={setReplyTo} contact={{name:groupe?.nom??'Groupe'}}/>
    </div>
  )
}


export default function Conversations() {
  const [tab, setTab]                 = useState('msgs') // 'msgs' | 'groupes'
  const [selected, setSelected]       = useState(null)
  const [selectedGroupe, setSelectedGroupe] = useState(null)
  const [convs, setConvs]             = useState([])
  const [groupes, setGroupes]         = useState([])
  const [users, setUsers]             = useState([])
  const [showNewConv, setShowNewConv] = useState(false)
  const [showNewGroupe, setShowNewGroupe] = useState(false)
  const profileColor = useThemeStore(s => s.profileColor) ?? '#007AFF'
  const darkMode     = useThemeStore(s => s.darkMode)
  const bg   = darkMode ? '#000' : '#fff'
  const text = darkMode ? '#fff' : '#000'
  const sub  = darkMode ? '#8E8E93' : '#8E8E93'

  const [notifs, setNotifs] = useState([])
  const loadNotifs = () => api.get('/api/notifications').then(r => setNotifs(r.data)).catch(()=>{})
  const unreadMsgs   = convs.reduce((acc, cv) => acc + (cv.unreadCount??0), 0)
  const unreadGroupes = notifs.filter(n => n.type==='groupe' && !n.isRead).length


  const loadConvs = () => api.get('/api/conversations').then(r => {
    const sorted = r.data.sort((a,b) => {
      if (!a.lastMessage && !b.lastMessage) return 0
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.datetime) - new Date(a.lastMessage.datetime)
    })
    setConvs(sorted)
  }).catch(() => {})

  useEffect(() => {
    loadConvs()
    loadNotifs()
    api.get('/api/conversations/users').then(r => setUsers(r.data)).catch(() => {})
    const loadGroupes = () => api.get('/api/groupes').then(r=>setGroupes(r.data)).catch(()=>{})
    loadGroupes()
    const iv2 = setInterval(loadGroupes, 2000)
    const iv = setInterval(loadConvs, 2000)
    const iv3 = setInterval(loadNotifs, 2000)
    return () => { clearInterval(iv); clearInterval(iv2); clearInterval(iv3) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ fontFamily:ft, height:'100%', display:'flex', flexDirection:'column', background:bg }}>
        {selectedGroupe ? (
          <GroupChatView groupe={selectedGroupe} onBack={() => setSelectedGroupe(null)} dark={darkMode} myColor={profileColor}/>
        ) : selected ? (
          <ChatView
            contact={selected}
            onBack={() => { setSelected(null); loadConvs() }}
            dark={darkMode}
            myColor={profileColor}
            onSent={loadConvs}
          />
        ) : (
          <>
            {/* Header */}
            <div style={{ padding:'16px 16px 10px', flexShrink:0, background:bg }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h1 style={{ fontSize:28, fontWeight:700, color:text, letterSpacing:'-0.5px', margin:0 }}>{tab==='msgs'?'Messages':'Groupes'}</h1>
                <button onClick={() => tab==='msgs'?setShowNewConv(s=>!s):setShowNewGroupe(s=>!s)}
                  style={{ width:32, height:32, borderRadius:'50%', border:'none', background:darkMode?'#1C1C1E':'#F2F2F7', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {(showNewConv||showNewGroupe) ? <X size={16} color={text} strokeWidth={2}/> : <Plus size={18} color={text} strokeWidth={2}/>}
                </button>
              </div>
              {/* Recherche */}
              <div style={{ display:'flex', alignItems:'center', gap:8, background:darkMode?'#1C1C1E':'#F2F2F7', borderRadius:12, padding:'8px 12px' }}>
                <Search size={14} color="#8E8E93" strokeWidth={2}/>
                <input placeholder="Rechercher" style={{ border:'none', background:'transparent', fontSize:14, color:text, outline:'none', fontFamily:ft, flex:1 }}/>
              </div>
            </div>

            {/* Onglets */}
            <div style={{ display:'flex', gap:6, padding:'8px 16px 0' }}>
              {[{key:'msgs',label:'Messages',count:unreadMsgs},{key:'groupes',label:'Groupes',count:unreadGroupes}].map(t=>(
                <div key={t.key} style={{position:'relative',display:'inline-flex'}}>
                  <button onClick={()=>{setTab(t.key);setShowNewConv(false);setShowNewGroupe(false)}}
                    style={{padding:'6px 16px',borderRadius:980,border:'none',cursor:'pointer',fontSize:13,fontWeight:tab===t.key?700:400,background:tab===t.key?darkMode?'#fff':'#111':darkMode?'#2C2C2E':'#F2F2F7',color:tab===t.key?darkMode?'#000':'#fff':darkMode?'#fff':'#000',fontFamily:ft}}>
                    {t.label}
                  </button>
                  {t.count>0&&<div style={{position:'absolute',top:-7,right:-7,minWidth:20,height:20,borderRadius:'50%',background:'#FF3B30',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px',zIndex:10}}>{t.count}</div>}
                </div>
              ))}
            </div>

            {/* Nouveau conv panel */}
            {showNewConv && tab==='msgs' && (
              <NewConvPanel users={users} dark={darkMode} onSelect={u => {
                api.post('/api/conversations', { userId:u.id }).then(r => {
                  setShowNewConv(false)
                  loadConvs()
                  const color = u.roles?.includes('ROLE_TEACHER')?'#FF6B35':u.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF'
                  setSelected({ id:r.data.id, convId:r.data.id, name:u.firstName+' '+u.lastName, avatar:(u.firstName?.[0]??'')+(u.lastName?.[0]??''), color, online:false, role:u.roles?.includes('ROLE_TEACHER')?'Enseignant':'Étudiant' })
                }).catch(() => {})
              }}/>
            )}

            {showNewGroupe && tab==='groupes' && (
              <CreateGroupPanel users={users} dark={darkMode} onCreated={g => {
                setShowNewGroupe(false)
                api.get('/api/groupes').then(r=>setGroupes(r.data)).catch(()=>{})
                setSelectedGroupe(g)
              }}/>
            )}

            {/* Liste groupes */}
            {tab==='groupes' && (
              <div style={{ flex:1, overflowY:'auto' }}>
                {groupes.length===0 && <div style={{ textAlign:'center', color:sub, fontSize:13, padding:32 }}>Aucun groupe — crée le premier !</div>}
                {groupes.map(g=>(
                  <div key={g.id} onClick={()=>setSelectedGroupe(g)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', borderBottom:`0.5px solid ${darkMode?'#1C1C1E':'#F2F2F7'}` }}
                    onMouseEnter={e=>e.currentTarget.style.background=darkMode?'#0A0A0A':'#F9F9F9'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <GroupAvatar size={48} couleur={g.couleur}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                        <span style={{ fontSize:15, fontWeight:notifs.filter(n=>n.type==='groupe'&&!n.isRead&&n.title?.includes(g.nom)).length>0?700:500, color:text }}>{g.nom}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          {g.lastMessage&&<span style={{ fontSize:12, color:sub }}>{g.lastMessage.createdAt}</span>}
                          {notifs.filter(n=>n.type==='groupe'&&!n.isRead&&n.title?.includes(g.nom)).length>0&&<span style={{ minWidth:18,height:18,borderRadius:'50%',background:'#FF0000',color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px' }}>{notifs.filter(n=>n.type==='groupe'&&!n.isRead&&n.title?.includes(g.nom)).length}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        <span style={{fontWeight:notifs.filter(n=>n.type==='groupe'&&!n.isRead&&n.title?.includes(g.nom)).length>0?700:400,color:notifs.filter(n=>n.type==='groupe'&&!n.isRead&&n.title?.includes(g.nom)).length>0?text:sub}}>
                        {g.lastMessage?(g.lastMessage.isMe?'Vous : ':'')+g.lastMessage.content:g.nbMembres+' membres'}
                      </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Liste conversations */}
            {tab==='msgs' && <ContactList
              contacts={convs.map(cv => ({
                id:cv.id, convId:cv.id,
                name:(cv.other?.firstName??'')+' '+(cv.other?.lastName??''),
                role:cv.other?.roles?.includes('ROLE_TEACHER')?'Enseignant':'Étudiant',
                avatar:(cv.other?.firstName?.[0]??'')+(cv.other?.lastName?.[0]??''),
                color:cv.other?.roles?.includes('ROLE_TEACHER')?'#FF6B35':cv.other?.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF',
                last:cv.lastMessage?(cv.lastMessage.isMe?'Vous : ':'')+cv.lastMessage.content:'Nouvelle conversation',
                time:cv.lastMessage?.createdAt??'', unread:cv.unreadCount??0, online:false,
              }))}
              onSelect={contact => setSelected({ ...contact, convId:contact.id })}
              dark={darkMode}
              myColor={profileColor}
            />}
          </>
        )}
      </div>
    </>
  )
}