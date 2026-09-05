import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import { Home, Users, Settings, LogOut, ChevronLeft, ChevronRight, Bell, Moon, Sun, Shield, Database, Activity } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"

const NAV = [
  { id:'accueil',      label:'Accueil',           icon:Home },
  { id:'utilisateurs', label:'Utilisateurs',       icon:Users },
  { id:'securite',     label:'Sécurité',           icon:Shield },
  { id:'base',         label:'Base de données',    icon:Database },
  { id:'demandes',     label:'Demandes modification', icon:Shield },
  { id:'logs',         label:'Activité système',   icon:Activity },
  { id:'params',       label:'Paramètres',         icon:Settings },
]

function DemandesSection({ C }) {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [processing, setProcessing]   = useState(false)

  const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"

  const charger = () => {
    api.get('/api/demandes').then(r => { setDemandes(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }

  useEffect(() => { charger() }, [])

  const traiter = async (action) => {
    setProcessing(true)
    try {
      await api.post(`/api/demandes/${selected.id}/traiter`, { action, commentaire })
      charger()
      setSelected(null)
      setCommentaire('')
    } catch {}
    setProcessing(false)
  }

  const statuts = { en_attente:'En attente', approuvee:'Approuvée', rejetee:'Rejetée' }
  const colors  = { en_attente:'#FF9500', approuvee:'#22C55E', rejetee:'#FF3B30' }

  return (
    <div>
      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
        {[{label:'Total',value:demandes.length},{label:'En attente',value:demandes.filter(d=>d.statut==='en_attente').length},{label:'Approuvées',value:demandes.filter(d=>d.statut==='approuvee').length},{label:'Rejetées',value:demandes.filter(d=>d.statut==='rejetee').length}].map(({label,value})=>(
          <div key={label} style={{ background:C.surface, border:`1px solid ${C.surface2}`, borderRadius:10, padding:'10px 16px' }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.surface, borderRadius:12, border:`1px solid ${C.surface2}`, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 2fr 1.5fr 1fr', padding:'10px 20px', borderBottom:`1px solid ${C.surface2}` }}>
          {['Demandeur','Champ','Nouvelle valeur','Date','Statut'].map(h=>(
            <div key={h} style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</div>
          ))}
        </div>
        {loading && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Chargement...</div>}
        {!loading && demandes.length===0 && <div style={{ padding:24, textAlign:'center', color:C.muted }}>Aucune demande.</div>}
        {demandes.map((d,i) => (
          <div key={d.id} onClick={()=>{ setSelected(d); setCommentaire('') }}
            style={{ display:'grid', gridTemplateColumns:'2fr 2fr 2fr 1.5fr 1fr', padding:'13px 20px', borderBottom:i<demandes.length-1?`1px solid ${C.surface2}`:'none', alignItems:'center', cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.surface2}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{d.demandeur}</div>
            <div style={{ fontSize:13, color:C.muted }}>{d.champ}</div>
            <div style={{ fontSize:13, color:C.text }}>{d.nouvelleValeur}</div>
            <div style={{ fontSize:12, color:C.muted }}>{d.createdAt}</div>
            <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:colors[d.statut]+'20', color:colors[d.statut] }}>
              {statuts[d.statut]}
            </span>
          </div>
        ))}
      </div>

      {/* Panneau traitement */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
          <div style={{ flex:1, background:'rgba(0,0,0,0.4)' }}/>
          <div onClick={e=>e.stopPropagation()} style={{ width:440, background:C.bg, height:'100vh', overflowY:'auto', padding:28, borderLeft:`1px solid ${C.surface2}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Traiter la demande</div>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:20 }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[{label:'Demandeur',value:selected.demandeur},{label:'Champ',value:selected.champ},{label:'Nouvelle valeur',value:selected.nouvelleValeur},{label:'Message',value:selected.message||'—'},{label:'Soumis le',value:selected.createdAt}].map(({label,value})=>(
                <div key={label} style={{ background:C.surface, borderRadius:10, padding:'10px 14px', border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:13, color:C.text }}>{value}</div>
                </div>
              ))}
              {selected.justificatifPath && (
                <div style={{ background:C.surface, borderRadius:10, padding:'10px 14px', border:`1px solid ${C.surface2}` }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Justificatif</div>
                  {selected.justificatifPath.match(/.(jpg|jpeg|png|webp)$/i)
                    ? <img src={'http://127.0.0.1:8000'+selected.justificatifPath} alt="justificatif" style={{ width:'100%', borderRadius:8, maxHeight:300, objectFit:'contain' }}/>
                    : <a href={'http://127.0.0.1:8000'+selected.justificatifPath} target="_blank" rel="noreferrer"
                        style={{ fontSize:13, color:'#007AFF', textDecoration:'none' }}>
                        Ouvrir le fichier PDF
                      </a>
                  }
                </div>
              )}
              {!selected.justificatifPath && selected.champ !== 'Email' && (
                <div style={{ background:C.surface, borderRadius:10, padding:'10px 14px', border:`1px solid ${C.surface2}`, color:C.muted, fontSize:13 }}>
                  Aucun justificatif joint.
                </div>
              )}
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>Commentaire (optionnel)</div>
                <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} rows={3}
                  placeholder="Motif de l'approbation ou du rejet..."
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:`1px solid ${C.surface2}`, background:C.bg, color:C.text, fontSize:13, fontFamily:ft, outline:'none', resize:'none', boxSizing:'border-box' }}/>
              </div>
              {selected.statut === 'en_attente' && (
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>traiter('rejeter')} disabled={processing}
                    style={{ flex:1, padding:'11px 0', borderRadius:10, border:'1px solid #FF3B30', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
                    Rejeter
                  </button>
                  <button onClick={()=>traiter('approuver')} disabled={processing}
                    style={{ flex:1, padding:'11px 0', borderRadius:10, border:'none', background:'#22C55E', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}>
                    {processing?'Traitement...':'Approuver'}
                  </button>
                </div>
              )}
              {selected.statut !== 'en_attente' && (
                <div style={{ padding:'12px 14px', borderRadius:10, background:selected.statut==='approuvee'?'#ECFDF5':'#FFF0F0', color:selected.statut==='approuvee'?'#22C55E':'#FF3B30', fontSize:13 }}>
                  Déjà traitée — {statuts[selected.statut]}
                  {selected.traitePar && ` par ${selected.traitePar}`}
                  {selected.commentaire && ` : "${selected.commentaire}"`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SuperAdminDashboard() {
  const { user }       = useAuth()
  const darkMode       = useThemeStore(s => s.darkMode)
  const toggleDarkMode = useThemeStore(s => s.toggleDarkMode)
  const C              = darkMode ? DARK_THEME : LIGHT_THEME
  const [active, setActive]       = useState('accueil')
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href='/' }
  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase()

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:ft, background:C.bg, color:C.text, overflow:'hidden' }}>

      {/* Sidebar */}
      <div style={{ width:collapsed?60:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.surface2}`, display:'flex', flexDirection:'column', padding:'18px 10px', transition:'width 0.25s ease', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, padding:'0 4px' }}>
          {!collapsed && <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.4px', color:C.text }}>Miralabs.</div>}
          <button onClick={() => setCollapsed(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, marginLeft:collapsed?'auto':0 }}>
            {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
        </div>

        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ id, label, icon:Icon }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => setActive(id)}
                style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'9px 12px', borderRadius:8, border:'none', background:isActive?C.surface2:'transparent', color:isActive?C.text:C.muted, fontSize:13, fontWeight:isActive?600:400, cursor:'pointer', fontFamily:ft, width:'100%' }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background=C.surface)}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background='transparent')}>
                <Icon size={18} strokeWidth={1.8}/>
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ borderTop:`1px solid ${C.surface2}`, paddingTop:12 }}>
          <button onClick={toggleDarkMode} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:ft, width:'100%', marginBottom:4 }}>
            {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
            {!collapsed && (darkMode?'Mode clair':'Mode sombre')}
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {initials}
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize:11, color:C.muted }}>Responsable Informatique</div>
              </div>
            )}
          </div>
          <button onClick={logout} style={{ display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'10px 0':'8px 12px', borderRadius:8, border:'none', background:'none', color:'#FF3B30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft, width:'100%' }}>
            <LogOut size={16}/>{!collapsed && 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:`1px solid ${C.surface2}`, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.text }}>{NAV.find(n=>n.id===active)?.label}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={18} color={C.muted} strokeWidth={1.5}/>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>{initials}</div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {active === 'accueil' && (
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:'-0.4px', marginBottom:4 }}>Bonjour, {user?.firstName} </h1>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16 }}>
                {[
                  { label:'Utilisateurs actifs', icon:Users, color:'#007AFF' },
                  { label:'Connexions aujourd\'hui', icon:Activity, color:'#34C759' },
                  { label:'Alertes sécurité', icon:Shield, color:'#FF3B30' },
                  { label:'Santé système', icon:Database, color:'#FF9500' },
                ].map(({ label, icon:Icon, color }) => (
                  <div key={label} style={{ background:C.surface, borderRadius:14, padding:'18px 20px', border:`1px solid ${C.surface2}` }}>
                    <Icon size={18} color={color} strokeWidth={1.8} style={{ marginBottom:12 }}/>
                    <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:C.text }}>—</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {active === 'demandes' && <DemandesSection C={C}/>}
      {active !== 'accueil' && active !== 'demandes' && (
            <div style={{ background:C.surface, borderRadius:14, padding:24, border:`1px solid ${C.surface2}` }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:8 }}>En cours de développement</div>
              <div style={{ fontSize:13, color:C.muted }}>Cette section sera disponible prochainement.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
