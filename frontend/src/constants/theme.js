/**
 * Design tokens globaux — police, couleurs, espacements.
 * Toute modification ici se répercute sur l'ensemble de l'application.
 */

export const FONT_STACK =
  '-apple-system,"SF Pro Display","SF Pro Text",BlinkMacSystemFont,"Helvetica Neue",sans-serif'

export const COLORS = {
  black: '#1d1d1f', white: '#ffffff', bg: '#f0f0f0',
  border: '#e8e8e8', surface: '#ffffff',
  textPrimary: '#1d1d1f', textSecondary: '#3d3d3f',
  textMuted: '#86868b', textDisabled: '#aeaeb2',
  success: '#34c759', warning: '#ff9500', danger: '#ff3b30', info: '#007aff',
  urgent: { color:'#ff3b30', bg:'#fff1f0', border:'#ffd0cc' },
  normal: { color:'#007aff', bg:'#f0f6ff', border:'#bfdbfe' },
  done:   { color:'#34c759', bg:'#f0fdf4', border:'#bbf7d0' },
  classes: { '1ASSP1':'#f97316', '1ASSP2':'#34c759', '2AAGA':'#af52de', '2PSR':'#007aff' },
  bookColors: ['#9f1239','#1e3a5f','#4a1942','#1a3c34','#7c2d12','#374151',
               '#713f12','#1e1b4b','#064e3b','#7f1d1d','#0c4a6e','#3b0764'],
}

export const RADIUS = { sm:6, md:10, lg:14, xl:18, xxl:22, pill:980 }
export const SHADOW = {
  card: '0 1px 4px rgba(0,0,0,0.04)',
  elevated: '0 4px 16px rgba(0,0,0,0.08)',
  modal: '0 8px 32px rgba(0,0,0,0.18)',
}
