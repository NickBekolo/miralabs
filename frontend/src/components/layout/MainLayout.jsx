import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar  } from './Topbar'
import { FONT_STACK, COLORS } from '../../constants/theme'

/**
 * Layout principal qui compose Sidebar + Topbar + contenu scrollable.
 * Tous les écrans teacher héritent de ce layout.
 */
export function MainLayout({ children, userName }) {
  const [activeNav, setActiveNav] = useState('accueil')

  return (
    <div style={{ fontFamily:FONT_STACK, background:COLORS.bg, color:COLORS.textPrimary,
      WebkitFontSmoothing:'antialiased', fontSize:14, height:'100vh', display:'flex', overflow:'hidden' }}>
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar userName={userName} />
        <div style={{ flex:1, overflowY:'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
