import { FONT_STACK } from '../../../constants/theme'
import { CLASSES } from '../../../data/teacher.data'
export function ClassesSection() {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:14, fontWeight:700 }}>Mes classes</span>
        <span style={{ fontSize:12, color:'#86868b', cursor:'pointer' }}>Voir tout ›</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {CLASSES.map(cls=>(
          <div key={cls.id} style={{ background:'#fff', border:'1.5px solid #e8e8e8', borderRadius:14, padding:12 }}>
            <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.5px', marginBottom:1 }}>{cls.name}</div>
            <div style={{ fontSize:11, color:'#86868b', marginBottom:8 }}>{cls.matiere} · {cls.niveau}</div>
            <div style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
              {cls.avatars.map((av,i)=>(
                <div key={i} style={{ width:20,height:20,borderRadius:'50%',border:'2px solid #fff',marginLeft:i===0?0:-4,background:av.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#fff' }}>{av.l}</div>
              ))}
              <span style={{ fontSize:10, color:'#86868b', marginLeft:6 }}>{cls.apprenants} appr.</span>
            </div>
            <div style={{ display:'flex', gap:5 }}>
              {['Cahier','Assiduité'].map(lbl=>(
                <button key={lbl} style={{ padding:'5px 10px',borderRadius:980,border:'1.5px solid #e8e8e8',background:'#fff',color:'#1d1d1f',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',transition:'all 0.15s',fontFamily:FONT_STACK }}
                  onMouseEnter={e=>{e.target.style.background='#1d1d1f';e.target.style.color='#fff';e.target.style.borderColor='#1d1d1f'}}
                  onMouseLeave={e=>{e.target.style.background='#fff';e.target.style.color='#1d1d1f';e.target.style.borderColor='#e8e8e8'}}>{lbl}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
