import { useState, useEffect } from 'react'
import { Bell, PenLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Signature from '../Signature'
import { useAuth } from '../../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../../store/ThemeStore'
import api from '../../../services/api'
import MoyenneChart from '../../../components/charts/MoyenneChart'
import StudentPlanningWidget from '../PlanningWidget'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"

function avg(notes) {
  if (!notes.length) return 0
  const total = notes.reduce((s, n) => s + (n.valeur / n.noteSur) * 20, 0)
  return Math.round((total / notes.length) * 10) / 10
}

function buildDatasets(notes) {
  return {
    general: {
      label: 'Moyenne générale',
      points: notes.map(n => ({
        label: n.createdAt,
        val: Math.round((n.valeur / n.noteSur) * 200) / 10,
        classe: 12, rang: 1,
      })),
    }
  }
}

export default function Mobile({ onSign, onNav }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showChart, setShowChart] = useState(true)
  const [showEdt, setShowEdt] = useState(true)
  const [showAlertes, setShowAlertes] = useState(true)
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME

  const [notes,   setNotes]   = useState([])
  const [cours,   setCours]   = useState([])
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/notes'),
      api.get('/api/cours/today'),
      api.get('/api/notifications'),
    ]).then(([n, c, nt]) => {
      setNotes(n.data)
      setCours(c.data)
      setNotifs(nt.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const moyenne  = avg(notes)
  const datasets = buildDatasets(notes)

  return (
    <div style={{ fontFamily:ft, background:C.bg, color:C.text, paddingBottom:20, minHeight:'100%', paddingTop:0 }}>

      {/* Salutation */}
      <div style={{ padding:'0 16px 0', marginTop:0 }}>
        <div style={{ fontSize:22, fontWeight:400, color:C.text, letterSpacing:'-0.8px' }}>
          Bonjour, {user?.firstName ?? 'toi !'}
        </div>
        <div style={{fontSize:14,color:C.text,marginTop:20,marginBottom:8}}>
          Tu sais que tu as actuellement <span style={{fontWeight:400,color:'#a29bfe',fontSize:18,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",letterSpacing:'-0.8px'}}>{moyenne}/20</span> de moyenne, <span style={{color:'#a29bfe'}}>{parseFloat(moyenne)>=16?"mention très bien":parseFloat(moyenne)>=14?"mention bien":parseFloat(moyenne)>=12?"mention assez bien":parseFloat(moyenne)>=10?"continue tes efforts":"il faut bosser"}</span>
        </div>

      </div>

      {/* Carte moyenne */}
      <div style={{padding:'0 16px',marginTop:16,marginBottom:4,display:'flex',flexDirection:'row',alignItems:'center',gap:8}}>
        <div style={{fontSize:16,fontWeight:400,letterSpacing:'-0.6px',color:C.text,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>Planning de la semaine</div>
        <button onClick={()=>setShowEdt(v=>!v)} style={{fontSize:11,color:'#FF3B30',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>{showEdt?'Réduire':'Afficher'}</button>
      </div>
      {showEdt && <div style={{padding:'0 16px',marginTop:8}}><StudentPlanningWidget C={C} onNav={()=>{}}/></div>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px',marginBottom:4}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:16,fontWeight:400,letterSpacing:'-0.6px',color:C.text,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>Moyenne générale</div>
          <button onClick={()=>setShowChart(v=>!v)} style={{fontSize:11,color:'#FF3B30',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>{showChart?'Réduire':'Afficher'}</button>
        </div>
      </div>
      {showChart && <div style={{ margin:'0 16px 16px', background:'transparent', padding:'0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div onClick={()=>setShowChart(v=>!v)} style={{ fontSize:12, color:C.hint, marginBottom:2, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            </div>
          </div>

        </div>
        {notes.length > 0 && <MoyenneChart datasets={datasets} defaultKey="general"/>}
      </div>}



      {/* Notes récentes */}
      <div style={{ padding:'0 16px', marginBottom:12, marginTop:16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:16, fontWeight:400, letterSpacing:'-0.6px', color:C.text, fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" }}>Dernières notes</span>
          <button onClick={() => navigate('/student/notes')}
            style={{ fontSize:12, color:'#FF3B30', background:'none', border:'none', cursor:'pointer', fontFamily:ft, fontWeight:500 }}>
            Voir tout →
          </button>
        </div>

        {loading ? (
            <div style={{fontSize:12,color:C.hint}}>Chargement...</div>
          ) : notes.length === 0 ? (
            <div style={{fontSize:12,color:C.hint,textAlign:'center',padding:'8px 0'}}>Aucune note</div>
          ) : (
            <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
              {notes.slice(0,6).map((n,i)=>{
                const sur20 = Math.round((n.valeur/n.noteSur)*200)/10
                const low = sur20 < 10
                const color = low ? '#FF3B30' : '#a29bfe'
                return (
                  <div key={n.id} style={{flexShrink:0,width:200,background:C.surface,borderRadius:16,padding:'16px 18px',border:`1px solid ${C.surface2}`}}>
                    <div style={{fontSize:34,fontWeight:400,color,letterSpacing:'-0.8px',fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"}}>{sur20}<span style={{fontSize:12,color:C.muted}}>/20</span></div>
                    <div style={{fontSize:14,fontWeight:500,color:C.text,marginTop:6,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n.matiere.nom}</div>
                    {n.typeEvaluation&&<div style={{fontSize:10,color:C.muted,marginTop:4,padding:'2px 8px',borderRadius:999,border:`1px solid ${C.surface2}`,display:'inline-block'}}>{n.typeEvaluation}</div>}
                    {n.commentaire&&<div style={{fontSize:12,color:C.muted,marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n.commentaire}</div>}
                    <div style={{fontSize:11,color:C.hint,marginTop:6}}>{n.createdAt}</div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {/* Notifications */}
      {notifs.length > 0 && (
        <div style={{padding:'0 16px',marginBottom:20,marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:16,fontWeight:400,letterSpacing:'-0.6px',color:C.text,fontFamily:ft}}>Alertes</div>
            <div style={{fontSize:11,background:'#a29bfe',color:'#fff',borderRadius:999,padding:'2px 8px',fontWeight:600}}>{notifs.length}</div>
            <button onClick={()=>setShowAlertes(v=>!v)} style={{fontSize:11,color:'#FF3B30',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>{showAlertes?'Réduire':'Afficher'}</button>
          </div>
          </div>
          {showAlertes && <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.surface2}`,overflow:'hidden'}}>
            {notifs.slice(0,3).map((n,i)=>(
              <div key={n.id} onClick={()=>{ if(n.type==='appel'){onSign&&onSign()} else{onNav&&onNav('conversations')} }}
                onMouseEnter={e=>e.currentTarget.style.background=C.surface2}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                style={{padding:'12px 14px',borderBottom:i<Math.min(notifs.length,3)-1?`1px solid ${C.surface2}`:'none',cursor:'pointer',transition:'background 0.15s',display:'flex',alignItems:'center',gap:12}}>
                {(()=>{
                  const name = n.sender ? n.sender.firstName+' '+n.sender.lastName : n.title??'?'
                  const hue = Array.from(name).reduce((a,ch)=>a+ch.charCodeAt(0),0)%360
                  const bg = `hsl(${hue},65%,52%)`
                  const initials = name.split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase()
                  return <div style={{width:36,height:36,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13,fontWeight:600,color:'#fff'}}>{initials}</div>
                })()}
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:C.text}}>{n.title}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{n.message}</div>
                </div>
                {n.type==='appel'&&(
                  <div style={{background:'#FF3B30',borderRadius:980,padding:'6px 12px',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>Signer</div>
                )}
              </div>
            ))}
          </div>}
        </div>
      )}
      
    </div>
  )
}