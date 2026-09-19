import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { T, ft, radius } from '../../constants/theme'
import { ETAB_TYPES } from '../../constants/data'
import {
  LayoutDashboard, Building2, TrendingUp, Puzzle,
  Megaphone, LogOut, Plus, Users, GraduationCap, Activity
} from 'lucide-react'

const NAV = [
  { id:'overview',       label:"Vue d'ensemble", icon:LayoutDashboard },
  { id:'etablissements', label:'Établissements',  icon:Building2 },
  { id:'analytics',      label:'Analytics',       icon:TrendingUp },
  { id:'modules',        label:'Modules',         icon:Puzzle },
  { id:'actualites',     label:'Actualités',      icon:Megaphone },
]

//  Composants 
function StatCard({ title, value, icon: Icon }) {
  return (
    <div style={{ background:T.surface, borderRadius:radius.md, padding:'16px 18px' }}>
      <div style={{ color:T.muted, marginBottom:10 }}><Icon size={16} strokeWidth={1.5}/></div>
      <div style={{ fontSize:26, fontWeight:500, color:T.text, letterSpacing:'-0.5px', marginBottom:3 }}>{value}</div>
      <div style={{ fontSize:11, color:T.hint }}>{title}</div>
    </div>
  )
}

function SideItem({ id, label, icon: Icon, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={() => onClick(id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:9, padding:'8px 12px',
        borderRadius:radius.sm, cursor:'pointer', fontSize:13, 
        fontWeight: active ? 500 : 400,
        color: active ? T.text : T.muted,
        background: active ? T.surface2 : hov ? T.surface : 'transparent',
        marginBottom:1,
      }}>
      <Icon size={15} strokeWidth={1.5}/>{label}
    </div>
  )
}

function FieldInput({ label, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, color:T.hint, marginBottom:4 }}>{label}</label>}
      <input {...props} style={{ width:'100%', padding:'9px 12px', background:T.surface3, borderRadius:radius.sm, border:'none', fontSize:13, color:T.text, outline:'none', boxSizing:'border-box', fontFamily:ft }}/>
    </div>
  )
}

function FieldSelect({ label, options, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, color:T.hint, marginBottom:4 }}>{label}</label>}
      <select {...props} style={{ width:'100%', padding:'9px 12px', background:T.surface3, borderRadius:radius.sm, border:'none', fontSize:13, color:T.text, outline:'none', boxSizing:'border-box', fontFamily:ft }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

//  Sections 

function OverviewSection({ etabs, overview }) {
  const s = overview ?? {}
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:500, color:T.text, letterSpacing:'-0.4px', marginBottom:3 }}>Vue d'ensemble</h1>
        <p style={{ fontSize:12, color:T.hint }}>Plateforme Miralabs</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:16 }}>
        <StatCard title="Établissements"         value={s.etablissements?.total  ?? '—'} icon={Building2}/>
        <StatCard title="Utilisateurs"           value={s.users?.total           ?? '—'} icon={Users}/>
        <StatCard title="Étudiants"              value={s.users?.students        ?? '—'} icon={GraduationCap}/>
        <StatCard title="Connexions aujourd'hui" value={s.activity?.loginsToday  ?? '—'} icon={Activity}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        <div style={{ background:T.surface, borderRadius:radius.md, padding:18 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.text, marginBottom:14 }}>Répartition</div>
          {[
            { label:'Étudiants',   val:s.users?.students ?? 0 },
            { label:'Enseignants', val:s.users?.teachers ?? 0 },
            { label:'Parents',     val:s.users?.parents  ?? 0 },
            { label:'Admins',      val:s.users?.admins   ?? 0 },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:12, color:T.muted }}>{r.label}</span>
              <span style={{ fontSize:12, fontWeight:500, color:T.text }}>{r.val}</span>
            </div>
          ))}
        </div>

        <div style={{ background:T.surface, borderRadius:radius.md, padding:18 }}>
          <div style={{ fontSize:12, fontWeight:500, color:T.text, marginBottom:14 }}>Établissements</div>
          {etabs.length === 0
            ? <p style={{ fontSize:12, color:T.hint }}>Aucun établissement</p>
            : etabs.slice(0,4).map(e => (
              <div key={e.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:26, height:26, borderRadius:6, background:T.surface3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:T.text, flexShrink:0 }}>
                  {e.name.substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</div>
                  <div style={{ fontSize:10, color:T.hint }}>{e.code}</div>
                </div>
                <div style={{ fontSize:10, color:T.hint }}>{e.isActive ? 'Actif' : 'Inactif'}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function EtablissementsSection({ etabs, onRefresh }) {
  const [showModal, setShowModal] = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [err,       setErr]       = useState(null)
  const [ok,        setOk]        = useState(null)
  const [search,    setSearch]    = useState('')
  const [form,      setForm]      = useState({
    name:'', code:'', type:'lycee', adresse:'',
    adminFirstName:'', adminLastName:'', adminEmail:''
  })

  const filtered = etabs.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    setCreating(true); setErr(null); setOk(null)
    try {
      await api.post('/api/platform/etablissements', form)
      setOk('Établissement créé.')
      setForm({ name:'', code:'', type:'lycee', adresse:'', adminFirstName:'', adminLastName:'', adminEmail:'' })
      onRefresh()
    } catch (e) { setErr(e.response?.data?.message ?? 'Erreur.') }
    finally { setCreating(false) }
  }

  const handleToggle = async (etab) => {
    try { await api.patch(`/api/platform/etablissements/${etab.id}/toggle`); onRefresh() }
    catch (e) { console.error(e) }
  }

  const handleDelete = async (etab) => {
    if (!window.confirm(`Supprimer "${etab.name}" ?`)) return
    try { await api.delete(`/api/platform/etablissements/${etab.id}`); onRefresh() }
    catch (e) { console.error(e) }
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:500, color:T.text, letterSpacing:'-0.4px' }}>Établissements</h2>
        <button onClick={() => { setShowModal(true); setErr(null); setOk(null) }}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:radius.sm, border:'none', background:T.surface2, color:T.text, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:ft }}>
          <Plus size={13}/> Nouveau
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
        style={{ width:'100%', padding:'9px 14px', background:T.surface, borderRadius:radius.sm, border:'none', fontSize:13, color:T.text, outline:'none', fontFamily:ft, marginBottom:8, boxSizing:'border-box' }}/>

      <div style={{ background:T.surface, borderRadius:radius.md, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Nom','Code','Type','Statut','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:500, color:T.hint, textTransform:'uppercase', letterSpacing:'0.4px', background:T.surface2 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5} style={{ padding:28, textAlign:'center', fontSize:12, color:T.hint }}>Aucun établissement</td></tr>
              : filtered.map((e, i) => (
                <tr key={e.id}
                  style={{ background: i % 2 === 0 ? T.surface : T.surface }}
                  onMouseEnter={ev => ev.currentTarget.style.background = T.surface2}
                  onMouseLeave={ev => ev.currentTarget.style.background = T.surface}>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:28, height:28, borderRadius:6, background:T.surface3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:T.text, flexShrink:0 }}>
                        {e.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:500, color:T.text }}>{e.name}</div>
                        <div style={{ fontSize:10, color:T.hint }}>{e.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:11, color:T.muted, fontFamily:'monospace' }}>{e.code}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:radius.pill, background:T.surface3, color:T.muted }}>{e.type}</span>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:11, color:T.muted }}>{e.isActive ? 'Actif' : 'Inactif'}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={() => handleToggle(e)} style={{ padding:'4px 10px', borderRadius:6, border:'none', background:T.surface3, color:T.muted, fontSize:10, cursor:'pointer', fontFamily:ft }}>
                        {e.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => handleDelete(e)} style={{ padding:'4px 10px', borderRadius:6, border:'none', background:T.surface3, color:T.hint, fontSize:10, cursor:'pointer', fontFamily:ft }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(12px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:T.surface, borderRadius:radius.lg, padding:24, width:460 }}>
            <div style={{ fontSize:15, fontWeight:500, color:T.text, marginBottom:18 }}>Nouvel établissement</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ gridColumn:'1/-1' }}><FieldInput label="Nom *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Lycée Jean Hyppolite"/></div>
              <FieldInput label="Code *" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="LJH-JONZAC"/>
              <FieldSelect label="Type *" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} options={ETAB_TYPES}/>
              <div style={{ gridColumn:'1/-1' }}><FieldInput label="Adresse" value={form.adresse} onChange={e=>setForm(f=>({...f,adresse:e.target.value}))} placeholder="Jonzac..."/></div>
              <FieldInput label="Prénom admin *" value={form.adminFirstName} onChange={e=>setForm(f=>({...f,adminFirstName:e.target.value}))} placeholder="Jean"/>
              <FieldInput label="Nom admin *" value={form.adminLastName} onChange={e=>setForm(f=>({...f,adminLastName:e.target.value}))} placeholder="Martin"/>
              <div style={{ gridColumn:'1/-1' }}><FieldInput label="Email admin *" type="email" value={form.adminEmail} onChange={e=>setForm(f=>({...f,adminEmail:e.target.value}))} placeholder="admin@lycee.fr"/></div>
            </div>
            {err && <div style={{ padding:'9px 12px', borderRadius:radius.sm, background:T.surface3, color:T.muted, fontSize:11, marginTop:4 }}>{err}</div>}
            {ok  && <div style={{ padding:'9px 12px', borderRadius:radius.sm, background:T.surface3, color:T.text, fontSize:11, marginTop:4 }}>{ok}</div>}
            <div style={{ display:'flex', gap:8, marginTop:18 }}>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:10, borderRadius:radius.sm, border:'none', background:T.surface3, color:T.muted, fontSize:12, cursor:'pointer', fontFamily:ft }}>Annuler</button>
              <button onClick={handleCreate} disabled={creating} style={{ flex:1, padding:10, borderRadius:radius.sm, border:'none', background:T.surface3, color:T.text, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:ft, opacity:creating?0.5:1 }}>
                {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ModulesSection({ etabs }) {
  const mods = [
    { label:'Mira School',    desc:'Gestion scolaire complète' },
    { label:'Mira Learn',     desc:'Réseau collaboratif' },
    { label:'Mira IA',        desc:'Assistant intelligent' },
    { label:'Mira Challenge', desc:'Compétitions inter-écoles' },
  ]
  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:500, color:T.text, letterSpacing:'-0.4px', marginBottom:16 }}>Modules</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {mods.map(m => (
          <div key={m.label} style={{ background:T.surface, borderRadius:radius.md, padding:18 }}>
            <div style={{ fontSize:13, fontWeight:500, color:T.text, marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{m.desc}</div>
            <div style={{ fontSize:10, color:T.hint }}>Actif sur {etabs.filter(e=>e.isActive).length} établissement(s)</div>
          </div>
        ))}
      </div>
    </div>
  )
}

//  Page principale 

export default function PlatformDashboard() {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [active,   setActive]   = useState('overview')
  const [etabs,    setEtabs]    = useState([])
  const [overview, setOverview] = useState(null)
  const [loading,  setLoading]  = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [e, o] = await Promise.all([
        api.get('/api/platform/etablissements'),
        api.get('/api/platform/analytics/overview'),
      ])
      setEtabs(e.data)
      setOverview(o.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, []) // eslint-disable-line

  const sections = {
    overview:       <OverviewSection etabs={etabs} overview={overview}/>,
    etablissements: <EtablissementsSection etabs={etabs} onRefresh={fetchAll}/>,
    analytics:      <div><h2 style={{ color:T.text, fontWeight:500 }}>Analytics — à venir</h2></div>,
    modules:        <ModulesSection etabs={etabs}/>,
    actualites:     <div><h2 style={{ color:T.text, fontWeight:500 }}>Actualités — à venir</h2></div>,
  }

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:T.bg, color:T.text, overflow:'hidden' }}>

      {/* Sidebar — fond légèrement différent du bg, aucun trait */}
      <div style={{ width:200, flexShrink:0, background:T.sidebar, display:'flex', flexDirection:'column', padding:'18px 10px' }}>
        <div style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.4px', color:T.text, padding:'4px 12px', marginBottom:20 }}>Miralabs.</div>
        <nav>{NAV.map(n => <SideItem key={n.id} {...n} active={active===n.id} onClick={setActive}/>)}</nav>
        <div style={{ marginTop:'auto' }}>
          <SideItem id="logout" label="Déconnexion" icon={LogOut} active={false} onClick={() => { logout(); navigate('/') }}/>
        </div>
      </div>

      {/* Contenu — fond bg, séparation uniquement par la couleur */}
      <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:T.bg }}>
        {loading
          ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'50%', color:T.hint, fontSize:12 }}>Chargement...</div>
          : sections[active]
        }
      </div>
    </div>
  )
}