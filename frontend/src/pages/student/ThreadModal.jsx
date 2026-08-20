import { useState } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { ArrowLeft, Send, MoreHorizontal, FileText, X } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

export default function ThreadModal({ post, reactions=[], comments:init=[], onClose }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const [comments, setComments] = useState(init)
  const [draft, setDraft] = useState('')

  // Toujours fond sombre pour ce composant (style thread)
  const bg      = '#0e0e0e'
  const surface = '#1c1c1c'
  const text    = '#ffffff'
  const muted   = '#8a8a8a'
  const border  = 'rgba(255,255,255,0.08)'

  const submit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    setComments(prev => [...prev, { id:Date.now(), user:'Vous', date:"à l'instant", text:draft.trim() }])
    setDraft('')
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:24 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:520, maxHeight:'88vh', background:bg, color:text, borderRadius:24, display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:ft }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'18px 18px 14px', borderBottom:`1px solid ${border}`, flexShrink:0 }}>
          <button onClick={onClose} style={{ background:'none', border:'none', color:text, display:'flex', cursor:'pointer', padding:4 }}>
            <ArrowLeft size={22} strokeWidth={2}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0 }}>
              {post?.author?.name?.[0] || 'P'}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>{post?.author?.name || 'Professeur'}</div>
              <div style={{ fontSize:12, color:muted }}>{post?.postedAt || 'Récemment'}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ background:'none', border:'none', color:text, display:'flex', cursor:'pointer', padding:4 }}><Send size={20} strokeWidth={2}/></button>
            <button style={{ background:'none', border:'none', color:text, display:'flex', cursor:'pointer', padding:4 }}><MoreHorizontal size={22} strokeWidth={2}/></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 18px 8px', display:'flex', flexDirection:'column', gap:24 }}>

          {/* Post */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {post?.type === 'file' && (
              <div style={{ display:'flex', alignItems:'center', gap:14, background:surface, borderRadius:16, padding:16 }}>
                <FileText size={28} strokeWidth={1.75} color={muted}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>{post.fileName}</div>
                  <div style={{ fontSize:13, color:muted }}>Document joint</div>
                </div>
              </div>
            )}
            {post?.title && <h2 style={{ fontSize:20, fontWeight:800, margin:0 }}>{post.title}</h2>}
            {post?.content && <p style={{ margin:0, fontSize:15, lineHeight:1.55, color:'#dcdcdc' }}>{post.content}</p>}
          </div>

          {/* Réactions */}
          {reactions.length > 0 && (
            <div>
              <h3 style={{ fontSize:18, fontWeight:800, margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
                Réactions <span style={{ fontSize:14, fontWeight:600, color:muted }}>{reactions.length}</span>
              </h3>
              <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:4 }}>
                {reactions.map((r, i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
                    <div style={{ position:'relative', width:52, height:52 }}>
                      <div style={{ width:52, height:52, borderRadius:'50%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700 }}>
                        {r.user?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ position:'absolute', bottom:-4, right:-4, fontSize:16, background:bg, borderRadius:'50%', padding:2 }}>{r.emoji}</span>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:'#cfcfcf', maxWidth:56, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaires */}
          <div>
            <h3 style={{ fontSize:18, fontWeight:800, margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
              Commentaires <span style={{ fontSize:14, fontWeight:600, color:muted }}>{comments.length}</span>
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display:'flex', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0 }}>
                    {c.user?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700 }}>{c.user}</span>
                      <span style={{ fontSize:12, color:muted }}>{c.date}</span>
                    </div>
                    <p style={{ margin:'0 0 6px', fontSize:14, color:'#e4e4e4', lineHeight:1.4 }}>{c.text}</p>
                    <button style={{ background:'none', border:'none', fontSize:12, fontWeight:600, color:muted, cursor:'pointer', padding:0, fontFamily:ft }}>Répondre</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={submit} style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', borderTop:`1px solid ${border}`, flexShrink:0 }}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ajouter un commentaire..."
            style={{ flex:1, background:surface, border:'none', borderRadius:999, padding:'12px 18px', color:text, fontSize:15, fontFamily:ft, outline:'none' }}/>
          <button type="submit"
            style={{ width:40, height:40, borderRadius:'50%', border:'none', background:draft.trim()?text:surface, cursor:draft.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s' }}>
            <Send size={16} color={draft.trim()?bg:muted} strokeWidth={2}/>
          </button>
        </form>
      </div>
    </div>
  )
}
