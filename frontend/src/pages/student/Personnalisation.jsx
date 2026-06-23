import { useState } from 'react'
import { useThemeStore, FONTS, } from '../../store/ThemeStore'

const PALETTE = [
  '#1a1a1a','#374151','#6b7280','#dc2626','#ea580c','#d97706',
  '#ca8a04','#65a30d','#166534','#0d9488','#0284c7','#2563eb',
  '#7c3aed','#db2777','#fef9c3','#fef3c7','#dcfce7','#dbeafe',
  '#fce7f3','#fff','#f5f5f5','#fafafa','#f0fdf4','#eff6ff',
]

const DAY_ITEMS = [
  { key:'today',     label:"aujourd'hui",       sub:'fond du bouton du jour actuel' },
  { key:'sel',       label:'jour sélectionné',  sub:'fond du bouton' },
  { key:'selBorder', label:'sélectionné — bordure', sub:'' },
  { key:'we',        label:'week-end',           sub:'couleur du texte' },
]

const CARD_GROUPS = [
  { label:'cours normal',  items:[
    { key:'normalTxt',    label:'texte & barre' },
    { key:'normalBg',     label:'fond de la card' },
    { key:'normalBorder', label:'bordure' },
  ]},
  { label:'évaluation', items:[
    { key:'evalTxt',    label:'texte & barre' },
    { key:'evalBg',     label:'fond de la card' },
    { key:'evalBorder', label:'bordure' },
  ]},
  { label:'travail dirigé', items:[
    { key:'tdTxt',    label:'texte & barre' },
    { key:'tdBg',     label:'fond de la card' },
    { key:'tdBorder', label:'bordure' },
  ]},
  { label:'cours annulé', items:[
    { key:'annTxt',    label:'texte & barre' },
    { key:'annBg',     label:'fond de la card' },
    { key:'annBorder', label:'bordure' },
  ]},
]

function ColorPicker({ colorKey, label, onClose }) {
  const { colors, setColor } = useThemeStore()
  const [temp, setTemp] = useState(colors[colorKey] || '#1a1a1a')
  const [hex, setHex] = useState(colors[colorKey] || '#1a1a1a')

  const pick = c => { setTemp(c); setHex(c) }
  const onHex = v => { setHex(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) setTemp(v) }
  const confirm = () => { setColor(colorKey, temp); onClose() }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:300 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'32px 32px 0 0', padding:'28px 24px 40px', width:'100%', maxWidth:480, fontFamily:'inherit' }}>
        <div style={{ fontSize:20, fontWeight:900, marginBottom:18 }}>{label}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:20 }}>
          {PALETTE.map(c => (
            <div key={c} onClick={() => pick(c)} style={{
              width:'100%', aspectRatio:1, borderRadius:14, cursor:'pointer',
              background:c, border:`3px solid ${c === temp ? '#1a1a1a' : 'transparent'}`,
              transform: c === temp ? 'scale(1.12)' : 'scale(1)',
              transition:'all 0.15s',
              boxShadow: c === '#fff' ? 'inset 0 0 0 1px #e5e5e5' : 'none',
            }} />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:40, height:40, borderRadius:12, border:'2px solid #e5e5e5', background:temp, flexShrink:0 }} />
          <input
            value={hex} onChange={e => onHex(e.target.value)}
            style={{ flex:1, padding:'12px 16px', borderRadius:14, border:'2px solid #e5e5e5', fontSize:16, fontWeight:700, fontFamily:'inherit', outline:'none', color:'#1a1a1a' }}
            placeholder="#000000"
          />
        </div>
        <button onClick={confirm} style={{ width:'100%', padding:16, borderRadius:980, border:'none', background:'#1a1a1a', color:'#fff', fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>
          appliquer
        </button>
      </div>
    </div>
  )
}

function ColorRow({ colorKey, label }) {
  const { colors } = useThemeStore()
  const [open, setOpen] = useState(false)
  return (
    <>
      <div onClick={() => setOpen(true)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', cursor:'pointer', borderBottom:'1px solid #f5f5f5', transition:'background 0.12s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:10, border:'2px solid rgba(0,0,0,0.08)', background:colors[colorKey], flexShrink:0, boxShadow: colors[colorKey] === '#fff' ? 'inset 0 0 0 1px #e5e5e5' : 'none' }} />
          <div>
            <div style={{ fontSize:15, fontWeight:900 }}>{label}</div>
            <div style={{ fontSize:12, fontWeight:700, color:'#aaa', marginTop:1 }}>{colors[colorKey]}</div>
          </div>
        </div>
        <span style={{ fontSize:18, color:'#ccc' }}>›</span>
      </div>
      {open && <ColorPicker colorKey={colorKey} label={label} onClose={() => setOpen(false)} />}
    </>
  )
}

export default function Personnalisation() {
  const { fontId, setFont, resetColors } = useThemeStore()

  return (
    <div style={{ background:'#fff', minHeight:'100vh', padding:'36px 22px 80px' }}>
      <div style={{ fontSize:32, fontWeight:900, letterSpacing:'-1.5px', marginBottom:4 }}>personnaliser</div>
      <div style={{ fontSize:14, fontWeight:700, color:'#aaa', marginBottom:28 }}>couleurs · police · cards</div>

      {/* Police */}
      <div style={{ fontSize:11, fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', color:'#bbb', marginBottom:10 }}>police d'écriture</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:4 }}>
        {FONTS.map(f => (
          <button key={f.id} onClick={() => setFont(f.id)} style={{
            width:'100%', padding:'16px 20px', borderRadius:22,
            border:`2.5px solid ${fontId === f.id ? '#1a1a1a' : '#f0f0f0'}`,
            background: fontId === f.id ? '#f7f7f7' : '#fff',
            cursor:'pointer', textAlign:'left',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            fontFamily: f.stack, transition:'all 0.15s',
          }}>
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:'#1a1a1a', fontFamily:f.stack }}>{f.label}</div>
              <div style={{ fontSize:14, color:'#888', fontWeight:600, fontFamily:f.stack }}>mathématiques — histoire — physique</div>
            </div>
            <div style={{
              width:22, height:22, borderRadius:'50%', flexShrink:0,
              background: fontId === f.id ? '#1a1a1a' : 'transparent',
              border:`2px solid ${fontId === f.id ? '#1a1a1a' : '#e0e0e0'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, color:'#fff',
            }}>
              {fontId === f.id ? '✓' : ''}
            </div>
          </button>
        ))}
      </div>

      {/* Jours */}
      <div style={{ fontSize:11, fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', color:'#bbb', marginBottom:10, marginTop:28 }}>jours de la semaine</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {DAY_ITEMS.map(item => (
          <div key={item.key} style={{ border:'2px solid #f0f0f0', borderRadius:18 }}>
            <ColorRow colorKey={item.key} label={item.label} />
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ fontSize:11, fontWeight:900, letterSpacing:'1.5px', textTransform:'uppercase', color:'#bbb', marginBottom:10, marginTop:28 }}>couleurs des cards</div>
      {CARD_GROUPS.map(g => (
        <div key={g.label} style={{ border:'2px solid #f0f0f0', borderRadius:22, overflow:'hidden', marginBottom:12 }}>
          <div style={{ padding:'14px 18px', background:'#fafafa', borderBottom:'2px solid #f0f0f0', fontSize:14, fontWeight:900, color:'#555' }}>{g.label}</div>
          {g.items.map(item => <ColorRow key={item.key} colorKey={item.key} label={item.label} />)}
        </div>
      ))}

      <button onClick={resetColors} style={{ width:'100%', padding:14, borderRadius:980, border:'2px solid #f0f0f0', background:'#fff', fontSize:15, fontWeight:900, color:'#aaa', cursor:'pointer', fontFamily:'inherit', marginTop:8 }}>
        remettre par défaut
      </button>
    </div>
  )
}