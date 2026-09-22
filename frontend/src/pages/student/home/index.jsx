import Desktop from './Desktop'
import Mobile from './Mobile'

export default function HomeScreen({ onSign, onNav }) {
  const isMobile = window.innerWidth < 768
  return isMobile ? <Mobile onSign={onSign} onNav={onNav}/> : <Desktop onSign={onSign}/>
}
