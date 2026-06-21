import { FONT_STACK, COLORS, RADIUS } from '../../constants/theme'

/**
 * Composant Button réutilisable.
 * Variantes : primary | secondary | ghost | danger
 */
export function Button({ children, variant = 'primary', onClick, disabled = false, style = {}, ...props }) {
  const base = {
    padding: '8px 16px', borderRadius: RADIUS.pill, border: 'none',
    fontSize: 13, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
    fontFamily: FONT_STACK, whiteSpace: 'nowrap', transition: 'all 0.15s',
    opacity: disabled ? 0.4 : 1, ...style,
  }
  const variants = {
    primary:   { background: COLORS.black,   color: COLORS.white },
    secondary: { background: COLORS.white,   color: COLORS.black, border: `1.5px solid ${COLORS.border}` },
    ghost:     { background: 'transparent',  color: COLORS.black, border: `1.5px solid ${COLORS.black}` },
    danger:    { background: COLORS.white,   color: COLORS.danger, border: `1.5px solid ${COLORS.danger}` },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }} {...props}>
      {children}
    </button>
  )
}
