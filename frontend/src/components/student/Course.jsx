const sf = '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'

export function Course({ name, meta, time, annule, color, C }) {
  const textColor   = C?.text   ?? '#111111'
  const mutedColor  = C?.muted  ?? '#8A8A8A'
  const surface2    = C?.surface2 ?? '#F5F5F5'

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px', fontFamily:sf,
    }}>
      <div style={{ width:3, height:36, borderRadius:2, background: annule ? mutedColor : color, flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500, color: annule ? mutedColor : textColor, textDecoration: annule ? 'line-through' : 'none', marginBottom:2 }}>
          {name}
        </div>
        <div style={{ fontSize:11, color:mutedColor }}>{meta}</div>
      </div>
      <div style={{ fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:980, background: annule ? 'rgba(255,85,85,0.1)' : surface2, color: annule ? '#ff5555' : mutedColor, flexShrink:0 }}>
        {annule ? 'Annulé' : time}
      </div>
    </div>
  )
}
