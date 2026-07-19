import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FONTS = [
  { id:'apple',   label:'SF Pro (défaut)',    stack:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif" },
  { id:'arial',   label:'Arial Rounded',      stack:"'Arial Rounded MT Bold','Arial Rounded MT',sans-serif" },
  { id:'nunito',  label:'Nunito',             stack:"'Nunito',sans-serif" },
  { id:'jakarta', label:'Plus Jakarta Sans',  stack:"'Plus Jakarta Sans',sans-serif" },
  { id:'inter',   label:'Inter',              stack:"'Inter',sans-serif" },
  { id:'outfit',  label:'Outfit',             stack:"'Outfit',sans-serif" },
  { id:'dm',      label:'DM Sans',            stack:"'DM Sans',sans-serif" },
]

export const DEFAULT_COLORS = {
  today:        '#1a1a1a',
  sel:          '#fef9c3',
  selBorder:    '#ca8a04',
  selTxt:       '#92400e',
  we:           '#ddd',
  weBg:         '#fafafa',
  normalTxt:    '#1a1a1a',
  normalBg:     '#fff',
  normalBorder: '#e0e0e0',
  evalTxt:      '#166534',
  evalBg:       '#fff',
  evalBorder:   '#e0e0e0',
  tdTxt:        '#ca8a04',
  tdBg:         '#fff',
  tdBorder:     '#e0e0e0',
  annTxt:       '#dc2626',
  annBg:        '#fff',
  annBorder:    '#e0e0e0',
}

// ─── Thèmes clair / sombre ────────────────────────────────────

export const LIGHT_THEME = {
  bg:       '#ffffff',
  surface:  '#ffffff',
  surface2: '#F5F5F5',
  surface3: '#EBEBEB',
  border:   'rgba(0,0,0,0.06)',
  text:     '#111111',
  muted:    '#8A8A8A',
  hint:     '#AEAEB2',
  sidebar:  '#ffffff',
  red:      '#dc2626',
}

export const DARK_THEME = {
  bg:       '#0a0a0a',
  surface:  '#141414',
  surface2: '#1c1c1c',
  surface3: '#242424',
  border:   'rgba(255,255,255,0.07)',
  text:     '#f5f5f5',
  muted:    'rgba(255,255,255,0.4)',
  hint:     'rgba(255,255,255,0.18)',
  sidebar:  '#111111',
  red:      '#ff5555',
}

// ─── Store ────────────────────────────────────────────────────

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // Mode clair par défaut
      darkMode: false,
  font: 'SF Pro Display',

      // Couleur profil
      profileColor: '#6C5CE7',
      setProfileColor: (color) => set({ profileColor: color }),
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      setDarkMode: (val) => set({ darkMode: val }),

      // Thème actif (calculé)
      getTheme: () => get().darkMode ? DARK_THEME : LIGHT_THEME,

      // Police
      font:   FONTS[0].stack,
      fontId: 'apple',
      setFont: (id) => set({ fontId: id, font: FONTS.find(f => f.id === id)?.stack || FONTS[0].stack }),

      // Couleurs EDT
      colors: { ...DEFAULT_COLORS },
      setColor: (key, value) => set(state => ({ colors: { ...state.colors, [key]: value } })),
      resetColors: () => set({ colors: { ...DEFAULT_COLORS }, font: FONTS[0].stack, fontId: 'apple' }),
    }),
    {
      name: 'miralabs-theme', // clé localStorage
      partialize: (state) => ({
        darkMode: state.darkMode,
        profileColor: state.profileColor,
        fontId:   state.fontId,
        font:     state.font,
        colors:   state.colors,
      }),
    }
  )
)