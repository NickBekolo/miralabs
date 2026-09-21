import { UserRoundCheck, UserRoundX, Clock } from 'lucide-react'

export default function AvatarUser({ genre, isActive=true, statut='present', size=28 }) {
  if (statut === 'retard') {
    return (
      <div style={{ width:size, height:size, borderRadius:'50%', background:'#FFF3CD', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Clock size={size*0.5} color='#FF9500' strokeWidth={2}/>
      </div>
    )
  }
  const color = isActive
    ? (genre === 'F' ? '#FF3B9A' : genre === 'M' ? '#007AFF' : '#8E8E93')
    : '#FF3B30'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#fafafa', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isActive
        ? <UserRoundCheck size={size*0.5} color={color} strokeWidth={2}/>
        : <UserRoundX size={size*0.5} color={color} strokeWidth={2}/>
      }
    </div>
  )
}
