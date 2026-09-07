const API_URL = ''+(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')+'/api'

/**
 * Service d'authentification — connecte React au backend Symfony/JWT
 */

// ─── Login ────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erreur de connexion')
  // Sauvegarde le token et les infos user
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

// ─── Logout ───────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// ─── Utilisateur courant ──────────────────────────────────────────────────
export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// ─── Token ────────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('token')
}

export function isAuthenticated() {
  return !!getToken()
}

// ─── Rôle ─────────────────────────────────────────────────────────────────
export function hasRole(role) {
  const user = getCurrentUser()
  return user?.roles?.includes(role) ?? false
}

// ─── Requête authentifiée (helper) ────────────────────────────────────────
export async function authFetch(url, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    logout()
    window.location.href = '/login'
  }
  return res
}

// ─── Mot de passe oublié ──────────────────────────────────────────────────
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erreur')
  return data
}

// ─── Réinitialisation du mot de passe ─────────────────────────────────────
export async function resetPassword(token, password) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erreur')
  return data
}