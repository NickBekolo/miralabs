import { STATS } from '../../../data/teacher.data'
function InnerBlock({ children }) {
  return <div style={{ background:'#f8f8f8', borderRadius:12, padding:12, border:'1px solid #eeeeee' }}>{children}</div>
}
function Label({ children }) {
  return <div style={{ fontSize:9, color:'#aeaeb2', marginBottom:4 }}>{children}</div>
}
export function OverviewSection() {
  const avs=[{c:'#5e5ce6',l:'T'},{c:'#30b0c7',l:'A'},{c:'#ff9500',l:'C'},{c:'#34c759',l:'L'}]
  return (
    <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:18, padding:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
        <InnerBlock>
          <div style={{ display:'flex', marginBottom:8 }}>
            {avs.map((av,i)=>(
              <div key={i} style={{ width:22,height:22,borderRadius:'50%',border:'2px solid #f8f8f8',marginLeft:i===0?0:-4,background:av.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#fff' }}>{av.l}</div>
            ))}
          </div>
          <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-1.5px', marginBottom:2 }}>{STATS.apprenants}</div>
          <div style={{ fontSize:10, color:'#86868b' }}>apprenants</div>
          <div style={{ marginTop:8 }}>
            <Label>Présence cette semaine</Label>
            <svg viewBox="0 0 100 28" style={{ width:'100%', height:26 }}>
              <polyline points="0,22 17,14 33,17 50,6 67,10 83,4 100,1" fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>
        </InnerBlock>
        <InnerBlock>
          <Label>Taux de présence</Label>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-1px', marginBottom:10 }}>{STATS.presence}%</div>
          <Label>Appréciation cours</Label>
          <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:34 }}>
            {STATS.appreciation.map((h,i)=>(
              <div key={i} style={{ width:10, background:[3,5].includes(i)?'#d1d1d6':'#1d1d1f', borderRadius:'2px 2px 0 0', height:`${h}%` }}/>
            ))}
          </div>
          <div style={{ fontSize:9, color:'#aeaeb2', marginTop:3 }}>Lun → Ven</div>
        </InnerBlock>
      </div>
      <div style={{ fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><span>👥</span> Vue d'ensemble</div>
    </div>
  )
}
