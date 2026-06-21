import { FONT_STACK, COLORS } from '../../constants/theme'

/**
 * Barre de navigation horizontale supérieure.
 */
export function Topbar({ userName = 'Dr Mandeng' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 24px', background:'#fff', borderBottom:`1px solid ${COLORS.border}`, flexShrink:0 }}>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'#f0f0f0',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:10, fontWeight:700, color:'#555', fontFamily:FONT_STACK }}>
          RM
        </div>
        <span style={{ fontSize:13, fontWeight:500, color:'#3d3d3f', fontFamily:FONT_STACK }}>
          {userName}
        </span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, color:'#aeaeb2', fontFamily:FONT_STACK }}>
          Besoin d'aide ? Voir les ressources
        </span>
        <div style={{ position:'relative', width:28, height:28, borderRadius:8,
          border:`1px solid #e5e5ea`, display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', fontSize:13 }}>
          🔔
          <div style={{ position:'absolute', top:4, right:4, width:7, height:7,
            borderRadius:'50%', background: COLORS.danger, border:'1.5px solid #fff' }}/>
        </div>
        <button style={{ padding:'5px 12px', borderRadius:7, border:'none',
          background: COLORS.black, color:'#fff', fontSize:12, fontWeight:600,
          cursor:'pointer', fontFamily:FONT_STACK }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
