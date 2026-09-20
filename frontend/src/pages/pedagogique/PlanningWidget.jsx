import { useState, useEffect } from 'react'
import api from '../../services/api'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
const RED = '#FF3B30'
const HOURS = Array.from({length:14},(_,i)=>i+8) // 8h à 21h
const PX_PER_MIN = 30/60 // 30px par heure

function timeToY(t) {
  const [h,m] = t.split(':').map(Number)
  return (h-8)*30 + m*PX_PER_MIN
}
function durToH(s,e) {
  const [sh,sm]=s.split(':').map(Number),[eh,em]=e.split(':').map(Number)
  return ((eh*60+em)-(sh*60+sm))*PX_PER_MIN
}

export default function PlanningWidget({ C }) {
  const [cours, setCours] = useState([])
  const [nowY, setNowY] = useState(0)
  const [nowTime, setNowTime] = useState('')

  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1)

  const todayDay = (today.getDay()+6)%7+1
  const tomorrowDay = (tomorrow.getDay()+6)%7+1

  useEffect(() => {
    api.get('/api/cours/enseignant').then(r => setCours(r.data)).catch(()=>{})
  }, [])

  useEffect(() => {
    const update = () => {
      const n = new Date()
      const t = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
      setNowY(timeToY(t))
      setNowTime(t)
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [])

  const DAYS_FR = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
  const todayName = DAYS_FR[todayDay-1].toUpperCase()
  const tomorrowName = DAYS_FR[tomorrowDay-1].toUpperCase()

  const todayCours = cours.filter(c=>c.jourSemaine===todayDay)
  const tomorrowCours = cours.filter(c=>c.jourSemaine===tomorrowDay)
  const totalH = HOURS.length * 40

  const DayCol = ({ label, dayNum, isToday, dayCours }) => (
    <div style={{flex:1, minWidth:0}}>
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:700,color:isToday?RED:'#aeaeb2',letterSpacing:'0.5px'}}>{label}</div>
        <div style={{fontSize:28,fontWeight:800,color:'#1d1d1f',lineHeight:1}}>{dayNum}</div>
      </div>
      <div style={{position:'relative',height:totalH}}>
        {/* Lignes heures */}
        {HOURS.map((h,i)=>(
          <div key={h} style={{position:'absolute',top:i*40,left:0,right:0,display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:9,color:'#c7c7cc',width:24,flexShrink:0}}>{String(h).padStart(2,'0')}h</span>
            <div style={{flex:1,height:1,background:'#f0f0f0'}}/>
          </div>
        ))}
        {/* Indicateur heure actuelle */}
        {isToday && (
          <div style={{position:'absolute',top:nowY,left:0,right:0,display:'flex',alignItems:'center',gap:4,zIndex:5,pointerEvents:'none'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:RED,flexShrink:0}}/>
            <div style={{flex:1,height:1.5,background:RED}}/>
          </div>
        )}
        {/* Cours */}
        {dayCours.map((c,i)=>{
          const top = timeToY(c.heureDebut)
          const h = Math.max(durToH(c.heureDebut,c.heureFin)-2, 16)
          const color = c.couleur || '#4ECDC4'
          return (
            <div key={c.id} style={{
              position:'absolute',top,left:30,right:2,height:h,
              background:color,borderRadius:6,padding:'3px 6px',
              overflow:'hidden',zIndex:3
            }}>
              <div style={{fontSize:9,fontWeight:700,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.matiere?.nom}</div>
              {h>20&&<div style={{fontSize:8,color:'rgba(255,255,255,0.85)'}}>{c.heureDebut}–{c.heureFin}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{
      fontFamily:ft,
      background:'#fff',
      borderRadius:20,
      padding:'16px 16px 12px',
      position:'relative',
      overflow:'hidden',
      boxShadow:'0 2px 16px rgba(0,0,0,0.08)'
    }}>
      {/* Dégradé décoratif */}
      <div style={{position:'absolute',top:-20,left:-20,width:100,height:100,background:'radial-gradient(circle,rgba(255,149,0,0.15),transparent)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-20,right:-20,width:100,height:100,background:'radial-gradient(circle,rgba(0,122,255,0.12),transparent)',pointerEvents:'none'}}/>

      <div style={{fontSize:14,fontWeight:500,letterSpacing:'-0.4px',color:'#1d1d1f',marginBottom:12}}>Planning</div>

      <div style={{display:'flex',gap:16,position:'relative'}}>
        <DayCol label={todayName} dayNum={today.getDate()} isToday dayCours={todayCours}/>
        <div style={{width:1,background:'#f0f0f0',alignSelf:'stretch'}}/>
        <DayCol label={tomorrowName} dayNum={tomorrow.getDate()} isToday={false} dayCours={tomorrowCours}/>
      </div>
    </div>
  )
}
