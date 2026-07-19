import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'
import { ft } from '../../constants/theme'
import { useThemeStore } from '../../store/ThemeStore'


// iMessage colors
const IMSG_BLACK  = '#111111'
const IMSG_GRAY   = '#E9E9EB'
const IMSG_GRAY_D = '#2C2C2E'

const CONTACTS = []

const HISTORY = {}
const TAPBACKS = ['❤️','👍','👎','😂','😮','🙏']

// ─── Composants ───────────────────────────────────────────────

function Avatar({ name, color, size=44, online=false }) {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.33, fontWeight:600, color:'#fff', letterSpacing:'-0.5px' }}>
        {initials}
      </div>
      {online && <div style={{ position:'absolute', bottom:1, right:1, width:Math.max(8, size*0.2), height:Math.max(8, size*0.2), borderRadius:'50%', background:'#34C759', border:'2px solid #fff' }}/>}
    </div>
  )
}

// Bulle avec animations CSS via style tag
function Bubble({ msg, dark, myColor, onTapback, sameAsPrev=false, sameAsNext=false }) {
  const [showTapbacks, setShowTapbacks] = useState(false)
  const pressTimer = useRef(null)
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    setTimeout(() => setAnim(true), 10)
  }, [])

  const sentBg    = dark ? '#ffffff' : '#111111'
  const recvBg    = dark ? IMSG_GRAY_D : IMSG_GRAY
  const sentColor = dark ? '#000' : '#fff'
  const recvColor = dark ? '#fff' : '#000'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:msg.me?'flex-end':'flex-start', marginBottom:msg.tapback?20:4, position:'relative' }}>
      <div
        onDoubleClick={() => setShowTapbacks(s=>!s)}
        onContextMenu={e=>{e.preventDefault();setReplyTo(msg)}}
        onTouchStart={() => { pressTimer.current = setTimeout(() => setShowTapbacks(s=>!s), 500) }}
        onTouchEnd={() => clearTimeout(pressTimer.current)}
        onTouchMove={() => clearTimeout(pressTimer.current)}
        style={{
          padding:'9px 13px',
          borderRadius: msg.me
            ? (sameAsPrev && sameAsNext ? '22px 6px 6px 22px'
              : sameAsPrev ? '22px 6px 22px 22px'
              : sameAsNext ? '22px 22px 6px 22px'
              : '22px 22px 6px 22px')
            : (sameAsPrev && sameAsNext ? '6px 22px 22px 6px'
              : sameAsPrev ? '6px 22px 22px 22px'
              : sameAsNext ? '22px 22px 22px 6px'
              : '22px 22px 22px 6px'),
          background: msg.me ? sentBg : recvBg,
          color: msg.me ? sentColor : recvColor,
          fontSize:16,
          lineHeight:1.4,
          opacity: anim ? 1 : 0,
          transform: anim ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(10px)',
          transition:'opacity 0.25s cubic-bezier(.34,1.56,.64,1), transform 0.25s cubic-bezier(.34,1.56,.64,1)',
          cursor:'default',
          userSelect:'none',
          position:'relative',
        }}>
        {msg.replyTo&&(
          <div style={{borderLeft:'3px solid rgba(255,255,255,0.5)',paddingLeft:8,marginBottom:6,opacity:0.7,fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {msg.replyTo.text}
          </div>
        )}
        {msg.text}

        {/* Tapback */}
        {msg.tapback && (
          <div style={{
            position:'absolute', bottom:-14, right:msg.me?8:'auto', left:msg.me?'auto':8,
            fontSize:13, background:dark?'#1C1C1E':'#fff', borderRadius:980,
            padding:'2px 6px', boxShadow:`0 1px 6px rgba(0,0,0,${dark?0.4:0.15})`,
            border:`1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,
            transition:'transform 0.2s cubic-bezier(.34,1.56,.64,1)',
          }}>
            {msg.tapback}
          </div>
        )}
      </div>

      {/* Picker tapbacks */}
      {showTapbacks && (
        <div style={{
          display:'flex', gap:4, marginTop:6,
          background:dark?'#2C2C2E':'#fff', borderRadius:20,
          padding:'6px 10px',
          boxShadow:`0 4px 24px rgba(0,0,0,${dark?0.5:0.15})`,
          animation:'fadeIn 0.15s ease',
        }}>
          {TAPBACKS.map(t => (
            <button key={t} onClick={() => { onTapback(msg.id, t); setShowTapbacks(false) }}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, padding:'2px 3px', lineHeight:1, transition:'transform 0.15s' }}
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
    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'10px 14px', borderRadius:'18px 18px 18px 5px', background:dark?IMSG_GRAY_D:IMSG_GRAY, width:56, marginBottom:8 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:8, height:8, borderRadius:'50%', background:dark?'#999':'#888',
          animation:`bounce 1s ease infinite ${i*0.2}s`,
        }}/>
      ))}
    </div>
  )
}

function ChatView({ contact, onBack, dark, myColor, onSent }) {
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    const convId = contact.convId || contact.id
    if (!convId) return
    api.get('/api/conversations/'+convId+'/messages').then(r => {
      setMsgs(r.data.map(m => ({
        id: m.id, me: m.isMe, text: m.content, time: m.createdAt,
        from: m.sender?.firstName, tapback: m.tapback??null,
      })))
    }).catch(()=>{})
  }, [contact.convId, contact.id])

  // Polling toutes les 3s
  useEffect(() => {
    const convId = contact.convId || contact.id
    if (!convId) return
    const iv = setInterval(() => {
      api.get('/api/conversations/'+convId+'/messages').then(r => {
        setMsgs(prev => r.data.map(m => {
          const existing = prev.find(p => p.id === m.id)
          return {
            id: m.id, me: m.isMe, text: m.content, time: m.createdAt,
            from: m.sender?.firstName, tapback: m.tapback ?? existing?.tapback ?? null,
          }
        }))
      }).catch(()=>{})
    }, 3000)
    return () => clearInterval(iv)
  }, [contact.convId, contact.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = () => {
    if (!input.trim()) return
    const convId = contact.convId || contact.id
    const newMsg = { id:Date.now(), me:true, text:input.trim(), time:'Maintenant', tapback:null, replyTo:replyTo }
    setMsgs(m => [...m, newMsg])
    setInput('')
    setReplyTo(null)
    if (convId) {
      api.post('/api/conversations/'+convId+'/messages', { content: newMsg.text }).then(()=>{
        if (onSent) onSent()
      }).catch(()=>{})
    }
  }

  const tapback = (msgId, emoji) => {
    const newEmoji = msgs.find(m=>m.id===msgId)?.tapback===emoji ? null : emoji
    setMsgs(m => m.map(msg => msg.id===msgId ? { ...msg, tapback: newEmoji } : msg))
    api.patch('/api/conversations/'+msgId+'/tapback', { tapback: newEmoji }).catch(()=>{})
  }

  const bg    = dark ? '#000' : '#fff'
  const text  = dark ? '#fff' : '#000'
  const sub   = dark ? '#8E8E93' : '#8E8E93'
  const inBg  = dark ? '#1C1C1E' : '#F2F2F7'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:bg }}>

      {/* Header iMessage */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 16px 8px', flexShrink:0, position:'relative' }}>
        <button onClick={onBack} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:2, color:'#007AFF', fontSize:17, fontFamily:ft }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1 8.5L9 16" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <Avatar name={contact.name} color={contact.color} size={40} online={contact.online}/>
        <div style={{ fontSize:13, fontWeight:600, color:text, marginTop:4 }}>{contact.name}</div>
        {contact.online && <div style={{ fontSize:11, color:'#34C759' }}>En ligne</div>}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 8px' }}>
        {msgs.map((msg, i) => {
          const sameAsPrev = i > 0 && msgs[i-1].me === msg.me
          const sameAsNext = i < msgs.length-1 && msgs[i+1].me === msg.me
          const isFirst    = !sameAsPrev
          const isLast     = !sameAsNext
          const showAvatar = !msg.me && isLast
          const showTime   = isLast
          const showTime2  = i===0 || msgs[i-1]?.me !== msg.me
          const getDateLabel = (t) => {
            const now = new Date()
            const d = new Date(now.toDateString()+' '+t)
            if (isNaN(d)) return null
            return null // on simplifie : juste Aujourd'hui pour i===0
          }
          return (
            <div key={msg.id} style={{marginTop:sameAsPrev?2:16}}>
              {i===0&&(
                <div style={{textAlign:'center',margin:'12px 0'}}>
                  <span style={{fontSize:11,color:dark?'rgba(255,255,255,0.4)':'#8E8E93',background:dark?'#2C2C2E':'#F2F2F7',padding:'3px 12px',borderRadius:980,fontFamily:ft}}>
                    {"Aujourd'hui · "}{new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                  </span>
                </div>
              )}
              <div style={{display:'flex',alignItems:'flex-end',gap:6,justifyContent:msg.me?'flex-end':'flex-start'}}>
                {!msg.me && (
                  <div style={{width:28,flexShrink:0}}>
                    {showAvatar && <Avatar name={contact.name} color={contact.color} size={28}/>}
                  </div>
                )}
                <div style={{display:'flex',flexDirection:'column',alignItems:msg.me?'flex-end':'flex-start',maxWidth:'70%'}}>
                  <Bubble msg={msg} dark={dark} myColor={myColor} onTapback={tapback} sameAsPrev={sameAsPrev} sameAsNext={sameAsNext}/>
                  {showTime&&<div style={{fontSize:10,color:dark?'rgba(255,255,255,0.35)':'#8E8E93',marginTop:2}}>
                    {msg.time}
                  </div>}
                </div>
              </div>
            </div>
          )
        })}

        {typing && (
          <div style={{ paddingLeft:32 }}>
            <TypingIndicator dark={dark}/>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input iMessage */}
      <div style={{ padding:'8px 12px 24px', borderTop:`1px solid ${dark?'#2C2C2E':'#E5E5EA'}`, background:bg, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
          {/* Bouton apps */}
          <button style={{ width:32, height:32, borderRadius:'50%', background:inBg, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={dark?'#8E8E93':'#8E8E93'} strokeWidth="2">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>

          {/* Zone texte */}
          <div style={{ flex:1, background:inBg, borderRadius:20, border:`1px solid ${dark?'#3A3A3C':'#C7C7CC'}`, padding:'7px 40px 7px 14px', position:'relative', minHeight:36 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
              placeholder="iMessage"
              style={{ width:'100%', border:'none', background:'transparent', fontSize:16, fontFamily:ft, color:text, outline:'none', lineHeight:1.4 }}
            />
            {/* Emoji */}
            <button style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:20, lineHeight:1 }}>
              😊
            </button>
          </div>

          {/* Bouton envoyer */}
          <button onClick={send}
            style={{
              width:32, height:32, borderRadius:'50%', border:'none',
              background: input.trim() ? (myColor ?? '#007AFF') : inBg,
              cursor: input.trim() ? 'pointer' : 'default',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)',
              transform: input.trim() ? 'scale(1)' : 'scale(0.8)',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim()?'#fff':dark?'#3A3A3C':'#C7C7CC'} strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ContactList({ contacts, onSelect, dark, myColor }) {
  const bg   = dark ? '#000'     : '#fff'
  const text = dark ? '#fff'     : '#000'
  const sub  = dark ? '#8E8E93'  : '#8E8E93'
  const sep  = dark ? '#2C2C2E'  : '#E5E5EA'

  return (
    <div style={{ flex:1, overflowY:'auto', background:bg }}>
      {contacts.map(c => (
        <div key={c.id} onClick={() => onSelect(c)}
          style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderBottom:`0.5px solid ${sep}` }}
          onMouseEnter={e => e.currentTarget.style.background=dark?'#1C1C1E':'#F9F9F9'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <Avatar name={c.name} color={c.color} size={50} online={c.online}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:2 }}>
              <span style={{ fontSize:16, fontWeight:c.unread>0?700:400, color:text }}>{c.name}</span>
              <span style={{ fontSize:13, color:sub }}>{c.time}</span>
            </div>
            <div style={{ fontSize:14, color:sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.last}</div>
          </div>
          {c.unread>0 && (
            <div style={{ width:22, height:22, borderRadius:'50%', background:myColor??'#007AFF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {c.unread}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function GroupedContactList({ convs, dark, myColor, onSelect }) {
  const bg   = dark ? '#000' : '#fff'
  const text = dark ? '#fff' : '#000'
  const sub  = dark ? '#8E8E93' : '#8E8E93'
  const sep  = dark ? '#1C1C1E' : '#F2F2F7'

  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now()-86400000).toDateString()

  const getLabel = (datetime) => {
    if (!datetime) return null
    const d = new Date(datetime)
    if (d.toDateString() === today) return "Aujourd'hui"
    if (d.toDateString() === yesterday) return 'Hier'
    return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })
  }

  const getTime = (datetime) => {
    if (!datetime) return ''
    const d = new Date(datetime)
    if (d.toDateString() === today) return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    if (d.toDateString() === yesterday) return 'Hier'
    return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})
  }

  // Grouper par date
  const groups = []
  const seen = new Set()
  convs.forEach(cv => {
    const label = cv.lastMessage ? (getLabel(cv.lastMessage.datetime) ?? "Aujourd'hui") : 'Sans messages'
    if (!seen.has(label)) { seen.add(label); groups.push({ label, items:[] }) }
    groups[groups.length-1].items.push(cv)
  })

  return (
    <div>
      {groups.map(g => (
        <div key={g.label}>
          {/* Séparateur de date */}
          <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 16px 6px' }}>
            <div style={{ flex:1,height:'0.5px',background:dark?'#2C2C2E':'#E5E5EA' }}/>
            <span style={{ fontSize:11,color:sub,fontWeight:600 }}>{g.label}</span>
            <div style={{ flex:1,height:'0.5px',background:dark?'#2C2C2E':'#E5E5EA' }}/>
          </div>
          {g.items.map((cv,i) => {
            const other = cv.other
            const name  = (other?.firstName??'')+' '+(other?.lastName??'')
            const avatar= (other?.firstName?.[0]??'')+(other?.lastName?.[0]??'')
            const color = other?.roles?.includes('ROLE_TEACHER')?'#FF6B35':other?.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF'
            const last  = cv.lastMessage
            return (
              <div key={cv.id} onClick={()=>onSelect({id:cv.id,convId:cv.id,name,avatar,color,online:false,role:other?.roles?.includes('ROLE_TEACHER')?'Enseignant':'Etudiant'})}
                style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 16px',cursor:'pointer',borderBottom:`0.5px solid ${dark?'#1C1C1E':'#F2F2F7'}` }}
                onMouseEnter={e=>e.currentTarget.style.background=dark?'#1C1C1E':'#F9F9F9'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ position:'relative',flexShrink:0 }}>
                  <div style={{ width:48,height:48,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:600,color:'#fff' }}>{avatar}</div>
                  {cv.unreadCount>0&&<div style={{ position:'absolute',top:-2,right:-2,width:18,height:18,borderRadius:'50%',background:'#FF3B30',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff' }}>{cv.unreadCount}</div>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
                    <span style={{ fontSize:15,fontWeight:cv.unreadCount>0?700:500,color:text }}>{name}</span>
                    {last&&<span style={{ fontSize:12,color:sub }}>{getTime(last.datetime)}</span>}
                  </div>
                  <div style={{ fontSize:13,color:cv.unreadCount>0?text:sub,fontWeight:cv.unreadCount>0?600:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                    {last?(last.isMe?'Vous : ':'')+last.content:'Nouvelle conversation'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}


function NewConvPanel({ users, dark, onSelect }) {
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
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
      : filtre==='administration' ? u.roles?.includes('ROLE_ADMIN')
      : !u.roles?.includes('ROLE_TEACHER') && !u.roles?.includes('ROLE_ADMIN')
    return matchSearch && matchFiltre
  })
  const color = u => u.roles?.includes('ROLE_TEACHER')?'#FF6B35':u.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF'
  const role  = u => u.roles?.includes('ROLE_TEACHER')?'Enseignant':u.roles?.includes('ROLE_ADMIN')?'Admin':'Camarade'
  return (
    <div style={{ background:dark?'#1C1C1E':'#f9f9f9', borderRadius:16, margin:'0 16px 12px', overflow:'hidden' }}>
      {/* Recherche */}
      <div style={{ padding:'10px 14px', borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
          style={{ width:'100%',border:'none',background:dark?'#2C2C2E':'#fff',borderRadius:10,padding:'8px 12px',fontSize:14,color:dark?'#fff':'#000',outline:'none',fontFamily:ft,boxSizing:'border-box' }}/>
      </div>
      {/* Filtres chips */}
      <div style={{ display:'flex',gap:6,padding:'10px 14px',overflowX:'auto',borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}>
        {CATS.map(cat=>(
          <button key={cat.key} onClick={()=>setFiltre(cat.key)}
            style={{ padding:'5px 14px',borderRadius:980,border:'none',cursor:'pointer',fontSize:12,fontWeight:filtre===cat.key?700:400,background:filtre===cat.key?dark?'#fff':'#111':dark?'#2C2C2E':'#e5e5e5',color:filtre===cat.key?dark?'#000':'#fff':dark?'#fff':'#000',whiteSpace:'nowrap',fontFamily:ft }}>
            {cat.label}
          </button>
        ))}
      </div>
      {/* Liste */}
      <div style={{ maxHeight:280,overflowY:'auto' }}>
        {filtered.length===0?(
          <div style={{ textAlign:'center',padding:24,color:'#8E8E93',fontSize:13 }}>Aucun résultat</div>
        ):filtered.map(u=>(
          <div key={u.id} onClick={()=>onSelect(u)}
            style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',cursor:'pointer',borderBottom:`0.5px solid ${dark?'#2C2C2E':'#E5E5EA'}` }}
            onMouseEnter={e=>e.currentTarget.style.background=dark?'#2C2C2E':'#f0f0f0'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ width:38,height:38,borderRadius:'50%',background:color(u),display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',flexShrink:0 }}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,color:dark?'#fff':'#000',fontWeight:500 }}>{u.firstName} {u.lastName}</div>
              <div style={{ fontSize:11,color:'#8E8E93' }}>{role(u)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function Conversations() {
  const [selected, setSelected] = useState(null)
  const [convs, setConvs] = useState([])
  const [users, setUsers] = useState([])
  const [showNewConv, setShowNewConv] = useState(false)
  const profileColor = useThemeStore(s => s.profileColor) ?? '#007AFF'
  useEffect(() => {
    const loadConvs = () => api.get('/api/conversations').then(r => setConvs(r.data.sort((a,b)=>new Date(b.lastMessage?.createdAt??0)-new Date(a.lastMessage?.createdAt??0)))).catch(()=>{})
    loadConvs()
    api.get('/api/conversations/users').then(r => setUsers(r.data)).catch(()=>{})
    const iv = setInterval(loadConvs, 5000)
    return () => clearInterval(iv)
  }, [])
  const darkMode     = useThemeStore(s => s.darkMode)

  const bg   = darkMode ? '#000' : '#fff'
  const text = darkMode ? '#fff' : '#000'

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30% { transform: translateY(-4px) }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.9) }
          to   { opacity:1; transform:scale(1) }
        }
      `}</style>

      <div style={{ fontFamily:ft, height:'100%', display:'flex', flexDirection:'column', background:bg }}>
        {selected ? (
          <ChatView contact={selected} onBack={() => setSelected(null)} dark={darkMode} myColor={profileColor} onSent={()=>api.get('/api/conversations').then(r=>setConvs(r.data)).catch(()=>{})}/>
        ) : (
          <>
            <div style={{ padding:'16px 16px 10px', flexShrink:0, background:bg }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h1 style={{ fontSize:28, fontWeight:700, color:text, letterSpacing:'-0.5px', margin:0 }}>Messages</h1>
                <button style={{ width:30, height:30, borderRadius:'50%', background:darkMode?'#2C2C2E':'#F2F2F7', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={darkMode?'#fff':'#000'} strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
              {/* Search */}
              <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8, background:darkMode?'#1C1C1E':'#F2F2F7', borderRadius:12, padding:'8px 12px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span style={{ fontSize:15, color:'#8E8E93' }}>Rechercher</span>
              </div>
            </div>
            <div style={{ padding:'0 16px 12px' }}>
              <button onClick={()=>setShowNewConv(s=>!s)}
                style={{ width:'100%',padding:'10px',borderRadius:12,border:'none',background:darkMode?'#1C1C1E':'#f5f5f5',color:darkMode?'#fff':'#111',fontSize:13,cursor:'pointer',fontFamily:ft }}>
                {showNewConv?'Annuler':'+ Nouvelle conversation'}
              </button>
            </div>
            {showNewConv&&(
              <NewConvPanel users={users} dark={darkMode} onSelect={u=>{
                api.post('/api/conversations',{userId:u.id}).then(r=>{
                  setShowNewConv(false)
                  api.get('/api/conversations').then(r2=>setConvs(r2.data)).catch(()=>{})
                  const color=u.roles?.includes('ROLE_TEACHER')?'#FF6B35':u.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF'
                  setSelected({id:r.data.id,convId:r.data.id,name:u.firstName+' '+u.lastName,avatar:(u.firstName?.[0]??'')+(u.lastName?.[0]??''),color,online:false,role:u.roles?.includes('ROLE_TEACHER')?'Enseignant':'Etudiant'})
                }).catch(()=>{})
              }}/>
            )}

            <ContactList contacts={convs.map(cv=>({
              id:cv.id, convId:cv.id,
              name:(cv.other?.firstName??'')+' '+(cv.other?.lastName??''),
              role:cv.other?.roles?.includes('ROLE_TEACHER')?'Enseignant':'Etudiant',
              avatar:(cv.other?.firstName?.[0]??'')+(cv.other?.lastName?.[0]??''),
              color:cv.other?.roles?.includes('ROLE_TEACHER')?'#FF6B35':cv.other?.roles?.includes('ROLE_ADMIN')?'#2ECC71':'#007AFF',
              last:cv.lastMessage?(cv.lastMessage.isMe?'Vous : ':'')+cv.lastMessage.content:'Nouvelle conversation',
              time:cv.lastMessage?.createdAt??'', unread:cv.unreadCount??0, online:false,
            }))} onSelect={contact=>setSelected({...contact,convId:contact.id})} dark={darkMode} myColor={profileColor}/>

          </>
        )}
      </div>
    </>
  )
}