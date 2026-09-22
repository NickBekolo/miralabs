import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Ping toutes les 5 minutes si connecté
  useEffect(() => {
    if (!user) return
    const ping = () => api.post('/api/me/ping').catch(()=>{})
    ping()
    const interval = setInterval(ping, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  // Ping toutes les 5 minutes si connecté
  useEffect(() => {
    if (!user) return
    const ping = () => api.post('/api/me/ping').catch(()=>{})
    ping()
    const interval = setInterval(ping, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  // Au démarrage — charger le user depuis /api/me ou sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }

    // Recharger depuis l'API seulement si token présent
    const token = sessionStorage.getItem('token')
    if (token) {
      api.get('/api/me')
        .then(r => {
          setUser(r.data)
          sessionStorage.setItem('user', JSON.stringify(r.data))
        })
        .catch(() => {
          setUser(null)
          sessionStorage.clear()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password, etablissementId) => {
    const res = await api.post('/api/auth/login', { email, password, etablissementId })
    const { token, user: userData } = res.data
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    sessionStorage.clear()
    sessionStorage.clear()
    setUser(null)
    window.location.href = '/'
  }

  const refreshUser = async () => {
    try {
      const r = await api.get('/api/me')
      setUser(r.data)
      sessionStorage.setItem('user', JSON.stringify(r.data))
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
