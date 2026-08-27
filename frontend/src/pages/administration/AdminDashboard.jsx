import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { Home, Users, BookOpen, ClipboardList, BarChart2, Settings, LogOut, Calendar, ChevronRight, ChevronLeft, Bell, Search } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const NAV = [
  { id:'accueil',     label:'Accueil',         icon:Home },
  { id:'eleves',      label:'Apprenants',          icon:Users },
  { id:'enseignants', label:'Enseignants',     icon:BookOpen },
  { id:'classes',     label:'Classes',         icon:ClipboardList },
  { id:'edt',         label:'Emploi du temps', icon:Calendar },
  { id:'stats',       label:'Statistiques',    icon:BarChart2 },
  { id:'params',      label:'Paramètres',      icon:Settings },
]

function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width:44, height:26, borderRadius:13, background:value?'#0a0a0a':'#ccc', position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:value?19:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
    </div>
  )
}

function ElevesView({ C }) {
  const [eleves, setEleves] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [fiche, setFiche] = useState(null)
  const [ficheLoading, setFicheLoading] = useState(false)
  const [sortCol, setSortCol] = useState('firstName')
  const [sortDir, setSortDir] = useState('asc')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [filtreClasse, setFiltreClasse] = useState('toutes')

  const openFiche = (e) => {
    setSelected(e)
    setFicheLoading(true)
    api.get('/api/apprenants/'+e.id).then(r => { setFiche(r.data); setFicheLoading(false) }).catch(() => setFicheLoading(false))
  }

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d==='asc'?'desc':'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const classes = [...new Set(eleves.map(e => e.classe?.nom).filter(Boolean))]

  useEffect(() => {
    api.get('/api/admin/users').then(r => {
      setEleves(r.data.filter(u => u.roles.includes('ROLE_STUDENT')))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = eleves
    .filter(e => (e.firstName+' '+e.lastName+' '+e.email).toLowerCase().includes(search.toLowerCase()))
    .filter(e => filtreStatut==='tous' || (filtreStatut==='actif'?e.isActive:!e.isActive))
    .filter(e => filtreClasse==='toutes' || e.classe?.nom===filtreClasse)
    .sort((a,b) => {
      const va = (a[sortCol]||'').toString().toLowerCase()
      const vb = (b[sortCol]||'').toString().toLowerCase()
      return sortDir==='asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  return (
    <div>
      {/* Barre recherche */}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'10px 14px', marginBottom:20 }}>
        <Search size={16} color={C.muted} strokeWidth={1.8}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un apprenant..."
          style={{ border:'none', background:'transparent', outline:'none', fontSize:14, color:C.text, width:'100%', fontFamily:ft }}/>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, cursor:'pointer', outline:'none' }}>
          <option value='tous'>Tous les statuts</option>
          <option value='actif'>Actif</option>
          <option value='inactif'>Inactif</option>
        </select>
        <select value={filtreClasse} onChange={e=>setFiltreClasse(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, cursor:'pointer', outline:'none' }}>
          <option value='toutes'>Toutes les classes</option>
          {classes.map(cl => <option key={cl} value={cl}>{cl}</option>)}
        </select>
      </div>
      {/* Tableau */}
      <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.surface2}`, overflow:'hidden' }}>
        {/* Header tableau */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr 1fr', padding:'12px 20px', borderBottom:`1px solid ${C.surface2}`, background:C.surface2 }}>
          {['Prénom', 'Nom', 'Email', 'Classe', 'Statut'].map(h => (
            <div key={h} style={{ fontSize:12, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
          ))}
        </div>

        {/* Lignes */}
        {loading && <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>Chargement...</div>}
        {!loading && filtered.length === 0 && <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>Aucun apprenant trouvé.</div>}
        {filtered.map((e, i) => (
          <div key={e.id} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr 1fr', padding:'14px 20px', borderBottom:i<filtered.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center' }}
            onClick={() => openFiche(e)}
            onMouseEnter={el => el.currentTarget.style.background=C.surface2}
            onMouseLeave={el => el.currentTarget.style.background='transparent'}
            style={{ ...{display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr 1fr', padding:'13px 20px', borderBottom:i<filtered.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center'}, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:e.genre==='F'?'#FF9500':e.genre==='M'?'#007AFF':'#8E8E93', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {e.firstName?.[0]}{e.lastName?.[0]}
                </div>
                <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{e.firstName}</span>
              </div>
            <div style={{ fontSize:14, color:C.text }}>{e.lastName}</div>
            <div style={{ fontSize:13, color:C.muted }}>{e.email}</div>
            <div style={{ fontSize:13, color:C.muted }}>{e.classe?.nom||'—'}</div>
            <div style={{ fontSize:13, color:e.isActive?'#34C759':'#FF3B30', fontWeight:500 }}>{e.isActive?'Actif':'Inactif'}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:12, color:C.muted, marginTop:12 }}>{filtered.length} apprenant{filtered.length>1?'s':''}</div>
      {/* Fiche apprenant */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
          <div onClick={() => setSelected(null)} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
          <div style={{ width:480, background:C.bg, height:'100vh', overflowY:'auto', padding:28, borderLeft:`1px solid ${C.surface2}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:selected.genre==='F'?'#FF9500':selected.genre==='M'?'#007AFF':'#8E8E93', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff' }}>
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize:13, color:C.muted }}>{selected.classe?.nom||'Aucune classe'} · {selected.genre==='F'?'Fille':selected.genre==='M'?'Garçon':'Genre non renseigné'}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:20 }}></button>
            </div>
            {ficheLoading && <div style={{ textAlign:'center', color:C.muted }}>Chargement...</div>}
            {fiche && !ficheLoading && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[{label:'Moyenne',value:fiche.moyenne!=null?`${fiche.moyenne}/20`:'—'},{label:'Absences',value:fiche.nbAbsences},{label:'Retards',value:fiche.nbRetards}].map(({label,value})=>(
                    <div key={label} style={{ background:C.surface, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.surface2}` }}>
                      <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                      <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Informations personnelles</div>
                  {[{label:'Email',value:fiche.email},{label:'Naissance',value:fiche.dateNaissance||'—'},{label:'Téléphone',value:fiche.telephone||'—'},{label:'Adresse',value:fiche.adresse||'—'},{label:'Inscrit le',value:fiche.createdAt}].map(({label,value})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Parent / Tuteur</div>
                  {[{label:'Nom',value:fiche.parentNom||'—'},{label:'Email',value:fiche.parentEmail||'—'},{label:'Téléphone',value:fiche.parentTelephone||'—'}].map(({label,value})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                {fiche.moyennesParMatiere?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Moyennes par matière</div>
                    {fiche.moyennesParMatiere.map(m=>(
                      <div key={m.matiere} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${C.surface2}` }}>
                        <div>
                          <div style={{ fontSize:13, color:C.text }}>{m.matiere}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{m.nbNotes} note{m.nbNotes>1?'s':''}</div>
                        </div>
                        <div style={{ fontSize:15, fontWeight:700, color:m.moyenne>=10?'#34C759':'#FF3B30' }}>{m.moyenne}/20</div>
                      </div>
                    ))}
                  </div>
                )}
                {fiche.notes?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Notes</div>
                    {fiche.notes.map(n=>(
                      <div key={n.id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.surface2}` }}>
                        <div><div style={{ fontSize:13, color:C.text }}>{n.matiere}</div><div style={{ fontSize:11, color:C.muted }}>{n.createdAt}</div></div>
                        <div style={{ fontWeight:700, color:n.valeur/n.noteSur>=0.5?'#34C759':'#FF3B30' }}>{n.valeur}/{n.noteSur}</div>
                      </div>
                    ))}
                  </div>
                )}
                {fiche.absences?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Absences</div>
                    {fiche.absences.map(a=>(
                      <div key={a.id} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.surface2}` }}>
                        <span style={{ fontSize:13, color:C.text }}>{a.date}{a.motif?' · '+a.motif:''}</span>
                        <span style={{ fontSize:12, color:a.justifiee?'#34C759':'#FF3B30' }}>{a.justifiee?'Justifiée':'Non justifiée'}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button style={{ width:'100%', padding:'12px 0', borderRadius:10, border:`1px solid ${C.surface2}`, background:'none', color:C.muted, fontSize:13, cursor:'not-allowed' }}>
                   Bulletin scolaire — pas encore disponible
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

  )
}

export default function AdminDashboard() {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const [active, setActive]       = useState('accueil')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href='/' }

  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase()

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo + toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
        {!collapsed && <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.4px', color:C.text }}>Miralabs.</div>}
        <button onClick={() => setCollapsed(s=>!s)}
          style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:collapsed?'auto':0, padding:4 }}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(({ id, label, icon:Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => { setActive(id); setMobileOpen(false) }}
              style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:10, padding:collapsed?'10px 0':'10px 12px', borderRadius:8, border:'none', background:isActive?C.surface2:'transparent', color:isActive?C.text:C.muted, fontSize:13, fontWeight:isActive?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.background=C.surface)}
              onMouseLeave={e => !isActive && (e.currentTarget.style.background='transparent')}>
              <Icon size={18} strokeWidth={1.8}/>
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bas sidebar */}
      <div style={{ borderTop:`1px solid ${C.surface2}`, paddingTop:12 }}>
        {/* Dark mode toggle */}
        {!collapsed ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', marginBottom:12 }}>
            <span style={{ fontSize:13, color:C.muted }}>Mode sombre</span>
            <Toggle value={darkMode} onChange={toggleDarkMode}/>
          </div>
        ) : (
          <button onClick={toggleDarkMode} style={{ display:'flex', justifyContent:'center', width:'100%', padding:'10px 0', background:'none', border:'none', cursor:'pointer', marginBottom:8 }}>
            <Toggle value={darkMode} onChange={()=>{}}/>
          </button>
        )}

        {/* Avatar + nom */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', marginBottom:8 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {initials}
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize:11, color:C.muted }}>Administrateur</div>
            </div>
          )}
        </div>

        {/* Déconnexion */}
        <button onClick={logout}
          style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}>
          <LogOut size={16} strokeWidth={2}/>
          {!collapsed && 'Déconnexion'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>

      {/* Sidebar desktop */}
      <div className="sidebar-desktop" style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, padding:'18px 10px', height:'100vh', transition:'width 0.25s ease', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <SidebarContent/>
      </div>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex' }}>
          <div style={{ width:240, background:C.sidebar, padding:'18px 10px', height:'100vh', display:'flex', flexDirection:'column' }}>
            <SidebarContent/>
          </div>
          <div onClick={() => setMobileOpen(false)} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
        </div>
      )}

      {/* Contenu */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setMobileOpen(true)} style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:C.text }} className="mobile-menu-btn">
              
            </button>
            <div style={{ fontSize:16, fontWeight:600, color:C.text }}>
              {NAV.find(n => n.id===active)?.label || 'Accueil'}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={18} color={C.muted} strokeWidth={1.5}/>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Page */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {active === 'accueil' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:'-0.4px', marginBottom:4 }}>Bonjour, {user?.firstName} </h1>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginBottom:24 }}>
                {[
                  { label:'Apprenants', icon:Users, color:'#007AFF' },
                  { label:'Enseignants', icon:BookOpen, color:'#34C759' },
                  { label:'Classes', icon:ClipboardList, color:'#FF9500' },
                  { label:"Cours aujourd'hui", icon:Calendar, color:'#FF3B30' },
                ].map(({ label, icon:Icon, color }) => (
                  <div key={label} style={{ background:C.surface, borderRadius:14, padding:'18px 20px', border:`1px solid ${C.surface2}` }}>
                    <Icon size={18} color={C.muted} strokeWidth={1.8} style={{ marginBottom:12 }}/>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:C.text, letterSpacing:'-1px' }}>—</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {active === 'eleves' && <ElevesView C={C}/>}
          {active !== 'accueil' && active !== 'eleves' && (
            <div style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.surface2}` }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:8 }}>En cours de développement</div>
              <div style={{ fontSize:13, color:C.muted }}>Cette section sera disponible prochainement.</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
