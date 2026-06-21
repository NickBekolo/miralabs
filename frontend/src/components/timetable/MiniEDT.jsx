import { EDT_ITEMS } from '../../data/teacher.data'

/**
 * Aperçu de l'emploi du temps du jour — format vertical compact.
 */
export function MiniEDT() {
  return (
    <div style={{ background:'#fff', borderRadius:18, border:'1px solid #e8e8e8', overflow:'hidden' }}>
      <div style={{ padding:'13px 16px 10px', borderBottom:'1px solid #f0f0f0',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:13, fontWeight:700 }}>Emploi du temps</div>
        <div style={{ fontSize:11, color:'#86868b' }}>Ven. 30 Mai</div>
      </div>
      <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:6 }}>
        {EDT_ITEMS.map((item, i) =>
          item.pause
            ? <PauseRow key={i} item={item} />
            : <CourseRow key={i} item={item} />
        )}
      </div>
      <div style={{ textAlign:'center', padding:9, fontSize:11, fontWeight:600,
        color:'#86868b', borderTop:'1px solid #f0f0f0', cursor:'pointer' }}
        onMouseEnter={e => e.target.style.color = '#1d1d1f'}
        onMouseLeave={e => e.target.style.color = '#86868b'}>
        Voir le complet ›
      </div>
    </div>
  )
}

function PauseRow({ item }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <div style={{ minWidth:36, textAlign:'right', fontSize:10, color:'#aeaeb2', fontWeight:500 }}>
        {item.dur}
      </div>
      <div style={{ flex:1, padding:'6px 10px', borderRadius:9, background:'#f5f5f7',
        border:'1px solid #ebebeb', fontSize:11, fontWeight:600, color:'#86868b' }}>
        {item.label || 'Pause'}
      </div>
    </div>
  )
}

function CourseRow({ item }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <div style={{ minWidth:36, textAlign:'right', fontSize:11,
        fontWeight:700, color: item.tc || '#1d1d1f', flexShrink:0 }}>
        {item.time}
      </div>
      <div style={{ flex:1, padding:'8px 10px', borderRadius:9, border:'1px solid #f0f0f0' }}>
        <div style={{ fontSize:12, fontWeight:700 }}>{item.name}</div>
        <div style={{ fontSize:10, color:'#86868b', marginTop:1 }}>{item.info}</div>
        <div style={{ display:'inline-block', fontSize:9, fontWeight:600,
          padding:'2px 6px', borderRadius:4, marginTop:3, border:'1px solid',
          color: item.lc, background: item.lb, borderColor: item.lbo }}>
          {item.lbl}
        </div>
      </div>
    </div>
  )
}
