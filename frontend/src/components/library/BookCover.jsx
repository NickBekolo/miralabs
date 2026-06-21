import { Button } from '../ui/Button'

/**
 * Couverture du livre sélectionné — affiché à gauche de la bibliothèque.
 */
export function BookCover({ book }) {
  if (!book) return null
  return (
    <div style={{ width:200, flexShrink:0, height:340, background: book.color,
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      padding:'24px 22px 20px', transition:'background 0.3s' }}>
      <div>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)', marginBottom:4 }}>
          Dr Mandeng
        </div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>
          {book.cls} · {book.type}
        </div>
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.8px',
          lineHeight:1.2, marginBottom:14 }}>
          {book.title}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button style={{ padding:'7px 16px', borderRadius:980,
            border:'1.5px solid rgba(255,255,255,0.65)', background:'transparent',
            color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}
            onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.target.style.background='transparent'}>
            Lire →
          </button>
        </div>
      </div>
    </div>
  )
}
