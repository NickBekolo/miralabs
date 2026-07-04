/**
 * NotificationBrick — Panneau de notifications
 *
 * Props :
 *   items      : [{ id, title, message, type, isRead, createdAt, link }]
 *   onRead     : fn(id)
 *   onReadAll  : fn
 *   onDelete   : fn(id)
 */

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

const TYPE_COLORS = {
  NOTE_CREATED:       '#6366f1',
  ABSENCE_CREATED:    '#f59e0b',
  EDT_PUBLISHED:      '#10b981',
  BULLETIN_READY:     '#8b5cf6',
  DECISION_VALIDATED: '#3b82f6',
  ABSENCE_ALERT:      '#ef4444',
  ACCOUNT_CREATED:    '#111111',
}

export default function NotificationBrick({ items = [], onRead, onReadAll, onDelete }) {
  const unread = items.filter(n => !n.isRead).length

  return (
    <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:14, overflow:'hidden', fontFamily:ft }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #F5F5F5' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>Notifications</span>
          {unread > 0 && (
            <span style={{ fontSize:11, fontWeight:700, background:'#111', color:'#fff', padding:'2px 8px', borderRadius:980 }}>
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onReadAll}
            style={{ fontSize:12, color:'#9ca3af', background:'none', border:'none', cursor:'pointer', fontFamily:ft }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div style={{ maxHeight:400, overflowY:'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding:'32px 16px', textAlign:'center', fontSize:13, color:'#9ca3af' }}>
            Aucune notification
          </div>
        ) : items.map(n => (
          <div
            key={n.id}
            style={{
              display:'flex', alignItems:'flex-start', gap:12,
              padding:'12px 18px', borderBottom:'1px solid #F9F9F9',
              background: n.isRead ? '#fff' : '#FAFAFA',
              cursor:'pointer',
            }}
            onClick={() => !n.isRead && onRead?.(n.id)}
          >
            {/* Point couleur */}
            <div style={{
              width:8, height:8, borderRadius:'50%', flexShrink:0, marginTop:5,
              background: TYPE_COLORS[n.type] ?? '#111',
              opacity: n.isRead ? 0.4 : 1,
            }}/>

            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight: n.isRead ? 400 : 600, color:'#111', marginBottom:2 }}>
                {n.title}
              </div>
              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:2 }}>{n.message}</div>
              <div style={{ fontSize:11, color:'#d1d5db' }}>{n.createdAt}</div>
            </div>

            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(n.id) }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#d1d5db', fontSize:14, padding:2 }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}