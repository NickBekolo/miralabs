/**
 * Centralisation des routes — évite les chaînes dispersées dans le code.
 */
export const ROUTES = {
  HOME:             '/',
  TEACHER_HOME:     '/teacher/home',
  TEACHER_DASHBOARD:'/teacher/dashboard',
  STUDENT_DASHBOARD:'/student/dashboard',
  PARENT_DASHBOARD: '/parent/dashboard',
  LOGIN:            '/login',
  FORGOT_PASSWORD:  '/forgot-password',
  RESET_PASSWORD:   '/reset-password/:token',
}
