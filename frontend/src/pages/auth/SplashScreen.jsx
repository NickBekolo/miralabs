import { useState, useEffect } from 'react'

const words = ['Mira.', 'Miralearn.', 'Miralabs.']

const wrapperStyle = {
  fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  background: '#fff',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}

export default function SplashScreen({ onFinish }) {
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    const isLast = current === words.length - 1

    const holdTimer = setTimeout(() => {
      if (isLast) {
        setTimeout(() => onFinish?.(), 400)
        return
      }
      setPhase('out')
      const nextTimer = setTimeout(() => {
        setCurrent((i) => i + 1)
        setPhase('in')
      }, 280)
      return () => clearTimeout(nextTimer)
    }, 1400)

    return () => clearTimeout(holdTimer)
  }, [current, onFinish])

  return (
    <div style={wrapperStyle}>
      <span style={{
        position: 'absolute',
        fontSize: '64px',
        fontWeight: 600,
        letterSpacing: '-3px',
        color: '#0a0a0a',
        opacity: phase === 'in' ? 1 : 0,
        transform: phase === 'in' ? 'translateY(0px)' : 'translateY(-16px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {words[current]}
      </span>
    </div>
  )
}