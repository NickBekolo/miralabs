/**
 * MIRALABS — Design System
 * Source unique de vérité pour toutes les couleurs et valeurs de design.
 * Inspiré de Sana AI — dark mode natif.
 *
 * Usage :
 *   import { T, ft, radius } from '../../constants/theme'
 *   <div style={{ background: T.bg, color: T.text }}>
 */

// ─── Couleurs principales ─────────────────────────────────────
export const T = {
  // Fonds
  bg:       '#0f0f0f',   // fond de page principal
  surface:  '#1a1a1a',   // cards, panneaux
  surface2: '#222222',   // cards imbriquées, inputs
  surface3: '#2a2a2a',   // hover, éléments actifs

  // Bordures
  border:   'rgba(255,255,255,0.07)',   // bordure subtile
  borderHv: 'rgba(255,255,255,0.14)',   // bordure au hover
  borderAc: 'rgba(255,255,255,0.22)',   // bordure active/focus

  // Texte
  text:     '#ffffff',                  // texte principal
  muted:    'rgba(255,255,255,0.5)',    // texte secondaire
  hint:     'rgba(255,255,255,0.25)',   // texte tertiaire / labels
  disabled: 'rgba(255,255,255,0.15)',   // texte désactivé

  // Couleurs d'accent
  accent:   '#ffffffff',   // vert émeraude Miralabs
  accentBg: 'rgba(0,200,150,0.12)',

  // Couleurs sémantiques
  success:  '#4ade80',
  successBg:'rgba(74,222,128,0.1)',
  warning:  '#fbbf24',
  warningBg:'rgba(251,191,36,0.1)',
  danger:   '#f87171',
  dangerBg: 'rgba(248,113,113,0.1)',
  info:     '#60a5fa',
  infoBg:   'rgba(96,165,250,0.1)',

  // Couleurs de rôles
  student:  '#f59e0b',
  teacher:  '#6366f1',
  parent:   '#ec4899',
  admin:    '#00C896',

  // Sidebar
  sidebar:  '#141414',
}

// ─── Typographie ──────────────────────────────────────────────
export const ft = '-apple-system,"SF Pro Display",BlinkMacSystemFont,"Inter",sans-serif'

// ─── Valeurs de design ────────────────────────────────────────
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 980,
}

export const shadow = {
  sm:  '0 2px 8px rgba(0,0,0,0.3)',
  md:  '0 8px 24px rgba(0,0,0,0.4)',
  lg:  '0 24px 64px rgba(0,0,0,0.6)',
  modal:'0 32px 80px rgba(0,0,0,0.7)',
}

// ─── Composants de base ───────────────────────────────────────

/**
 * Style d'une card standard
 */
export const cardStyle = (extra = {}) => ({
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: radius.lg,
  ...extra,
})

/**
 * Style d'un input
 */
export const inputStyle = (extra = {}) => ({
  width: '100%',
  padding: '10px 14px',
  background: T.surface2,
  border: `1px solid ${T.border}`,
  borderRadius: radius.md,
  fontSize: 13,
  color: T.text,
  outline: 'none',
  fontFamily: ft,
  boxSizing: 'border-box',
  ...extra,
})

/**
 * Style d'un bouton primaire
 */
export const btnPrimary = (extra = {}) => ({
  padding: '10px 20px',
  borderRadius: radius.md,
  border: 'none',
  background: T.text,
  color: '#000',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: ft,
  ...extra,
})

/**
 * Style d'un bouton secondaire
 */
export const btnSecondary = (extra = {}) => ({
  padding: '10px 20px',
  borderRadius: radius.md,
  border: `1px solid ${T.border}`,
  background: 'transparent',
  color: T.muted,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: ft,
  ...extra,
})

/**
 * Style d'un bouton danger
 */
export const btnDanger = (extra = {}) => ({
  padding: '10px 20px',
  borderRadius: radius.md,
  border: `1px solid ${T.dangerBg}`,
  background: 'transparent',
  color: T.danger,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: ft,
  ...extra,
})

/**
 * Badge de statut
 */
export const badge = (active) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 10px',
  borderRadius: radius.pill,
  fontSize: 11,
  fontWeight: 500,
  background: active ? T.accentBg : 'rgba(255,255,255,0.06)',
  color: active ? T.accent : T.hint,
})

/**
 * Dot de statut (rond coloré)
 */
export const dot = (active) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: active ? T.accent : '#444',
  flexShrink: 0,
})

// ─── Constantes de layout ─────────────────────────────────────
export const SIDEBAR_WIDTH = 220
export const TOPBAR_HEIGHT = 56
export const RIGHT_PANEL   = 280

// ─── Exports compatibilité ancienne version ───────────────────
// Ces exports maintiennent la compatibilité avec les fichiers existants
// qui importent COLORS, FONT_STACK, RADIUS depuis ce fichier.

export const FONT_STACK = ft

export const RADIUS = radius

export const COLORS = {
  // Fonds
  bg:           T.bg,
  white:        T.surface,
  black:        T.text,

  // Texte
  textPrimary:  T.text,
  textSecondary:T.muted,
  textMuted:    T.hint,

  // Bordures
  border:       T.border,

  // Sémantique
  danger:       T.danger,
  success:      T.accent,
  warning:      T.warning,

  // Couleurs de livres (pour la bibliothèque)
  bookColors: [
    '#1e3a5f','#9f1239','#4a1942','#1a3c34',
    '#7c2d12','#374151','#713f12','#0f3460',
    '#1e40af','#065f46','#6b21a8','#92400e',
  ],

  // Pour Badge.jsx
  student:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  teacher:  { bg: 'rgba(99,102,241,0.15)',  color: '#6366f1' },
  parent:   { bg: 'rgba(236,72,153,0.15)',  color: '#ec4899' },
  admin:    { bg: 'rgba(0,200,150,0.15)',   color: '#00C896' },
  directeur:{ bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  cpe:      { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
}