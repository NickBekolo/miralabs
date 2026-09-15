import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AppelContext = createContext(null)

export function AppelProvider({ children }) {
  const [hasAppel,  setHasAppel]  = useState(false)
  const [showSign,  setShowSign]  = useState(false)

  useEffect(() => {
    const check = () => {
      if (!sessionStorage.getItem('token')) return
      return api.get('/api/appels/en-cours')
      ?.then(r => setHasAppel(r.data.length > 0))
      ?.catch(()=>{})
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  const openSign = () => { if (hasAppel) setShowSign(true) }

  return (
    <AppelContext.Provider value={{ hasAppel, showSign, setShowSign, openSign }}>
      {children}
    </AppelContext.Provider>
  )
}

export function useAppel() {
  return useContext(AppelContext)
}
