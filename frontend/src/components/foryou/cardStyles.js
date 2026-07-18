// src/components/foryou/cardStyles.js

export const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, sans-serif";

export const CARD_HEIGHT = 210;
export const CARD_RADIUS = 24;

export const PEEK_HEIGHT = 38; // hauteur visible des cartes fermées
export const CARD_GAP = 12;

export const ANIMATION =
  "450ms cubic-bezier(.22,1,.36,1)";

export const PALETTES = [
  {
    bg: "#1a1a2e",
    text: "#ffffff",
    sub: "rgba(255,255,255,.55)",
    accent: "#e94560",
  },
  {
    bg: "#0f3460",
    text: "#ffffff",
    sub: "rgba(255,255,255,.55)",
    accent: "#bbe1fa",
  },
  {
    bg: "#16213e",
    text: "#ffffff",
    sub: "rgba(255,255,255,.55)",
    accent: "#e94560",
  },
  {
    bg: "#1b262c",
    text: "#ffffff",
    sub: "rgba(255,255,255,.55)",
    accent: "#bbe1fa",
  },
  {
    bg: "#2d132c",
    text: "#ffffff",
    sub: "rgba(255,255,255,.55)",
    accent: "#ee4540",
  },
  {
    bg: "#243b55",
    text: "#ffffff",
    sub: "rgba(255,255,255,.55)",
    accent: "#cee8ff",
  },
];

export const URGENT_THEME = {
  bg: "#c0392b",
  text: "#ffffff",
  sub: "rgba(255,255,255,.65)",
  accent: "#ffffff",
};

export function getPalette(index, urgent = false) {
  if (urgent) return URGENT_THEME;

  return PALETTES[index % PALETTES.length];
}

export const shadowActive =
  "0 22px 55px rgba(0,0,0,.28)";

export const shadowInactive =
  "0 12px 30px rgba(0,0,0,.18)";

export const glass =
  "rgba(255,255,255,.10)";

export const divider =
  "rgba(255,255,255,.15)";