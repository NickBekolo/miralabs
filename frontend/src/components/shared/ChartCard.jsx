import { useState } from 'react'
import { X } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function Chart({ type, data, dataKey, color, height, showAxes=true }) {
  const common = {
    data,
    margin: showAxes ? { top:5, right:10, left:0, bottom:5 } : { top:5, right:5, left:-30, bottom:0 }
  }
  const tooltipStyle = { fontSize:12, borderRadius:8 }

  if (type === 'bar') return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart {...common} barSize={showAxes?28:14}>
        {showAxes && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)"/>}
        {showAxes && <XAxis dataKey="name" tick={{ fontSize:11 }}/>}
        {showAxes && <YAxis tick={{ fontSize:11 }}/>}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill:'rgba(0,0,0,0.04)' }}/>
        <Bar dataKey={dataKey} fill={color} radius={[6,6,0,0]}/>
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart {...common}>
        {showAxes && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)"/>}
        {showAxes && <XAxis dataKey="name" tick={{ fontSize:11 }}/>}
        {showAxes && <YAxis tick={{ fontSize:11 }}/>}
        <Tooltip contentStyle={tooltipStyle}/>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r:4, fill:color }}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

function ChartFullscreenModal({ chart, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', animation:'fadeIn 0.15s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:32, width:'90vw', maxWidth:800, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'scaleIn 0.15s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.3px' }}>{chart.title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', display:'flex' }}>
            <X size={20}/>
          </button>
        </div>
        <Chart type={chart.type} data={chart.data} dataKey={chart.dataKey} color={chart.color} height={360} showAxes={true}/>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  )
}

export default function ChartCard({ title, data, dataKey, type='bar', color='#007AFF', C }) {
  const [expanded, setExpanded] = useState(false)
  const surface  = C?.surface  || '#fff'
  const surface2 = C?.surface2 || '#f0f0f0'
  const text     = C?.text     || '#111'
  const muted    = C?.muted    || '#888'

  return (
    <>
      <div onClick={() => setExpanded(true)}
        style={{ background:surface, borderRadius:14, padding:'16px 18px', border:`1px solid ${surface2}`, cursor:'pointer', transition:'box-shadow 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:600, color:text }}>{title}</div>
          <div style={{ fontSize:11, color:muted, background:surface2, padding:'2px 8px', borderRadius:20 }}>Agrandir</div>
        </div>
        <Chart type={type} data={data} dataKey={dataKey} color={color} height={220} showAxes={true}/>
      </div>
      {expanded && <ChartFullscreenModal chart={{ title, data, dataKey, type, color }} onClose={() => setExpanded(false)}/>}
    </>
  )
}
