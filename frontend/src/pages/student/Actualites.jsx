import { useState, useEffect } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import { X } from 'lucide-react'
import Signature from './Signature'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const TYPES = {
  message: { color: '#007AFF', label: 'Message' },
  groupe:  { color: '#34C759', label: 'Message' },
  appel:   { color: '#FF3B30', label: 'Urgent' },
  default: { color: '#9ca3af', label: 'Info' },
}

export default function Actualites({ onClose }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const [notifs,    setNotifs]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showSign,  setShowSign]  = useState(false)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
    api.get('/api/notifications')
      .then(r => setNotifs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose?.(), 280)
  }

  const handleNotifClick = (n) => {
    if (n.type === 'appel') setShowSign(true)
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={handleClose}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', zIndex:400, opacity:visible?1:0, transition:'opacity 0.28s ease' }}/>

      {/* Sheet */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:401, background:'#fff', borderRadius:'24px 24px 0 0', maxHeight:'80vh', display:'flex', flexDirection:'column', transform:visible?'translateY(0)':'translateY(100%)', transition:'transform 0.3s cubic-bezier(0.32,0.72,0,1)', fontFamily:ft }}>

        {/* Handle */}
        <div style={{ width:36, height:4, borderRadius:2, background:'#e5e5e5', margin:'12px auto 0' }}/>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px' }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#0a0a0a', letterSpacing:'-0.4px' }}>Actualités</div>
          <button onClick={handleClose} style={{ width:30, height:30, borderRadius:'50%', background:'#f5f5f5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={15} color="#666" strokeWidth={2}/>
          </button>
        </div>

        {/* Liste */}
        <div style={{ overflowY:'auto', padding:'0 16px 32px', flex:1 }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:14 }}>Chargement...</div>
          ) : notifs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:14 }}>Aucune actualité</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {notifs.map(n => {
                const { Icon, color, label } = TYPES[n.type] ?? TYPES.default
                const clickable = n.type === 'appel'
                return (
                  <button key={n.id} onClick={() => handleNotifClick(n)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, cursor:clickable?'pointer':'default', textAlign:'left', width:'100%', transition:'background 0.15s', boxSizing:'border-box' }}
                    onMouseEnter={e => clickable && (e.currentTarget.style.background='#fafafa')}
                    onMouseLeave={e => e.currentTarget.style.background='#f9f9f9'}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:n.type==='appel'?'#FF3B30':'#9ca3af', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:4 }}>{label}</div>
                      <div style={{ fontSize:15, fontWeight:600, color:'#0a0a0a', marginBottom:3 }}>{n.title}</div>
                      <div style={{ fontSize:13, color:'#0a0a0a', lineHeight:1.4 }}>{n.message}</div>
                      {n.createdAt && <div style={{ fontSize:11, color:'#0a0a0a', marginTop:4, fontWeight:400 }}>{formatDate(n.createdAt)}</div>}
                    </div>

                    {clickable && <div style={{ background:'#0a0a0a', borderRadius:980, padding:'6px 14px', fontSize:12, fontWeight:600, color:'#fff', flexShrink:0 }}>Signer</div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showSign && <Signature onClose={() => setShowSign(false)}/>}
    </>
  )
}
