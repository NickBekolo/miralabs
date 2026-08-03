import { useState, useEffect } from 'react'

const sf = "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
const words = ['Mira.', 'Miralearn.', 'Miralabs.']

export default function SplashScreen({ onFinish }) {
  const [current,  setCurrent]  = useState(0)
  const [phase,    setPhase]    = useState('in')

  useEffect(() => {
    const isLast = current === words.length - 1
    const hold = setTimeout(() => {
      if (isLast) { onFinish?.(); return }
      setPhase('out')
      const next = setTimeout(() => { setCurrent(i => i + 1); setPhase('in') }, 280)
      return () => clearTimeout(next)
    }, 1400)
    return () => clearTimeout(hold)
  }, [current])

  return (
    <div style={{ fontFamily:sf, background:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{
        fontSize:64, fontWeight:500, letterSpacing:'-3px', color:'#0a0a0a',
        opacity: phase==='in'?1:0,
        transform: phase==='in'?'translateY(0)':'translateY(-16px)',
        transition:'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {words[current]}
      </span>
    </div>
  )
}
