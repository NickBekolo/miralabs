/**
 * DataTableBrick — Tableau de données réutilisable
 *
 * Props :
 *   columns  : [{ key, label, render? }]
 *   rows     : array
 *   actions  : [{ label, onClick, danger? }] — optionnel
 *   readOnly : bool — masque les actions
 *   searchable : bool
 *   title    : string
 *   onAdd    : fn — bouton "Ajouter" en haut à droite
 *   addLabel : string
 *   emptyMsg : string
 */

import { useState } from 'react'

const ft = '-apple-system,"SF Pro Text",BlinkMacSystemFont,sans-serif'

export default function DataTableBrick({
  columns = [],
  rows = [],
  actions = [],
  readOnly = false,
  searchable = true,
  title,
  onAdd,
  addLabel = '+ Ajouter',
  emptyMsg = 'Aucune donnée.',
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  // Filtre
  let filtered = rows.filter(row =>
    columns.some(col => {
      const val = row[col.key]
      return val && String(val).toLowerCase().includes(search.toLowerCase())
    })
  )

  // Tri
  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const va = String(a[sortKey] ?? '').toLowerCase()
      const vb = String(b[sortKey] ?? '').toLowerCase()
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va)
    })
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #F0F0F0', borderRadius:14, overflow:'hidden', fontFamily:ft }}>

      {/* Header */}
      {(title || onAdd || searchable) && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #F5F5F5' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {title && <span style={{ fontSize:14, fontWeight:700, color:'#111' }}>{title}</span>}
            {searchable && (
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Rechercher..."
                style={{
                  padding:'6px 12px', border:'1px solid #E5E7EB', borderRadius:8,
                  fontSize:13, fontFamily:ft, outline:'none', color:'#111', width:200,
                }}
              />
            )}
          </div>
          {onAdd && !readOnly && (
            <button
              onClick={onAdd}
              style={{
                padding:'7px 16px', borderRadius:8, border:'none',
                background:'#111', color:'#fff', fontSize:13,
                fontWeight:600, cursor:'pointer', fontFamily:ft,
              }}
            >
              {addLabel}
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #F0F0F0' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    padding:'10px 16px', textAlign:'left', fontSize:11,
                    fontWeight:600, color:'#9ca3af', textTransform:'uppercase',
                    letterSpacing:'0.5px', cursor:'pointer', userSelect:'none',
                    whiteSpace:'nowrap',
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (sortAsc ? ' ↑' : ' ↓')}
                </th>
              ))}
              {!readOnly && actions.length > 0 && (
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding:'32px 16px', textAlign:'center', fontSize:13, color:'#9ca3af' }}>
                  {emptyMsg}
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom:'1px solid #F9F9F9' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding:'12px 16px', fontSize:13, color:'#111' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {!readOnly && actions.length > 0 && (
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      {actions.map((action, ai) => (
                        <button
                          key={ai}
                          onClick={() => action.onClick(row)}
                          style={{
                            padding:'4px 10px', borderRadius:6, fontSize:11,
                            fontWeight:600, cursor:'pointer', fontFamily:ft,
                            border: action.danger ? '1px solid #fecaca' : '1px solid #E5E7EB',
                            background:'#fff',
                            color: action.danger ? '#dc2626' : '#111',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = action.danger ? '#FFF0F0' : '#F5F5F5'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          {typeof action.label === 'function' ? action.label(row) : action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 18px', borderTop:'1px solid #F5F5F5' }}>
          <span style={{ fontSize:12, color:'#9ca3af' }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
          <div style={{ display:'flex', gap:4 }}>
            <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</PageBtn>
            {Array.from({ length: totalPages }, (_, i) => (
              <PageBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
                {i + 1}
              </PageBtn>
            ))}
            <PageBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</PageBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:28, height:28, borderRadius:6, border:'1px solid #E5E7EB',
        background: active ? '#111' : '#fff',
        color: active ? '#fff' : disabled ? '#ccc' : '#111',
        fontSize:12, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily:'-apple-system,sans-serif',
      }}
    >
      {children}
    </button>
  )
}