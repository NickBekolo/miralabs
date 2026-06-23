import Desktop from './Desktop'
import Mobile from './Mobile'

export default function HomeScreen() {
  const isMobile = window.innerWidth < 768
  return isMobile ? <Mobile /> : <Desktop />
}
