import Desktop from './Desktop'
import Mobile from './Mobile'

export default function HomeScreen({ onSign, onNav }) {
  const isMobile = window.innerWidth < 768
  return <Mobile onSign={onSign} onNav={onNav}/>
}
