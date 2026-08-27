import { STATS } from '../../../data/teacher.data'
function InnerBlock({ children }) {
  return <div style={{ background:'fff', borderRadius:, padding:, border:'px solid eeeeee' }}>{children}</div>
}
function Label({ children }) {
  return <div style={{ fontSize:, color:'aeaeb', marginBottom: }}>{children}</div>
}
export function OverviewSection() {
  const avs=[{c:'ece',l:'T'},{c:'bc',l:'A'},{c:'ff',l:'C'},{c:'c',l:'L'}]
  return (
    <div style={{ background:'fff', border:'px solid eee', borderRadius:, padding: }}>
      <div style={{ display:'grid', gridTemplateColumns:'fr fr', gap:, marginBottom: }}>
        <InnerBlock>
          <div style={{ display:'flex', marginBottom: }}>
            {avs.map((av,i)=>(
              <div key={i} style={{ width:,height:,borderRadius:'%',border:'px solid fff',marginLeft:i===?:-,background:av.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:,fontWeight:,color:'fff' }}>{av.l}</div>
            ))}
          </div>
          <div style={{ fontSize:, fontWeight:, letterSpacing:'-.px', marginBottom: }}>{STATS.apprenants}</div>
          <div style={{ fontSize:, color:'b' }}>apprenants</div>
          <div style={{ marginTop: }}>
            <Label>Présence cette semaine</Label>
            <svg viewBox="   " style={{ width:'%', height: }}>
              <polyline points=", , , , , , ," fill="none" stroke="ddf" strokeWidth="" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>
        </InnerBlock>
        <InnerBlock>
          <Label>Taux de présence</Label>
          <div style={{ fontSize:, fontWeight:, letterSpacing:'-px', marginBottom: }}>{STATS.presence}%</div>
          <Label>Appréciation cours</Label>
          <div style={{ display:'flex', alignItems:'flex-end', gap:, height: }}>
            {STATS.appreciation.map((h,i)=>(
              <div key={i} style={{ width:, background:[,].includes(i)?'ddd':'ddf', borderRadius:'px px  ', height:`${h}%` }}/>
            ))}
          </div>
          <div style={{ fontSize:, color:'aeaeb', marginTop: }}>Lun → Ven</div>
        </InnerBlock>
      </div>
      <div style={{ fontSize:, fontWeight:, display:'flex', alignItems:'center', gap: }}> Vue d'ensemble</div>
    </div>
  )
}
