import { useState, useEffect, useRef } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ft = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif"
const DAYS_SHORT = ['L','M','M','J','V','S','D']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const COLORS_MAT = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FF9F43','#F7DC6F','#26de81','#fd9644']

const HOURS = Array.from({length:48}, (_,i)=>i/2) // 0h à 23h30 par tranches de 30min

function getMonthDays(year, month) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month+1, 0)
  const startDay = (first.getDay()+6)%7 // 0=lun
  const days = []
  for(let i=0;i<startDay;i++) days.push(null)
  for(let d=1;d<=last.getDate();d++) days.push(d)
  return days
}

function getWeekDates(baseDate) {
  const d = new Date(baseDate)
  const day = (d.getDay()+6)%7 // 0=lun
  d.setDate(d.getDate()-day)
  return Array.from({length:7},(_,i)=>{ const dd=new Date(d); dd.setDate(d.getDate()+i); return dd })
}

const timeToTop = (t) => { const [h,m]=t.split(':').map(Number); return(h*60+m)*(30/30) }
const durToH    = (s,e) => { const [sh,sm]=s.split(':').map(Number),[eh,em]=e.split(':').map(Number); return((eh*60+em)-(sh*60+sm))*(30/30) }


function getOverlapLayout(cours) {
  const sorted = [...cours].sort((a,b)=>a.heureDebut.localeCompare(b.heureDebut))
  const layout = []
  const cols = []
  sorted.forEach(cr => {
    const [sh,sm]=cr.heureDebut.split(':').map(Number)
    const startMin=sh*60+sm
    let col=0
    for(let i=0;i<cols.length;i++){
      const [lh,lm]=cols[i].heureFin.split(':').map(Number)
      if(lh*60+lm<=startMin){col=i;break}
      col=i+1
    }
    cols[col]=cr
    layout.push({cr,col,totalCols:0})
  })
  const totalCols=cols.length||1
  return layout.map(l=>({...l,totalCols}))
}

export default function PlanningWidget() {
  const darkMode = useThemeStore(s=>s.darkMode)
  const C = darkMode ? DARK_THEME : LIGHT_THEME
  const today = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [baseDate, setBaseDate] = useState(new Date())
  const [cours,    setCours]    = useState([])
  const [absences, setAbsences] = useState([])
  const [devoirs,  setDevoirs]  = useState([])
  const [selectedDay, setSelectedDay] = useState(null) // null = vue semaine
  const [nowTop,   setNowTop]   = useState(0)
  const [selectedCours, setSelectedCours] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [calCollapsed, setCalCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const scrollRef = useRef(null)

  const weekDates = getWeekDates(baseDate)

  useEffect(() => {
    api.get('/api/cours/enseignant').then(r=>setCours(r.data)).catch(()=>{})
    api.get('/api/absences').then(r=>setAbsences(r.data)).catch(()=>{})
    api.get('/api/devoirs').then(r=>setDevoirs(r.data)).catch(()=>{})
  }, [])

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setNowTop(timeToTop(`${now.getHours()}:${now.getMinutes()}`))
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if(scrollRef.current) {
      const scrollTo = Math.max(0, nowTop - 100)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [nowTop])

  const matColors = {}
  let ci = 0
  cours.forEach(c => { if(!matColors[c.matiere?.nom]) { matColors[c.matiere?.nom]=COLORS_MAT[ci%COLORS_MAT.length]; ci++ } })

  const absDays = absences.map(a => new Date(a.date).toDateString())
  const devoirDays = devoirs.map(d => new Date(d.dateLimite || d.date).toDateString())

  const monthDays = getMonthDays(calYear, calMonth)

  const bg    = darkMode?'#000':'#fff'
  const border= darkMode?'rgba(255,255,255,0.08)':'#e5e5ea'
  const text  = darkMode?'#fff':'#1d1d1f'
  const muted = darkMode?'rgba(255,255,255,0.35)':'#8e8e93'
  const RED   = '#FF3B30'

  const goWeekBack = () => { const d=new Date(baseDate); d.setDate(d.getDate()-7); setBaseDate(d) }
  const goWeekNext = () => { const d=new Date(baseDate); d.setDate(d.getDate()+7); setBaseDate(d) }

  const isToday = d => d && d.toDateString()===today.toDateString()
  const isSelected = d => d && weekDates.some(wd=>wd.toDateString()===new Date(calYear,calMonth,d).toDateString())
  const selectDay = (d) => { const date=new Date(calYear,calMonth,d); setBaseDate(date); setSelectedDay(date) }

  const annulerCours = async (id) => {
    try {
      const res = await api.patch('/api/cours/' + id + '/annuler')
      setCours(prev => prev.map(c => c.id === id ? {...c, isAnnule: res.data.isAnnule} : c))
    } catch(e) { console.error(e) }
  }

  return (
    <div style={{fontFamily:ft, background:bg, height:400, display:'flex', flexDirection:'column', overflow:'hidden', borderRadius:20, boxShadow:'0 2px 16px rgba(0,0,0,0.08)', marginBottom:16}}>
      {/* Header */}
      <div style={{padding:'12px 20px 8px', borderBottom:`1px solid ${border}`, flexShrink:0}}>
        <div style={{fontSize:20,fontWeight:400,letterSpacing:'-0.8px',color:text,marginBottom:2}}>
    Planning · <span style={{color:'#FF3B30',fontSize:13}}>{new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long'})}</span>
  </div>
      </div>
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

      {/* Colonne gauche — mini calendrier */}
      {!isMobile && <div style={{position:'relative',width:calCollapsed?32:220,borderRight:`1px solid ${border}`, display:'flex', flexDirection:'column', padding:'16px 12px', flexShrink:0, overflowY:'auto'}}>

        <button onClick={()=>setCalCollapsed(v=>!v)}
          style={{position:'absolute',top:10,right:6,background:'none',border:'none',cursor:'pointer',color:'#FF3B30',fontSize:10,fontWeight:600,display:'flex',alignItems:'center',gap:2,zIndex:1}}>
          {calCollapsed ? <ChevronRight size={13}/> : <><ChevronLeft size={13}/><span>Réduire</span></>}
        </button>
        {!calCollapsed && <>
        {/* Mois nav */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, marginTop:28}}>
          <button onClick={()=>{ const d=new Date(calYear,calMonth-1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
            style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:4}}><ChevronLeft size={14}/></button>
          <div style={{fontSize:13,fontWeight:400,letterSpacing:'-0.4px',color:text}}>{MONTHS[calMonth]} {calYear}</div>
          <button onClick={()=>{ const d=new Date(calYear,calMonth+1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
            style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:4}}><ChevronRight size={14}/></button>
        </div>

        {/* Jours semaine */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
          {DAYS_SHORT.map((d,i)=>(
            <div key={i} style={{textAlign:'center',fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.85)',fontWeight:500,padding:'2px 0'}}>{d}</div>
          ))}
        </div>

        {/* Jours */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1}}>
          {monthDays.map((d,i)=>{
            if(!d) return <div key={i}/>
            const date = new Date(calYear,calMonth,d)
            const isTod = date.toDateString()===today.toDateString()
            const isAbs = absDays.includes(date.toDateString())
            const isDev = devoirDays.includes(date.toDateString())
            const isSel = isSelected(d)
            return (
              <div key={i} onClick={()=>{ setBaseDate(date); setSelectedDay(date) }}
                style={{
                  width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:11,fontWeight:isTod?700:400,
                  background:isTod?RED:isSel?'rgba(0,0,0,0.06)':'transparent',
                  color:isTod?'#fff':text,
                  cursor:'pointer',position:'relative',margin:'1px auto'
                }}>
                {d}
                {/* Dots */}
                <div style={{position:'absolute',bottom:2,left:'50%',transform:'translateX(-50%)',display:'flex',gap:2}}>
                  {isAbs && <div style={{width:3,height:3,borderRadius:'50%',background:'#FF3B30'}}/>}
                  {isDev && <div style={{width:3,height:3,borderRadius:'50%',background:'#007AFF'}}/>}

                </div>
              </div>
            )
          })}
        </div>
      </>}
      </div>}

      {/* Colonne droite — vue semaine */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
        {selectedCours && <div onClick={()=>setSelectedCours(null)} style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.5)',backdropFilter:'blur(3px)',zIndex:8,cursor:'pointer',transition:'all 0.4s ease'}}/>}

        {/* Header semaine */}
        <div style={{borderBottom:`1px solid ${border}`,flexShrink:0,padding:'10px 0 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px',marginBottom:8}}>
            <div style={{fontSize:16,fontWeight:700,color:text}}>
              {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {selectedDay && <button onClick={()=>setSelectedDay(null)} style={{fontSize:12,color:RED,background:'none',border:'none',cursor:'pointer',fontWeight:500,marginRight:8}}>← Semaine</button>}
              <button onClick={()=>{ setBaseDate(new Date()); setSelectedDay(null) }} style={{fontSize:12,color:RED,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>Aujourd'hui</button>
              <button onClick={goWeekBack} style={{background:'none',border:'none',cursor:'pointer',color:muted}}><ChevronLeft size={16}/></button>
              <button onClick={goWeekNext} style={{background:'none',border:'none',cursor:'pointer',color:muted}}><ChevronRight size={16}/></button>
            </div>
          </div>

          {/* Jours semaine header */}
          <div style={{display:'grid',gridTemplateColumns:selectedDay?'48px 1fr':'48px repeat(7,1fr)'}}>
            <div/>
            {(selectedDay ? [selectedDay] : weekDates).map((date,i)=>(
              <div key={i} style={{textAlign:'center',paddingBottom:8}}>
                <div style={{fontSize:10,color:isToday(date)?RED:muted,fontWeight:500,marginBottom:4}}>
                  {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][(date.getDay()+6)%7]}
                </div>
                <div onClick={()=>setSelectedDay(date)} style={{
                  width:28,height:28,borderRadius:'50%',margin:'0 auto',
                  background:isToday(date)?RED:'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:14,fontWeight:isToday(date)?700:400,
                  color:isToday(date)?'#fff':text,
                  cursor:'pointer'
                }}>{date.getDate()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grille heures */}
        <div ref={scrollRef} style={{flex:1,overflowY:'auto',position:'relative'}}>
          <div style={{display:'grid',gridTemplateColumns:selectedDay?'48px 1fr':'48px repeat(7,1fr)',position:'relative'}}>

            {/* Heures */}
            <div>
              {HOURS.map((h,i)=>(
                <div key={i} style={{height:30,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:8,paddingTop:2}}>
                  {Number.isInteger(h) 
    ? <span style={{fontSize:10,color:muted}}>{String(Math.floor(h)).padStart(2,'0')}:00</span>
    : <span style={{fontSize:9,color:muted+'88'}}>{String(Math.floor(h)).padStart(2,'0')}:30</span>
  }
                </div>
              ))}
            </div>

            {/* Colonnes */}
            {(selectedDay ? [selectedDay] : weekDates).map((date,di)=>{
              const jsDay = (date.getDay()+6)%7 + 1 // 1=lun...7=dim
              const daysCours = cours.filter(c=>c.jourSemaine===jsDay)
              const isCurrentDay = isToday(date)

              return (
                <div key={di} style={{position:'relative',borderLeft:`1px solid ${border}`}}>
                  {HOURS.map((h,i)=>(
                    <div key={i} style={{height:30,borderBottom:Number.isInteger(h)?'1px solid '+border:'1px dashed '+border+'88'}}/>
                  ))}

                  {/* Ligne heure actuelle */}
                  {isCurrentDay && (
                    <div style={{position:'absolute',top:nowTop-10,left:-48,right:0,zIndex:10,pointerEvents:'none',display:'flex',alignItems:'center'}}>
                      <div style={{
                        background:RED,color:'#fff',borderRadius:999,
                        padding:'2px 6px',fontSize:10,fontWeight:700,
                        flexShrink:0,whiteSpace:'nowrap'
                      }}>
                        {String(new Date().getHours()).padStart(2,'0')}:{String(new Date().getMinutes()).padStart(2,'0')}
                      </div>
                      <div style={{flex:1,height:2,background:RED}}/>
                    </div>
                  )}

                  {/* Cours */}
                  {getOverlapLayout(daysCours).map(({cr:c, col, totalCols}, ci2)=>{
                    const top = timeToTop(c.heureDebut)
                    const naturalH = Math.max(durToH(c.heureDebut,c.heureFin)-2, 20)
                    const height = expandedId===c.id ? Math.max(naturalH, 100) : naturalH
                    const color = matColors[c.matiere?.nom] || COLORS_MAT[0]
                    return (
                      <div key={ci2} style={{
                        position:'absolute',top,left:1,right:1,height,
                        background:color,borderLeft:'none',opacity:c.isAnnule?0.5:1,textDecoration:c.isAnnule?'line-through':'none',boxShadow:selectedCours?.id===c.id?'0 8px 24px rgba(0,0,0,0.2)':'0 2px 8px rgba(0,0,0,0.08)',filter:selectedCours&&selectedCours.id!==c.id?'brightness(0.7)':'none',transform:selectedCours?.id===c.id?'scale(1.02)':'scale(1)',transition:'all 0.2s',
                        borderRadius:4,padding:'3px 5px',overflow:'hidden',cursor:'pointer',zIndex:selectedCours?.id===c.id?20:2
                      }} onClick={e=>{e.stopPropagation();setExpandedId(expandedId===c.id?null:c.id);setSelectedCours(selectedCours?.id===c.id?null:c)}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#fff',lineHeight:1.2}}>{c.matiere?.nom}</div>
                          <button onClick={e=>{e.stopPropagation();annulerCours(c.id)}}
                            style={{background:'rgba(255,255,255,0.25)',border:'none',borderRadius:4,color:'#fff',fontSize:9,fontWeight:600,cursor:'pointer',padding:'2px 5px',flexShrink:0}}>
                            {c.isAnnule ? '↩' : '✕'}
                          </button>
                        </div>
                        <div style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.85)'}}>{c.heureDebut}–{c.heureFin}</div>
                        {c.salle&&<div style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.85)'}}>{c.salle}</div>}
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
    </div>
  )
}
