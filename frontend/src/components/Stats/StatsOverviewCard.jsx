import { useState } from 'react'
import { Users2, X } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const AVATAR_COLORS = ['#f6c343','#e0605c','#3fb87f','#8f8fe0','#6ec6e0']

function colorFor(name) {
  const sum = [...(name||'?')].reduce((acc,c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function initials(name) {
  return (name||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()
}

function AvatarStack({ users, max=4 }) {
  const shown = users.slice(0, max)
  const rest  = users.length - shown.length
  return (
    <div style={{ display:'flex' }}>
      {shown.map((u,i) => (
        <div key={u.id??u.name} style={{ width:36, height:36, borderRadius:'50%', border:'2px solid #fff', marginLeft:i===0?0:-10, overflow:'hidden', flexShrink:0 }}>
          {u.photo
            ? <img src={u.photo} alt={u.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <span style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#1c1c1c', background:u.color??colorFor(u.name) }}>{initials(u.name)}</span>
          }
        </div>
      ))}
      {rest > 0 && (
        <div style={{ width:36, height:36, borderRadius:'50%', border:'2px solid #fff', marginLeft:-10, background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#666' }}>
          +{rest}
        </div>
      )}
    </div>
  )
}

function LineSpark({ data=[] }) {
  if (data.length < 2) return null
  const w=100, h=40
  const min=Math.min(...data), max=Math.max(...data)
  const range = max-min||1
  const points = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width:'100%', height:56 }}>
      <polyline points={points} fill="none" stroke="#2f80ed" strokeWidth="2.5"/>
    </svg>
  )
}

function BarSpark({ data=[] }) {
  if (data.length===0) return null
  const max = Math.max(...data.map(d=>d.value))||1
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8, height:180 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', gap:8 }}>
          <div style={{ width:10, borderRadius:6, background:'#e8703a', height:`${Math.max((d.value/max)*100,6)}%` }}/>
          <span style={{ fontSize:11, fontWeight:600, color:'#8a8a8a' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function StatsDetailModal({ users, metric, trend, distribution, caption, onClose }) {
  const CaptionIcon = caption?.icon ?? Users2
  const chartData = distribution.map(d => ({ name:d.label, value:d.value }))
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:32, width:'90vw', maxWidth:800, maxHeight:'85vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <CaptionIcon size={20} strokeWidth={2}/>
            <span style={{ fontSize:18, fontWeight:700 }}>{caption?.label}</span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888' }}>
            <X size={20}/>
          </button>
        </div>

        {/* Metric + users */}
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
          <div>
            <div style={{ fontSize:40, fontWeight:800, letterSpacing:'-1px' }}>{metric.value}</div>
            <div style={{ fontSize:13, color:'#888' }}>{metric.label}</div>
          </div>
          <AvatarStack users={users} max={10}/>
        </div>

        {/* Trend line */}
        {trend.length > 1 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Évolution</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend.map((v,i) => ({ name:`P${i+1}`, value:v }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{ fontSize:12 }}/>
                <YAxis tick={{ fontSize:12 }}/>
                <Tooltip/>
                <Line type="monotone" dataKey="value" stroke="#2f80ed" strokeWidth={2} dot={{ r:4 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Distribution bars */}
        {chartData.length > 0 && (
          <div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Répartition</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{ fontSize:12 }}/>
                <YAxis tick={{ fontSize:12 }}/>
                <Tooltip/>
                <Bar dataKey="value" fill="#e8703a" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Liste complète users */}
        {users.length > 0 && (
          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Membres ({users.length})</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {users.map(u => (
                <div key={u.id??u.name} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'#f5f5f5', borderRadius:20 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:u.color??colorFor(u.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#1c1c1c' }}>
                    {initials(u.name)}
                  </div>
                  <span style={{ fontSize:13, fontWeight:500 }}>{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatsOverviewCard({
  users=[],
  metric={ label:'Effectif', value:0 },
  trend=[],
  distribution=[],
  caption={ icon:Users2, label:"Vue d'ensemble" }
}) {
  const [showDetail, setShowDetail] = useState(false)
  const CaptionIcon = caption?.icon ?? Users2
  const tile = { background:'#ffffff', border:'1.5px solid #111', borderRadius:20, padding:18, display:'flex', flexDirection:'column' }

  return (
    <>
      <div onClick={() => setShowDetail(true)}
        style={{ display:'flex', flexDirection:'column', gap:14, fontFamily:"'SF Pro Display',-apple-system,sans-serif", cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'auto auto', gap:12 }}>
          <div style={{ ...tile, gridColumn:1, gridRow:1, gap:14 }}>
            <AvatarStack users={users}/>
            <span style={{ fontSize:32, fontWeight:800, lineHeight:1 }}>{metric.value}</span>
            <span style={{ fontSize:13, fontWeight:600, color:'#8a8a8a' }}>{metric.label}</span>
          </div>
          <div style={{ ...tile, gridColumn:1, gridRow:2, justifyContent:'flex-end', minHeight:110 }}>
            <div style={{ width:28, height:4, borderRadius:2, background:'#ececec', marginBottom:12 }}/>
            <LineSpark data={trend}/>
          </div>
          <div style={{ ...tile, gridColumn:2, gridRow:'1 / span 2', justifyContent:'flex-end' }}>
            <div style={{ width:28, height:4, borderRadius:2, background:'#ececec', marginBottom:12 }}/>
            <BarSpark data={distribution}/>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:16, fontWeight:700, color:'#111' }}>
          <CaptionIcon size={18} strokeWidth={2}/>
          <span>{caption?.label}</span>
        </div>
      </div>

      {showDetail && (
        <StatsDetailModal
          users={users}
          metric={metric}
          trend={trend}
          distribution={distribution}
          caption={caption}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}
