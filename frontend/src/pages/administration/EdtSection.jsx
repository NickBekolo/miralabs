import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Trash2, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
const DAYS_SHORT = ['L','M','M','J','V','S','D']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_SEMAINE = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const COLORS_PALETTE = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FF9F43','#F7DC6F','#26de81','#fd9644','#a29bfe','#74b9ff']
const HOURS = Array.from({length:68},(_,i)=>i/4+7) // 7h à 24h par tranches de 15min
const RED = '#FF3B30'

function getMonthDays(year, month) {
  const first = new Date(year, month, 1)
  const startDay = (first.getDay()+6)%7
  const last = new Date(year, month+1, 0)
  const days = []
  for(let i=0;i<startDay;i++) days.push(null)
  for(let d=1;d<=last.getDate();d++) days.push(d)
  return days
}

function getWeekDates(baseDate) {
  const d = new Date(baseDate)
  const day = (d.getDay()+6)%7
  d.setDate(d.getDate()-day)
  return Array.from({length:7},(_,i)=>{ const dd=new Date(d); dd.setDate(d.getDate()+i); return dd })
}

const timeToTop = (t) => { const [h,m]=t.split(':').map(Number); return((h-7)*60+m) }
const posToTime = (pos) => { const totalMins=Math.round(pos*60/15)*15+7*60; return String(Math.floor(totalMins/60)).padStart(2,'0')+':'+String(totalMins%60).padStart(2,'0') }
const durToH    = (s,e) => { const [sh,sm]=s.split(':').map(Number),[eh,em]=e.split(':').map(Number); return(eh*60+em)-(sh*60+sm) }

export default function EdtSection({ C }) {
  const today = new Date()
  const [cours,       setCours]       = useState([])
  const [classes,     setClasses]     = useState([])
  const [matieres,    setMatieres]    = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [showForm,    setShowForm]    = useState(false)
  const [editCours,   setEditCours]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [baseDate,    setBaseDate]    = useState(new Date())
  const [calYear,     setCalYear]     = useState(today.getFullYear())
  const [calMonth,    setCalMonth]    = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [filtreClasse,setFiltreClasse]= useState('')
  const [nowTop, setNowTop] = useState(0)
  const [nowTime, setNowTime] = useState('')
  const [calCollapsed, setCalCollapsed] = useState(false)
  const scrollRef = useRef(null)
  const nowRef = useRef(null)

  const weekDates = getWeekDates(baseDate)
  const monthDays = getMonthDays(calYear, calMonth)

  const [form, setForm] = useState({
    jourSemaine:1, heureDebut:'08:00', heureFin:'10:00',
    salle:'', matiereId:'', classeId:'', enseignantId:'', couleur:'#FF6B6B'
  })

  const matColors = {}
  let ci = 0
  cours.forEach(c => { if(!matColors[c.matiere?.nom]) { matColors[c.matiere?.nom]=COLORS_PALETTE[ci%COLORS_PALETTE.length]; ci++ } })

  const load = async () => {
    setLoading(true)
    try {
      const [c, cl, m, u] = await Promise.all([
        api.get('/api/cours/admin/all'),
        api.get('/api/admin/classes'),
        api.get('/api/matieres').catch(()=>({data:[]})),
        api.get('/api/admin/users'),
      ])
      setCours(c.data)
      setClasses(cl.data)
      setMatieres(m.data)
      setEnseignants((u.data||[]).filter(u=>u.roles?.includes('ROLE_TEACHER')))
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      setNowTop(timeToTop(t))
      setNowTime(t)
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && nowTop > 0) {
        scrollRef.current.scrollTop = Math.max(0, nowTop - 100)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [nowTop, loading])

  const submit = async () => {
    try {
      const payload = { ...form, jourSemaine:parseInt(form.jourSemaine), matiereId:parseInt(form.matiereId),
        classeId:form.classeId?parseInt(form.classeId):null, enseignantId:form.enseignantId?parseInt(form.enseignantId):null }
      if (editCours) await api.put('/api/cours/'+editCours.id, payload)
      else await api.post('/api/cours', payload)
      setShowForm(false); setEditCours(null)
      setForm({ jourSemaine:1, heureDebut:'08:00', heureFin:'10:00', salle:'', matiereId:'', classeId:'', enseignantId:'', couleur:'#FF6B6B' })
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
      salle:c.salle||'', matiereId:c.matiere?.id||'', classeId:c.classe?.id||'',
      enseignantId:c.enseignant?.id||'', couleur:c.couleur||'#FF6B6B' })
    setShowForm(true)
  }

  const isToday = d => d && d.toDateString()===today.toDateString()
  const isSelected = d => d && weekDates.some(wd=>wd.toDateString()===new Date(calYear,calMonth,d).toDateString())

  const coursFiltres = filtreClasse ? cours.filter(c=>c.classe?.id===parseInt(filtreClasse)) : cours

  const bg    = C?.bg || '#fff'
  const border= C?.surface2 || '#e5e5ea'
  const text  = C?.text || '#1d1d1f'
  const muted = C?.muted || '#8e8e93'

  if (loading) return <div style={{color:muted,fontSize:13,padding:20}}>Chargement...</div>

  return (
    <div style={{fontFamily:ft, height:'calc(100vh - 120px)', display:'flex', flexDirection:'column'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexShrink:0}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:text}}>Emploi du temps</div>
          <div style={{fontSize:12,color:muted}}>{cours.length} cours · {classes.length} classes</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {/* Filtre classe */}
          <div style={{position:'relative'}}>
            <select value={filtreClasse} onChange={e=>setFiltreClasse(e.target.value)}
              style={{padding:'8px 32px 8px 12px',borderRadius:10,border:`1.5px solid ${border}`,background:'#fff',fontSize:13,color:text,cursor:'pointer',appearance:'none',outline:'none'}}>
              <option value="">Toutes les classes</option>
              {classes.map(cl=><option key={cl.id} value={cl.id}>{cl.nom||cl.name}</option>)}
            </select>
            <svg style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {selectedDay && <button onClick={()=>setSelectedDay(null)} style={{fontSize:13,color:RED,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>← Semaine</button>}
          <button onClick={()=>{setShowForm(true);setEditCours(null)}}
            style={{display:'flex',alignItems:'center',gap:6,background:RED,color:'#fff',border:'none',borderRadius:12,padding:'9px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            <Plus size={14}/> Ajouter
          </button>
        </div>
      </div>

      {/* Corps */}
      <div style={{flex:1,display:'flex',gap:0,overflow:'hidden',border:`1px solid ${border}`,borderRadius:16}}>

        {/* Mini calendrier */}
        <div style={{width:calCollapsed?36:200,borderRight:`1px solid ${border}`,padding:calCollapsed?'14px 4px':'14px 10px',flexShrink:0,overflowY:'auto',transition:'width 0.2s',position:'relative'}}>
          <button onClick={()=>setCalCollapsed(v=>!v)}
            style={{position:'absolute',top:10,right:6,background:'none',border:'none',cursor:'pointer',color:'#FF3B30',padding:2,fontSize:10,fontWeight:600,display:'flex',alignItems:'center',gap:3,zIndex:1}}>
            {calCollapsed ? <><ChevronRight size={12}/></> : <><ChevronLeft size={12}/><span>Réduire</span></>}
          </button>
          {!calCollapsed && (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,marginTop:24}}>
                <button onClick={()=>{ const d=new Date(calYear,calMonth-1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                  style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:2}}><ChevronLeft size={13}/></button>
                <div style={{fontSize:12,fontWeight:600,color:text}}>{MONTHS[calMonth].slice(0,3)} {calYear}</div>
                <button onClick={()=>{ const d=new Date(calYear,calMonth+1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                  style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:2}}><ChevronRight size={13}/></button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
                {DAYS_SHORT.map((d,i)=><div key={i} style={{textAlign:'center',fontSize:9,color:muted,padding:'1px 0'}}>{d}</div>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1}}>
                {monthDays.map((d,i)=>{
                  if(!d) return <div key={i}/>
                  const date = new Date(calYear,calMonth,d)
                  const isTod = date.toDateString()===today.toDateString()
                  const isSel = isSelected(d)
                  return (
                    <div key={i} onClick={()=>{ setBaseDate(date); setSelectedDay(date) }}
                      style={{width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:isTod?700:400,cursor:'pointer',margin:'1px auto',
                      background:isTod?RED:isSel?'rgba(0,0,0,0.06)':'transparent',
                      color:isTod?'#fff':text}}>
                      {d}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Grille semaine */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Header jours */}
          <div style={{borderBottom:`1px solid ${border}`,flexShrink:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 16px'}}>
              <div style={{fontSize:14,fontWeight:700,color:text}}>{MONTHS[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}</div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button onClick={()=>{ setBaseDate(new Date()); setSelectedDay(null) }} style={{fontSize:11,color:RED,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>Aujourd'hui</button>
                <button onClick={()=>{ const d=new Date(baseDate); d.setDate(d.getDate()-7); setBaseDate(d) }} style={{background:'none',border:'none',cursor:'pointer',color:muted}}><ChevronLeft size={14}/></button>
                <button onClick={()=>{ const d=new Date(baseDate); d.setDate(d.getDate()+7); setBaseDate(d) }} style={{background:'none',border:'none',cursor:'pointer',color:muted}}><ChevronRight size={14}/></button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:`48px repeat(${selectedDay?1:7},1fr)`}}>
              <div/>
              {(selectedDay?[selectedDay]:weekDates).map((date,i)=>(
                <div key={i} onClick={()=>setSelectedDay(date)} style={{textAlign:'center',padding:'6px 0',cursor:'pointer',borderLeft:`1px solid ${border}`}}>
                  <div style={{fontSize:10,color:isToday(date)?RED:muted}}>{JOURS_SEMAINE[i]}</div>
                  <div style={{width:26,height:26,borderRadius:'50%',margin:'2px auto',background:isToday(date)?RED:'transparent',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:isToday(date)?700:400,color:isToday(date)?'#fff':text}}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grille heures */}
          <div ref={scrollRef} style={{flex:1,overflowY:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:`48px repeat(${selectedDay?1:7},1fr)`,position:'relative'}}>
              {/* Heures */}
              <div>
                {HOURS.map((h,i)=>(
                  <div key={i} style={{height:15,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:6,paddingTop:1}}>
                    {h%1===0?<span style={{fontSize:9,color:muted}}>{String(Math.floor(h)).padStart(2,'0')}:00</span>:h%0.5===0?<span style={{fontSize:8,color:muted+'88'}}>{String(Math.floor(h)).padStart(2,'0')}:30</span>:null}
                  </div>
                ))}
              </div>
              {/* Colonnes */}
              {(selectedDay?[selectedDay]:weekDates).map((date,di)=>{
                const jsDay=(date.getDay()+6)%7+1
                const daysCours=coursFiltres.filter(c=>c.jourSemaine===jsDay)
                return (
                  <div key={di} style={{position:'relative',borderLeft:`1px solid ${border}`}}>
                    {HOURS.map((h,i)=>(
                      <div key={i} style={{height:15,borderBottom:h%1===0?`1px solid ${border}`:h%0.5===0?`1px dashed ${border}44`:'none'}}/>
                    ))}
                    {isToday(date) && (
                      <div style={{position:'absolute',top:nowTop,left:-48,right:0,zIndex:10,pointerEvents:'none',display:'flex',alignItems:'center'}}>
                        <div style={{background:RED,color:'#fff',borderRadius:999,padding:'2px 6px',fontSize:10,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>
                          {nowTime}
                        </div>
                        <div style={{flex:1,height:2,background:RED}}/>
                      </div>
                    )}
                    {daysCours.map((c,ci2)=>{
                      const top=timeToTop(c.heureDebut)
                      const height=Math.max(durToH(c.heureDebut,c.heureFin)-2,20)
                      const color=c.couleur||matColors[c.matiere?.nom]||COLORS_PALETTE[0]
                      return (
                        <div key={ci2} style={{position:'absolute',top,left:2,right:2,height,
                          background:color,borderRadius:6,padding:'3px 6px',overflow:'hidden',
                          cursor:'pointer',opacity:c.isAnnule?0.4:1}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                            <div style={{overflow:'hidden'}}>
                              <div style={{fontSize:12,fontWeight:700,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.matiere?.nom}</div>
                              <div style={{fontSize:11,color:'rgba(255,255,255,0.85)'}}>{c.heureDebut}–{c.heureFin}</div>
                              <div style={{fontSize:11,color:'rgba(255,255,255,0.85)'}}>{c.classe?.name} · {c.salle}</div>
                            </div>
                            <div style={{display:'flex',gap:2,flexShrink:0}}>
                              <button onClick={e=>{e.stopPropagation();openEdit(c)}} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.9)',padding:1}}><Edit3 size={12}/></button>
                              <button onClick={e=>{e.stopPropagation();deleteCours(c.id)}} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.9)',padding:1}}><Trash2 size={12}/></button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
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
              <div style={{fontSize:13,color:'#6e6e73',marginBottom:20}}>Ces informations apparaîtront dans l'emploi du temps des élèves et enseignants</div>
            </div>
            <div style={{padding:'0 24px 24px'}}>
              {/* Jour */}
              <Field label="Jour de la semaine" k="jourSemaine" form={form} setForm={setForm}
                opts={['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map((j,i)=>({v:i+1,l:j}))}/>
              {/* Horaires */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Field label="Heure début" k="heureDebut" form={form} setForm={setForm} type="time"/>
                <Field label="Heure fin" k="heureFin" form={form} setForm={setForm} type="time"/>
              </div>
              <Field label="Salle" k="salle" form={form} setForm={setForm} maxLen={15}/>
              <Field label="Matière" k="matiereId" form={form} setForm={setForm}
                opts={matieres.map(m=>({v:m.id,l:m.nom}))}/>
              <Field label="Classe" k="classeId" form={form} setForm={setForm}
                opts={classes.map(c=>({v:c.id,l:c.nom||c.name}))}/>
              <Field label="Enseignant" k="enseignantId" form={form} setForm={setForm}
                opts={enseignants.map(e=>({v:e.id,l:e.firstName+' '+e.lastName}))}/>
              {/* Couleur */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:600,color:'#6e6e73',marginBottom:8}}>Couleur du bandeau</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {COLORS_PALETTE.map(col=>(
                    <div key={col} onClick={()=>setForm(f=>({...f,couleur:col}))}
                      style={{width:28,height:28,borderRadius:'50%',background:col,cursor:'pointer',
                      border:form.couleur===col?'3px solid #1d1d1f':'3px solid transparent',
                      boxSizing:'border-box',transition:'all 0.15s'}}/>
                  ))}
                </div>
              </div>
              <button onClick={submit}
                style={{width:'100%',padding:'13px',borderRadius:14,background:RED,color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer'}}>
                {editCours?'Enregistrer les modifications':'Créer le cours'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function Field({label, k, type='text', opts=null, form, setForm, maxLen}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:12,fontWeight:600,color:'#6e6e73',marginBottom:6}}>{label}</div>
      {opts ? (
        <div style={{position:'relative'}}>
          <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
            style={{width:'100%',padding:'10px 36px 10px 12px',borderRadius:12,border:'1.5px solid #e5e5ea',
            background:'#fff',color:form[k]?'#1d1d1f':'#aeaeb2',fontSize:14,boxSizing:'border-box',outline:'none',appearance:'none',cursor:'pointer'}}>
            <option value="">Choisir...</option>
            {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <svg style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      ) : (
        <input type={type} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
          maxLength={maxLen}
          style={{width:'100%',padding:'10px 12px',borderRadius:12,border:'1.5px solid #e5e5ea',
          background:'#fff',color:'#1d1d1f',fontSize:14,boxSizing:'border-box',outline:'none'}}/>
      )}
    </div>
  )
}
