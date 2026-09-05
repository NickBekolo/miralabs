import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Save, Eye, EyeOff, UserRoundCheck, UserRoundX } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

function AvatarUser({ genre, isActive=true, size=80 }) {
  const color = isActive
    ? (genre==='F'?'#FF3B9A':genre==='M'?'#007AFF':'#8E8E93')
    : '#FF3B30'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#fafafa', border:'2px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isActive ? <UserRoundCheck size={size*0.45} color={color} strokeWidth={2}/> : <UserRoundX size={size*0.45} color={color} strokeWidth={2}/>}
    </div>
  )
}

function Section({ title, children, C }) {
  return (
    <div style={{ background:C.surface, borderRadius:16, padding:24, border:`1px solid ${C.surface2}`, marginBottom:16 }}>
      <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:16 }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, value, editable=false, type='text', onChange, C }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>
      {editable
        ? <input type={type} value={value||''} onChange={e=>onChange(e.target.value)}
            style={{ padding:'10px 12px', borderRadius:10, border:`1px solid ${C.surface2}`, background:C.bg, color:C.text, fontSize:14, fontFamily:ft, outline:'none' }}
            onFocus={e=>e.target.style.border=`1px solid ${C.text}`}
            onBlur={e=>e.target.style.border=`1px solid ${C.surface2}`}/>
        : <div style={{ padding:'10px 12px', borderRadius:10, background:C.surface2, color:C.text, fontSize:14 }}>{value||'—'}</div>
      }
    </div>
  )
}

const ROLE_LABEL = {
  ROLE_ADMIN:'Administrateur', ROLE_SECRETARIAT:'Secrétariat', ROLE_COMPTABILITE:'Comptabilité',
  ROLE_TEACHER:'Enseignant', ROLE_STUDENT:'Apprenant', ROLE_DIRECTEUR:'Directeur',
  ROLE_CPE:'CPE', ROLE_SUPER_ADMIN:'Super Admin', ROLE_SUPER_ADMIN_PLATEFORME:'Plateforme',
}

export default function ProfilPage() {
  const { user }       = useAuth()
  const navigate       = useNavigate()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME

  const [form, setForm] = useState({
    firstName: user?.firstName||'', lastName: user?.lastName||'',
    email: user?.email||'', telephone: user?.telephone||'',
    adresse: user?.adresse||'', dateNaissance: user?.dateNaissance||'',
  })

  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' })
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState(null)

  const set = (key) => (val) => setForm(f=>({...f,[key]:val}))

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/api/profile', form)
      setMsg({ type:'ok', text:'Profil mis à jour.' })
    } catch {
      setMsg({ type:'err', text:'Erreur lors de la sauvegarde.' })
    }
    setSaving(false)
    setTimeout(()=>setMsg(null), 3000)
  }

  const changePw = async () => {
    if (pwForm.next !== pwForm.confirm) return setMsg({ type:'err', text:'Les mots de passe ne correspondent pas.' })
    setSaving(true)
    try {
      await api.put('/api/profile/password', { currentPassword:pwForm.current, newPassword:pwForm.next })
      setMsg({ type:'ok', text:'Mot de passe mis à jour.' })
      setPwForm({ current:'', next:'', confirm:'' })
    } catch {
      setMsg({ type:'err', text:'Mot de passe actuel incorrect.' })
    }
    setSaving(false)
    setTimeout(()=>setMsg(null), 3000)
  }

  const userRole = user?.roles?.find(r => ROLE_LABEL[r]) || ''

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:ft, color:C.text }}>
      <div style={{ height:56, display:'flex', alignItems:'center', padding:'0 24px', borderBottom:`1px solid ${C.surface2}`, background:C.bg, position:'sticky', top:0, zIndex:10 }}>
        <button onClick={()=>navigate(-1)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', color:C.text, fontFamily:ft, fontSize:14, padding:0 }}>
          <ArrowLeft size={18}/>
          Retour
        </button>
        <div style={{ fontSize:16, fontWeight:600, color:C.text, margin:'0 auto' }}>Mon profil</div>
        <div style={{ width:60 }}/>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'24px 16px' }}>
        {msg && (
          <div style={{ padding:'12px 16px', borderRadius:10, background:msg.type==='ok'?'#ECFDF5':'#FFF0F0', color:msg.type==='ok'?'#22C55E':'#FF3B30', fontSize:13, fontWeight:500, marginBottom:16 }}>
            {msg.text}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:20, background:C.surface, borderRadius:16, padding:24, border:`1px solid ${C.surface2}`, marginBottom:16 }}>
          <div style={{ position:'relative' }}>
            <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={80}/>
            <button style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#111', border:'2px solid '+C.bg, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Camera size={13} color="#fff"/>
            </button>
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:'-0.4px' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{ROLE_LABEL[userRole]||userRole}</div>
            <div style={{ fontSize:12, color:user?.isActive?'#22C55E':'#FF3B30', marginTop:4, fontWeight:500 }}>{user?.isActive?'Compte actif':'Compte inactif'}</div>
          </div>
        </div>

        <Section title="Informations personnelles" C={C}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Field label="Prénom" value={form.firstName} editable onChange={set('firstName')} C={C}/>
            <Field label="Nom" value={form.lastName} editable onChange={set('lastName')} C={C}/>
          </div>
          <Field label="Email" value={form.email} C={C}/>
          <Field label="Téléphone" value={form.telephone} editable onChange={set('telephone')} C={C}/>
          <Field label="Adresse" value={form.adresse} editable onChange={set('adresse')} C={C}/>
          <Field label="Date de naissance" value={form.dateNaissance} editable type="date" onChange={set('dateNaissance')} C={C}/>
          <button onClick={save} disabled={saving}
            style={{ marginTop:8, padding:'11px 20px', borderRadius:10, border:'none', background:'#111', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, display:'flex', alignItems:'center', gap:8 }}>
            <Save size={15}/>
            {saving?'Enregistrement...':'Enregistrer'}
          </button>
        </Section>

        <Section title="Compte" C={C}>
          <Field label="Rôle" value={ROLE_LABEL[userRole]||userRole} C={C}/>
          <Field label="Inscrit le" value={user?.createdAt} C={C}/>
          <Field label="Statut" value={user?.isActive?'Actif':'Inactif'} C={C}/>
        </Section>

        <Section title="Sécurité" C={C}>
          <Field label="Mot de passe actuel" value={pwForm.current} editable type={showPw?'text':'password'} onChange={v=>setPwForm(f=>({...f,current:v}))} C={C}/>
          <Field label="Nouveau mot de passe" value={pwForm.next} editable type={showPw?'text':'password'} onChange={v=>setPwForm(f=>({...f,next:v}))} C={C}/>
          <Field label="Confirmer" value={pwForm.confirm} editable type={showPw?'text':'password'} onChange={v=>setPwForm(f=>({...f,confirm:v}))} C={C}/>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
            <button onClick={()=>setShowPw(s=>!s)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${C.surface2}`, borderRadius:8, padding:'8px 12px', cursor:'pointer', color:C.muted, fontSize:13, fontFamily:ft }}>
              {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
              {showPw?'Masquer':'Afficher'}
            </button>
            <button onClick={changePw} disabled={saving}
              style={{ padding:'9px 20px', borderRadius:10, border:'none', background:'#111', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
              Changer le mot de passe
            </button>
          </div>
        </Section>

        <Section title="Préférences" C={C}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0' }}>
            <div>
              <div style={{ fontSize:14, color:C.text }}>Thème</div>
              <div style={{ fontSize:12, color:C.muted }}>{darkMode?'Mode sombre activé':'Mode clair activé'}</div>
            </div>
            <button onClick={toggleDarkMode}
              style={{ padding:'8px 16px', borderRadius:20, border:`1px solid ${C.surface2}`, background:darkMode?'#111':'#f5f5f5', color:darkMode?'#fff':'#111', fontSize:13, cursor:'pointer', fontFamily:ft, fontWeight:500 }}>
              {darkMode?'Passer en clair':'Passer en sombre'}
            </button>
          </div>
        </Section>
      </div>
    </div>
  )
}
