/**
 * MIRALABS — Constantes de données
 * Listes et données partagées entre plusieurs pages.
 *
 * Usage :
 *   import { ETAB_TYPES, ROLE_LABELS, UNIQUE_ROLES } from '../../constants/data'
 */

// ─── Établissements ───────────────────────────────────────────

export const ETAB_TYPES = [
  { value:'lycee',      label:'Lycée' },
  { value:'college',    label:'Collège' },
  { value:'universite', label:'Université' },
  { value:'ecole',      label:'École privée' },
  { value:'autre',      label:'Autre' },
]

// ─── Rôles ────────────────────────────────────────────────────

export const ROLE_LABELS = {
  ROLE_SUPER_ADMIN_PLATEFORME: 'Éditeur Miralabs',
  ROLE_SUPER_ADMIN:            'Super Admin',
  ROLE_DIRECTEUR:              'Directeur',
  ROLE_DIRECTEUR_ADJOINT:      'Directeur Adjoint',
  ROLE_SERVICE_PEDAGOGIQUE:    'Service Pédagogique',
  ROLE_CPE:                    'CPE',
  ROLE_SECRETARIAT:            'Secrétariat',
  ROLE_COMPTABILITE:           'Comptabilité',
  ROLE_SURVEILLANT:            'Surveillant',
  ROLE_TEACHER:                'Enseignant',
  ROLE_STUDENT:                'Étudiant',
  ROLE_PARENT:                 'Parent',
}

export const ALLOWED_ROLES = [
  'ROLE_DIRECTEUR',
  'ROLE_DIRECTEUR_ADJOINT',
  'ROLE_SERVICE_PEDAGOGIQUE',
  'ROLE_CPE',
  'ROLE_SECRETARIAT',
  'ROLE_COMPTABILITE',
  'ROLE_SURVEILLANT',
  'ROLE_TEACHER',
  'ROLE_STUDENT',
  'ROLE_PARENT',
]

export const UNIQUE_ROLES = [
  'ROLE_DIRECTEUR',
  'ROLE_DIRECTEUR_ADJOINT',
  'ROLE_SERVICE_PEDAGOGIQUE',
  'ROLE_CPE',
  'ROLE_SECRETARIAT',
  'ROLE_COMPTABILITE',
]

export const ROLE_OPTIONS = ALLOWED_ROLES.map(r => ({
  value: r,
  label: ROLE_LABELS[r] ?? r,
}))

// ─── Routes par rôle ──────────────────────────────────────────

export const ROLE_ROUTES = {
  ROLE_SUPER_ADMIN_PLATEFORME: '/platform/dashboard',
  ROLE_SUPER_ADMIN:            '/superadmin/dashboard',
  ROLE_DIRECTEUR:              '/directeur/dashboard',
  ROLE_DIRECTEUR_ADJOINT:      '/directeur/dashboard',
  ROLE_SERVICE_PEDAGOGIQUE:    '/pedagogique/dashboard',
  ROLE_CPE:                    '/cpe/dashboard',
  ROLE_SECRETARIAT:            '/secretariat/dashboard',
  ROLE_COMPTABILITE:           '/comptabilite/dashboard',
  ROLE_SURVEILLANT:            '/surveillant/dashboard',
  ROLE_TEACHER:                '/enseignant/home',
  ROLE_STUDENT:                '/student/dashboard',
  ROLE_PARENT:                 '/parent/dashboard',
}

export const ROLE_PRIORITY = [
  'ROLE_SUPER_ADMIN_PLATEFORME',
  'ROLE_SUPER_ADMIN',
  'ROLE_DIRECTEUR',
  'ROLE_DIRECTEUR_ADJOINT',
  'ROLE_SERVICE_PEDAGOGIQUE',
  'ROLE_CPE',
  'ROLE_SECRETARIAT',
  'ROLE_COMPTABILITE',
  'ROLE_SURVEILLANT',
  'ROLE_TEACHER',
  'ROLE_PARENT',
  'ROLE_STUDENT',
]

export function getRedirectRoute(roles) {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return ROLE_ROUTES[role]
  }
  return '/student/dashboard'
}

// ─── Matières ─────────────────────────────────────────────────

export const NOTE_TYPES = [
  { value:'CCF',         label:'CCF' },
  { value:'DS',          label:'Devoir Surveillé' },
  { value:'TP',          label:'Travaux Pratiques' },
  { value:'TD',          label:'Travaux Dirigés' },
  { value:'Evaluation',  label:'Évaluation' },
  { value:'Oral',        label:'Oral' },
]

// ─── Niveaux scolaires ────────────────────────────────────────

export const NIVEAUX = [
  '6ème','5ème','4ème','3ème',
  '2nde','1ère','Terminale',
  'BTS 1','BTS 2',
  'Licence 1','Licence 2','Licence 3',
  'Master 1','Master 2',
]