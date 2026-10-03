import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'
import MoyenneChart from '../../components/charts/MoyenneChart'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"
const RED = '#FF3B30'

function buildDatasets(notes) {
  const sorted = [...notes].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const byMatiere = {}
  sorted.forEach(n => {
    const key = n.matiere.nom.toLowerCase().replace(/\s/g, '_')
    if (!byMatiere[key]) byMatiere[key] = { label: n.matiere.nom, points: [] }
    byMatiere[key].points.push({ label: n.createdAt ? n.createdAt.split('T')[0] : n.createdAt, val: Math.round((n.valeur / n.noteSur) * 200) / 10 })
  })
  return {
    general: {
      label: 'Moyenne générale',
      points: sorted.map((n, i, arr) => {
        const slice = arr.slice(0, i + 1)
        const moy = Math.round(slice.reduce((s, x) => s + (x.valeur / x.noteSur) * 20, 0) / slice.length * 10) / 10
        return { label: n.createdAt ? n.createdAt.split('T')[0] : n.createdAt, val: moy }
      }),
    },
    ...byMatiere
  }
}

function avg(liste) {
  if (!liste.length) return 0
  return Math.round(liste.reduce((s,n) => s+(n.valeur/n.noteSur)*20, 0)/liste.length*10)/10
}

function noteColor(v) { return v >= 10 ? '#166534' : '#ff5555' }

const MAT_COLORS = {
  'Mathématiques':'#4F7CFF','Physique-Chimie':'#E85D5D','Français':'#8B5CF6',
  'Anglais':'#14B8A6','Histoire-Géographie':'#F59E0B'
}

function MatCard({ matiere, notes, C }) {
  const [open, setOpen] = useState(false)
  const moy = avg(notes)
  const color = moy >= 10 ? '#166534' : '#ff5555'

  return (
    <div style={{background:C.surface,borderRadius:20,border:`1px solid ${C.surface2}`,overflow:'hidden',marginBottom:12}}>
      {/* Header */}
      <div onClick={()=>setOpen(v=>!v)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:color,flexShrink:0}}/>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:ft}}>{matiere}</div>
            <div style={{fontSize:11,color:C.muted}}>{notes.length} note(s)</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{padding:'4px 14px',borderRadius:999,background:color,color:'#fff',fontSize:13,fontWeight:600,fontFamily:ft}}>
            {moy}/20
          </div>
          {open ? <ChevronUp size={16} color={C.muted}/> : <ChevronDown size={16} color={C.muted}/>}
        </div>
      </div>

      {/* Détails */}
      {open && (
        <>
          <div style={{height:1,background:C.surface2}}/>
          {notes.map((n,i) => {
            const sur20 = Math.round((n.valeur/n.noteSur)*200)/10
            const nc = noteColor(sur20)
            return (
              <div key={n.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<notes.length-1?`1px solid ${C.surface2}`:'none',background:C.surface}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:C.muted}}>{n.createdAt}</div>
                  {n.typeEvaluation&&<div style={{fontSize:10,color:C.muted,padding:'2px 6px',borderRadius:999,border:`1px solid ${C.surface2}`,display:'inline-block',marginTop:2}}>{n.typeEvaluation}</div>}
                  {n.commentaire&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{n.commentaire}</div>}
                </div>
                <div style={{fontSize:20,fontWeight:400,color:nc,fontFamily:ft,letterSpacing:'-0.5px'}}>{sur20}<span style={{fontSize:11,color:C.muted}}>/20</span></div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default function Notes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const darkMode = useThemeStore(s => s.darkMode)
  const C = darkMode ? DARK_THEME : LIGHT_THEME
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/notes').then(r=>setNotes(r.data)).finally(()=>setLoading(false))
  }, [])

  const grouped = notes.reduce((acc,n) => {
    const m = n.matiere.nom
    if(!acc[m]) acc[m]=[]
    acc[m].push(n)
    return acc
  }, {})

  const moyGen = avg(notes)

  return (
    <div style={{background:C.bg,minHeight:'100vh',padding:'20px 16px',fontFamily:ft}}>
      <div style={{maxWidth:600,margin:'0 auto'}}>

        {/* Header */}
        <div style={{marginBottom:20}}>
          <button onClick={()=>navigate(-1)} style={{background:'none',border:'none',cursor:'pointer',color:C.text,display:'flex',alignItems:'center',gap:4,fontSize:13,marginBottom:12,padding:0}}>
            <ArrowLeft size={16}/> Retour
          </button>
          <div style={{fontSize:22,fontWeight:400,letterSpacing:'-0.8px',color:C.text}}>Mes notes</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{user?.firstName} {user?.lastName}</div>
        </div>

        {/* Moyenne générale */}
        {notes.length>0&&(
          <div style={{background:C.surface,borderRadius:20,padding:'16px',border:`1px solid ${C.surface2}`,marginBottom:20,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,background:'radial-gradient(circle,rgba(162,155,254,0.15),transparent)',pointerEvents:'none'}}/>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>Moyenne générale</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:34,fontWeight:400,color:'#166534',letterSpacing:'-1px',fontFamily:ft}}>{moyGen}<span style={{fontSize:14,color:C.muted}}>/20</span></div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{notes.length} notes · {Object.keys(grouped).length} matières</div>
              </div>
            </div>
          </div>
        )}

        {notes.length > 1 && (
          <div style={{marginBottom:20}}>
            <MoyenneChart datasets={buildDatasets(notes)} defaultKey="general"/>
          </div>
        )}
        {loading&&<div style={{textAlign:'center',color:C.muted,padding:40,fontSize:13}}>Chargement...</div>}

        {/* Par matière */}
        {Object.entries(grouped).map(([mat,liste])=>(
          <MatCard key={mat} matiere={mat} notes={liste} C={C}/>
        ))}

        {!loading&&notes.length===0&&(
          <div style={{textAlign:'center',color:C.muted,padding:40,fontSize:13}}>Aucune note pour le moment.</div>
        )}
      </div>
    </div>
  )
}
