import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  withCredentials: true, // envoie les cookies HttpOnly automatiquement
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur requête — ajoute le token si présent en localStorage (dev)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur réponse — redirige vers login si 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
