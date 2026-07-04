/**
 * StatsBrick — Carte statistique réutilisable
 *
 * Props :
 *   title    : string   — libellé
 *   value    : string|number — valeur principale
 *   icon     : ReactNode — icône Lucide
 *   color    : string   — couleur de l'icône (défaut #111)
 *   trend    : number   — variation en % (positif = vert, négatif = rouge)
 *   size     : 'sm'|'md'|'lg' — taille de la carte
 *   onClick  : fn       — optionnel
 */

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

export default function StatsBrick({
  title,
  value,
  icon,
  color = '#111111',
  trend,
  size = 'md',
  onClick,
}) {
  const sizes = {
    sm: { padding:'14px 16px', valSize:22, titleSize:11 },
    md: { padding:'18px 20px', valSize:28, titleSize:12 },
    lg: { padding:'22px 24px', valSize:36, titleSize:13 },
  }
  const s = sizes[size] ?? sizes.md

  return (
    <div
      onClick={onClick}
      style={{
        background:'#fff',
        border:'1px solid #F0F0F0',
        borderRadius:14,
        padding:s.padding,
        fontFamily:ft,
        cursor: onClick ? 'pointer' : 'default',
        transition:'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Icône + tendance */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ color, display:'flex' }}>{icon}</div>
        {trend !== undefined && (
          <span style={{
            fontSize:11, fontWeight:700,
            color: trend >= 0 ? '#166534' : '#dc2626',
            background: trend >= 0 ? '#F0FDF4' : '#FFF0F0',
            padding:'2px 8px', borderRadius:980,
          }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      {/* Valeur */}
      <div style={{ fontSize:s.valSize, fontWeight:800, color:'#111', letterSpacing:'-0.8px', lineHeight:1, marginBottom:4 }}>
        {value}
      </div>

      {/* Titre */}
      <div style={{ fontSize:s.titleSize, color:'#9ca3af', fontWeight:500 }}>
        {title}
      </div>
    </div>
  )
}