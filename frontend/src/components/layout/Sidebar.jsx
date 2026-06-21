import { FONT_STACK, COLORS } from '../../constants/theme'
import { NAV_ITEMS, CLASSES } from '../../data/teacher.data'

/**
 * Sidebar verticale de navigation — layout teacher.
 */
export function Sidebar({ activeNav, onNavChange }) {
  const hoverStyle = { background: '#f5f5f5' }

  return (
    <div style={{ width:200, background:'#fff', borderRight:`1px solid ${COLORS.border}`,
      display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>

      {/* Logo */}
      <div style={{ padding:'18px 16px 14px', borderBottom:`1px solid #f0f0f0`,
        fontSize:15, fontWeight:700, letterSpacing:'-0.4px', fontFamily:FONT_STACK }}>
        Miralabs.
      </div>

      {/* Navigation principale */}
      <div style={{ padding:'10px 0 4px' }}>
        {NAV_ITEMS.map(n => (
          <NavItem key={n.id} item={n} active={activeNav === n.id} onClick={() => onNavChange(n.id)} />
        ))}
      </div>

      {/* Section classes */}
      <div style={{ padding:'12px 16px 4px', fontSize:10, fontWeight:600,
        color:'#c7c7cc', letterSpacing:'0.5px', textTransform:'uppercase', fontFamily:FONT_STACK }}>
        Classes
      </div>
      <div style={{ padding:'0 0 4px' }}>
        {CLASSES.map(c => (
          <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
            cursor:'pointer', borderRadius:8, margin:'2px 8px', fontSize:13, fontWeight:500,
            color:'#6b6b6b', fontFamily:FONT_STACK, transition:'all 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:c.pip, flexShrink:0 }}/>
            {c.name}
          </div>
        ))}
      </div>

      {/* Bouton nouveau cours */}
      <div style={{ marginTop:'auto', padding:12 }}>
        <button style={{ width:'100%', padding:9, borderRadius:9, border:'none',
          background: COLORS.black, color:'#fff', fontSize:13, fontWeight:700,
          cursor:'pointer', fontFamily:FONT_STACK }}>
          + Nouveau cours
        </button>
      </div>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
      cursor:'pointer', borderRadius:8, margin:'2px 8px', fontSize:13, fontWeight:500,
      fontFamily:FONT_STACK, transition:'all 0.12s',
      background: active ? COLORS.black : 'transparent',
      color: active ? '#fff' : '#6b6b6b',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <span style={{ fontSize:14, width:17, textAlign:'center' }}>{item.icon}</span>
      {item.label}
    </div>
  )
}
