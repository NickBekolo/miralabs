import { useEffect } from 'react'
import { bezierPath, dataToPts } from '../utils/chart.utils'

/**
 * Hook qui gère le rendu SVG et l'interaction hover d'un graphique en courbe.
 *
 * @param {{ svgRef, vlRef, hpRef, ttRef, ttLRef, ttVRef }} refs
 * @param {{ data, W, H, paddingLeft, maxVal }} opts
 */
export function useChart(refs, { data, W = 600, H = 115, paddingLeft = 30, maxVal = 20 }) {
  const { svgRef, vlRef, hpRef, ttRef, ttLRef, ttVRef } = refs

  useEffect(() => {
    const pts = dataToPts(data, { W, H, paddingLeft, maxVal })
    const path = bezierPath(pts)
    const areaPath = path + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`

    const svg = svgRef.current
    svg.querySelector('#crv').setAttribute('d', path)
    svg.querySelector('#area').setAttribute('d', areaPath)

    const findClosest = (mx) => {
      let closest = pts[0], minDist = Infinity
      pts.forEach(p => { const d = Math.abs(p.x - mx); if (d < minDist) { minDist = d; closest = p } })
      return closest
    }

    const onMove = (e) => {
      const rect = svg.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * W
      const cl = findClosest(mx)
      const px = (cl.x / W) * rect.width
      const py = (cl.y / H) * rect.height

      vlRef.current.setAttribute('x1', cl.x); vlRef.current.setAttribute('x2', cl.x)
      vlRef.current.setAttribute('opacity', '1')
      hpRef.current.setAttribute('cx', cl.x); hpRef.current.setAttribute('cy', cl.y)
      hpRef.current.setAttribute('opacity', '1')

      ttLRef.current.textContent = cl.label
      ttVRef.current.textContent = cl.val.toFixed(1)
      ttRef.current.style.left    = `${Math.max(0, px - 60)}px`
      ttRef.current.style.top     = `${Math.max(0, py - 60)}px`
      ttRef.current.style.opacity = '1'
    }

    const onLeave = () => {
      vlRef.current.setAttribute('opacity', '0')
      hpRef.current.setAttribute('opacity', '0')
      ttRef.current.style.opacity = '0'
    }

    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)
    return () => {
      svg.removeEventListener('mousemove', onMove)
      svg.removeEventListener('mouseleave', onLeave)
    }
  }, [data])
}
