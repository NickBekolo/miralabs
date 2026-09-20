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

export default function Calendrier() {
  const darkMode = useThemeStore(s=>s.darkMode)
  const C = darkMode ? DARK_THEME : LIGHT_THEME
  const today = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [baseDate, setBaseDate] = useState(new Date())
  const [cours,    setCours]    = useState([])
  const [absences, setAbsences] = useState([])
  const [devoirs,  setDevoirs]  = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [calCollapsed, setCalCollapsed] = useState(false) // null = vue semaine
  const [nowTop,   setNowTop]   = useState(0)
  const scrollRef = useRef(null)

  const weekDates = getWeekDates(baseDate)

  useEffect(() => {
    api.get('/api/cours/edt').then(r=>setCours(r.data)).catch(()=>{})
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

  return (
    <div style={{fontFamily:ft, background:bg, height:'100vh', display:'flex', overflow:'hidden'}}>

      {/* Colonne gauche — mini calendrier */}
      <div style={{width:calCollapsed?32:220, borderRight:`1px solid ${border}`, position:'relative', transition:'width 0.2s', display:'flex', flexDirection:'column', padding:'16px 12px', flexShrink:0}}>

        <button onClick={()=>setCalCollapsed(v=>!v)}
          style={{position:'absolute',top:10,right:6,background:'none',border:'none',cursor:'pointer',color:'#FF3B30',fontSize:10,fontWeight:600,display:'flex',alignItems:'center',gap:2,zIndex:1}}>
          {calCollapsed ? <ChevronRight size={13}/> : <><ChevronLeft size={13}/><span style={{display:calCollapsed?'none':'inline'}}>Réduire</span></>}
        </button>
        {!calCollapsed && <>
        {/* Mois nav */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, marginTop:28}}>
          <button onClick={()=>{ const d=new Date(calYear,calMonth-1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
            style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:4}}><ChevronLeft size={14}/></button>
          <div style={{fontSize:13,fontWeight:600,color:text}}>{MONTHS[calMonth]} {calYear}</div>
          <button onClick={()=>{ const d=new Date(calYear,calMonth+1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()) }}
            style={{background:'none',border:'none',cursor:'pointer',color:muted,padding:4}}><ChevronRight size={14}/></button>
        </div>

        {/* Jours semaine */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
          {DAYS_SHORT.map((d,i)=>(
            <div key={i} style={{textAlign:'center',fontSize:10,color:muted,fontWeight:500,padding:'2px 0'}}>{d}</div>
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

        {/* Légende */}
        <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:11,color:muted,fontWeight:600,marginBottom:4}}>Légende</div>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:muted}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#FF3B30'}} /> Absence
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:muted}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#007AFF'}}/> Devoir
          </div>

        </div>
      </>}
      </div>

      {/* Colonne droite — vue semaine */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

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
                  {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i]}
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
                  {Number.isInteger(h) && <span style={{fontSize:10,color:muted}}>{String(Math.floor(h)).padStart(2,'0')}:00</span>}
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
                  {daysCours.map((c,ci2)=>{
                    const top = timeToTop(c.heureDebut)
                    const height = Math.max(durToH(c.heureDebut,c.heureFin)-2, 20)
                    const color = matColors[c.matiere?.nom] || COLORS_MAT[0]
                    return (
                      <div key={ci2} style={{
                        position:'absolute',top,left:1,right:1,height,
                        background:color+'22',borderLeft:`3px solid ${color}`,
                        borderRadius:4,padding:'3px 5px',overflow:'hidden',cursor:'pointer'
                      }}>
                        <div style={{fontSize:11,fontWeight:700,color,lineHeight:1.2}}>{c.matiere?.nom}</div>
                        <div style={{fontSize:10,color:muted}}>{c.heureDebut}–{c.heureFin}</div>
                        {c.salle&&<div style={{fontSize:10,color:muted}}>{c.salle}</div>}
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
  )
}
