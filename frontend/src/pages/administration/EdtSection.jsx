import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Trash2, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
const timeToTop = (t) => { const [h,m]=t.split(':').map(Number); return(h*60+m) }
const durToH = (s,e) => { const [sh,sm]=s.split(':').map(Number),[eh,em]=e.split(':').map(Number); return(eh*60+em)-(sh*60+sm) }

const JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
const HOURS = Array.from({length:28},(_,i)=>i/2+7) // 7h à 21h par tranches de 30min
const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FF3B30','#F7DC6F','#26de81']
const RED = '#FF3B30'

export default function EdtSection({ C }) {
  const [cours,       setCours]       = useState([])
  const [classes,     setClasses]     = useState([])
  const [matieres,    setMatieres]    = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [absences,    setAbsences]    = useState([])
  const [showForm,    setShowForm]    = useState(false)
  const [editCours,   setEditCours]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [selectedJour, setSelectedJour] = useState(null)
  const [filtreClasse, setFiltreClasse] = useState('')
  const [form, setForm] = useState({
    jourSemaine:1, heureDebut:'08:00', heureFin:'10:00',
    salle:'', matiereId:'', classeId:'', enseignantId:'', couleur:'#FF6B6B'
  })

  const matColors = {}
  let ci = 0
  cours.forEach(c => { if(!matColors[c.matiere?.nom]) { matColors[c.matiere?.nom]=COLORS[ci%COLORS.length]; ci++ } })

  const load = async () => {
    setLoading(true)
    try {
      const [c, cl, m, u, a] = await Promise.all([
        api.get('/api/cours/admin/all'),
        api.get('/api/admin/classes'),
        api.get('/api/matieres').catch(()=>({data:[]})),
        api.get('/api/admin/users'),
        api.get('/api/absences').catch(()=>({data:[]})),
      ])
      setCours(c.data)
      setClasses(cl.data)
      setMatieres(m.data)
      setEnseignants((u.data||[]).filter(u=>u.roles?.includes('ROLE_TEACHER')))
      setAbsences(a.data||[])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    try {
      const payload = {
        ...form,
        couleur: form.couleur,
        jourSemaine: parseInt(form.jourSemaine),
        matiereId:   parseInt(form.matiereId),
        classeId:    form.classeId ? parseInt(form.classeId) : null,
        enseignantId:form.enseignantId ? parseInt(form.enseignantId) : null,
      }
      if (editCours) await api.put('/api/cours/'+editCours.id, payload)
      else await api.post('/api/cours', payload)
      setShowForm(false); setEditCours(null)
      setForm({ jourSemaine:1, heureDebut:'08:00', heureFin:'10:00', salle:'', matiereId:'', classeId:'', enseignantId:'' })
      load()
    } catch(e) { console.error(e) }
  }

  const deleteCours = async (id) => {
    if (!confirm('Supprimer ce cours ?')) return
    await api.delete('/api/cours/'+id); load()
  }

  const openEdit = (c) => {
    setEditCours(c)
    setForm({ jourSemaine:c.jourSemaine, heureDebut:c.heureDebut, heureFin:c.heureFin,
      salle:c.salle||'', matiereId:c.matiere?.id||'', classeId:c.classe?.id||'', enseignantId:c.enseignant?.id||'' })
    setShowForm(true)
  }

function Inp({label, k, type='text', opts=null, form, setForm}) {
  return <div style={{marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:600,color:'#6e6e73',marginBottom:6}}>{label}</div>
      {opts ? (
        <div style={{position:'relative'}}>
          <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
            style={{width:'100%',padding:'10px 12px',paddingRight:36,borderRadius:12,border:'1.5px solid #e5e5ea',background:'#fff',color:form[k]?'#1d1d1f':'#aeaeb2',fontSize:14,boxSizing:'border-box',outline:'none',appearance:'none',WebkitAppearance:'none',cursor:'pointer'}}>
            <option value="">Choisir...</option>
            {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <svg style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      ) : (
        <input type={type} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} maxLength={k==='salle'?10:undefined}
          style={{width:'100%',padding:'10px 12px',borderRadius:12,border:'1px solid #e5e5ea',background:'#fff',color:'#1d1d1f',fontSize:14,boxSizing:'border-box',outline:'none'}}/>
      )}
  </div>
}

  const coursFiltres = filtreClasse ? cours.filter(c=>c.classe?.id===parseInt(filtreClasse)) : cours
  const jours = selectedJour !== null ? [selectedJour] : Array.from({length:7},(_,i)=>i)

  if (loading) return <div style={{color:C.muted,fontSize:13,padding:20}}>Chargement...</div>

  return (
    <div style={{fontFamily:ft}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.text}}>Emploi du temps</div>
          <div style={{fontSize:12,color:C.muted}}>{cours.length} cours · {classes.length} classes</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{position:'relative'}}>
            <select value={filtreClasse} onChange={e=>setFiltreClasse(e.target.value)}
              style={{padding:'8px 32px 8px 12px',borderRadius:10,border:'1.5px solid #e5e5ea',background:'#fff',fontSize:13,color:'#1d1d1f',cursor:'pointer',appearance:'none',outline:'none'}}>
              <option value="">Toutes les classes</option>
              {classes.map(cl=><option key={cl.id} value={cl.id}>{cl.nom||cl.name}</option>)}
            </select>
            <svg style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {selectedJour !== null && (
            <button onClick={()=>setSelectedJour(null)}
              style={{fontSize:13,color:RED,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>
              ← Vue semaine
            </button>
          )}
          <button onClick={()=>{setShowForm(true);setEditCours(null)}}
            style={{display:'flex',alignItems:'center',gap:6,background:'#FF3B30',color:'#fff',border:'none',borderRadius:12,padding:'9px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            <Plus size={14}/> Ajouter
          </button>
        </div>
      </div>

      {/* Grille EDT */}
      <div style={{background:C.surface,borderRadius:16,overflow:'hidden',border:`1px solid ${C.surface2}`}}>
        {/* Header jours */}
        <div style={{display:'grid',gridTemplateColumns:`60px repeat(${jours.length},1fr)`,borderBottom:`1px solid ${C.surface2}`,background:C.bg}}>
          <div/>
          {jours.map(di=>(
            <div key={di} onClick={()=>setSelectedJour(selectedJour===null?di:null)}
              style={{padding:'10px 8px',textAlign:'center',cursor:'pointer',borderLeft:`1px solid ${C.surface2}`}}>
<div style={{fontSize:12,fontWeight:600,color:C.text}}>{JOURS[di].slice(0,3)}</div>
            </div>
          ))}
        </div>

        {/* Lignes heures */}
        {HOURS.map(h=>(
          <div key={h} style={{display:'grid',gridTemplateColumns:`60px repeat(${jours.length},1fr)`,borderBottom:`1px solid ${C.surface2}`,minHeight:56}}>
            <div style={{padding:'6px 10px',fontSize:10,color:C.muted,borderRight:`1px solid ${C.surface2}`}}>{h}:00</div>
            {jours.map(di=>{
              const daysCours = cours.filter(c=>c.jourSemaine===di+1&&Math.floor(parseInt(c.heureDebut))===h)
              return (
                <div key={di} style={{borderLeft:`1px solid ${C.surface2}`,padding:3,position:'relative'}}>
                  {daysCours.map(c=>{
                    const color = matColors[c.matiere?.nom]||COLORS[0]
                    const absCount = absences.filter(a=>a.cours?.id===c.id).length
                    return (
                      <div key={c.id} style={{
                        background:color,borderLeft:'none',
                        borderRadius:6,padding:'4px 8px',marginBottom:3,
                        cursor:'pointer',transition:'all 0.15s'
                      }}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:'#fff'}}>{c.matiere?.nom}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,0.8)'}}>{c.heureDebut}–{c.heureFin}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,0.8)'}}>{c.classe?.name} · {c.salle}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,0.8)'}}>{c.enseignant?.firstName} {c.enseignant?.lastName}</div>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
                            {absCount>0 && <div style={{background:RED,color:'#fff',borderRadius:999,padding:'1px 6px',fontSize:9,fontWeight:700}}>{absCount} abs</div>}
                            <div style={{display:'flex',gap:4}}>
                              <button onClick={()=>openEdit(c)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.9)',padding:2}}><Edit3 size={11}/></button>
                              <button onClick={()=>deleteCours(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.9)',padding:2}}><Trash2 size={11}/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Modal formulaire */}
      {showForm && createPortal(
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:24,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',fontFamily:ft}}>
            <div style={{padding:'24px 24px 0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{fontSize:18,fontWeight:700,color:'#1d1d1f'}}>{editCours?'Modifier le cours':'Nouveau cours'}</div>
                <button onClick={()=>{setShowForm(false);setEditCours(null)}} style={{background:'none',border:'none',cursor:'pointer',color:'#aeaeb2'}}><X size={18}/></button>
              </div>
              <div style={{fontSize:13,color:'#6e6e73',marginBottom:24}}>Remplissez les informations du cours</div>
            </div>

            <div style={{padding:'0 24px 24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div style={{gridColumn:'span 2'}}><Inp form={form} setForm={setForm} label="Jour" k="jourSemaine" opts={JOURS.map((j,i)=>({v:i+1,l:j}))}/></div>
                <Inp form={form} setForm={setForm} label="Heure début" k="heureDebut" type="time"/>
                <Inp form={form} setForm={setForm} label="Heure fin" k="heureFin" type="time"/>
                <div style={{gridColumn:'span 2'}}><Inp form={form} setForm={setForm} label="Salle" k="salle"/></div>
                <div style={{gridColumn:'span 2'}}><Inp form={form} setForm={setForm} label="Matière" k="matiereId" opts={matieres.map(m=>({v:m.id,l:m.nom}))}/></div>
                <div style={{gridColumn:'span 2'}}><Inp form={form} setForm={setForm} label="Classe" k="classeId" opts={classes.map(c=>({v:c.id,l:c.nom||c.name}))}/></div>
                <div style={{gridColumn:'span 2'}}><Inp form={form} setForm={setForm} label="Enseignant" k="enseignantId" opts={enseignants.map(e=>({v:e.id,l:e.firstName+' '+e.lastName}))}/></div>
              <div style={{gridColumn:'span 2',marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:600,color:'#6e6e73',marginBottom:8}}>Couleur du bandeau</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FF9F43','#F7DC6F','#26de81','#fd9644','#a29bfe','#74b9ff'].map(col=>(
                    <div key={col} onClick={()=>setForm(f=>({...f,couleur:col}))}
                      style={{width:28,height:28,borderRadius:'50%',background:col,cursor:'pointer',
                      border:form.couleur===col?'3px solid #1d1d1f':'3px solid transparent',
                      boxSizing:'border-box',transition:'all 0.15s'}}/>
                  ))}
                </div>
              </div>
              </div>

              <button onClick={submit}
                style={{width:'100%',padding:'13px',borderRadius:14,background:'#FF3B30',color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer',marginTop:4}}>
                {editCours ? 'Enregistrer les modifications' : 'Créer le cours'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
