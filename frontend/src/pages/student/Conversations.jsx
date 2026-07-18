import { useState, useRef, useEffect } from 'react'
import { useThemeStore } from '../../store/ThemeStore'

const ft = "'Arial Rounded MT Bold', 'Arial Rounded MT', Nunito, sans-serif"

// iMessage colors
const IMSG_BLACK  = '#111111'
const IMSG_GRAY   = '#E9E9EB'
const IMSG_GRAY_D = '#2C2C2E'

const CONTACTS = [
  { id:1, name:'Mme Martin',     avatar:'MM', color:'#FF2D55', last:'Votre TP est noté 16/20 👏', time:'09:32', unread:2, online:true },
  { id:2, name:'M. Dupont',      avatar:'MD', color:'#007AFF', last:'Exercices pour vendredi svp', time:'Hier',  unread:0, online:false },
  { id:3, name:'Administration', avatar:'LJ', color:'#34C759', last:'Réunion parents-profs 13 juin', time:'Lun',  unread:1, online:true },
  { id:4, name:'Alice B.',       avatar:'AB', color:'#FF9500', last:'Tu peux m\'aider pour l\'exo ?', time:'Dim',  unread:3, online:true },
  { id:5, name:'Kevin L.',       avatar:'KL', color:'#AF52DE', last:'OK à demain !', time:'Sam',  unread:0, online:false },
  { id:6, name:'M. Brun',        avatar:'MB', color:'#FF6B35', last:'Bien reçu, merci', time:'Ven',  unread:0, online:false },
]

const HISTORY = {
  1:[
    { id:1, me:false, text:'Bonjour Ritah !', time:'09:28' },
    { id:2, me:false, text:'Je voulais vous informer que votre TP de Physique-Chimie a été corrigé.', time:'09:29' },
    { id:3, me:true,  text:'Bonjour Madame ! Merci pour l\'info 😊', time:'09:30' },
    { id:4, me:false, text:'Vous avez obtenu 16/20. Très bon travail, continuez comme ça !', time:'09:31', tapback:'👏' },
    { id:5, me:true,  text:'Merci beaucoup Madame ! 🙏', time:'09:32', tapback:'❤️' },
  ],
  2:[
    { id:1, me:false, text:'Bonjour, n\'oubliez pas les exercices 12 à 18 page 45 pour vendredi.', time:'Hier' },
    { id:2, me:true,  text:'Bien reçu M. Dupont, merci !', time:'Hier' },
  ],
  3:[
    { id:1, me:false, text:'📌 Rappel : réunion parents-professeurs le 13 juin à 17h.', time:'Lun' },
    { id:2, me:false, text:'⚠️ La sortie pédagogique du 15 juin est annulée. Rattrapage à venir.', time:'Lun' },
  ],
  4:[
    { id:1, me:false, text:'Salut ! Tu peux m\'aider pour l\'exo 15 ?', time:'14:20' },
    { id:2, me:true,  text:'Oui bien sûr ! On se retrouve à la biblio ?', time:'14:21' },
    { id:3, me:false, text:'Super ! À 16h ça te va ?', time:'14:22', tapback:'👍' },
    { id:4, me:true,  text:'Parfait 👍', time:'14:23' },
  ],
  5:[{ id:1, me:false, text:'OK à demain alors ! Bonne soirée 🌙', time:'Sam' }],
  6:[{ id:1, me:false, text:'Votre dossier sur la décolonisation est bien reçu, merci.', time:'Ven' }],
}

const TAPBACKS = ['❤️','👍','👎','😂','‼️','?']

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
function Bubble({ msg, dark, myColor, onTapback }) {
  const [showTapbacks, setShowTapbacks] = useState(false)
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
        style={{
          maxWidth:'72%',
          padding:'9px 13px',
          borderRadius: msg.me ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
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

function ChatView({ contact, onBack, dark, myColor }) {
  const [msgs,   setMsgs]   = useState(HISTORY[contact.id] ?? [])
  const [input,  setInput]  = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs])

  // Simulation typing
  useEffect(() => {
    let t
    if (msgs.length > 0 && !msgs[msgs.length-1].me) {
      t = setTimeout(() => setTyping(true), 2000)
      setTimeout(() => setTyping(false), 4000)
    }
    return () => clearTimeout(t)
  }, [])

  const send = () => {
    if (!input.trim()) return
    const newMsg = { id:Date.now(), me:true, text:input.trim(), time:'Maintenant' }
    setMsgs(m => [...m, newMsg])
    setInput('')
    // Simulate reply
    setTimeout(() => {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMsgs(m => [...m, { id:Date.now()+1, me:false, text:'Bien reçu ! 👍', time:'Maintenant' }])
      }, 2000)
    }, 1000)
  }

  const tapback = (msgId, emoji) => {
    setMsgs(m => m.map(msg => msg.id===msgId ? { ...msg, tapback: msg.tapback===emoji ? undefined : emoji } : msg))
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
          const showTime = i===0 || msgs[i-1]?.me !== msg.me
          return (
            <div key={msg.id}>
              {showTime && !msg.me && (
                <div style={{ display:'flex', justifyContent:'flex-start', marginBottom:2 }}>
                  <Avatar name={contact.name} color={contact.color} size={24}/>
                </div>
              )}
              <div style={{ paddingLeft: !msg.me ? 32 : 0 }}>
                <Bubble msg={msg} dark={dark} myColor={myColor} onTapback={tapback}/>
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

export default function Conversations() {
  const [selected, setSelected] = useState(null)
  const profileColor = useThemeStore(s => s.profileColor) ?? '#007AFF'
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
          <ChatView contact={selected} onBack={() => setSelected(null)} dark={darkMode} myColor={profileColor}/>
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
            <ContactList contacts={CONTACTS} onSelect={setSelected} dark={darkMode} myColor={profileColor}/>
          </>
        )}
      </div>
    </>
  )
}