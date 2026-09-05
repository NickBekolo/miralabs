import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Au démarrage — charger le user depuis /api/me ou localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }

    // Recharger depuis l'API pour avoir les données fraîches
    api.get('/api/me')
      .then(r => {
        setUser(r.data)
        localStorage.setItem('user', JSON.stringify(r.data))
      })
      .catch(() => {
        // Si 401 — token expiré, on nettoie
        const token = localStorage.getItem('token')
        if (!token) {
          setUser(null)
          localStorage.clear()
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, etablissementId) => {
    const res = await api.post('/api/auth/login', { email, password, etablissementId })
    const { token, user: userData } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    window.location.href = '/'
  }

  const refreshUser = async () => {
    try {
      const r = await api.get('/api/me')
      setUser(r.data)
      localStorage.setItem('user', JSON.stringify(r.data))
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
