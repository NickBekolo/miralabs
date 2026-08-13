import axios from 'axios'

const DEFAULT_URL = 'http://192.168.1.35:8000'

const api = axios.create({
  baseURL: DEFAULT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  // URL dynamique par établissement
  const apiUrl = localStorage.getItem('api_url') || DEFAULT_URL
  config.baseURL = apiUrl

  // Token JWT
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Intercepteur réponse — gestion expiration token
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('api_url')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
