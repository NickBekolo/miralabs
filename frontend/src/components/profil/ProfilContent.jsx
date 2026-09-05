import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore } from '../../store/ThemeStore'
import { Eye, EyeOff, UserRoundCheck, UserRoundX, Moon, Sun, Send, Paperclip, X } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

function AvatarUser({ genre, isActive=true, size=72 }) {
  const color = isActive ? (genre==='F'?'#FF3B9A':genre==='M'?'#007AFF':'#8E8E93') : '#FF3B30'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#fafafa', border:'2px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isActive ? <UserRoundCheck size={size*0.45} color={color} strokeWidth={2}/> : <UserRoundX size={size*0.45} color={color} strokeWidth={2}/>}
    </div>
  )
}

function Field({ label, value, C }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
      <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>
      <div style={{ padding:'9px 12px', borderRadius:10, background:C.surface2, color:C.text, fontSize:13 }}>{value||'—'}</div>
    </div>
  )
}

function SectionTitle({ title, C }) {
  return <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10, marginTop:20 }}>{title}</div>
}

const ROLE_LABEL = {
  ROLE_ADMIN:'Administrateur', ROLE_SECRETARIAT:'Secrétariat', ROLE_COMPTABILITE:'Comptabilité',
  ROLE_TEACHER:'Enseignant', ROLE_STUDENT:'Apprenant', ROLE_DIRECTEUR:'Directeur',
  ROLE_CPE:'CPE', ROLE_SUPER_ADMIN:'Super Admin', ROLE_SUPER_ADMIN_PLATEFORME:'Plateforme',
}

const DEMANDE_OPTIONS = ['Prénom', 'Nom', 'Date de naissance', 'Email', 'Autre']

export default function ProfilContent({ C }) {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)

  // Mot de passe
  const [pwForm, setPwForm]   = useState({ current:'', next:'', confirm:'' })
  const [showPw, setShowPw]   = useState(false)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState(null)

  // Demande support
  const [showDemande, setShowDemande] = useState(false)
  const [demande, setDemande]         = useState({ type: DEMANDE_OPTIONS[0], message:'', fichier:null })
  const [sendingDemande, setSendingDemande] = useState(false)

  const showMsg = (type, text) => { setMsg({type,text}); setTimeout(()=>setMsg(null),3000) }

  const changePw = async () => {
    if (!pwForm.current || !pwForm.next) return showMsg('err', 'Remplissez tous les champs.')
    if (pwForm.next !== pwForm.confirm) return showMsg('err', 'Les mots de passe ne correspondent pas.')
    if (pwForm.next.length < 8) return showMsg('err', 'Le mot de passe doit contenir au moins 8 caractères.')
    setSaving(true)
    try {
      await api.put('/api/profile/password', { currentPassword:pwForm.current, newPassword:pwForm.next })
      showMsg('ok', 'Mot de passe mis à jour.')
      setPwForm({ current:'', next:'', confirm:'' })
    } catch { showMsg('err', 'Mot de passe actuel incorrect.') }
    setSaving(false)
  }

  const envoyerDemande = async () => {
    const valeurPrincipale = demande.type === 'Email' ? demande.valeur2 : demande.type === 'Autre' ? demande.message : demande.valeur
    if (!valeurPrincipale?.trim()) return showMsg('err', 'Veuillez remplir tous les champs requis.')
    if (demande.type === 'Email' && demande.valeur2 !== demande.valeur3) return showMsg('err', 'Les emails ne correspondent pas.')
    if (demande.type !== 'Email' && demande.type !== 'Autre' && !demande.fichier) return showMsg('err', 'Un justificatif est obligatoire.')
    setSendingDemande(true)
    try {
      const nouvelleValeur = demande.type === 'Email'
        ? demande.valeur2
        : demande.type === 'Autre'
        ? demande.message
        : demande.valeur

      // Créer la demande
      const res = await api.post('/api/demandes', {
        champ: demande.type,
        nouvelleValeur,
        message: demande.message,
      })

      // Upload justificatif si présent
      if (demande.fichier && res.data.id) {
        const formData = new FormData()
        formData.append('fichier', demande.fichier)
        await api.post('/api/upload/justificatif/'+res.data.id, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      showMsg('ok', 'Demande envoyée. Elle sera traitée par le service informatique.')
      setShowDemande(false)
      setDemande({ type: DEMANDE_OPTIONS[0], valeur:'', valeur2:'', valeur3:'', message:'', fichier:null })
      chargerMesDemandes()
    } catch { showMsg('err', "Erreur lors de l'envoi.") }
    setSendingDemande(false)
  }

  const [mesDemandes, setMesDemandes] = useState([])
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl||null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const uploadPhoto = async (file) => {
    if (!file) return
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('photo', file)
    try {
      const res = await api.post('/api/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPhotoPreview('http://127.0.0.1:8000'+res.data.photoUrl)
      showMsg('ok', 'Photo mise à jour.')
    } catch { showMsg('err', 'Erreur lors de l\'upload.') }
    setUploadingPhoto(false)
  }

  const chargerMesDemandes = async () => {
    try {
      const r = await api.get('/api/demandes/mes-demandes')
      setMesDemandes(r.data)
    } catch {}
  }

  useState(() => { chargerMesDemandes() }, [])

  const userRole = user?.roles?.find(r => ROLE_LABEL[r]) || ''

  return (
    <div style={{ fontFamily:ft }}>
      {msg && (
        <div style={{ padding:'10px 14px', borderRadius:10, background:msg.type==='ok'?'#ECFDF5':'#FFF0F0', color:msg.type==='ok'?'#22C55E':'#FF3B30', fontSize:13, fontWeight:500, marginBottom:16 }}>
          {msg.text}
        </div>
      )}

      {/* Avatar + nom */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'4px 0 20px', borderBottom:`1px solid ${C.surface2}` }}>
        <AvatarUser genre={user?.genre} isActive={user?.isActive!==false} size={72}/>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{ROLE_LABEL[userRole]||userRole}</div>
          <div style={{ fontSize:12, color:user?.isActive?'#22C55E':'#FF3B30', marginTop:3, fontWeight:500 }}>{user?.isActive?'Compte actif':'Compte inactif'}</div>
        </div>
      </div>

      {/* Infos personnelles — lecture seule */}
      <SectionTitle title="Informations personnelles" C={C}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
        <Field label="Prénom" value={user?.firstName} C={C}/>
        <Field label="Nom" value={user?.lastName} C={C}/>
      </div>
      <Field label="Email" value={user?.email} C={C}/>
      <Field label="Téléphone" value={user?.telephone} C={C}/>
      <Field label="Date de naissance" value={user?.dateNaissance} C={C}/>
      <Field label="Genre" value={user?.genre==='F'?'Femme':user?.genre==='M'?'Homme':'Non renseigné'} C={C}/>

      <button onClick={() => setShowDemande(true)}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10, border:`1px solid ${C.surface2}`, background:'none', color:C.text, fontSize:13, cursor:'pointer', fontFamily:ft, marginBottom:4 }}
        onMouseEnter={e=>{e.currentTarget.style.background=C.surface}}
        onMouseLeave={e=>{e.currentTarget.style.background='none'}}>
        <Send size={14} color={C.muted}/>
        Demander une modification
      </button>

      {/* Compte */}
      <SectionTitle title="Compte" C={C}/>
      <Field label="Rôle" value={ROLE_LABEL[userRole]||userRole} C={C}/>
      <Field label="Inscrit le" value={user?.createdAt} C={C}/>
      <Field label="Statut" value={user?.isActive?'Actif':'Inactif'} C={C}/>

      {/* Mot de passe */}
      <SectionTitle title="Sécurité" C={C}/>
      <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
        <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>Mot de passe actuel</label>
        <input type={showPw?'text':'password'} value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))}
          style={{ padding:'9px 12px', borderRadius:10, border:`1px solid ${C.surface2}`, background:C.bg, color:C.text, fontSize:13, fontFamily:ft, outline:'none' }}
          onFocus={e=>e.target.style.border=`1px solid ${C.text}`}
          onBlur={e=>e.target.style.border=`1px solid ${C.surface2}`}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>Nouveau mot de passe</label>
          <input type={showPw?'text':'password'} value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))}
            style={{ padding:'9px 12px', borderRadius:10, border:`1px solid ${C.surface2}`, background:C.bg, color:C.text, fontSize:13, fontFamily:ft, outline:'none' }}
            onFocus={e=>e.target.style.border=`1px solid ${C.text}`}
            onBlur={e=>e.target.style.border=`1px solid ${C.surface2}`}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px' }}>Confirmer</label>
          <input type={showPw?'text':'password'} value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))}
            style={{ padding:'9px 12px', borderRadius:10, border:`1px solid ${C.surface2}`, background:C.bg, color:C.text, fontSize:13, fontFamily:ft, outline:'none' }}
            onFocus={e=>e.target.style.border=`1px solid ${C.text}`}
            onBlur={e=>e.target.style.border=`1px solid ${C.surface2}`}/>
        </div>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:4 }}>
        <button onClick={()=>setShowPw(s=>!s)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${C.surface2}`, borderRadius:8, padding:'8px 12px', cursor:'pointer', color:C.muted, fontSize:13, fontFamily:ft }}>
          {showPw?<EyeOff size={13}/>:<Eye size={13}/>} {showPw?'Masquer':'Afficher'}
        </button>
        <button onClick={changePw} disabled={saving}
          style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#111', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
          {saving?'Enregistrement...':'Changer le mot de passe'}
        </button>
      </div>

      {/* Préférences */}
      <SectionTitle title="Préférences" C={C}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}` }}>
        <div>
          <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>Thème</div>
          <div style={{ fontSize:11, color:C.muted }}>{darkMode?'Mode sombre':'Mode clair'}</div>
        </div>
        <button onClick={toggleDarkMode}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:20, border:`1px solid ${C.surface2}`, background:darkMode?'#111':'#f5f5f5', color:darkMode?'#fff':'#111', fontSize:13, cursor:'pointer', fontFamily:ft }}>
          {darkMode?<Sun size={13}/>:<Moon size={13}/>}
          {darkMode?'Clair':'Sombre'}
        </button>
      </div>

      {/* Mes demandes en cours */}
      {mesDemandes.length > 0 && (
        <div style={{ marginTop:16 }}>
          <SectionTitle title="Mes demandes" C={C}/>
          {mesDemandes.map(d => (
            <div key={d.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:C.surface, borderRadius:10, border:`1px solid ${C.surface2}`, marginBottom:8 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{d.champ}</div>
                <div style={{ fontSize:11, color:C.muted }}>Nouvelle valeur : {d.nouvelleValeur}</div>
                <div style={{ fontSize:11, color:C.muted }}>{d.createdAt}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background: d.statut==='approuvee'?'#ECFDF5': d.statut==='rejetee'?'#FFF0F0':'#FFF7E6',
                  color: d.statut==='approuvee'?'#22C55E': d.statut==='rejetee'?'#FF3B30':'#FF9500'
                }}>
                  {d.statut==='approuvee'?'Approuvée': d.statut==='rejetee'?'Rejetée':'En attente'}
                </span>
                {d.commentaire && <div style={{ fontSize:11, color:C.muted, maxWidth:140, textAlign:'right' }}>{d.commentaire}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal demande modification */}
      {showDemande && (
        <div onClick={()=>setShowDemande(false)} style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:28, width:'90vw', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#111' }}>Demande de modification</div>
              <button onClick={()=>setShowDemande(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888' }}><X size={18}/></button>
            </div>

            {/* Onglets champs */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
              {DEMANDE_OPTIONS.map(o => (
                <button key={o} onClick={()=>setDemande(d=>({...d,type:o,valeur:'',valeur2:'',valeur3:''}))}
                  style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${demande.type===o?'#111':'#eee'}`, background:demande.type===o?'#111':'#fff', color:demande.type===o?'#fff':'#888', fontSize:12, fontWeight:demande.type===o?600:400, cursor:'pointer', fontFamily:ft }}>
                  {o}
                </button>
              ))}
            </div>

            {/* Formulaire selon le type */}
            {demande.type === 'Prénom' && (
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Nouveau prénom</label>
                <input value={demande.valeur||''} onChange={e=>setDemande(d=>({...d,valeur:e.target.value}))} placeholder="Entrez votre nouveau prénom"
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:14, fontFamily:ft, outline:'none', boxSizing:'border-box' }}/>
              </div>
            )}

            {demande.type === 'Nom' && (
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Nouveau nom</label>
                <input value={demande.valeur||''} onChange={e=>setDemande(d=>({...d,valeur:e.target.value}))} placeholder="Entrez votre nouveau nom"
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:14, fontFamily:ft, outline:'none', boxSizing:'border-box' }}/>
              </div>
            )}

            {demande.type === 'Date de naissance' && (
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Date de naissance</label>
                <input type="date" value={demande.valeur||''} onChange={e=>setDemande(d=>({...d,valeur:e.target.value}))}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:14, fontFamily:ft, outline:'none', boxSizing:'border-box' }}/>
              </div>
            )}

            {demande.type === 'Email' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ padding:'12px 14px', borderRadius:10, background:'#FFF7E6', border:'1px solid #FFE4B2', fontSize:12, color:'#FF9500', lineHeight:1.6 }}>
                  Un email de confirmation sera envoyé à votre nouvelle adresse. La modification sera effective après validation par le service informatique.
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Nouvel email</label>
                  <input value={demande.valeur2||''} onChange={e=>setDemande(d=>({...d,valeur2:e.target.value}))} placeholder="Votre nouvel email"
                    style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:14, fontFamily:ft, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Confirmer le nouvel email</label>
                  <input value={demande.valeur3||''} onChange={e=>setDemande(d=>({...d,valeur3:e.target.value}))} placeholder="Confirmez votre nouvel email"
                    style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:14, fontFamily:ft, outline:'none', boxSizing:'border-box' }}/>
                </div>
                {demande.valeur2 && demande.valeur3 && demande.valeur2 !== demande.valeur3 && (
                  <div style={{ fontSize:12, color:'#FF3B30' }}>Les emails ne correspondent pas.</div>
                )}
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Message explicatif (optionnel)</label>
                  <textarea value={demande.message} onChange={e=>setDemande(d=>({...d,message:e.target.value}))} rows={3} placeholder="Expliquez pourquoi vous souhaitez changer votre email..."
                    style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:13, fontFamily:ft, outline:'none', resize:'none', boxSizing:'border-box' }}/>
                </div>
              </div>
            )}

            {demande.type === 'Autre' && (
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Décrivez votre demande</label>
                <textarea value={demande.message} onChange={e=>setDemande(d=>({...d,message:e.target.value}))} rows={4} placeholder="Expliquez votre demande en détail..."
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'1px solid #eee', background:'#f9f9f9', color:'#111', fontSize:14, fontFamily:ft, outline:'none', resize:'none', boxSizing:'border-box' }}/>
              </div>
            )}

            {/* Justificatif — pas requis pour Email */}
            {demande.type !== 'Email' && (
              <div style={{ marginTop:16, marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>
                  Pièce justificative <span style={{ color:'#FF3B30' }}>*</span>
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:10, border:`1.5px dashed ${demande.fichier?'#22C55E':'#ddd'}`, cursor:'pointer', background:demande.fichier?'#ECFDF5':'#f9f9f9', color:demande.fichier?'#22C55E':'#888', fontSize:13 }}>
                  <Paperclip size={15}/>
                  {demande.fichier ? demande.fichier.name : 'Joindre CNI, passeport ou tout autre justificatif...'}
                  <input type="file" style={{ display:'none' }} onChange={e=>setDemande(d=>({...d,fichier:e.target.files[0]}))} accept="image/*,.pdf"/>
                </label>
              </div>
            )}
            {demande.type === 'Email' && <div style={{ marginBottom:20 }}/>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setShowDemande(false)}
                style={{ flex:1, padding:'11px 0', borderRadius:10, border:'1px solid #eee', background:'none', color:'#888', fontSize:13, cursor:'pointer', fontFamily:ft }}>
                Annuler
              </button>
              <button onClick={envoyerDemande} disabled={sendingDemande||(demande.type!=='Email'&&!demande.fichier)}
                style={{ flex:2, padding:'11px 0', borderRadius:10, border:'none', background:(demande.type!=='Email'&&!demande.fichier)?'#ccc':'#111', color:'#fff', fontSize:13, fontWeight:600, cursor:(demande.type!=='Email'&&!demande.fichier)?'not-allowed':'pointer', fontFamily:ft, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <Send size={13}/>
                {sendingDemande?'Envoi...':'Soumettre la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
