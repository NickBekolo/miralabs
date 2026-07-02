import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import {
  Home, Search, Compass, PlusSquare, Settings,
  ChevronDown, ChevronRight, Bell, Users, BookOpen,
  BarChart2, Calendar, AlertCircle, TrendingUp, Award,
  Plus, MoreHorizontal, Clock, CheckCircle
} from 'lucide-react'

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,"Segoe UI",sans-serif'

const CLASSES = [
  { id:1, label:'1ASSP1',  color:'#4ade80', count:28 },
  { id:2, label:'1ASSP2',  color:'#60a5fa', count:26 },
  { id:3, label:'2AAGA',   color:'#f472b6', count:24 },
  { id:4, label:'2PSR',    color:'#fb923c', count:22 },
]

const ROLE_LABEL = {
  ROLE_STUDENT: 'Étudiant',
  ROLE_TEACHER: 'Enseignant',
  ROLE_PARENT:  'Parent',
  ROLE_ADMIN:   'Admin',
}

const FEATURED = [
  { bg:'linear-gradient(135deg,#667eea,#764ba2)', title:'Gérer les inscriptions 2026-2027', sub:'Ouvrir les dossiers dès maintenant' },
  { bg:'linear-gradient(135deg,#f093fb,#f5576c)', title:'Résultats du semestre disponibles', sub:'Consulter les bulletins' },
]

const RECENT_CARDS = [
  { bg:'#1a1a2e', label:'Live', title:'Physique-Chimie · Labo 1', sub:'Mme Martin', tag:'En cours' },
  { bg:'#16213e', label:'',    title:'Mathématiques · Salle A12', sub:'M. Dupont',  tag:'Complété' },
  { bg:'#0f3460', label:'',    title:'Anglais · Bât. 9',           sub:'Pullen A.', tag:'Annulé' },
  { bg:'#533483', label:'',    title:'Histoire-Géo · B07',         sub:'M. Brun',   tag:'' },
  { bg:'#2b2d42', label:'',    title:'Français · C12',             sub:'Mme Leclerc',tag:'' },
]

const TASKS = [
  { icon:'📋', title:'CCF — Fonctions polynômes',    sub:'Corriger 28 copies · 1ASSP1',    type:'Évaluation', progress:65, due:'23 juin', priority:'Urgent' },
  { icon:'🔬', title:'TP Solutions aqueuses',        sub:'Préparer le matériel · 2AAGA',   type:'TP',         progress:0,  due:'24 juin', priority:'Normal' },
  { icon:'📊', title:'Bulletins semestre 2',         sub:'Saisir les appréciations',        type:'Admin',      progress:40, due:'25 juin', priority:'Urgent' },
  { icon:'📚', title:'Programme de révision',        sub:'Créer les fiches · 1ASSP2',      type:'Cours',      progress:80, due:'26 juin', priority:'Normal' },
  { icon:'👥', title:'Réunion pédagogique',          sub:'Préparer le compte-rendu',        type:'Réunion',    progress:0,  due:'27 juin', priority:'Normal' },
]

const ACTU = [
  { color:'#4ade80', tag:'Établissement', title:'Réunion parents-professeurs', time:'Ven. 13 juin à 17h', urgent:false },
  { color:'#f87171', tag:'Urgent',        title:'Sortie pédagogique annulée',  time:'Rattrapage à venir', urgent:true  },
  { color:'#60a5fa', tag:'Calendrier',    title:'Inscriptions 2026-2027',      time:'Jusqu\'au 30 juin',  urgent:false },
]

function getMainRole(roles) {
  const p = ['ROLE_ADMIN','ROLE_TEACHER','ROLE_PARENT','ROLE_STUDENT']
  return p.find(r => roles.includes(r)) ?? roles[0]
}
function initials(f, l) { return ((f?.[0]??'')+(l?.[0]??'')).toUpperCase() }

export default function SuperAdminDashboard() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [createMsg, setCreateMsg] = useState(null)
  const [activeNav, setActiveNav] = useState('home')
  const [manageOpen, setManageOpen] = useState(true)
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', role:'ROLE_STUDENT' })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/users')
      setUsers(res.data)
    } catch { /* silently */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setCreateMsg({ type:'error', text:'Tous les champs sont requis.' }); return
    }
    try {
      setCreating(true); setCreateMsg(null)
      const res = await api.post('/api/admin/users', form)
      setCreateMsg({ type:'success', text:`Compte créé ! Mot de passe : ${res.data.tempPassword}` })
      setForm({ firstName:'', lastName:'', email:'', role:'ROLE_STUDENT' })
      fetchUsers()
    } catch (err) {
      setCreateMsg({ type:'error', text: err.response?.data?.message ?? 'Erreur.' })
    } finally { setCreating(false) }
  }

  const handleToggle = async (id) => {
    try { await api.patch(`/api/admin/users/${id}/toggle`); fetchUsers() } catch {}
  }
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return
    try { await api.delete(`/api/admin/users/${id}`); fetchUsers() } catch {}
  }

  const counts = {
    total:    users.length,
    teachers: users.filter(u => u.roles.includes('ROLE_TEACHER')).length,
    students: users.filter(u => u.roles.includes('ROLE_STUDENT')).length,
    parents:  users.filter(u => u.roles.includes('ROLE_PARENT')).length,
  }

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:'#f8f8f8', overflow:'hidden', fontSize:14 }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width:220, flexShrink:0, background:'#fff', borderRight:'1px solid #ebebeb', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Logo */}
        <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #ebebeb' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontSize:13, fontWeight:800 }}>M</span>
            </div>
            <span style={{ fontSize:15, fontWeight:700, color:'#111' }}>Miralabs.</span>
            <ChevronDown size={14} color='#999' style={{ marginLeft:'auto' }}/>
          </div>
        </div>

        {/* Nav principale */}
        <div style={{ padding:'8px 8px 0', flex:1, overflowY:'auto' }}>
          {[
            { id:'home',     icon:<Home size={16}/>,     label:'Accueil'   },
            { id:'search',   icon:<Search size={16}/>,   label:'Rechercher'},
            { id:'discover', icon:<Compass size={16}/>,  label:'Découvrir' },
            { id:'create',   icon:<PlusSquare size={16}/>,label:'Créer'    },
          ].map(n => (
            <SideItem key={n.id} icon={n.icon} label={n.label} active={activeNav===n.id} onClick={() => setActiveNav(n.id)}/>
          ))}

          {/* Manage avec sous-menu */}
          <SideItem icon={<BarChart2 size={16}/>} label="Gérer" chevron active={activeNav==='manage'} onClick={() => { setActiveNav('manage'); setManageOpen(o=>!o) }}/>
          {manageOpen && (
            <div style={{ paddingLeft:24 }}>
              <SideSubItem label="Utilisateurs" onClick={() => setShowModal(true)}/>
              <SideSubItem label="Classes"/>
              <SideSubItem label="Rapports"/>
            </div>
          )}
          <SideItem icon={<Settings size={16}/>} label="Paramètres" chevron onClick={() => { logout(); navigate('/login') }}/>

          {/* Classes */}
          <div style={{ marginTop:16, marginBottom:6, padding:'0 8px', fontSize:11, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Classes
          </div>
          {CLASSES.map(c => (
            <div key={c.id} onClick={() => setActiveNav('class'+c.id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'7px 8px', borderRadius:8, cursor:'pointer',
              background: activeNav==='class'+c.id ? '#f0f0f0' : 'transparent',
            }}
            onMouseEnter={e=>e.currentTarget.style.background='#f5f5f5'}
            onMouseLeave={e=>e.currentTarget.style.background=activeNav==='class'+c.id?'#f0f0f0':'transparent'}>
              <div style={{ width:20, height:20, borderRadius:6, background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {c.label[0]}
              </div>
              <span style={{ fontSize:13, color:'#333', fontWeight:500 }}>{c.label}</span>
              <ChevronDown size={12} color='#ccc' style={{ marginLeft:'auto' }}/>
            </div>
          ))}

          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', cursor:'pointer', color:'#999', fontSize:13 }}>
            <Plus size={14}/> Parcourir
          </div>
        </div>

        {/* Bouton New */}
        <div style={{ padding:12, borderTop:'1px solid #ebebeb' }}>
          <button onClick={() => setShowModal(true)} style={{
            width:'100%', padding:'10px', borderRadius:10, border:'none', background:'#111', color:'#fff',
            fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft,
          }}>Nouveau</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, overflowY:'auto' }}>

        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 28px', background:'#fff', borderBottom:'1px solid #ebebeb', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#111', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>SA</div>
            <span style={{ fontSize:13, fontWeight:600, color:'#111' }}>Super Admin</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:12, color:'#999' }}>Besoin d'aide ? <span style={{ color:'#111', fontWeight:600, cursor:'pointer' }}>Voir les ressources</span></span>
            <div style={{ position:'relative', cursor:'pointer' }}>
              <Bell size={18} color='#555'/>
              <div style={{ position:'absolute', top:-3, right:-3, width:7, height:7, borderRadius:'50%', background:'#ef4444', border:'1.5px solid #fff' }}/>
            </div>
          </div>
        </div>

        <div style={{ padding:'28px 32px' }}>

          {/* Greeting */}
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:26, fontWeight:700, color:'#111', letterSpacing:'-0.5px', marginBottom:4 }}>
              Bonjour, Super Admin
            </h1>
            <p style={{ fontSize:15, color:'#888' }}>
              Vous avez <strong style={{ color:'#111' }}>{TASKS.filter(t=>t.priority==='Urgent').length} tâches urgentes</strong> à traiter aujourd'hui
            </p>
          </div>

          {/* Tâches — style tableau comme la ref */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ebebeb', marginBottom:28, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 160px 140px 110px', padding:'10px 16px', borderBottom:'1px solid #f0f0f0' }}>
              {['Tâche','Type','Progression','Échéance','Priorité'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
              ))}
            </div>
            {TASKS.map((t, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 120px 160px 140px 110px', padding:'12px 16px', borderBottom: i<TASKS.length-1?'1px solid #f9f9f9':'none', alignItems:'center' }}
                onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{t.title}</div>
                    <div style={{ fontSize:11, color:'#999', marginTop:2 }}>{t.sub}</div>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'#666' }}>{t.type}</div>
                <div>
                  {t.progress > 0 ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:5, background:'#f0f0f0', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${t.progress}%`, height:'100%', background:'#4ade80', borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:11, color:'#999', flexShrink:0 }}>{t.progress}%</span>
                    </div>
                  ) : <span style={{ fontSize:11, color:'#ccc' }}>—</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#666' }}>
                  <Calendar size={12} color='#bbb'/> {t.due}
                </div>
                <div>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:980,
                    background: t.priority==='Urgent' ? '#fef3c7' : '#f5f5f5',
                    color:      t.priority==='Urgent' ? '#d97706' : '#999',
                  }}>
                    {t.priority==='Urgent' ? '● ' : ''}{t.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent — cartes horizontales */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <span style={{ fontSize:16, fontWeight:700, color:'#111' }}>Récent</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#aaa' }}>{RECENT_CARDS.length}</span>
            </div>
            <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:4 }}>
              {RECENT_CARDS.map((c, i) => (
                <div key={i} style={{ flexShrink:0, width:220, borderRadius:12, overflow:'hidden', border:'1px solid #ebebeb', background:'#fff', cursor:'pointer' }}>
                  <div style={{ height:120, background:c.bg, display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:10 }}>
                    {c.label && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.2)', color:'#fff', padding:'3px 8px', borderRadius:6 }}>{c.label}</span>}
                    {c.tag && <span style={{
                      fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6,
                      background: c.tag==='En cours' ? 'rgba(74,222,128,0.2)' : c.tag==='Complété' ? 'rgba(96,165,250,0.2)' : 'rgba(248,113,113,0.2)',
                      color:      c.tag==='En cours' ? '#4ade80' : c.tag==='Complété' ? '#60a5fa' : '#f87171',
                    }}>{c.tag==='Complété'?'✓ ':''}{c.tag}</span>}
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#111', marginBottom:2 }}>{c.title}</div>
                    <div style={{ fontSize:11, color:'#999' }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid bas : stats + actu + utilisateurs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>

            {/* Stats utilisateurs */}
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ebebeb', padding:'20px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>Vue d'ensemble</span>
                <span style={{ fontSize:12, color:'#aaa', cursor:'pointer' }}>Voir tout →</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { val:counts.total,    lbl:'Utilisateurs',  icon:<Users size={14}/>,      color:'#111' },
                  { val:counts.teachers, lbl:'Enseignants',   icon:<BookOpen size={14}/>,   color:'#6366f1' },
                  { val:counts.students, lbl:'Étudiants',     icon:<Award size={14}/>,      color:'#4ade80' },
                  { val:counts.parents,  lbl:'Parents',       icon:<TrendingUp size={14}/>, color:'#fb923c' },
                ].map(s => (
                  <div key={s.lbl} style={{ background:'#fafafa', borderRadius:10, padding:'14px 16px' }}>
                    <div style={{ color:s.color, marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.8px', color:'#111' }}>{s.val}</div>
                    <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actualités */}
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ebebeb', padding:'20px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>Actualités</span>
                <span style={{ fontSize:12, color:'#aaa', cursor:'pointer' }}>Voir tout →</span>
              </div>
              {ACTU.map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 0', borderBottom: i<ACTU.length-1?'1px solid #f5f5f5':'none', cursor:'pointer' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0, marginTop:5 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:2 }}>{a.tag}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111', marginBottom:1 }}>{a.title}</div>
                    <div style={{ fontSize:11, color:'#bbb' }}>{a.time}</div>
                  </div>
                  {a.urgent && <AlertCircle size={14} color='#f87171'/>}
                </div>
              ))}
            </div>
          </div>

          {/* Featured — grandes cartes */}
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:14 }}>À la une</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {FEATURED.map((f, i) => (
                <div key={i} style={{ height:160, borderRadius:12, background:f.bg, padding:'24px 28px', display:'flex', flexDirection:'column', justifyContent:'flex-end', cursor:'pointer', overflow:'hidden', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.15)' }}/>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', marginBottom:6 }}>{f.sub}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:'#fff', lineHeight:1.3 }}>{f.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau utilisateurs */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ebebeb', marginTop:28, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #f0f0f0' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>Utilisateurs</span>
              <button onClick={() => { setShowModal(true); setCreateMsg(null) }} style={{ padding:'7px 14px', borderRadius:8, border:'none', background:'#111', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
                + Ajouter
              </button>
            </div>
            {loading ? <div style={{ padding:24, color:'#aaa', fontSize:13 }}>Chargement...</div> : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #f0f0f0' }}>
                    {['Utilisateur','Rôle','Statut','Créé le','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const role    = getMainRole(u.roles)
                    const isAdmin = u.roles.includes('ROLE_ADMIN')
                    return (
                      <tr key={u.id}
                        onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        style={{ borderBottom:'1px solid #f9f9f9' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:30, height:30, borderRadius:'50%', background: u.isActive?'#111':'#d1d5db', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>
                              {initials(u.firstName, u.lastName)}
                            </div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{u.firstName} {u.lastName}</div>
                              <div style={{ fontSize:11, color:'#aaa' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:980,
                            background: role==='ROLE_TEACHER'?'#eff6ff':role==='ROLE_STUDENT'?'#f0fdf4':role==='ROLE_PARENT'?'#fff7ed':'#111',
                            color:      role==='ROLE_TEACHER'?'#1d4ed8':role==='ROLE_STUDENT'?'#166534':role==='ROLE_PARENT'?'#c2410c':'#fff',
                          }}>{ROLE_LABEL[role]??role}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                            <div style={{ width:6, height:6, borderRadius:'50%', background: u.isActive?'#4ade80':'#e5e7eb' }}/>
                            <span style={{ color: u.isActive?'#111':'#aaa' }}>{u.isActive?'Actif':'Inactif'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#aaa' }}>{u.createdAt}</td>
                        <td style={{ padding:'12px 16px' }}>
                          {!isAdmin && (
                            <div style={{ display:'flex', gap:4 }}>
                              <Btn onClick={() => handleToggle(u.id)}>{u.isActive?'Désactiver':'Activer'}</Btn>
                              <Btn danger onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}>Supprimer</Btn>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:420, boxShadow:'0 24px 64px rgba(0,0,0,0.15)', fontFamily:ft }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#111', marginBottom:4 }}>Nouvel utilisateur</h2>
            <p style={{ fontSize:13, color:'#aaa', marginBottom:20 }}>Mot de passe généré automatiquement et envoyé par email.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Prénom"><input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} placeholder="Prénom" style={iStyle}/></Field>
              <Field label="Nom"><input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} placeholder="Nom" style={iStyle}/></Field>
            </div>
            <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@exemple.com" style={iStyle}/></Field>
            <Field label="Rôle">
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={iStyle}>
                <option value="ROLE_STUDENT">Étudiant</option>
                <option value="ROLE_TEACHER">Enseignant</option>
                <option value="ROLE_PARENT">Parent</option>
              </select>
            </Field>
            {createMsg && (
              <div style={{ padding:'10px 12px', borderRadius:8, marginTop:8, fontSize:12, fontWeight:500,
                background: createMsg.type==='success'?'#f0fdf4':'#fff0f0',
                color:      createMsg.type==='success'?'#166534':'#dc2626',
                border:`1px solid ${createMsg.type==='success'?'#bbf7d0':'#fecaca'}`,
              }}>{createMsg.text}</div>
            )}
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={()=>{setShowModal(false);setCreateMsg(null)}} style={{ flex:1, padding:11, borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', color:'#111', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}>Annuler</button>
              <button onClick={handleCreate} disabled={creating} style={{ flex:1, padding:11, borderRadius:8, border:'none', background:'#111', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, opacity:creating?0.6:1 }}>
                {creating?'Création...':'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SideItem({ icon, label, active, chevron, onClick }) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 8px', borderRadius:8, cursor:'pointer', background: active?'#f0f0f0':'transparent', color: active?'#111':'#555', fontWeight: active?600:400, fontSize:13, marginBottom:2 }}
      onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='#f5f5f5' }}
      onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent' }}>
      <span style={{ opacity: active?1:0.6 }}>{icon}</span>
      {label}
      {chevron && <ChevronDown size={13} color='#ccc' style={{ marginLeft:'auto' }}/>}
    </div>
  )
}

function SideSubItem({ label, onClick }) {
  return (
    <div onClick={onClick} style={{ padding:'6px 8px', fontSize:12, color:'#777', cursor:'pointer', borderRadius:6 }}
      onMouseEnter={e=>e.currentTarget.style.color='#111'}
      onMouseLeave={e=>e.currentTarget.style.color='#777'}>
      {label}
    </div>
  )
}

function Btn({ children, danger, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'-apple-system,sans-serif', border: danger?'1px solid #fecaca':'1px solid #e5e7eb', background:'#fff', color: danger?'#dc2626':'#111' }}
      onMouseEnter={e=>e.currentTarget.style.background=danger?'#fff0f0':'#f5f5f5'}
      onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
      {children}
    </button>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#666', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  )
}

const iStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontFamily:'-apple-system,sans-serif', outline:'none', color:'#111', background:'#fff', boxSizing:'border-box' }