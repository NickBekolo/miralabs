import { RADIUS } from '../../constants/theme'

/**
 * Chip style "Salle est Bât.2" — typographie mixte.
 * Inspiré de Sana Labs.
 */
export function Chip({ label, value }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '4px 11px', borderRadius: RADIUS.md,
      border: '1.5px solid #e5e5ea', background: '#fff', fontSize: 12,
    }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 400, color: '#aeaeb2', fontSize: 11, margin: '0 1px' }}>est</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}
