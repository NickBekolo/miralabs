import { STATS_DETAIL } from '../../../data/teacher.data'
export function StatsModal({ onClose }) {
  const sections=[
    {title:'Résultats académiques',items:STATS_DETAIL.academic},
    {title:'Progression des apprenants',items:STATS_DETAIL.progression},
    {title:'Performance de la classe',items:STATS_DETAIL.performance},
  ]
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'24px 24px 0 0',width:'100%',maxHeight:'88vh',overflowY:'auto',padding:'24px 28px 36px'}}>
        <div style={{width:36,height:4,borderRadius:2,background:'#e0e0e0',margin:'0 auto 20px'}}/>
        <div style={{fontSize:20,fontWeight:800,marginBottom:18}}>Résultats académiques</div>
        {sections.map((s,si)=>(
          <div key={si} style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:700,color:'#aeaeb2',textTransform:'uppercase',marginBottom:10}}>{s.title}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {s.items.map((it,i)=>(
                <div key={i} style={{background:'#f5f5f5',borderRadius:12,padding:12}}>
                  <div style={{fontSize:20,fontWeight:800,marginBottom:2}}>{it.v}</div>
                  <div style={{fontSize:10,color:'#86868b'}}>{it.l}</div>
                  <div style={{fontSize:10,fontWeight:600,marginTop:3,color:it.up?'#34c759':'#ff3b30'}}>{it.d}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {STATS_DETAIL.matieres.map((m,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <div style={{fontSize:11,fontWeight:600,width:120,flexShrink:0}}>{m.l}</div>
            <div style={{flex:1,height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${m.p}%`,background:'#1d1d1f',borderRadius:3}}/></div>
            <div style={{fontSize:11,fontWeight:700,width:36,textAlign:'right'}}>{m.v}</div>
          </div>
        ))}
        <button onClick={onClose} style={{width:'100%',padding:12,borderRadius:980,background:'#1d1d1f',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:16}}>Fermer</button>
      </div>
    </div>
  )
}
