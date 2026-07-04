/**
 * ClassCardBrick — Carte classe
 *
 * Props :
 *   classe   : { id, name, niveau, anneeScolaire }
 *   stats    : { nbEtudiants, moyenne, tauxAssiduite }
 *   onSelect : fn(classe)
 *   active   : bool
 */

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

const COLORS = ['#1e3a5f','#9f1239','#4a1942','#1a3c34','#7c2d12','#374151','#713f12','#0f3460']

export default function ClassCardBrick({ classe, stats = {}, onSelect, active }) {
  const color = COLORS[classe.id % COLORS.length]

  return (
    <div
      onClick={() => onSelect?.(classe)}
      style={{
        background:'#fff',
        border: active ? `2px solid ${color}` : '1px solid #F0F0F0',
        borderRadius:14, padding:'16px 18px', cursor:'pointer',
        fontFamily:ft, transition:'all 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Badge classe */}
      <div style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:40, height:40, borderRadius:10, background:color,
        fontSize:13, fontWeight:800, color:'#fff', marginBottom:12,
      }}>
        {classe.name.substring(0, 2)}
      </div>

      <div style={{ fontSize:15, fontWeight:700, color:'#111', marginBottom:2 }}>{classe.name}</div>
      <div style={{ fontSize:12, color:'#9ca3af', marginBottom:14 }}>{classe.niveau} · {classe.anneeScolaire}</div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {[
          { val: stats.nbEtudiants ?? '—', lbl:'Élèves' },
          { val: stats.moyenne ? `${stats.moyenne}/20` : '—', lbl:'Moyenne' },
          { val: stats.tauxAssiduite ? `${stats.tauxAssiduite}%` : '—', lbl:'Assiduité' },
        ].map(s => (
          <div key={s.lbl} style={{ background:'#F8F8F8', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#111' }}>{s.val}</div>
            <div style={{ fontSize:10, color:'#9ca3af', marginTop:1 }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}