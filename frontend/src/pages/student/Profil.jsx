import { useState } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useAuth } from '../../context/AuthContext'
import { ChevronLeft, Mail, Building2, Shield, Moon, Sun, Bell, Key } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const ROLE_LABELS = {
  ROLE_STUDENT:               'Étudiant',
  ROLE_TEACHER:               'Enseignant',
  ROLE_ADMIN:                 'Administrateur',
  ROLE_DIRECTEUR:             'Directeur',
  ROLE_SUPER_ADMIN:           'Super Admin',
  ROLE_SUPER_ADMIN_PLATEFORME:'Plateforme',
}

function Row({ icon: Icon, label, value, last, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderBottom: last?'none':`1px solid ${C.surface2}` }}>
      <Icon size={16} color={C.muted} strokeWidth={1.8} style={{ flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:15, fontWeight:500, color:C.text }}>{value || '—'}</div>
      </div>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, value, onChange, last, C }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderBottom: last?'none':`1px solid ${C.surface2}` }}>
      <Icon size={16} color={C.muted} strokeWidth={1.8} style={{ flexShrink:0 }}/>
      <div style={{ flex:1, fontSize:15, fontWeight:500, color:C.text }}>{label}</div>
      <div onClick={onChange} style={{ width:44, height:26, borderRadius:13, background:value?'#0a0a0a':'#e5e5e5', position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
        <div style={{ width:22, height:22, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:value?20:2, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
      </div>
    </div>
  )
}

export default function Profil({ onBack, onNavigate }) {
  const darkMode   = useThemeStore(s => s.darkMode)
  const toggleDark = useThemeStore(s => s.toggleDarkMode)
  const C          = darkMode ? DARK_THEME : LIGHT_THEME
  const { user }   = useAuth()
  const [notifs, setNotifs] = useState(true)

  const role      = user?.roles?.find(r => r !== 'ROLE_USER') || 'ROLE_STUDENT'
  const roleLabel = ROLE_LABELS[role] || 'Utilisateur'
  const initials  = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase() || 'M'

  return (
    <div style={{ fontFamily:ft, background:C.bg, minHeight:'100%', color:C.text }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 16px 16px', borderBottom:`1px solid ${C.surface2}` }}>
        {onBack && (
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:C.muted }}>
            <ChevronLeft size={22} strokeWidth={2}/>
          </button>
        )}
        <div style={{ fontSize:18, fontWeight:700, color:C.text, letterSpacing:'-0.4px' }}>Profil</div>
      </div>

      {/* Avatar + nom */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 24px 28px', borderBottom:`1px solid ${C.surface2}` }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, color:'#fff', marginBottom:14 }}>
          {initials}
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:'-0.4px', marginBottom:6 }}>
          {user?.firstName} {user?.lastName}
        </div>
        <div style={{ fontSize:13, color:C.muted, background:C.surface, borderRadius:980, padding:'4px 12px' }}>
          {roleLabel}
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* Informations */}
        <div style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8, paddingLeft:4 }}>Informations</div>
        <div style={{ background:C.surface, borderRadius:16, overflow:'hidden', border:`1px solid ${C.surface2}`, marginBottom:24 }}>
          <Row icon={Mail} label="Email" value={user?.email} C={C}/>
          <Row icon={Building2} label="Établissement" value={user?.etablissement?.name} C={C}/>
          <Row icon={Shield} label="Rôle" value={roleLabel} C={C} last/>
        </div>

        {/* Préférences */}
        <div style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8, paddingLeft:4 }}>Préférences</div>
        <div style={{ background:C.surface, borderRadius:16, overflow:'hidden', border:`1px solid ${C.surface2}`, marginBottom:24 }}>
          <ToggleRow icon={darkMode?Moon:Sun} label="Mode sombre" value={darkMode} onChange={toggleDark} C={C}/>
          <ToggleRow icon={Bell} label="Notifications" value={notifs} onChange={() => setNotifs(s=>!s)} C={C} last/>
        </div>

        {/* Sécurité */}
        <div style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8, paddingLeft:4 }}>Sécurité</div>
        <div style={{ background:C.surface, borderRadius:16, overflow:'hidden', border:`1px solid ${C.surface2}`, marginBottom:24 }}>
          <div onClick={() => onNavigate?.('change-password')}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', cursor:'pointer' }}>
            <Key size={16} color={C.muted} strokeWidth={1.8} style={{ flexShrink:0 }}/>
            <div style={{ flex:1, fontSize:15, fontWeight:500, color:C.text }}>Changer le mot de passe</div>
            <ChevronLeft size={16} color={C.muted} style={{ transform:'rotate(180deg)' }}/>
          </div>
        </div>

        <div style={{ textAlign:'center', fontSize:11, color:C.muted }}>
          Miralabs · v1.0 · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
