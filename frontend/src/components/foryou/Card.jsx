import {
  CARD_HEIGHT,
  CARD_RADIUS,
  ANIMATION,
  glass,
  divider,
  shadowActive,
  shadowInactive,
  getPalette,
} from "./cardStyles";

export default function Card({ card, index, active, onClick, style = {} }) {
  const P = getPalette(index, card.urgent);

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: 0, right: 0,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        background: card.color ?? P.bg,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: active ? shadowActive : shadowInactive,
        transition: `top ${ANIMATION}, transform ${ANIMATION}, box-shadow ${ANIMATION}`,
        ...style,
      }}
    >
      {/* Décors cercles */}
      <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-30, right:20, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }}/>

      <div style={{ padding:"20px 22px", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>

        {/* Subtitle */}
        <div style={{ fontSize:12, color:P.sub, display:"flex", alignItems:"center", gap:6 }}>
          {card.emoji && <span>{card.emoji}</span>}
          {card.subtitle}
        </div>

        {/* Titre */}
        <div style={{ fontSize:26, fontWeight:700, lineHeight:1.2, color:P.text, letterSpacing:"-0.5px", whiteSpace:"pre-line" }}>
          {card.title}
        </div>

        {/* Footer */}
        <div style={{ background:glass, borderRadius:16, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
          {card.badge && (
            <>
              <div style={{ textAlign:"center", minWidth:44 }}>
                {card.badge.label && (
                  <div style={{ fontSize:8, fontWeight:700, color:P.accent, textTransform:"uppercase", marginBottom:1 }}>
                    {card.badge.label}
                  </div>
                )}
                <div style={{ fontSize:15, fontWeight:700, color:P.text }}>{card.badge.value}</div>
              </div>
              <div style={{ width:1, height:28, background:divider }}/>
            </>
          )}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:P.text }}>{card.main}</div>
            {card.sub && <div style={{ fontSize:11, color:P.sub }}>{card.sub}</div>}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}