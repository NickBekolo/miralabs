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

function DetailTable({ data, dataKey, color }) {
  const max = Math.max(...data.map(d => d[dataKey]||0)) || 1
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:16 }}>
      {data.map(d => (
        <div key={d.name} style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:100, fontSize:13, fontWeight:500, color:'#111', flexShrink:0 }}>{d.name}</div>
          <div style={{ flex:1, height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${Math.max((d[dataKey]||0)/max*100,2)}%`, height:'100%', background:color, borderRadius:4, transition:'width 0.4s ease' }}/>
          </div>
          <div style={{ width:48, fontSize:13, fontWeight:700, color, textAlign:'right', flexShrink:0 }}>{d[dataKey]||0}</div>
        </div>
      ))}
    </div>
  )
}

export default function ChartCard({ title, data, dataKey, type='bar', color='#007AFF', C, onDetail, renderDetail }) {
  const [expanded, setExpanded] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const surface  = C?.surface  || '#fff'
  const surface2 = C?.surface2 || '#f0f0f0'
  const text     = C?.text     || '#111'
  const muted    = C?.muted    || '#888'

  return (
    <>
      <div style={{ background:surface, borderRadius:14, padding:'16px 18px', border:`1px solid ${surface2}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:600, color:text }}>{title}</div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => onDetail ? onDetail() : setShowDetail(true)}
                style={{ fontSize:11, color:'#fff', background:'#111', border:'none', padding:'3px 10px', borderRadius:20, cursor:'pointer', fontWeight:600 }}>
                Voir plus
              </button>
              <button onClick={() => setExpanded(true)}
                style={{ fontSize:11, color:'#111', background:'#f0f0f0', border:'none', padding:'3px 10px', borderRadius:20, cursor:'pointer' }}>
                Agrandir
              </button>
            </div>
          </div>
        </div>
        <Chart type={type} data={data} dataKey={dataKey} color={color} height={220} showAxes={true}/>
      </div>

      {/* Modal agrandir */}
      {expanded && <ChartFullscreenModal chart={{ title, data, dataKey, type, color }} onClose={() => setExpanded(false)}/>}

      {/* Modal détails */}
      {showDetail && (
        <div onClick={() => setShowDetail(false)} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:20, padding:32, width:'90vw', maxWidth:600, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:18, fontWeight:700 }}>{title}</div>
              <button onClick={() => setShowDetail(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888' }}>
                <X size={20}/>
              </button>
            </div>
            <div style={{ fontSize:13, color:'#888', marginBottom:16 }}>{data.length} entrée{data.length>1?'s':''}</div>
            <Chart type={type} data={data} dataKey={dataKey} color={color} height={220} showAxes={true}/>
            <DetailTable data={data} dataKey={dataKey} color={color}/>
            {renderDetail && (
              <div style={{ marginTop:20, borderTop:'1px solid #f0f0f0', paddingTop:20 }}>
                {renderDetail()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
