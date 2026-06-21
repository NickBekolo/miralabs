/**
 * Avatar circulaire avec initiale et couleur de fond.
 */
export function Avatar({ letter, color, size = 24, borderColor = '#fff', offset = 0 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${borderColor}`,
      marginLeft: offset,
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {letter}
    </div>
  )
}

/**
 * Groupe d'avatars empilés.
 */
export function AvatarGroup({ avatars, size = 22, borderColor = '#fff' }) {
  return (
    <div style={{ display:'flex', alignItems:'center' }}>
      {avatars.map((av, i) => (
        <Avatar key={i} letter={av.l} color={av.c} size={size}
          borderColor={borderColor} offset={i === 0 ? 0 : -(size * 0.22)} />
      ))}
    </div>
  )
}
