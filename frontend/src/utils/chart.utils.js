/**
 * Utilitaires pour les graphiques SVG.
 */

/**
 * Génère un chemin SVG en courbe de Bézier cubique à partir d'un tableau de points.
 * @param {{ x: number, y: number }[]} pts
 * @returns {string} attribut `d` du path SVG
 */
export function bezierPath(pts) {
  if (!pts.length) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], cur = pts[i]
    const cpx = (prev.x + cur.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${cur.y}, ${cur.x} ${cur.y}`
  }
  return d
}

/**
 * Convertit des données en points SVG normalisés.
 * @param {{ val: number }[]} data
 * @param {{ W: number, H: number, paddingLeft?: number, paddingRight?: number, maxVal?: number }} opts
 */
export function dataToPts(data, { W, H, paddingLeft = 30, paddingRight = 10, maxVal = 20 }) {
  const usableW = W - paddingLeft - paddingRight
  return data.map((d, i) => ({
    x: paddingLeft + (i / (data.length - 1)) * usableW,
    y: H - (d.val / maxVal) * H,
    ...d,
  }))
}
