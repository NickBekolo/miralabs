import { useState, useEffect } from 'react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'
import api from '../../services/api'

const ft = "-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif"

const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MOIS  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function getFirstDay(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}
function getDays(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function StatCard({ label, value, sub, color, C, alert }) {
  return (
    <div style={{ background:C.surface, borderRadius:14, padding:'14px 16px', flex:1 }}>
      <div style={{ fontSize:26, fontWeight:400, color:color??C.text, letterSpacing:'-0.5px', marginBottom:2 }}>{value}</div>
      <div style={{ fontSize:12, fontWeight:400, color:C.text, marginBottom:1 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.muted }}>{sub}</div>}
      {alert && <div style={{ fontSize:12, color:'#ff5555', marginTop:6, fontWeight:600 }}>Seuil d'absences atteint</div>}
    </div>
  )
}

function Calendar({ absences, year, month, C }) {
  const firstDay  = getFirstDay(year, month)
  const daysCount = getDays(year, month)
  const today     = new Date()
  const todayDay  = today.getMonth()===month && today.getFullYear()===year ? today.getDate() : null

  const absentDays   = absences.filter(a => { const d=new Date(a.date); return d.getMonth()===month&&d.getFullYear()===year&&!a.justifiee }).map(a=>new Date(a.date).getDate())
  const justifiedDays= absences.filter(a => { const d=new Date(a.date); return d.getMonth()===month&&d.getFullYear()===year&&a.justifiee }).map(a=>new Date(a.date).getDate())

  const cells = []
  for (let i=0; i<firstDay; i++) cells.push(null)
  for (let d=1; d<=daysCount; d++) cells.push(d)

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', columnGap:0, rowGap:1, marginBottom:4 }}>
        {JOURS.map(j => <div key={j} style={{ fontSize:8, fontWeight:400, color:C.hint, textAlign:'center', padding:'3px 0' }}>{j}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(0,1fr))', columnGap:0, rowGap:1 }}>
        {cells.map((d,i) => {
          if (!d) return <div key={`e${i}`}/>
          const isAbsent    = absentDays.includes(d)
          const isJustified = justifiedDays.includes(d)
          const isToday     = d===todayDay
          const isWeekend   = (i%7)>=5
          let bg='transparent', color=C.muted
          if (isToday)       { bg=C.text;   color=C.bg }
          else if (isAbsent)     { bg='#ff5555';  color='#fff' }
          else if (isJustified)  { bg='rgba(251,191,36,0.15)'; color='#fbbf24' }
          else if (isWeekend)    { color=C.hint }
          return (
            <div key={d} style={{ width:30, height:30, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:400, background:bg, color, position:'relative' }}>
              {d}
              {(isAbsent||isJustified) && <div style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:isAbsent?'#ff5555':'#fbbf24' }}/>}
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:14, marginTop:10 }}>
        {[{ color:'#ff5555', label:'Absence' },{ color:'#fbbf24', label:'Justifiée' },{ color:C.text, label:"Aujourd'hui" }].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:C.muted }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:l.color }}/>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// Barre mensuelle présences/absences
function BarreMensuelle({ absences, C }) {
  const mois = MOIS.map((nom, i) => {
    const count = absences.filter(a => new Date(a.date).getMonth()===i).length
    return { nom:nom.slice(0,3), count, idx:i }
  })
  const max = Math.max(...mois.map(m=>m.count), 1)
  return (
    <div style={{ background:C.surface, borderRadius:14, padding:'16px', marginTop:10 }}>
      <div style={{ fontSize:12, fontWeight:400, color:C.text, marginBottom:14 }}>Absences par mois</div>
      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:60 }}>
        {mois.map(m => (
          <div key={m.idx} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ width:'100%', background:m.count>0?'#ff5555':C.surface2, borderRadius:4, height:m.count>0?`${(m.count/max)*48}px`:'4px', transition:'height 0.3s', minHeight:4 }}/>
            <div style={{ fontSize:8, color:C.hint }}>{m.nom}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AbsenceRow({ absence, C, onJustify }) {
  const date    = new Date(absence.date)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' })
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`1px solid ${C.surface2}` }}>
      <div style={{ width:3, height:36, borderRadius:2, background:absence.justifiee?'#fbbf24':'#ff5555', flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:1 }}>{absence.matiere?.nom ?? 'Cours'}</div>
        <div style={{ fontSize:11, color:C.muted }}>{dateStr}</div>
      </div>
      {absence.justifiee
        ? <span style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:980, background:'rgba(251,191,36,0.15)', color:'#fbbf24' }}>Justifiée</span>
        : absence.statutJustification==='en_attente'
          ? <span style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:980, background:'rgba(255,149,0,0.15)', color:'#FF9500' }}>En attente</span>
          : absence.statutJustification==='refusee'
            ? <span style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:980, background:'rgba(255,59,48,0.15)', color:'#FF3B30' }}>Refusée</span>
            : <button onClick={() => onJustify(absence)} style={{ fontSize:11, fontWeight:500, padding:'5px 12px', borderRadius:980, background:C.surface2, color:C.text, border:'none', cursor:'pointer', fontFamily:ft }}>Justifier</button>
      }
    </div>
  )
}

function JustifyModal({ absence, onClose, onSubmit, C }) {
  const [motif, setMotif] = useState('')
  const [type,  setType]  = useState('medical')
  const [fichier, setFichier] = useState(null)
  const [saving, setSaving] = useState(false)
  const TYPES = [
    { value:'medical',  label:'Médical' },
    { value:'familial', label:'Familial' },
    { value:'autre',    label:'Autre' },
  ]
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:C.bg, borderRadius:'24px 24px 0 0', padding:'20px 16px 30px', width:'100%', maxWidth:480 }}>
        <div style={{ width:40, height:4, background:C.surface2, borderRadius:2, margin:'0 auto 20px' }}/>
        <div style={{ fontSize:16, fontWeight:400, color:C.text, marginBottom:16 }}>Soumettre une justification</div>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              style={{ flex:1, padding:'8px 0', borderRadius:10, border:'none', cursor:'pointer', fontFamily:ft, fontSize:12, fontWeight:type===t.value?700:400, background:type===t.value?C.text:C.surface, color:type===t.value?C.bg:C.muted }}>
              {t.label}
            </button>
          ))}
        </div>
        <textarea value={motif} onChange={e=>setMotif(e.target.value)} placeholder="Motif (optionnel)..."
          style={{ width:'100%', padding:'10px 14px', background:C.surface, border:'none', borderRadius:12, fontSize:13, color:C.text, outline:'none', fontFamily:ft, resize:'none', height:80, boxSizing:'border-box', marginBottom:16 }}/>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6 }}>Justificatif (optionnel) — JPG, PNG ou PDF</label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e=>setFichier(e.target.files[0])}
            style={{ fontSize:12, color:C.text, width:'100%' }}/>
          {fichier && <div style={{ fontSize:11, color:'#34C759', marginTop:4 }}>{fichier.name}</div>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:12, borderRadius:12, border:'none', background:C.surface, color:C.muted, fontSize:13, cursor:'pointer', fontFamily:ft }}>Annuler</button>
          <button onClick={async()=>{
              setSaving(true)
              const formData = new FormData()
              if(fichier) formData.append('fichier', fichier)
              formData.append('motif', motif)
              formData.append('type', type)
              try {
                const r = await fetch('/api/upload/justificatif-absence/'+absence.id, {
                  method:'POST',
                  headers:{'Authorization':'Bearer '+sessionStorage.getItem('token')},
                  body: formData
                })
                if(r.ok) onSubmit({ absence, motif, type })
              } catch(e) { console.error(e) }
              setSaving(false)
            }} disabled={saving} style={{ flex:1, padding:12, borderRadius:12, border:'none', background:C.text, color:C.bg, fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:ft, opacity:saving?0.5:1 }}>{saving?'Envoi...':'Soumettre'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Assiduite() {
  const darkMode = useThemeStore(s => s.darkMode)
  const C        = darkMode ? DARK_THEME : LIGHT_THEME

  const now = new Date()
  const [year,      setYear]      = useState(now.getFullYear())
  const [month,     setMonth]     = useState(now.getMonth())
  const [absences,  setAbsences]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [toJustify, setToJustify] = useState(null)

  useEffect(() => {
    api.get('/api/absences')
      .then(r => setAbsences(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const prevMonth = () => month===0 ? (setMonth(11), setYear(y=>y-1)) : setMonth(m=>m-1)
  const nextMonth = () => month===11 ? (setMonth(0), setYear(y=>y+1)) : setMonth(m=>m+1)

  const handleJustify = ({ absence, motif }) => {
    api.get('/api/absences').then(r => setAbsences(r.data)).catch(()=>{})
    setToJustify(null)
  }

  const total       = absences.length
  const justified   = absences.filter(a=>a.justifiee).length
  const nonJustified= total - justified
  const thisMonth   = absences.filter(a => { const d=new Date(a.date); return d.getMonth()===month&&d.getFullYear()===year })

  return (
    <div style={{ fontFamily:ft, padding:'16px 14px 40px', background:C.bg, minHeight:'100%', color:C.text }}>

      <div style={{ marginBottom:16 }}>
        <h1 style={{ fontSize:22, fontWeight:400, letterSpacing:'-0.4px', color:C.text, marginBottom:3 }}>Assiduité</h1>
        <p style={{ fontSize:12, color:C.hint }}>Suivi de vos présences</p>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <StatCard label="Total absences" value={total} sub="cette année" color={total>10?'#ff5555':undefined} C={C}/>
        <StatCard label="Non justifiées" value={nonJustified} sub={`${justified} justifiées`} color={nonJustified>5?'#ff5555':'#fbbf24'} C={C} alert={nonJustified>=5}/>
      </div>



      {/* Layout 2 colonnes */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

        {/* Colonne gauche — Calendrier + Barre mensuelle */}
        <div>
          <div style={{ background:C.surface, borderRadius:16, padding:'16px' }}>
            {/* Navigation mois */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <button onClick={prevMonth} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:18, padding:'0 4px' }}>‹</button>
              <span style={{ fontSize:14, fontWeight:400, color:C.text }}>{MOIS[month]} {year}</span>
              <button onClick={nextMonth} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:18, padding:'0 4px' }}>›</button>
            </div>
            <Calendar absences={absences} year={year} month={month} C={C}/>
          </div>

          {/* Barre mensuelle */}
          <BarreMensuelle absences={absences} C={C}/>
        </div>

        {/* Colonne droite — Liste absences */}
        <div style={{ background:C.surface, borderRadius:16, padding:'16px' }}>
          <div style={{ fontSize:13, fontWeight:400, color:C.text, marginBottom:12 }}>
            {thisMonth.length>0 ? `${thisMonth.length} absence(s) · ${MOIS[month]}` : `Aucune absence · ${MOIS[month]}`}
          </div>
          {loading ? (
            <div style={{ fontSize:12, color:C.hint }}>Chargement...</div>
          ) : thisMonth.length===0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:C.hint }}>
             
              <div style={{ fontSize:13 }}>Parfaite assiduité ce mois-ci !</div>
            </div>
          ) : thisMonth.map(a => (
            <AbsenceRow key={a.id} absence={a} C={C} onJustify={setToJustify}/>
          ))}

          {/* Toutes les absences */}
          {absences.length > thisMonth.length && (
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:13, fontWeight:400, color:C.text, marginBottom:12 }}>Toutes les absences</div>
              {absences.filter(a => { const d=new Date(a.date); return !(d.getMonth()===month&&d.getFullYear()===year) }).map(a => (
                <AbsenceRow key={a.id} absence={a} C={C} onJustify={setToJustify}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {toJustify && <JustifyModal absence={toJustify} C={C} onClose={() => setToJustify(null)} onSubmit={handleJustify}/>}
    </div>
  )
}