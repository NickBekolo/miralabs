/**
 * Épine verticale d'un livre dans la bibliothèque.
 * Affiche le titre et la classe en écriture verticale.
 */
export function BookSpine({ book, isSelected, onClick }) {
  return (
    <div onClick={onClick} style={{ width: isSelected ? 36 : 30, flexShrink:0,
      cursor:'pointer', transition:'width 0.2s' }}>
      <div style={{ width:'100%', height:340, background: book.color,
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'space-between', padding:'12px 0 10px',
        boxShadow: isSelected
          ? 'inset -3px 0 8px rgba(0,0,0,0.25), 4px 0 14px rgba(0,0,0,0.18)'
          : 'inset -2px 0 5px rgba(0,0,0,0.18), 1px 0 3px rgba(0,0,0,0.1)' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:6, overflow:'hidden', width:'100%' }}>
          <SpineText size={9} opacity={0.6}>{book.cls}</SpineText>
          <SpineText size={10} opacity={0.92}>{book.title}</SpineText>
        </div>
        <SpineDots />
      </div>
    </div>
  )
}

function SpineText({ children, size, opacity }) {
  return (
    <span style={{ writingMode:'vertical-rl', textOrientation:'mixed',
      transform:'rotate(180deg)', fontSize:size, fontWeight:700,
      color:`rgba(255,255,255,${opacity})`, maxHeight: size === 9 ? 60 : 180,
      overflow:'hidden', whiteSpace:'nowrap' }}>
      {children}
    </span>
  )
}

function SpineDots() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      {[[3,3],[11,3],[3,11],[11,11]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="rgba(255,255,255,0.6)"/>
      ))}
    </svg>
  )
}
