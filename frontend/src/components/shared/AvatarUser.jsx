import { UserRoundCheck, UserRoundX } from 'lucide-react'

export default function AvatarUser({ genre, isActive=true, size=28 }) {
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
