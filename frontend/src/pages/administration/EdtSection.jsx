import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Trash2, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const JOURS_FULL = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
const DAYS_MINI = ['L','M','M','J','V','S','D']
const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FF9F43','#F7DC6F','#26de81','#fd9644','#a29bfe','#74b9ff']
const RED = '#FF3B30'
const SLOT_H = 20 // px par slot de 15min
const MIN_PX = SLOT_H / 15 // px par minute

function timeToY(t) {
  const [h, m] = t.split(':').map(Number)
  return (h - 8) * 60 * MIN_PX + m * MIN_PX
}

function durToH(s, e) {
  const [sh, sm] = s.split(':').map(Number)
  const [eh, em] = e.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) * MIN_PX
}

function getWeekDates(base) {
  const d = new Date(base)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d)
    dd.setDate(d.getDate() + i)
    return dd
  })
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const start = (first.getDay() + 6) % 7
  const days = []
  for (let i = 0; i < start; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(d)
  return days
}

const SLOTS = Array.from({ length: 64 }, (_, i) => i / 4 + 8) // 8h à 24h par 15min

export default function EdtSection({ C }) {
  const today = new Date()
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  const [cours,        setCours]        = useState([])
  const [classes,      setClasses]      = useState([])
  const [matieres,     setMatieres]     = useState([])
  const [enseignants,  setEnseignants]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [baseDate,     setBaseDate]     = useState(new Date())
  const [calYear,      setCalYear]      = useState(today.getFullYear())
  const [calMonth,     setCalMonth]     = useState(today.getMonth())
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [animating,    setAnimating]    = useState(false)
  const [filtreClasse, setFiltreClasse] = useState('')
  const [calCollapsed, setCalCollapsed] = useState(false)
  const [showForm,     setShowForm]     = useState(false)
  const [editCours,    setEditCours]    = useState(null)
  const [nowTop,       setNowTop]       = useState(0)
  const [nowTime,      setNowTime]      = useState('')
  const [selecting,    setSelecting]    = useState(null)
  const [confirmId,    setConfirmId]    = useState(null)
  const [expandedId,   setExpandedId]   = useState(null)
  const [refresh,      setRefresh]      = useState(0)
  const [selectBox,    setSelectBox]    = useState(null)
  const scrollRef = useRef(null)

  const FORM_INIT = { jourSemaine: 1, heureDebut: '08:00', heureFin: '10:00', salle: '', matiereId: '', classeId: '', enseignantId: '', couleur: '#FF6B6B' }
  const [form, setForm] = useState(FORM_INIT)

  const matColors = {}
  let ci = 0
  cours.forEach(c => {
    if (!matColors[c.matiere?.nom]) { matColors[c.matiere?.nom] = COLORS[ci % COLORS.length]; ci++ }
  })

  const load = async () => {
    setLoading(true)
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        api.get('/api/cours/admin/all'),
        api.get('/api/admin/classes'),
        api.get('/api/matieres').catch(() => ({ data: [] })),
        api.get('/api/admin/users'),
      ])
      const newCours = r1.data.map(c=>({...c}))
      setCours(newCours)
      setClasses(r2.data)
      setMatieres(r3.data)
      setEnseignants((r4.data || []).filter(u => u.roles?.includes('ROLE_TEACHER')))
      setRefresh(v=>v+1)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const update = () => {
      const n = new Date()
      const t = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
      setNowTop(timeToY(t))
      setNowTime(t)
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (scrollRef.current && nowTop > 0) {
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, nowTop - 120) }, 300)
    }
  }, [nowTop, loading])

  const submit = async () => {
    if (!form.matiereId) { alert('Choisissez une matière'); return }
    if (!form.heureDebut || !form.heureFin) { alert('Renseignez les heures'); return }
    if (form.heureDebut >= form.heureFin) { alert('Heure de fin doit être après heure de début'); return }
    try {
      const payload = {
        jourSemaine:  parseInt(form.jourSemaine),
        heureDebut:   form.heureDebut,
        heureFin:     form.heureFin,
        salle:        form.salle || null,
        matiereId:    parseInt(form.matiereId),
        classeId:     form.classeId ? parseInt(form.classeId) : null,
        enseignantId: form.enseignantId ? parseInt(form.enseignantId) : null,
        couleur:      form.couleur,
      }
      if (editCours) await api.put('/api/cours/' + editCours.id, payload)
      else await api.post('/api/cours', payload)
      setShowForm(false)
      setEditCours(null)
      setForm(FORM_INIT)
      load()
    } catch (e) { console.error(e); alert('Erreur lors de la sauvegarde') }
  }

  const deleteCours = async (id) => {
    await api.delete('/api/cours/' + id)
    setConfirmId(null)
    load()
  }

  const openEdit = (c) => {
    setEditCours(c)
    setForm({
      jourSemaine:  c.jourSemaine,
      heureDebut:   c.heureDebut,
      heureFin:     c.heureFin,
      salle:        c.salle || '',
      matiereId:    c.matiere?.id || '',
      classeId:     c.classe?.id || '',
      enseignantId: c.enseignant?.id || '',
      couleur:      c.couleur || '#FF6B6B',
    })
    setShowForm(true)
  }

  const weekDates = getWeekDates(baseDate)
  const monthDays = getMonthDays(calYear, calMonth)
  const isToday = d => d && d.toDateString() === today.toDateString()
  const inWeek  = d => d && weekDates.some(w => w.toDateString() === new Date(calYear, calMonth, d).toDateString())
  const displayDates = selectedDay ? [selectedDay] : weekDates
  const coursFiltres = filtreClasse ? cours.filter(cr => cr.classe?.id === parseInt(filtreClasse)) : cours

  const bg     = '#fff'
  const border = C?.surface2 || '#e5e5ea'
  const text   = C?.text || '#1d1d1f'
  const muted  = C?.muted || '#8e8e93'

  const posToTime = (px) => {
    const totalMins = Math.round(px / MIN_PX / 15) * 15 + 8 * 60
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }

  const onColMouseDown = (e, jourSemaine) => {
    if (showForm) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    setSelecting({ jourSemaine, startY: y, rect })
    setSelectBox({ top: y, height: 0, jourSemaine })
  }

  const onColMouseMove = (e) => {
    if (!selecting) return
    const y = e.clientY - selecting.rect.top
    setSelectBox({
      top: Math.min(selecting.startY, y),
      height: Math.abs(y - selecting.startY),
      jourSemaine: selecting.jourSemaine,
    })
  }

  const onColMouseUp = (e) => {
    if (!selecting) return
    const y = e.clientY - selecting.rect.top
    const startTime = posToTime(Math.min(selecting.startY, y))
    const endTime   = posToTime(Math.max(selecting.startY, y))
    setForm(f => ({ ...f, jourSemaine: selecting.jourSemaine, heureDebut: startTime, heureFin: endTime === startTime ? posToTime(Math.max(selecting.startY, y) + 60) : endTime }))
    setSelecting(null)
    setSelectBox(null)
    setShowForm(true)
  }

  if (loading) return <div style={{ fontFamily: ft, color: muted, padding: 24 }}>Chargement...</div>

  return (
    <div style={{ fontFamily: ft, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px', color: text, marginBottom: 6 }}>Emploi du temps</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:muted }}>
              <span style={{ color:RED, fontWeight:600 }}>
                {new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}
              </span>
              <span>·</span>
              <span style={{ fontWeight:600, color:text }}>{cours.length} cours</span>
              <span>·</span>
              <span style={{ fontWeight:600, color:text }}>{classes.length} classes</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)}
                style={{ padding: '7px 30px 7px 12px', borderRadius: 10, border: `1.5px solid ${border}`, background: bg, fontSize: 13, color: text, cursor: 'pointer', appearance: 'none', outline: 'none' }}>
                <option value="">Toutes les classes</option>
                {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.nom || cl.name}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            {selectedDay && (
              <button onClick={() => setSelectedDay(null)} style={{ fontSize: 12, color: RED, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>← Semaine</button>
            )}
            <button onClick={() => { setForm(FORM_INIT); setEditCours(null); setShowForm(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED }}>
              <Plus size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', border: `1px solid ${border}`, borderRadius: 16, position:'relative' }}>


        {/* Mini calendrier */}
        <div style={{ width: calCollapsed ? 32 : 196, filter: expandedId ? 'blur(2px)' : 'none', transition:'filter 0.2s', pointerEvents: expandedId ? 'none' : 'auto', borderRight: `1px solid ${border}`, flexShrink: 0, transition: 'width 0.2s', overflow: 'hidden', position: 'relative', padding: calCollapsed ? '12px 0' : '12px 10px' }}>
          <button onClick={() => setCalCollapsed(v => !v)}
            style={{ position: 'absolute', top: 10, right: 6, background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
            {calCollapsed ? <ChevronRight size={13} /> : <><ChevronLeft size={13} /><span>Réduire</span></>}
          </button>
          {!calCollapsed && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 20 }}>
                <button onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, padding: 2 }}><ChevronLeft size={13} /></button>
                <div style={{ fontSize: 12, fontWeight: 600, color: text }}>{MOIS[calMonth].slice(0, 3)} {calYear}</div>
                <button onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, padding: 2 }}><ChevronRight size={13} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                {DAYS_MINI.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, color: muted }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
                {monthDays.map((d, i) => {
                  if (!d) return <div key={i} />
                  const date = new Date(calYear, calMonth, d)
                  const isTod = date.toDateString() === today.toDateString()
                  const isSel = inWeek(d)
                  return (
                    <div key={i} onClick={() => { setBaseDate(date); setSelectedDay(date) }}
                      style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer', margin: '1px auto', background: isTod ? RED : isSel ? 'rgba(0,0,0,0.06)' : 'transparent', color: isTod ? '#fff' : text }}>
                      {d}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Grille */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'visible', minWidth: 0 }}>

          {/* Header jours */}
          <div style={{ borderBottom: `1px solid ${border}`, flexShrink: 0, position:'relative' }}>
            {expandedId && <div onClick={()=>setExpandedId(null)} style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.6)',backdropFilter:'blur(2px)',zIndex:50,pointerEvents:'auto',cursor:'pointer'}}/>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{MOIS[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setBaseDate(new Date()); setSelectedDay(null) }} style={{ fontSize: 11, color: RED, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Aujourd'hui</button>
                <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}><ChevronLeft size={14} /></button>
                <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted }}><ChevronRight size={14} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `44px repeat(${displayDates.length},1fr)` }}>
              <div />
              {displayDates.map((date, i) => (
                <div key={i} onClick={() => { setAnimating(true); setTimeout(()=>{ setSelectedDay(date); setAnimating(false) }, 200) }} style={{ textAlign: 'center', padding: '4px 0', cursor: 'pointer', borderLeft: `1px solid ${border}` }}>
                  <div style={{ fontSize: 10, color: isToday(date) ? RED : muted }}>{JOURS[(date.getDay()+6)%7]}</div>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '2px auto', background: isToday(date) ? RED : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: isToday(date) ? 700 : 400, color: isToday(date) ? '#fff' : text }}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grille heures */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', position:'relative', transition:'all 0.2s ease', opacity: animating ? 0 : 1, transform: animating ? 'scale(0.97)' : 'scale(1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `44px repeat(${displayDates.length},1fr)` }}>


              {/* Colonne heures */}
              <div style={{position:'relative'}}>
                {expandedId && <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.6)',backdropFilter:'blur(2px)',zIndex:50,pointerEvents:'none'}}/>}
                {SLOTS.map((h, i) => (
                  <div key={i} style={{ height: SLOT_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 6, paddingTop: 1 }}>
                    {Number.isInteger(h) && <span style={{ fontSize: 9, color: muted }}>{String(h).padStart(2, '0')}:00</span>}
                    {!Number.isInteger(h) && h % 0.5 === 0 && <span style={{ fontSize: 8, color: muted + '66' }}>{String(Math.floor(h)).padStart(2, '0')}:30</span>}
                  </div>
                ))}
              </div>
              {/* Colonnes jours */}
              {displayDates.map((date, di) => {
                const jsDay = (date.getDay() + 6) % 7 + 1
                const daysCours = coursFiltres.filter(cr => cr.jourSemaine === jsDay)
                const isCurrentDay = isToday(date)
                const totalH = SLOTS.length * SLOT_H

                return (
                  <div key={di} style={{ position: 'relative', borderLeft: `1px solid ${border}`, height: totalH }}
                    onMouseDown={e => onColMouseDown(e, jsDay)}
                    onMouseMove={onColMouseMove}
                    onMouseUp={onColMouseUp}
                  >
                    {/* Overlay si autre cours expandé */}
                    {expandedId && !daysCours.find(c=>c.id===expandedId) && (
                      <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.6)',backdropFilter:'blur(2px)',zIndex:50,pointerEvents:'none'}}/>
                    )}
                    {/* Lignes slots */}
                    {SLOTS.map((h, i) => (
                      <div key={i} style={{ position: 'absolute', top: i * SLOT_H, left: 0, right: 0, height: SLOT_H, borderBottom: Number.isInteger(h) ? `1px solid ${border}` : h % 0.5 === 0 ? `1px dashed ${border}55` : 'none', pointerEvents: 'none' }} />
                    ))}

                    {/* Indicateur heure actuelle */}
                    {isCurrentDay && (
                      <div style={{ position: 'absolute', top: nowTop, left: -44, right: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                        <div style={{ background: RED, color: '#fff', borderRadius: 999, padding: '2px 5px', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{nowTime}</div>
                        <div style={{ flex: 1, height: 2, background: RED }} />
                      </div>
                    )}

                    {/* Zone de sélection */}
                    {selectBox && selectBox.jourSemaine === jsDay && (
                      <div style={{ position: 'absolute', top: selectBox.top, left: 2, right: 2, height: Math.max(selectBox.height, 15), background: 'rgba(0,122,255,0.15)', border: '2px solid #007AFF', borderRadius: 6, pointerEvents: 'none', zIndex: 5 }} />
                    )}

                    {/* Cours */}
                    {daysCours.map((cr, ci2) => {
                      const top    = timeToY(cr.heureDebut)
                      const naturalH = Math.max(durToH(cr.heureDebut, cr.heureFin) - 2, 20)
                      const height = expandedId===cr.id ? Math.max(naturalH, 120) : naturalH
                      const color  = cr.couleur || matColors[cr.matiere?.nom] || COLORS[0]
                      return (
                        <div key={cr.id} style={{ position: 'absolute', top, left: 2, right: 2, height, background: color, borderRadius: 8, padding: '6px 8px', overflow: 'hidden', cursor: 'pointer', opacity: cr.isAnnule ? 0.5 : 1, zIndex: expandedId===cr.id ? 100 : 2, boxShadow: expandedId===cr.id ? '0 8px 32px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.15)', transition:'all 0.2s', left: expandedId===cr.id ? 4 : 2, right: expandedId===cr.id ? 4 : 2 }} onClick={e=>{e.stopPropagation();setExpandedId(expandedId===cr.id?null:cr.id)}} onMouseDown={e=>e.stopPropagation()} onMouseUp={e=>e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height:'100%' }}>
                            <div style={{ overflow: 'hidden', flex: 1, display:'flex', flexDirection:'column', gap:2 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight:1.2 }}>{cr.matiere?.nom}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight:500 }}>{cr.heureDebut} – {cr.heureFin}</div>
                              {height > 40 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{cr.classe?.name}{cr.salle ? ' · ' + cr.salle : ''}</div>}
                              {height > 60 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontStyle:'italic' }}>{cr.enseignant?.firstName} {cr.enseignant?.lastName}</div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection:'column', gap: 2, flexShrink: 0 }}>
                              <button onClick={e => { e.stopPropagation(); openEdit(cr) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', padding: '3px 4px', borderRadius:4 }}><Edit3 size={11} /></button>
                              <button onClick={e => { e.stopPropagation(); setConfirmId(cr.id) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', padding: '3px 4px', borderRadius:4 }}><Trash2 size={11} /></button>
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

      {/* Modal détail cours */}
            {/* Modal confirm suppression */}
      {confirmId && createPortal(
        <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:340,padding:'28px 24px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',fontFamily:ft }}>
            <div style={{ fontSize:17,fontWeight:700,color:'#1d1d1f',marginBottom:8 }}>Supprimer ce cours ?</div>
            <div style={{ fontSize:13,color:'#6e6e73',marginBottom:24 }}>Cette action est irréversible.</div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setConfirmId(null)}
                style={{ flex:1,padding:'11px',borderRadius:12,background:'#f5f5f7',color:'#1d1d1f',border:'none',fontSize:14,fontWeight:500,cursor:'pointer' }}>
                Annuler
              </button>
              <button onClick={()=>deleteCours(confirmId)}
                style={{ flex:1,padding:'11px',borderRadius:12,background:RED,color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal formulaire */}
      {showForm && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
        >
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: ft }}>
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f' }}>{editCours ? 'Modifier le cours' : 'Nouveau cours'}</div>
                <button onClick={() => { setShowForm(false); setEditCours(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aeaeb2' }}><X size={18} /></button>
              </div>
              <div style={{ fontSize: 12, color: '#6e6e73', marginBottom: 20 }}>Ces infos apparaîtront dans l'emploi du temps des élèves et enseignants</div>
            </div>
            <div style={{ padding: '0 24px 24px' }}>

              <F label="Jour *" k="jourSemaine" form={form} setForm={setForm}
                opts={JOURS_FULL.map((j, i) => ({ v: i + 1, l: j }))} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <F label="Heure début *" k="heureDebut" form={form} setForm={setForm} type="time" />
                <F label="Heure fin *" k="heureFin" form={form} setForm={setForm} type="time" />
              </div>

              <F label="Salle" k="salle" form={form} setForm={setForm} maxLen={15} />
              <F label="Matière *" k="matiereId" form={form} setForm={setForm}
                opts={matieres.map(m => ({ v: m.id, l: m.nom }))} />
              <F label="Classe" k="classeId" form={form} setForm={setForm}
                opts={classes.map(c => ({ v: c.id, l: c.nom || c.name }))} />

              {/* Enseignants */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 8 }}>Enseignant</div>
                <div style={{ maxHeight: 180, overflowY: 'auto', border: '1.5px solid #e5e5ea', borderRadius: 12 }}>
                  {enseignants.map((e, i, arr) => (
                    <div key={e.id} onClick={() => setForm(f => ({ ...f, enseignantId: e.id }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', background: form.enseignantId === e.id ? '#FF3B3010' : '#fff', borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none', borderLeft: form.enseignantId === e.id ? '3px solid #FF3B30' : '3px solid transparent' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: '#e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {e.photoUrl
                          ? <img src={baseUrl + e.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <span style={{ fontSize: 13, fontWeight: 700, color: '#636366' }}>{e.firstName?.[0]}</span>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{e.firstName} {e.lastName}</div>
                        <div style={{ fontSize: 11, color: '#8e8e93' }}>{(e.matieres || []).join(', ') || 'Aucune matière assignée'}</div>
                      </div>
                      {form.enseignantId === e.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: RED }} />}
                    </div>
                  ))}
                  {enseignants.length === 0 && <div style={{ padding: 12, fontSize: 12, color: '#8e8e93', textAlign: 'center' }}>Aucun enseignant</div>}
                </div>
              </div>

              {/* Couleur */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 8 }}>Couleur du bandeau</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(col => (
                    <div key={col} onClick={() => setForm(f => ({ ...f, couleur: col }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: col, cursor: 'pointer', border: form.couleur === col ? '3px solid #1d1d1f' : '3px solid transparent', boxSizing: 'border-box' }} />
                  ))}
                </div>
              </div>

              <button onClick={submit}
                style={{ width: '100%', padding: 13, borderRadius: 14, background: RED, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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

function F({ label, k, type = 'text', opts = null, form, setForm, maxLen }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>{label}</div>
      {opts ? (
        <div style={{ position: 'relative' }}>
          <select value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
            style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: 12, border: '1.5px solid #e5e5ea', background: '#fff', color: form[k] ? '#1d1d1f' : '#aeaeb2', fontSize: 14, boxSizing: 'border-box', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
            <option value="">Choisir...</option>
            {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      ) : (
        <input type={type} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
          maxLength={maxLen}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e5e5ea', background: '#fff', color: '#1d1d1f', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
      )}
    </div>
  )
}
