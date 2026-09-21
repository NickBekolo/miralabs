import { UserRoundCheck, UserRoundX, Clock } from 'lucide-react'
import { useThemeStore, LIGHT_THEME, DARK_THEME } from '../../store/ThemeStore'

export default function AvatarUser({ genre, isActive=true, statut='present', size=28 }) {
  const darkMode = useThemeStore(s => s.darkMode)
  const C = darkMode ? DARK_THEME : LIGHT_THEME

  if (statut === 'retard') {
    return (
      <div style={{ width:size, height:size, borderRadius:'50%', background:'#FFF3CD', border:`1px solid ${C.surface2}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Clock size={size*0.5} color='#FF9500' strokeWidth={2}/>
      </div>
    )
  }

  const color = isActive
    ? (genre === 'F' ? '#FF3B9A' : genre === 'M' ? '#007AFF' : '#8E8E93')
    : '#FF3B30'

  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:C.surface2, border:`1px solid ${C.surface2}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {isActive
        ? <UserRoundCheck size={size*0.5} color={color} strokeWidth={2}/>
        : <UserRoundX size={size*0.5} color={color} strokeWidth={2}/>
      }
    </div>
  )
}
