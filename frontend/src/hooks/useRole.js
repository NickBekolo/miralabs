import { useAuth } from '../context/AuthContext'

const DEPT_ROLES = {
  direction:       ['ROLE_DIRECTEUR'],
  administration:  ['ROLE_ADMIN', 'ROLE_SECRETARIAT', 'ROLE_COMPTABILITE'],
  vieScolaire:     ['ROLE_CPE', 'ROLE_SURVEILLANT'],
  pedagogique:     ['ROLE_TEACHER', 'ROLE_PEDAGOGIQUE'],
  apprenant:       ['ROLE_STUDENT'],
  parent:          ['ROLE_PARENT'],
  technique:       ['ROLE_SUPER_ADMIN', 'ROLE_SUPER_ADMIN_PLATEFORME'],
}

export function useRole() {
  const { user } = useAuth()
  // Fallback sur sessionStorage si user pas encore chargé
  const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}')
  const roles = user?.roles || storedUser?.roles || []

  const hasRole = (role) => roles.includes(role)

  const inDept = (dept) => {
    const deptRoles = DEPT_ROLES[dept] || []
    return deptRoles.some(r => roles.includes(r))
  }

  const can = (action) => {
    const permissions = {
      // Administration
      'gerer_apprenants':    ['ROLE_ADMIN', 'ROLE_SECRETARIAT'],
      'gerer_enseignants':   ['ROLE_ADMIN'],
      'gerer_classes':       ['ROLE_ADMIN'],
      'creer_edt':           ['ROLE_ADMIN'],
      'gerer_finances':      ['ROLE_COMPTABILITE'],
      'voir_stats':          ['ROLE_ADMIN', 'ROLE_DIRECTEUR', 'ROLE_COMPTABILITE'],
      // Vie scolaire
      'saisir_absences':     ['ROLE_TEACHER', 'ROLE_CPE', 'ROLE_SURVEILLANT'],
      'gerer_sanctions':     ['ROLE_CPE'],
      'faire_emargement':    ['ROLE_SURVEILLANT', 'ROLE_CPE'],
      // Pédagogie
      'saisir_notes':        ['ROLE_TEACHER'],
      'creer_devoirs':       ['ROLE_TEACHER'],
      'faire_appel':         ['ROLE_TEACHER'],
      // Direction
      'valider_decisions':   ['ROLE_DIRECTEUR'],
      'voir_tout':           ['ROLE_DIRECTEUR', 'ROLE_SUPER_ADMIN', 'ROLE_SUPER_ADMIN_PLATEFORME'],
    }
    const allowed = permissions[action] || []
    return allowed.some(r => roles.includes(r))
  }

  return { hasRole, inDept, can, roles }
}
