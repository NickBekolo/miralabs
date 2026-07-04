/**
 * ActionModalBrick — Modal formulaire générique
 *
 * Props :
 *   title    : string
 *   fields   : [{ key, label, type, options?, required?, placeholder? }]
 *   onSubmit : fn(data)
 *   onCancel : fn
 *   loading  : bool
 *   error    : string|null
 *   success  : string|null
 *   submitLabel : string
 */

import { useState } from 'react'

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

export default function ActionModalBrick({
  title,
  fields = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  success = null,
  submitLabel = 'Valider',
}) {
  const [form, setForm] = useState(
    Object.fromEntries(fields.map(f => [f.key, f.default ?? '']))
  )

  const handleSubmit = () => {
    for (const f of fields) {
      if (f.required && !form[f.key]) return
    }
    onSubmit(form)
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.2)',
      backdropFilter:'blur(4px)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'#fff', borderRadius:16, padding:28,
        width:440, maxWidth:'90vw',
        boxShadow:'0 24px 64px rgba(0,0,0,0.15)', fontFamily:ft,
      }}>
        <h2 style={{ fontSize:18, fontWeight:700, color:'#111', marginBottom:20 }}>{title}</h2>

        {/* Grid 2 colonnes si plus de 3 champs */}
        <div style={{
          display:'grid',
          gridTemplateColumns: fields.length > 3 ? '1fr 1fr' : '1fr',
          gap:12,
          marginBottom:4,
        }}>
          {fields.map(f => (
            <div key={f.key} style={{ gridColumn: f.fullWidth ? '1 / -1' : 'auto' }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:5 }}>
                {f.label}{f.required && <span style={{ color:'#dc2626' }}> *</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Choisir...</option>
                  {f.options?.map(o => (
                    <option key={o.value ?? o} value={o.value ?? o}>
                      {o.label ?? o}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize:'vertical' }}
                />
              ) : (
                <input
                  type={f.type ?? 'text'}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div style={{ padding:'10px 12px', borderRadius:8, marginTop:12, fontSize:12, fontWeight:500, background:'#FFF0F0', color:'#dc2626', border:'1px solid #fecaca' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding:'10px 12px', borderRadius:8, marginTop:12, fontSize:12, fontWeight:500, background:'#F0FDF4', color:'#166534', border:'1px solid #bbf7d0' }}>
            {success}
          </div>
        )}

        {/* Boutons */}
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button
            onClick={onCancel}
            style={{ flex:1, padding:11, borderRadius:8, border:'1px solid #E5E7EB', background:'#fff', color:'#111', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ft }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex:1, padding:11, borderRadius:8, border:'none', background:'#111', color:'#fff', fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:ft, opacity:loading?0.6:1 }}
          >
            {loading ? 'En cours...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width:'100%', padding:'10px 12px', border:'1px solid #E5E7EB',
  borderRadius:8, fontSize:13, fontFamily:'-apple-system,sans-serif',
  outline:'none', color:'#111', background:'#fff', boxSizing:'border-box',
}