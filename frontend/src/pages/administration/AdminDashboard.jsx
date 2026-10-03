import Conversations from '../student/Conversations'
import { useState, useEffect } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { useRole } from '../../hooks/useRole'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import EdtSection from './EdtSection'
import CalendarWidget from './CalendarWidget'
import ChartCard from '../../components/shared/ChartCard'
import {
  Home, Users, BookOpen, ClipboardList, Calendar,
  BarChart2, Settings, Search, UserRoundCheck, UserRoundX, MessageSquare,
  ChevronDown, ChevronUp
} from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const NAV_ALL = [
  { id:'accueil',     label:'Accueil',          icon:Home,         roles:['ROLE_ADMIN','ROLE_SECRETARIAT','ROLE_COMPTABILITE'] },
  { id:'apprenants',  label:'Apprenants',        icon:Users,        roles:['ROLE_ADMIN','ROLE_SECRETARIAT'] },
  { id:'enseignants', label:'Enseignants',       icon:BookOpen,     roles:['ROLE_ADMIN'] },
  { id:'classes',     label:'Classes',           icon:ClipboardList,roles:['ROLE_ADMIN'] },
  { id:'edt',         label:'Emploi du temps',   icon:Calendar,     roles:['ROLE_ADMIN'] },
  { id:'stats',       label:'Statistiques',      icon:BarChart2,    roles:['ROLE_ADMIN','ROLE_COMPTABILITE'] },
  { id:'absences',    label:'Absences',           icon:Users,        roles:['ROLE_ADMIN','ROLE_SECRETARIAT'] },
  { id:'messages',    label:'Messages',          icon:MessageSquare,roles:['ROLE_ADMIN','ROLE_SECRETARIAT','ROLE_COMPTABILITE'] },
]

const ROLE_LABEL = {
  ROLE_ADMIN:        'Administrateur',
  ROLE_SECRETARIAT:  'Secrétariat',
  ROLE_COMPTABILITE: 'Comptabilité',
}

// ─── Avatar ───────────────────────────────────────────────────
function AvatarUser({ genre, isActive, size=28 }) {
  const color = isActive
    ? (genre === 'F' ? '#FF3B9A' : genre === 'M' ? '#007AFF' : '#8E8E93')
    : '#FF3B30'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#fafafa', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isActive
        ? <UserRoundCheck size={size*0.5} color={color} strokeWidth={2}/>
        : <UserRoundX size={size*0.5} color={color} strokeWidth={2}/>
      }
    </div>
  )
}

// ─── Fiche Apprenant (panneau latéral) ────────────────────────
function FicheApprenant({ apprenant, fiche, loading, onClose, C }) {
  const [detailMatiere, setDetailMatiere] = useState(null)
  const [showAbsences, setShowAbsences]   = useState(false)
  const [showRetards, setShowRetards]     = useState(false)

  if (!apprenant) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
      <div style={{ width:480, background:C.bg, height:'100vh', overflowY:'auto', padding:28, borderLeft:`1px solid ${C.surface2}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <AvatarUser genre={apprenant.genre} isActive={apprenant.isActive} size={52}/>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{apprenant.firstName} {apprenant.lastName}</div>
            <div style={{ fontSize:13, color:C.muted }}>{apprenant.classe?.nom||'—'} · {apprenant.genre==='F'?'Fille':apprenant.genre==='M'?'Garçon':'Genre non renseigné'}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:20 }}>✕</button>
        </div>

        {loading && <div style={{ textAlign:'center', color:C.muted, padding:24 }}>Chargement...</div>}

        {fiche && !loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[{label:'Moyenne',value:fiche.moyenne!=null?`${fiche.moyenne}/20`:'—'},{label:'Absences',value:fiche.nbAbsences},{label:'Retards',value:fiche.nbRetards}].map(({label,value})=>(
                <div key={label} style={{ background:C.surface, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Infos */}
            <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Informations personnelles</div>
              {[{label:'Email',value:fiche.email},{label:'Naissance',value:fiche.dateNaissance||'—'},{label:'Téléphone',value:fiche.telephone||'—'},{label:'Adresse',value:fiche.adresse||'—'},{label:'Inscrit le',value:fiche.createdAt}].map(({label,value})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                  <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                  <span style={{ fontSize:13, color:C.text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Parent */}
            <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Parent / Tuteur</div>
              {[{label:'Nom',value:fiche.parentNom||'—'},{label:'Email',value:fiche.parentEmail||'—'},{label:'Téléphone',value:fiche.parentTelephone||'—'}].map(({label,value})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                  <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                  <span style={{ fontSize:13, color:C.text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Notes par matière avec clic */}
            {fiche.moyennesParMatiere?.length > 0 && (
              <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Notes par matière</div>
                {fiche.moyennesParMatiere.map(m => (
                  <div key={m.matiere}>
                    <div onClick={() => setDetailMatiere(detailMatiere===m.matiere?null:m.matiere)}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.surface2}`, cursor:'pointer' }}>
                      <div>
                        <div style={{ fontSize:13, color:C.text }}>{m.matiere}</div>
                        <div style={{ fontSize:11, color:C.muted }}>{m.nbNotes} note{m.nbNotes>1?'s':''}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontWeight:700, color:m.moyenne>=10?'#22C55E':'#FF3B30' }}>{m.moyenne}/20</span>
                        {detailMatiere===m.matiere ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                      </div>
                    </div>
                    {detailMatiere===m.matiere && (
                      <div style={{ background:C.surface2, borderRadius:8, padding:'8px 12px', margin:'4px 0' }}>
                        {fiche.notes?.filter(n=>n.matiere===m.matiere).map(n => (
                          <div key={n.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${C.surface2}` }}>
                            <div>
                              <div style={{ fontSize:12, color:C.text }}>{n.typeEvaluation||'Évaluation'} · {n.createdAt}</div>
                              {n.commentaire && <div style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>{n.commentaire}</div>}
                            </div>
                            <div style={{ fontSize:14, fontWeight:700, color:n.valeur/n.noteSur>=0.5?'#22C55E':'#FF3B30' }}>{n.valeur}/{n.noteSur}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Absences */}
            {fiche.nbAbsences > 0 && (
              <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                <div onClick={() => setShowAbsences(s=>!s)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Absences</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#FF3B30' }}>{fiche.nbAbsences}</span>
                    {showAbsences ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                  </div>
                </div>
                {showAbsences && (
                  <div style={{ marginTop:10 }}>
                    {fiche.absences.map(a => (
                      <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${C.surface2}` }}>
                        <div>
                          <div style={{ fontSize:13, color:C.text }}>{a.date}</div>
                          {a.motif && <div style={{ fontSize:11, color:C.muted }}>{a.motif}</div>}
                        </div>
                        <span style={{ fontSize:12, color:a.justifiee?'#34C759':'#FF3B30' }}>{a.justifiee?'Justifiée':'Non justifiée'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Retards */}
            {fiche.nbRetards > 0 && (
              <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                <div onClick={() => setShowRetards(s=>!s)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Retards</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#FF9500' }}>{fiche.nbRetards}</span>
                    {showRetards ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                  </div>
                </div>
                {showRetards && (
                  <div style={{ marginTop:10 }}>
                    {fiche.retards.map(r => (
                      <div key={r.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                        <span style={{ fontSize:13, color:C.text }}>{r.date}{r.duree?' · '+r.duree:''}</span>
                        <span style={{ fontSize:12, color:r.justifie?'#34C759':'#FF3B30' }}>{r.justifie?'Justifié':'Non justifié'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button style={{ width:'100%', padding:'12px 0', borderRadius:10, border:`1px solid ${C.surface2}`, background:'none', color:C.muted, fontSize:13, cursor:'not-allowed' }}>
              Bulletin scolaire — pas encore disponible
            </button>
          </div>
        )}
      </div>
    </div>
  )
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
      <div style={{ display:'flex', alignItems:'center', gap:8, background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'8px 12px', marginBottom:12 }}>
        <Search size={15} color={C.muted} strokeWidth={1.8}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un apprenant..."
          style={{ border:'none', background:'transparent', outline:'none', fontSize:14, color:C.text, width:'100%', fontFamily:ft }}/>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, outline:'none' }}>
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
        <select value={filtreClasse} onChange={e=>setFiltreClasse(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, outline:'none' }}>
          <option value="toutes">Toutes les classes</option>
          {classes.map(cl => <option key={cl} value={cl}>{cl}</option>)}
        </select>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:14 }}>
        {[{label:'Total',value:apprenants.length},{label:'Actifs',value:apprenants.filter(e=>e.isActive).length},{label:'Inactifs',value:apprenants.filter(e=>!e.isActive).length}].map(({label,value})=>(
          <div key={label} style={{ background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'10px 16px' }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}`, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr', padding:'10px 20px', borderBottom:`1px solid ${C.surface2}` }}>
          {[{label:'Prénom',col:'firstName'},{label:'Nom',col:'lastName'},{label:'Email',col:'email'},{label:'Classe',col:'classe'}].map(({label,col})=>(
            <div key={col} onClick={()=>{if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('asc')}}}
              style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px', cursor:'pointer', userSelect:'none' }}>
              {label}{sortCol===col?(sortDir==='asc'?' ↑':' ↓'):''}
            </div>
          ))}
        </div>
        {loading && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Chargement...</div>}
        {!loading && filtered.length===0 && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Aucun apprenant trouvé.</div>}
        {filtered.map((e,i) => (
          <div key={e.id} onClick={() => openFiche(e)}
            style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr', padding:'13px 20px', borderBottom:i<filtered.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center', cursor:'pointer' }}
            onMouseEnter={el=>el.currentTarget.style.background=C.surface2}
            onMouseLeave={el=>el.currentTarget.style.background='transparent'}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <AvatarUser genre={e.genre} isActive={e.isActive} size={28}/>
              <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{e.firstName}</span>
            </div>
            <div style={{ fontSize:13, color:C.text }}>{e.lastName}</div>
            <div style={{ fontSize:13, color:C.muted }}>{e.email}</div>
            <div style={{ fontSize:13, color:C.muted }}>{e.classe?.nom||'—'}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>{filtered.length} apprenant{filtered.length>1?'s':''}</div>
      <FicheApprenant apprenant={selected} fiche={fiche} loading={ficheLoading} onClose={()=>{setSelected(null);setFiche(null)}} C={C}/>
    </div>
  )
}

// ─── Section Enseignants ──────────────────────────────────────
function EnseignantSection({ C }) {
  const [enseignants, setEnseignants] = useState([])
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)
  const [fiche, setFiche]             = useState(null)
  const [ficheLoading, setFicheLoading] = useState(false)

  useEffect(() => {
    api.get('/api/admin/users')
      .then(r => { setEnseignants(r.data.filter(u => u.roles.includes('ROLE_TEACHER'))); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openFiche = (e) => {
    setSelected(e)
    setFicheLoading(true)
    api.get('/api/enseignants/'+e.id).then(r => { setFiche(r.data); setFicheLoading(false) }).catch(() => setFicheLoading(false))
  }

  const filtered = enseignants.filter(e =>
    (e.firstName+' '+e.lastName+' '+e.email).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'8px 12px', marginBottom:14 }}>
        <Search size={15} color={C.muted} strokeWidth={1.8}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un enseignant..."
          style={{ border:'none', background:'transparent', outline:'none', fontSize:14, color:C.text, width:'100%', fontFamily:ft }}/>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:14 }}>
        {[{label:'Total',value:enseignants.length},{label:'Actifs',value:enseignants.filter(e=>e.isActive).length}].map(({label,value})=>(
          <div key={label} style={{ background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'10px 16px' }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}`, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr', padding:'10px 20px', borderBottom:`1px solid ${C.surface2}` }}>
          {['Prénom','Nom','Email','Matières'].map(h=>(
            <div key={h} style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
          ))}
        </div>
        {loading && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Chargement...</div>}
        {!loading && filtered.length===0 && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Aucun enseignant trouvé.</div>}
        {filtered.map((e,i) => (
          <div key={e.id} onClick={() => openFiche(e)}
            style={{ display:'grid', gridTemplateColumns:'2fr 2fr 3fr 2fr', padding:'13px 20px', borderBottom:i<filtered.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center', cursor:'pointer' }}
            onMouseEnter={el=>el.currentTarget.style.background=C.surface2}
            onMouseLeave={el=>el.currentTarget.style.background='transparent'}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <AvatarUser genre={e.genre} isActive={e.isActive} size={28}/>
              <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{e.firstName}</span>
            </div>
            <div style={{ fontSize:13, color:C.text }}>{e.lastName}</div>
            <div style={{ fontSize:13, color:C.muted }}>{e.email}</div>
            <div style={{ fontSize:12, color:C.muted }}>{e.matieres?.join(', ')||'—'}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>{filtered.length} enseignant{filtered.length>1?'s':''}</div>

      {/* Fiche enseignant */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
          <div onClick={()=>{setSelected(null);setFiche(null)}} style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
          <div style={{ width:480, background:C.bg, height:'100vh', overflowY:'auto', padding:28, borderLeft:`1px solid ${C.surface2}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <AvatarUser genre={selected.genre} isActive={selected.isActive} size={52}/>
              <div>
                <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{selected.firstName} {selected.lastName}</div>
                <div style={{ fontSize:13, color:C.muted }}>Enseignant · {selected.genre==='F'?'Femme':selected.genre==='M'?'Homme':'Genre non renseigné'}</div>
              </div>
              <button onClick={()=>{setSelected(null);setFiche(null)}} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:20 }}>✕</button>
            </div>
            {ficheLoading && <div style={{ textAlign:'center', color:C.muted }}>Chargement...</div>}
            {fiche && !ficheLoading && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[{label:'Cours',value:fiche.nbCours},{label:'Élèves',value:fiche.nbEleves},{label:'Notes saisies',value:fiche.nbNotesSaisies}].map(({label,value})=>(
                    <div key={label} style={{ background:C.surface, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.surface2}` }}>
                      <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                      <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Informations</div>
                  {[{label:'Email',value:fiche.email},{label:'Téléphone',value:fiche.telephone||'—'},{label:'Adresse',value:fiche.adresse||'—'},{label:'Naissance',value:fiche.dateNaissance||'—'},{label:'Inscrit le',value:fiche.createdAt}].map(({label,value})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                {fiche.matieres?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Matières</div>
                    {fiche.matieres.map(m=>(
                      <div key={m} style={{ padding:'5px 0', borderBottom:`1px solid ${C.surface2}`, fontSize:13, color:C.text }}>{m}</div>
                    ))}
                  </div>
                )}
                {fiche.classes?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Classes</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {fiche.classes.map(cl=>(
                        <span key={cl} style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:C.surface2, color:C.text }}>{cl}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section Classes ──────────────────────────────────────────
function ClasseSection({ C }) {
  const { hasRole } = useRole()
  const [classes, setClasses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filtreNiveau, setFiltreNiveau] = useState('tous')
  const [sortCol, setSortCol]         = useState('nom')
  const [sortDir, setSortDir]         = useState('asc')
  const [page, setPage]               = useState(1)

  // Navigation cascade
  const [view, setView]               = useState('list')
  const [selectedClasse, setSelectedClasse] = useState(null)
  const [classeDetail, setClasseDetail]     = useState(null)
  const [classeLoading, setClasseLoading]   = useState(false)
  const [selectedApprenant, setSelectedApprenant] = useState(null)
  const [ficheApprenant, setFicheApprenant]       = useState(null)
  const [ficheLoading, setFicheLoading]     = useState(false)
  const [detailMatiere, setDetailMatiere]   = useState(null)
  const [showAbsences, setShowAbsences]     = useState(false)

  const perPage = 10
  const [showCreate, setShowCreate] = useState(false)
  const [newClasse, setNewClasse] = useState({name:'',niveau:''})
  const [creating, setCreating] = useState(false)

  const createClasse = async () => {
    if(!newClasse.name) return
    setCreating(true)
    try {
      await api.post('/api/classes', newClasse)
      api.get('/api/admin/classes').then(r=>setClasses(r.data))
      setNewClasse({name:'',niveau:''})
      setShowCreate(false)
    } catch(e) { console.error(e) }
    setCreating(false)
  }

  useEffect(() => {
    api.get('/api/admin/classes')
      .then(r => { setClasses(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openClasse = (cl) => {
    setSelectedClasse(cl)
    setClasseLoading(true)
    setView('classe')
    api.get('/api/admin/classes/'+cl.id)
      .then(r => { setClasseDetail(r.data); setClasseLoading(false) })
      .catch(() => setClasseLoading(false))
  }

  const openApprenant = (a) => {
    setSelectedApprenant(a)
    setFicheLoading(true)
    setView('apprenant')
    setDetailMatiere(null)
    setShowAbsences(false)
    api.get('/api/apprenants/'+a.id)
      .then(r => { setFicheApprenant(r.data); setFicheLoading(false) })
      .catch(() => setFicheLoading(false))
  }

  const niveaux = [...new Set(classes.map(c => c.niveau).filter(Boolean))]

  const filtered = classes
    .filter(c => (c.nom+' '+c.niveau).toLowerCase().includes(search.toLowerCase()))
    .filter(c => filtreNiveau==='tous' || c.niveau===filtreNiveau)
    .sort((a,b) => {
      const va = (a[sortCol]||'').toString().toLowerCase()
      const vb = (b[sortCol]||'').toString().toLowerCase()
      return sortDir==='asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const paginated = filtered.slice((page-1)*perPage, page*perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  // Breadcrumb
  const Breadcrumb = () => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, fontSize:13 }}>
      <button onClick={()=>setView('list')} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontFamily:ft, fontSize:13, padding:0 }}>Classes</button>
      {view !== 'list' && (
        <>
          <span style={{ color:C.muted }}>/</span>
          <button onClick={()=>setView('classe')} style={{ background:'none', border:'none', cursor:view==='apprenant'?'pointer':'default', color:view==='apprenant'?C.muted:C.text, fontWeight:view==='classe'?600:400, fontFamily:ft, fontSize:13, padding:0 }}>
            {selectedClasse?.nom}
          </button>
        </>
      )}
      {view === 'apprenant' && (
        <>
          <span style={{ color:C.muted }}>/</span>
          <span style={{ color:C.text, fontWeight:600 }}>{selectedApprenant?.firstName} {selectedApprenant?.lastName}</span>
        </>
      )}
    </div>
  )

  return (
    <div>
      {view !== 'list' && <Breadcrumb/>}

      {/* ── Vue liste ── */}
      {view === 'list' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'8px 12px' }}>
                <Search size={15} color={C.muted} strokeWidth={1.8}/>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Rechercher..."
                  style={{ border:'none', background:'transparent', outline:'none', fontSize:13, color:C.text, width:160, fontFamily:ft }}/>
              </div>
              <select value={filtreNiveau} onChange={e=>{setFiltreNiveau(e.target.value);setPage(1)}}
                style={{ padding:'8px 12px', borderRadius:10, border:`1px solid ${C.surface2}`, background:C.surface, color:C.text, fontSize:13, outline:'none' }}>
                <option value="tous">Tous les niveaux</option>
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={()=>setShowCreate(s=>!s)} style={{ padding:'8px 16px', borderRadius:10, border:'none', background:C.text, color:C.bg, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
              + Nouvelle classe
            </button>
          </div>
          {showCreate && (
            <div style={{background:C.surface,borderRadius:16,padding:'14px 16px',border:`1px solid ${C.surface2}`,marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
              <input value={newClasse.name} onChange={e=>setNewClasse(n=>({...n,name:e.target.value}))} placeholder="Nom de la classe *"
                style={{flex:1,padding:'8px 12px',borderRadius:10,border:`1px solid ${C.surface2}`,background:C.bg,color:C.text,fontSize:13,outline:'none'}}/>
              <input value={newClasse.niveau} onChange={e=>setNewClasse(n=>({...n,niveau:e.target.value}))} placeholder="Niveau (ex: 2nde)"
                style={{width:120,padding:'8px 12px',borderRadius:10,border:`1px solid ${C.surface2}`,background:C.bg,color:C.text,fontSize:13,outline:'none'}}/>
              <button onClick={createClasse} disabled={creating||!newClasse.name}
                style={{padding:'8px 14px',borderRadius:10,background:'#166534',color:'#fff',border:'none',fontSize:13,cursor:'pointer',opacity:creating?0.5:1}}>
                {creating?'...':'Créer'}
              </button>
              <button onClick={()=>setShowCreate(false)}
                style={{padding:'8px 14px',borderRadius:10,background:C.surface2,color:C.text,border:'none',fontSize:13,cursor:'pointer'}}>
                ✕
              </button>
            </div>
          )}
          <div style={{ display:'flex', gap:12, marginBottom:14 }}>
            {[{label:'Total',value:classes.length},{label:'Apprenants',value:classes.reduce((s,c)=>s+c.nbApprenants,0)},...niveaux.map(n=>({label:n,value:classes.filter(c=>c.niveau===n).length}))].map(({label,value})=>(
              <div key={label} style={{ background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}`, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1.5fr 3fr', padding:'10px 20px', borderBottom:`1px solid ${C.surface2}` }}>
              {[{label:'Classe',col:'nom'},{label:'Niveau',col:'niveau'},{label:'Apprenants',col:'nbApprenants'},{label:'Cours',col:'nbCours'},{label:'Enseignants',col:null}].map(({label,col})=>(
                <div key={label} onClick={()=>col&&(sortCol===col?setSortDir(d=>d==='asc'?'desc':'asc'):(setSortCol(col),setSortDir('asc')))}
                  style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px', cursor:col?'pointer':'default', userSelect:'none' }}>
                  {label}{col&&sortCol===col?(sortDir==='asc'?' ↑':' ↓'):''}
                </div>
              ))}
            </div>
            {loading && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Chargement...</div>}
            {!loading && filtered.length===0 && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Aucune classe trouvée.</div>}
            {paginated.map((cl,i) => (
              <div key={cl.id} onClick={()=>openClasse(cl)}
                style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1.5fr 1.5fr 3fr', padding:'13px 20px', borderBottom:i<paginated.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center', cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface2}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{cl.nom}</div>
                <div style={{ fontSize:13, color:C.muted }}>{cl.niveau}</div>
                <div style={{ fontSize:13, color:C.text }}>{cl.nbApprenants}</div>
                <div style={{ fontSize:13, color:C.text }}>{cl.nbCours}</div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {cl.enseignants?.slice(0,4).map((e,idx)=>(
                    <div key={e} style={{ width:26, height:26, borderRadius:'50%', background:'#fafafa', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:idx===0?0:-8, zIndex:10-idx, flexShrink:0 }}>
                      <UserRoundCheck size={13} color='#007AFF' strokeWidth={2}/>
                    </div>
                  ))}
                  {cl.enseignants?.length > 4 && <span style={{ fontSize:11, color:C.muted, marginLeft:6 }}>+{cl.enseignants.length-4}</span>}
                  {(!cl.enseignants||cl.enseignants.length===0) && <span style={{ fontSize:12, color:C.muted }}>—</span>}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:12 }}>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  style={{ width:28, height:28, borderRadius:6, border:`1px solid ${C.surface2}`, background:page===p?C.text:'transparent', color:page===p?C.bg:C.text, fontSize:12, cursor:'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Vue classe ── */}
      {view === 'classe' && (
        <div>
          {classeLoading && <div style={{ textAlign:'center', color:C.muted, padding:40 }}>Chargement...</div>}
          {classeDetail && !classeLoading && (
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:'-0.4px' }}>{classeDetail.nom}</div>
                <div style={{ fontSize:13, color:C.muted }}>{classeDetail.niveau} · {classeDetail.anneeScolaire}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12, marginBottom:20 }}>
                {[{label:'Apprenants',value:classeDetail.nbApprenants},{label:'Moyenne classe',value:classeDetail.moyenneClasse!=null?`${classeDetail.moyenneClasse}/20`:'—'},{label:'Cours',value:classeDetail.nbCours},{label:'Matières',value:classeDetail.matieres?.length||0}].map(({label,value})=>(
                  <div key={label} style={{ background:C.surface, borderRadius:12, padding:'14px 16px', border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}`, overflow:'hidden', marginBottom:16 }}>
                <div style={{ padding:'12px 20px', borderBottom:`1px solid ${C.surface2}`, fontSize:13, fontWeight:600, color:C.text }}>
                  Apprenants ({classeDetail.nbApprenants})
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 2fr 1fr', padding:'8px 20px', borderBottom:`1px solid ${C.surface2}` }}>
                  {['Prénom','Nom','Email','Moyenne'].map(h=>(
                    <div key={h} style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
                  ))}
                </div>
                {classeDetail.apprenants?.length===0 && <div style={{ padding:20, textAlign:'center', color:C.muted }}>Aucun apprenant</div>}
                {classeDetail.apprenants?.map((a,i) => (
                  <div key={a.id} onClick={()=>openApprenant(a)}
                    style={{ display:'grid', gridTemplateColumns:'2fr 2fr 2fr 1fr', padding:'12px 20px', borderBottom:i<classeDetail.apprenants.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center', cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.surface2}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <AvatarUser genre={a.genre} isActive={a.isActive} size={28}/>
                      <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{a.firstName}</span>
                    </div>
                    <div style={{ fontSize:13, color:C.text }}>{a.lastName}</div>
                    <div style={{ fontSize:13, color:C.muted }}>{a.email||'—'}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:a.moyenne!=null?(a.moyenne>=10?'#22C55E':'#FF3B30'):C.muted }}>
                      {a.moyenne!=null?`${a.moyenne}/20`:'—'}
                    </div>
                  </div>
                ))}
              </div>
              {classeDetail.matieres?.length > 0 && (
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Matières enseignées</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {classeDetail.matieres.map(m=>(
                      <span key={m} style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:C.surface2, color:C.text }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Vue apprenant ── */}
      {view === 'apprenant' && (
        <div>
          {ficheLoading && <div style={{ textAlign:'center', color:C.muted, padding:40 }}>Chargement...</div>}
          {ficheApprenant && !ficheLoading && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                <AvatarUser genre={ficheApprenant.genre} isActive={ficheApprenant.isActive} size={52}/>
                <div>
                  <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{ficheApprenant.firstName} {ficheApprenant.lastName}</div>
                  <div style={{ fontSize:13, color:C.muted }}>{ficheApprenant.classe?.nom||'—'} · {ficheApprenant.genre==='F'?'Fille':ficheApprenant.genre==='M'?'Garçon':'Genre non renseigné'}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                {[{label:'Moyenne',value:ficheApprenant.moyenne!=null?`${ficheApprenant.moyenne}/20`:'—'},{label:'Absences',value:ficheApprenant.nbAbsences},{label:'Retards',value:ficheApprenant.nbRetards}].map(({label,value})=>(
                  <div key={label} style={{ background:C.surface, borderRadius:12, padding:'14px 16px', border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Informations personnelles</div>
                  {[{label:'Email',value:ficheApprenant.email},{label:'Naissance',value:ficheApprenant.dateNaissance||'—'},{label:'Téléphone',value:ficheApprenant.telephone||'—'},{label:'Adresse',value:ficheApprenant.adresse||'—'},{label:'Inscrit le',value:ficheApprenant.createdAt}].map(({label,value})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Parent / Tuteur</div>
                  {[{label:'Nom',value:ficheApprenant.parentNom||'—'},{label:'Email',value:ficheApprenant.parentEmail||'—'},{label:'Téléphone',value:ficheApprenant.parentTelephone||'—'}].map(({label,value})=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.surface2}` }}>
                      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
                      <span style={{ fontSize:13, color:C.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                {ficheApprenant.moyennesParMatiere?.length > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Notes par matière</div>
                    {ficheApprenant.moyennesParMatiere.map(m => (
                      <div key={m.matiere}>
                        <div onClick={()=>setDetailMatiere(detailMatiere===m.matiere?null:m.matiere)}
                          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.surface2}`, cursor:'pointer' }}>
                          <div>
                            <div style={{ fontSize:13, color:C.text }}>{m.matiere}</div>
                            <div style={{ fontSize:11, color:C.muted }}>{m.nbNotes} note{m.nbNotes>1?'s':''}</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontWeight:700, color:m.moyenne>=10?'#22C55E':'#FF3B30' }}>{m.moyenne}/20</span>
                            {detailMatiere===m.matiere ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                          </div>
                        </div>
                        {detailMatiere===m.matiere && (
                          <div style={{ background:C.surface2, borderRadius:8, padding:'8px 12px', margin:'4px 0' }}>
                            {ficheApprenant.notes?.filter(n=>n.matiere===m.matiere).map(n => (
                              <div key={n.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${C.surface2}` }}>
                                <div>
                                  <div style={{ fontSize:12, color:C.text }}>{n.typeEvaluation||'Évaluation'} · {n.createdAt}</div>
                                  {n.commentaire && <div style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>{n.commentaire}</div>}
                                </div>
                                <div style={{ fontSize:14, fontWeight:700, color:n.valeur/n.noteSur>=0.5?'#22C55E':'#FF3B30' }}>{n.valeur}/{n.noteSur}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {ficheApprenant.nbAbsences > 0 && (
                  <div style={{ background:C.surface, borderRadius:12, padding:16, border:`1px solid ${C.surface2}` }}>
                    <div onClick={()=>setShowAbsences(s=>!s)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Absences</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'#FF3B30' }}>{ficheApprenant.nbAbsences}</span>
                        {showAbsences ? <ChevronUp size={14} color={C.muted}/> : <ChevronDown size={14} color={C.muted}/>}
                      </div>
                    </div>
                    {showAbsences && (
                      <div style={{ marginTop:10 }}>
                        {ficheApprenant.absences.map(a => (
                          <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${C.surface2}` }}>
                            <div>
                              <div style={{ fontSize:13, color:C.text }}>{a.date}</div>
                              {a.motif && <div style={{ fontSize:11, color:C.muted }}>{a.motif}</div>}
                            </div>
                            <span style={{ fontSize:12, color:a.justifiee?'#34C759':'#FF3B30' }}>{a.justifiee?'Justifiée':'Non justifiée'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button style={{ width:'100%', padding:'12px 0', borderRadius:10, border:`1px solid ${C.surface2}`, background:'none', color:C.muted, fontSize:13, cursor:'not-allowed' }}>
                  Bulletin scolaire — pas encore disponible
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}



// ─── Drill-down Classes ───────────────────────────────────────
function ClasseDrillDown({ C }) {
  const [classes, setClasses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedClasse, setSelectedClasse] = useState(null)
  const [apprenants, setApprenants]   = useState([])
  const [appLoading, setAppLoading]   = useState(false)

  useEffect(() => {
    api.get('/api/admin/classes')
      .then(r => { setClasses(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openClasse = (cl) => {
    setSelectedClasse(cl)
    setAppLoading(true)
    api.get('/api/admin/classes/'+cl.id)
      .then(r => { setApprenants(r.data.apprenants||[]); setAppLoading(false) })
      .catch(() => setAppLoading(false))
  }

  if (loading) return <div style={{ textAlign:'center', color:'#888', padding:16 }}>Chargement...</div>

  return (
    <div>
      <div style={{ fontSize:13, fontWeight:600, color:'#111', marginBottom:12 }}>
        {selectedClasse ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => setSelectedClasse(null)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:13, padding:0 }}>
              Classes
            </button>
            <span style={{ color:'#ccc' }}>/</span>
            <span style={{ color:'#111' }}>{selectedClasse.nom}</span>
          </div>
        ) : 'Toutes les classes'}
      </div>

      {!selectedClasse && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {classes.map(cl => (
            <div key={cl.id} onClick={() => openClasse(cl)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#f9f9f9', borderRadius:10, cursor:'pointer', border:'1px solid #eee' }}
              onMouseEnter={e => e.currentTarget.style.background='#f0f0f0'}
              onMouseLeave={e => e.currentTarget.style.background='#f9f9f9'}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#111' }}>{cl.nom}</div>
                <div style={{ fontSize:12, color:'#888' }}>{cl.niveau}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#111' }}>{cl.nbApprenants} appr.</span>
                <span style={{ fontSize:16, color:'#ccc' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedClasse && (
        <div>
          {appLoading && <div style={{ textAlign:'center', color:'#888', padding:16 }}>Chargement...</div>}
          {!appLoading && apprenants.length === 0 && <div style={{ textAlign:'center', color:'#888', padding:16 }}>Aucun apprenant</div>}
          {!appLoading && apprenants.map((a,i) => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:i%2===0?'#f9f9f9':'#fff', borderRadius:10, marginBottom:4, border:'1px solid #eee' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#fafafa', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {a.isActive
                    ? <UserRoundCheck size={15} color={a.genre==='F'?'#FF3B9A':'#007AFF'} strokeWidth={2}/>
                    : <UserRoundX size={15} color='#FF3B30' strokeWidth={2}/>
                  }
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, color:'#111' }}>{a.firstName} {a.lastName}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{a.email||'—'}</div>
                </div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:a.moyenne!=null?(a.moyenne>=10?'#22C55E':'#FF3B30'):'#ccc' }}>
                {a.moyenne!=null?`${a.moyenne}/20`:'—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


// ─── Modal détail générique ───────────────────────────────────
function DetailModal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:28, width:'90vw', maxWidth:700, maxHeight:'85vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#111' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Détail Effectifs ─────────────────────────────────────────
function EffectifsDetail({ stats, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = stats.effectifs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <DetailModal title="Effectifs par classe" onClose={onClose}>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f9f9f9', borderRadius:10, padding:'8px 12px', marginBottom:16 }}>
        <Search size={15} color="#888" strokeWidth={1.8}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une classe..."
          style={{ border:'none', background:'transparent', outline:'none', fontSize:13, width:'100%', fontFamily:ft }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[{label:'Total classes',value:stats.effectifs.length},{label:'Total apprenants',value:stats.effectifs.reduce((s,c)=>s+c.total,0)},{label:'Actifs',value:stats.effectifs.reduce((s,c)=>s+c.actifs,0)}].map(({label,value})=>(
          <div key={label} style={{ background:'#f9f9f9', borderRadius:12, padding:'12px 14px', border:'1px solid #eee' }}>
            <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:'#111' }}>{value}</div>
          </div>
        ))}
      </div>
      {filtered.map((cl,i) => (
        <div key={cl.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:i%2===0?'#f9f9f9':'#fff', borderRadius:10, marginBottom:4, border:'1px solid #eee' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#111' }}>{cl.name}</div>
          <div style={{ display:'flex', gap:16 }}>
            <span style={{ fontSize:13, color:'#888' }}>Total : <b style={{ color:'#111' }}>{cl.total}</b></span>
            <span style={{ fontSize:13, color:'#22C55E' }}>Actifs : <b>{cl.actifs}</b></span>
            <span style={{ fontSize:13, color:'#FF3B30' }}>Inactifs : <b>{cl.inactifs}</b></span>
          </div>
        </div>
      ))}
    </DetailModal>
  )
}

// ─── Détail Moyennes ──────────────────────────────────────────
function MoyennesDetail({ stats, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = [...stats.moyennes].filter(c => c.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.moyenne-a.moyenne)
  return (
    <DetailModal title="Moyennes par classe et matière" onClose={onClose}>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f9f9f9', borderRadius:10, padding:'8px 12px', marginBottom:16 }}>
        <Search size={15} color="#888" strokeWidth={1.8}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
          style={{ border:'none', background:'transparent', outline:'none', fontSize:13, width:'100%', fontFamily:ft }}/>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:'#111', marginBottom:10 }}>Par classe</div>
      {filtered.map((cl,i) => (
        <div key={cl.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:i%2===0?'#f9f9f9':'#fff', borderRadius:10, marginBottom:4, border:'1px solid #eee' }}>
          <div style={{ width:100, fontSize:14, fontWeight:600, color:'#111', flexShrink:0 }}>{cl.name}</div>
          <div style={{ flex:1, height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${(cl.moyenne/20)*100}%`, height:'100%', background:cl.moyenne>=10?'#22C55E':'#FF3B30', borderRadius:4 }}/>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:cl.moyenne>=10?'#22C55E':'#FF3B30', flexShrink:0 }}>{cl.moyenne}/20</div>
        </div>
      ))}
      <div style={{ fontSize:13, fontWeight:600, color:'#111', margin:'16px 0 10px' }}>Par matière</div>
      {stats.parMatiere.sort((a,b)=>b.moyenne-a.moyenne).map((m,i) => (
        <div key={m.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:i%2===0?'#f9f9f9':'#fff', borderRadius:10, marginBottom:4, border:'1px solid #eee' }}>
          <div style={{ width:160, fontSize:14, fontWeight:500, color:'#111', flexShrink:0 }}>{m.name}</div>
          <div style={{ flex:1, height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${(m.moyenne/20)*100}%`, height:'100%', background:'#8B5CF6', borderRadius:4 }}/>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:'#8B5CF6', flexShrink:0 }}>{m.moyenne}/20</div>
        </div>
      ))}
    </DetailModal>
  )
}

// ─── Détail Assiduité ─────────────────────────────────────────
function AssiduitéDetail({ stats, onClose }) {
  const total_abs = stats.absences.reduce((s,c)=>s+c.absences,0)
  const total_ret = stats.retards.reduce((s,c)=>s+c.retards,0)
  return (
    <DetailModal title="Assiduité par classe" onClose={onClose}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
        {[{label:'Total absences',value:total_abs,color:'#FF3B30'},{label:'Total retards',value:total_ret,color:'#FF9500'}].map(({label,value,color})=>(
          <div key={label} style={{ background:'#f9f9f9', borderRadius:12, padding:'12px 14px', border:'1px solid #eee' }}>
            <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>
      {stats.absences.map((cl,i) => {
        const ret = stats.retards.find(r=>r.name===cl.name)
        return (
          <div key={cl.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:i%2===0?'#f9f9f9':'#fff', borderRadius:10, marginBottom:4, border:'1px solid #eee' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#111' }}>{cl.name}</div>
            <div style={{ display:'flex', gap:16 }}>
              <span style={{ fontSize:13, color:'#FF3B30' }}>Absences : <b>{cl.absences}</b></span>
              <span style={{ fontSize:13, color:'#FF9500' }}>Retards : <b>{ret?.retards||0}</b></span>
            </div>
          </div>
        )
      })}
    </DetailModal>
  )
}

// ─── Section Statistiques ────────────────────────────────────
function StatsSection({ C, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEffectifs, setShowEffectifs] = useState(false)
  const [showMoyennes, setShowMoyennes] = useState(false)
  const [showAssiduite, setShowAssiduite] = useState(false)

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign:'center', color:C.muted, padding:40 }}>Chargement...</div>
  if (!stats) return null

  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Bloc 1 — Effectifs */}
      <div style={{ background:C.surface, borderRadius:16, padding:20, border:`1px solid ${C.surface2}` }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>Effectifs</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Répartition des apprenants par classe</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <ChartCard title="Total par classe" data={stats.effectifs} dataKey="total" type="bar" color="#007AFF" C={C} onDetail={() => setShowEffectifs(true)}/>
          <ChartCard title="Actifs vs Inactifs" data={stats.effectifs} dataKey="actifs" type="bar" color="#22C55E" C={C} onDetail={() => setShowEffectifs(true)}/>
        </div>
      </div>

      {/* Bloc 2 — Performance */}
      <div style={{ background:C.surface, borderRadius:16, padding:20, border:`1px solid ${C.surface2}` }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>Performance</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Moyennes académiques</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <ChartCard title="Moyenne par classe" data={stats.moyennes} dataKey="moyenne" type="bar" color="#FF9500" C={C} onDetail={() => setShowMoyennes(true)}/>
          <ChartCard title="Moyenne par matière" data={stats.parMatiere} dataKey="moyenne" type="bar" color="#8B5CF6" C={C} onDetail={() => setShowMoyennes(true)}/>
        </div>
      </div>

      {/* Bloc 3 — Assiduité */}
      <div style={{ background:C.surface, borderRadius:16, padding:20, border:`1px solid ${C.surface2}` }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>Assiduité</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Absences et retards par classe</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <ChartCard title="Absences par classe" data={stats.absences} dataKey="absences" type="bar" color="#FF3B30" C={C} onDetail={() => setShowAssiduite(true)}/>
          <ChartCard title="Retards par classe" data={stats.retards} dataKey="retards" type="bar" color="#FF9500" C={C} onDetail={() => setShowAssiduite(true)}/>
        </div>
      </div>

    </div>
    {showEffectifs && <EffectifsDetail stats={stats} onClose={() => setShowEffectifs(false)}/>}
    {showMoyennes && <MoyennesDetail stats={stats} onClose={() => setShowMoyennes(false)}/>}
    {showAssiduite && <AssiduitéDetail stats={stats} onClose={() => setShowAssiduite(false)}/>}
    </>
  )
}

// ─── Section Accueil ──────────────────────────────────────────
function AccueilSection({ C }) {
  const [users, setUsers]     = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/classes')
    ]).then(([ru, rc]) => {
      setUsers(ru.data)
      setClasses(rc.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const apprenants  = users.filter(u => u.roles.includes('ROLE_STUDENT'))
  const enseignants = users.filter(u => u.roles.includes('ROLE_TEACHER'))
  const nbActifs    = apprenants.filter(u => u.isActive).length

  const classeData  = classes.map(c => ({ name:c.nom, apprenants:c.nbApprenants, cours:c.nbCours, moyenne:c.moyenneClasse||0 }))

  const kpis = [
    { label:'Apprenants', value:apprenants.length, color:'#166534' },
    { label:'Enseignants', value:enseignants.length, color:'#166534' },
    { label:'Classes', value:classes.length, color:'#FF9500' },
    { label:'Actifs', value:nbActifs, color:'#166534' },
  ]

  if (loading) return <div style={{ textAlign:'center', color:C.muted, padding:40 }}>Chargement...</div>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, paddingTop:8 }}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:14 }}>
        {kpis.map(({ label, value, color }) => (
          <div key={label} style={{ background:C.surface, borderRadius:20, padding:'16px 18px', border:`1px solid ${C.surface2}` }}>
            <div style={{ fontSize:30, fontWeight:400, color, letterSpacing:'-1px', fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" }}>{value}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.surface, borderRadius:16, padding:20, border:`1px solid ${C.surface2}` }}>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:16 }}>Statistiques</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <ChartCard title="Apprenants par classe" data={classeData} dataKey="apprenants" type="bar" color="#007AFF" C={C}/>
          <ChartCard title="Moyennes par classe" data={classeData} dataKey="moyenne" type="bar" color="#22C55E" C={C}/>
          <div style={{ gridColumn:'1 / -1' }}>
            <ChartCard title="Cours par classe" data={classeData} dataKey="cours" type="line" color="#FF9500" C={C}/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard principal ──────────────────────────────────────

function AbsencesAdmin({ C }) {
  const [absences, setAbsences] = useState([])
  const [filtre, setFiltre] = useState('en_attente') // en_attente, toutes
  const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"

  useEffect(() => {
    api.get('/api/absences').then(r => setAbsences(r.data)).catch(()=>{})
  }, [])

  const list = filtre === 'en_attente'
    ? absences.filter(a => a.statutJustification === 'en_attente')
    : absences

  const valider = async (id, statut) => {
    try {
      await api.patch('/api/absences/'+id+'/justifier', { statut })
      setAbsences(prev => prev.map(a => a.id===id ? {...a, statutJustification: statut, justifiee: statut==='acceptee'} : a))
    } catch(e) { console.error(e) }
  }

  const STATUT_C = { en_attente:'#FF9500', acceptee:'#166534', refusee:'#FF3B30', non_soumise:'#8e8e93' }
  const STATUT_L = { en_attente:'En attente', acceptee:'Acceptée', refusee:'Refusée', non_soumise:'Non soumise' }

  return (
    <div style={{fontFamily:ft}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{display:'flex',gap:8}}>
          {['en_attente','toutes'].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:'6px 14px',borderRadius:10,border:'none',fontSize:12,fontWeight:500,cursor:'pointer',
                background:filtre===f?C.text:C.surface2, color:filtre===f?C.bg:C.text}}>
              {f==='en_attente'?'En attente':'Toutes'}
            </button>
          ))}
        </div>
      </div>

      {list.length===0 && <div style={{textAlign:'center',color:C.muted,padding:40,fontSize:13}}>
        {filtre==='en_attente'?'Aucune justification en attente':'Aucune absence'}
      </div>}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {list.map(a=>(
          <div key={a.id} style={{background:C.surface,borderRadius:16,padding:'14px 16px',border:`1px solid ${C.surface2}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:500,color:C.text}}>{a.eleve?.firstName} {a.eleve?.lastName}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{a.date} {a.motif?'· '+a.motif:''}</div>
                {a.motifJustification&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>Motif : {a.motifJustification}</div>}
                {a.typeJustification&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>Type : {a.typeJustification}</div>}
              </div>
              <div style={{padding:'3px 10px',borderRadius:999,background:STATUT_C[a.statutJustification||'non_soumise']+'20',color:STATUT_C[a.statutJustification||'non_soumise'],fontSize:11,fontWeight:600}}>
                {STATUT_L[a.statutJustification||'non_soumise']}
              </div>
            </div>
            {a.statutJustification==='en_attente'&&(
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button onClick={()=>valider(a.id,'acceptee')}
                  style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:'rgba(22,101,52,0.15)',color:'#166534',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  Accepter
                </button>
                <button onClick={()=>valider(a.id,'refusee')}
                  style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:'#FF3B3020',color:'#FF3B30',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  Refuser
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const darkMode  = useThemeStore(s => s.darkMode)
  const C         = darkMode ? DARK_THEME : LIGHT_THEME
  const { roles } = useRole()

  const nav = NAV_ALL.filter(n => n.roles.some(r => roles.includes(r)))
  const roleLabel = ROLE_LABEL[roles.find(r => ROLE_LABEL[r])] || 'Administration'

  const [activeSection, setActiveSection] = useState(null)
  return (
    <DashboardLayout nav={nav} role={roleLabel} defaultActive={activeSection}>
      {(active, C) => (
        <>
          {active === 'accueil'     && <AccueilSection C={C}/>}
          {active === 'apprenants'  && <ApprenantSection C={C}/>}
          {active === 'enseignants' && <EnseignantSection C={C}/>}
          {active === 'classes'     && <ClasseSection C={C}/>}
          {active === 'absences'    && <AbsencesAdmin C={C}/>}
          {active === 'messages'    && <Conversations/>}
          {active === 'stats'       && <StatsSection C={C} onNavigate={(id) => { /* naviguer via layout */ document.querySelector(`[data-nav='${id}']`)?.click() }}/> }
          {active === 'edt' && <EdtSection C={C}/>}
          {active !== 'accueil' && active !== 'apprenants' && active !== 'enseignants' && active !== 'classes' && active !== 'stats' && active !== 'edt' && active !== 'messages' && active !== 'absences' && (
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
