import { useState, useEffect } from 'react'
import api from '../../services/api'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,sans-serif'

const DEFAULT_COLORS = [
  '#1e3a5f','#9f1239','#4a1942','#1a3c34',
  '#7c2d12','#374151','#713f12','#0f3460',
]

export default function Library({ C }) {
  const [docs,     setDocs]     = useState([])
  const [selected, setSelected] = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/api/documents')
      .then(r => setDocs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ background:C.surface, borderRadius:16, padding:'16px 18px', fontFamily:ft }}>
      <div style={{ fontSize:12, color:C.hint }}>Chargement des documents...</div>
    </div>
  )

  if (!docs.length) return (
    <div style={{ background:C.surface, borderRadius:16, padding:'16px 18px', fontFamily:ft }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.text }}>Mes documents de cours</span>
        <button style={{ fontSize:11, fontWeight:500, padding:'5px 14px', borderRadius:980, border:'none', background:C.surface2, color:C.text, cursor:'pointer', fontFamily:ft }}>+ Ajouter</button>
      </div>
      <div style={{ fontSize:12, color:C.hint }}>Aucun document</div>
    </div>
  )

  const current = docs[selected]
  const color   = current?.couleur ?? DEFAULT_COLORS[selected % DEFAULT_COLORS.length]

  return (
    <div style={{ background:C.surface, borderRadius:16, overflow:'hidden', fontFamily:ft }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px 10px' }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.text }}>Mes documents de cours</span>
        <button style={{ fontSize:11, fontWeight:500, padding:'5px 14px', borderRadius:980, border:'none', background:C.surface2, color:C.text, cursor:'pointer', fontFamily:ft }}>
          + Ajouter
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'flex-end', padding:'0 18px', overflowX:'auto' }}>
        {/* Livre ouvert */}
        <div style={{
          width:140, flexShrink:0, height:200, borderRadius:'4px 0 0 4px',
          background:color,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          padding:'14px 12px 12px',
        }}>
          <div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>
              {current?.matiere?.nom ?? 'Cours'}
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.25 }}>
              {current?.titre}
            </div>
          </div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>
            {current?.createdAt}
          </div>
        </div>

        {/* Étagère */}
        <div style={{ display:'flex', alignItems:'flex-end' }}>
          {docs.map((doc, i) => {
            const c = doc.couleur ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]
            return (
              <div key={doc.id} onClick={() => setSelected(i)}
                style={{
                  width: i === selected ? 32 : 26,
                  height:200, background:c,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', flexShrink:0, transition:'width 0.2s',
                  borderLeft:'1px solid rgba(255,255,255,0.08)',
                }}>
                <span style={{
                  writingMode:'vertical-rl', transform:'rotate(180deg)',
                  fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.6)',
                  whiteSpace:'nowrap', overflow:'hidden', maxHeight:160,
                }}>
                  {doc.titre}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ height:14 }}/>
    </div>
  )
}