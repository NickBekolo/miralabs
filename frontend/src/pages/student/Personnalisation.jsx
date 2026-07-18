import { useThemeStore, FONTS, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useAuth } from '../../context/AuthContext'

const ft = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'

const PROFILE_COLORS = [
  '#FF6B6B','#FF8E53','#FFC300','#2ECC71','#1ABC9C',
  '#3498DB','#6C5CE7','#9B59B6','#E91E63','#00BCD4',
  '#FF5722','#607D8B','#795548','#F06292','#26C6DA',
  '#66BB6A','#FFA726','#AB47BC','#42A5F5','#EC407A',
]

export default function Personnalisation() {
  const { user } = useAuth()
  const {
    darkMode, toggleDarkMode,
    profileColor, setProfileColor,
    fontId, setFont,
  } = useThemeStore()

  const C = darkMode ? DARK_THEME : LIGHT_THEME

  return (
    <div style={{ fontFamily:ft,padding:'20px 16px 40px',background:C.bg,minHeight:'100%',color:C.text }}>

      {/* Profil */}
      <div style={{ background:C.surface,borderRadius:20,padding:'20px 18px',marginBottom:14 }}>
        <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:20 }}>
          <div style={{ width:64,height:64,borderRadius:'50%',background:profileColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:700,color:'#fff',boxShadow:`0 4px 16px ${profileColor}55` }}>
            {user?.firstName?.[0] ?? 'R'}
          </div>
          <div>
            <div style={{ fontSize:17,fontWeight:700,color:C.text }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize:12,color:C.muted }}>Étudiant · 1ASSP1</div>
          </div>
        </div>

        {/* Choix couleur profil */}
        <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:12 }}>Couleur de profil</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:8 }}>
          {PROFILE_COLORS.map(color => (
            <button key={color} onClick={() => setProfileColor(color)}
              style={{
                width:28,height:28,borderRadius:'50%',background:color,border:'none',cursor:'pointer',
                outline:profileColor===color?`3px solid ${color}`:'3px solid transparent',
                outlineOffset:2,
                transform:profileColor===color?'scale(1.2)':'scale(1)',
                transition:'all 0.15s',
                boxShadow:profileColor===color?`0 2px 8px ${color}88`:undefined,
              }}/>
          ))}
        </div>
      </div>

      {/* Apparence */}
      <div style={{ background:C.surface,borderRadius:20,padding:'18px 18px',marginBottom:14 }}>
        <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:14 }}>Apparence</div>

        {/* Dark mode */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${C.surface2}` }}>
          <div>
            <div style={{ fontSize:14,color:C.text }}>Mode sombre</div>
            <div style={{ fontSize:11,color:C.muted }}>Thème Miralabs sombre</div>
          </div>
          <div onClick={toggleDarkMode}
            style={{ width:44,height:26,borderRadius:13,background:darkMode?profileColor:'#e0e0e0',cursor:'pointer',position:'relative',transition:'background 0.2s' }}>
            <div style={{ position:'absolute',top:3,left:darkMode?20:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }}/>
          </div>
        </div>

        {/* Police */}
        <div style={{ padding:'14px 0' }}>
          <div style={{ fontSize:14,color:C.text,marginBottom:10 }}>Police</div>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {FONTS.map(f => (
              <button key={f.id} onClick={() => setFont(f.id)}
                style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderRadius:12,border:'none',cursor:'pointer',fontFamily:f.stack,fontSize:14,background:fontId===f.id?profileColor:C.surface2,color:fontId===f.id?'#fff':C.text,textAlign:'left' }}>
                <span>{f.label}</span>
                <span style={{ fontSize:12,opacity:0.7 }}>Aa</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div style={{ background:C.surface,borderRadius:20,padding:'18px 18px' }}>
        <div style={{ fontSize:13,fontWeight:600,color:C.text,marginBottom:12 }}>Aperçu</div>
        <div style={{ display:'flex',gap:10,alignItems:'flex-end' }}>
          {/* Message reçu */}
          <div style={{ maxWidth:'70%',padding:'10px 14px',borderRadius:'18px 18px 18px 4px',background:'#FF6B6B',color:'#fff',fontSize:13,lineHeight:1.4,boxShadow:'0 3px 12px #FF6B6B44' }}>
            Bonjour ! Comment ça va ?
          </div>
        </div>
        <div style={{ display:'flex',gap:10,alignItems:'flex-end',justifyContent:'flex-end',marginTop:8 }}>
          {/* Mon message */}
          <div style={{ maxWidth:'70%',padding:'10px 14px',borderRadius:'18px 18px 4px 18px',background:profileColor,color:'#fff',fontSize:13,lineHeight:1.4,boxShadow:`0 3px 12px ${profileColor}44` }}>
            Très bien merci ! 😊
          </div>
        </div>
      </div>
    </div>
  )
}