import { PriorityBadge } from '../../../components/ui/Badge'
import { TASKS } from '../../../data/teacher.data'
export function TachesSection() {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:14, fontWeight:700 }}>Tâches</span>
        <span style={{ fontSize:12, color:'#86868b', cursor:'pointer' }}>Voir tout ›</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {TASKS.map(t=>(
          <div key={t.id} style={{ background:'#fff', border:'1.5px solid #e8e8e8', borderRadius:12, padding:'9px 11px', display:'flex', alignItems:'flex-start', gap:8 }}>
            <span style={{ fontSize:14, flexShrink:0 }}>{t.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600 }}>{t.name}</div>
              <div style={{ fontSize:10, color:'#86868b', marginTop:1 }}>{t.desc}</div>
            </div>
            <PriorityBadge priority={t.priority} />
          </div>
        ))}
      </div>
    </div>
  )
}
