import { COLORS, RADIUS } from '../../constants/theme'

/**
 * Badge de priorité ou de statut.
 * priority: 'urgent' | 'normal' | 'done'
 */
export function PriorityBadge({ priority }) {
  const map = { urgent:'urgent', normal:'normal', done:'done', terminé:'done' }
  const key = map[priority?.toLowerCase()] ?? 'normal'
  const s   = COLORS[key]
  const labels = { urgent:'Urgent', normal:'Normal', done:'Terminé' }
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'3px 9px',
      borderRadius: RADIUS.sm, fontSize:11, fontWeight:600,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      whiteSpace:'nowrap',
    }}>
      {labels[key]}
    </span>
  )
}

/**
 * Badge de tag (ex: Actualités — "Établissement")
 */
export function TagBadge({ label, color, bg }) {
  return (
    <span style={{
      fontSize:10, fontWeight:600, padding:'2px 9px',
      borderRadius: RADIUS.pill, color, background: bg,
      flexShrink:0, whiteSpace:'nowrap',
    }}>
      {label}
    </span>
  )
}
