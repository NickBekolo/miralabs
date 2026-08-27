import { useState, useEffect } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useRole } from '../../hooks/useRole'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import { Home, Users, BookOpen, ClipboardList, Calendar, BarChart2, Settings, Search } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const NAV_ALL = [
  { id:'accueil',       label:'Accueil',          icon:Home,         roles:['ROLE_ADMIN','ROLE_SECRETARIAT','ROLE_COMPTABILITE'] },
  { id:'apprenants',    label:'Apprenants',        icon:Users,        roles:['ROLE_ADMIN','ROLE_SECRETARIAT'] },
  { id:'enseignants',   label:'Enseignants',       icon:BookOpen,     roles:['ROLE_ADMIN'] },
  { id:'classes',       label:'Classes',           icon:ClipboardList,roles:['ROLE_ADMIN'] },
  { id:'edt',           label:'Emploi du temps',   icon:Calendar,     roles:['ROLE_ADMIN'] },
  { id:'stats',         label:'Statistiques',      icon:BarChart2,    roles:['ROLE_ADMIN','ROLE_COMPTABILITE'] },
  { id:'params',        label:'Paramètres',        icon:Settings,     roles:['ROLE_ADMIN','ROLE_SECRETARIAT','ROLE_COMPTABILITE'] },
]

const ROLE_LABEL = {
  ROLE_ADMIN:        'Administrateur',
  ROLE_SECRETARIAT:  'Secrétariat',
  ROLE_COMPTABILITE: 'Comptabilité',
}

// ─── Section Apprenants ───────────────────────────────────────
function ApprenantSection({ C }) {
  const [apprenants, setApprenants] = useState([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [fiche, setFiche]           = useState(null)
  const [ficheLoading, setFicheLoading] = useState(false)
  const [sortCol, setSortCol]       = useState('firstName')
  const [sortDir, setSortDir]       = useState('asc')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [filtreClasse, setFiltreClasse] = useState('toutes')

  useEffect(() => {
    api.get('/api/admin/users')
      .then(r => { setApprenants(r.data.filter(u => u.roles.includes('ROLE_STUDENT'))); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openFiche = (e) => {
    setSelected(e)
    setFicheLoading(true)
    api.get('/api/apprenants/'+e.id).then(r => { setFiche(r.data); setFicheLoading(false) }).catch(() => setFicheLoading(false))
  }

  const classes = [...new Set(apprenants.map(e => e.classe?.nom).filter(Boolean))]

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d==='asc'?'desc':'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = apprenants
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
      <div style={{ display:'flex', alignItems:'center', gap:10, background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
        <Search size={16} color={C.muted} strokeWidth={1.8}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un apprenant..."
          style={{ border:'none', background:'transparent', outline:'none', fontSize:14, color:C.text, width:'100%', fontFamily:ft }}/>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, cursor:'pointer', outline:'none' }}>
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
        <select value={filtreClasse} onChange={e=>setFiltreClasse(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, cursor:'pointer', outline:'none' }}>
          <option value="toutes">Toutes les classes</option>
          {classes.map(cl => <option key={cl} value={cl}>{cl}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
        {[
          { label:'Total', value:apprenants.length },
          { label:'Actifs', value:apprenants.filter(e=>e.isActive).length },
          { label:'Inactifs', value:apprenants.filter(e=>!e.isActive).length },
        ].map(({label,value}) => (
          <div key={label} style={{ background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'12px 18px' }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}`, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr 1fr', padding:'10px 20px', borderBottom:`1px solid ${C.surface2}` }}>
          {[{label:'Prénom',col:'firstName'},{label:'Nom',col:'lastName'},{label:'Email',col:'email'},{label:'Classe',col:'classe'},{label:'Statut',col:'isActive'}].map(({label,col}) => (
            <div key={col} onClick={() => toggleSort(col)}
              style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer', userSelect:'none' }}>
              {label} {sortCol===col ? (sortDir==='asc'?'↑':'↓') : ''}
            </div>
          ))}
        </div>
        {loading && <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>Chargement...</div>}
        {!loading && filtered.length === 0 && <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>Aucun apprenant trouvé.</div>}
        {filtered.map((e,i) => (
          <div key={e.id} onClick={() => openFiche(e)}
            style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr 1fr', padding:'13px 20px', borderBottom:i<filtered.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center', cursor:'pointer' }}
            onMouseEnter={el => el.currentTarget.style.background=C.surface2}
            onMouseLeave={el => el.currentTarget.style.background='transparent'}>
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
      <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>{filtered.length} apprenant{filtered.length>1?'s':''}</div>

      {/* Fiche */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
          <div onClick={() => setSelected(null)} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
          <div style={{ width:480, background:C.bg, height:'100vh', overflowY:'auto', padding:28, borderLeft:`1px solid ${C.surface2}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:selected.genre==='F'?'#FF9500':selected.genre==='M'?'#007AFF':'#8E8E93', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize:13, color:C.muted }}>{selected.classe?.nom||'—'} · {selected.genre==='F'?'Fille':selected.genre==='M'?'Garçon':'Genre non renseigné'}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:20 }}>✕</button>
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
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Parent / Tuteur</div>
                  {[{label:'Nom',value:fiche.parentNom||'—'},{label:'Email',value:fiche.parentEmail||'—'},{label:'Téléphone',value:fiche.parentTelephone||'—'}].map(({label,value})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                {fiche.moyennesParMatiere?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Moyennes par matière</div>
                    {fiche.moyennesParMatiere.map(m=>(
                      <div key={m.matiere} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.surface2}` }}>
                        <div>
                          <div style={{ fontSize:13, color:C.text }}>{m.matiere}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{m.nbNotes} note{m.nbNotes>1?'s':''}</div>
                        </div>
                        <div style={{ fontWeight:700, color:m.moyenne>=10?'#34C759':'#FF3B30' }}>{m.moyenne}/20</div>
                      </div>
                    ))}
                  </div>
                )}
                {fiche.absences?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Absences ({fiche.nbAbsences})</div>
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

// ─── Section Accueil ─────────────────────────────────────────
function AccueilSection({ C }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:16, marginBottom:24 }}>
        {[
          { label:'Apprenants', icon:Users, color:'#007AFF' },
          { label:'Enseignants', icon:BookOpen, color:'#34C759' },
          { label:'Classes', icon:ClipboardList, color:'#FF9500' },
          { label:"Cours aujourd'hui", icon:Calendar, color:'#FF3B30' },
        ].map(({ label, icon:Icon, color }) => (
          <div key={label} style={{ background:C.surface, borderRadius:14, padding:'18px 20px', border:`1px solid ${C.surface2}` }}>
            <Icon size={18} color={color} strokeWidth={1.8} style={{ marginBottom:12 }}/>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:C.text }}>—</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard principal ─────────────────────────────────────
export default function AdminDashboard() {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME
  const { roles } = useRole()

  const nav = NAV_ALL.filter(n => n.roles.some(r => roles.includes(r)))
  const roleLabel = ROLE_LABEL[roles.find(r => ROLE_LABEL[r])] || 'Administration'

  return (
    <DashboardLayout nav={nav} role={roleLabel}>
      {(active, C) => (
        <>
          {active === 'accueil'    && <AccueilSection C={C}/>}
          {active === 'apprenants' && <ApprenantSection C={C}/>}
          {active !== 'accueil' && active !== 'apprenants' && (
            <div style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.surface2}` }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:8 }}>En cours de développement</div>
              <div style={{ fontSize:13, color:C.muted }}>Cette section sera disponible prochainement.</div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
