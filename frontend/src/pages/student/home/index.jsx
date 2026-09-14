import Desktop from './Desktop'
import Mobile from './Mobile'

export default function HomeScreen({ onSign }) {
  const isMobile = window.innerWidth < 768
  return isMobile ? <Mobile onSign={onSign} /> : <Desktop onSign={onSign} />
}
