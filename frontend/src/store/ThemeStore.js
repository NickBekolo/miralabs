import { create } from 'zustand'

export const FONTS = [
  { id:'arial',   label:'Arial Rounded',    stack:"'Arial Rounded MT Bold','Arial Rounded MT',sans-serif" },
  { id:'nunito',  label:'Nunito',           stack:"'Nunito',sans-serif" },
  { id:'jakarta', label:'Plus Jakarta Sans',stack:"'Plus Jakarta Sans',sans-serif" },
  { id:'inter',   label:'Inter',            stack:"'Inter',sans-serif" },
  { id:'outfit',  label:'Outfit',           stack:"'Outfit',sans-serif" },
  { id:'dm',      label:'DM Sans',          stack:"'DM Sans',sans-serif" },
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

export const useThemeStore = create(set => ({
  font: FONTS[0].stack,
  fontId: 'arial',
  colors: { ...DEFAULT_COLORS },
  setFont: (id) => set({ fontId: id, font: FONTS.find(f => f.id === id)?.stack || FONTS[0].stack }),
  setColor: (key, value) => set(state => ({ colors: { ...state.colors, [key]: value } })),
  resetColors: () => set({ colors: { ...DEFAULT_COLORS }, font: FONTS[0].stack, fontId: 'arial' }),
}))