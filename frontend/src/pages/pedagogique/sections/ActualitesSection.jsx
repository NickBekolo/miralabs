import { ACTU } from '../../../data/teacher.data'

const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,"Helvetica Neue",sans-serif'

const PALETTE = {
  bg:        '#F2F2F2',
  cardBg:    '#F8F8F8',
  textMain:  '#111111',
  textMuted: '#8A8A8A',
  border:    '#E5E7EB',
  shadow:    'rgba(0,0,0,0.05)',
}

/**
 * ActualitesSection — liste d'actualités, inspirée d'une UI de fil d'actu
 * mais adaptée à la palette Miralabs (neutre, noir & blanc).
 *
 * Chaque actualité dans ACTU peut optionnellement avoir :
 *   tags: string[] — tags supplémentaires affichés en chips (en plus de `tag`)
 * Si absent, seul `tag` (catégorie) est affiché comme chip.
 */
export function ActualitesSection() {
  return (
    <div style={{ fontFamily: ft }}>
      {/* En-tête de section */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:700, color:PALETTE.textMain, letterSpacing:'-0.3px' }}>
          Actualités
        </span>
        <span style={{ fontSize:12, color:PALETTE.textMuted, cursor:'pointer' }}>
          Voir tout ›
        </span>
      </div>

      {/* Liste de cartes */}
      {ACTU.map((a, i) => (
        <NewsCard key={i} item={a} />
      ))}
    </div>
  )
}

function NewsCard({ item }) {
  const tags = item.tags?.length ? item.tags : [item.tag]

  return (
    <article
      style={{
        background: PALETTE.cardBg, border:`1px solid ${PALETTE.border}`,
        borderRadius:32, padding:'22px 24px', marginBottom:14,
        cursor:'pointer', transition:'transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s, border-color 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 10px 26px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = PALETTE.textMain
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = PALETTE.border
      }}
    >
      {/* Titre */}
      <h3 style={{ fontSize:17, fontWeight:700, color:PALETTE.textMain, letterSpacing:'-0.3px', marginBottom:8, lineHeight:1.3 }}>
        {item.title}
      </h3>

      {/* Résumé */}
      <p style={{ fontSize:13, color:PALETTE.textMuted, lineHeight:1.6, marginBottom:16 }}>
        {item.sub}
      </p>

      {/* Tags */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        {tags.map((t, i) => (
          <span key={i} style={{
            background:'#fff', color:PALETTE.textMain,
            border:`1px solid ${PALETTE.border}`,
            padding:'6px 14px', borderRadius:980, fontSize:12, fontWeight:600,
          }}>
            {t}
          </span>
        ))}
      </div>

      {/* Date + actions */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:12, color:PALETTE.textMuted, display:'flex', alignItems:'center', gap:5 }}>
          <CalendarIcon /> {item.time}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{
            border:'none', padding:'9px 16px', borderRadius:14,
            cursor:'pointer', fontWeight:600, fontSize:12,
            background:PALETTE.textMain, color:'#fff', fontFamily:ft,
          }}>
            Détails
          </button>
          <button style={{
            border:`1px solid ${PALETTE.border}`, padding:'9px 16px', borderRadius:14,
            cursor:'pointer', fontWeight:600, fontSize:12,
            background:'#fff', color:PALETTE.textMain, fontFamily:ft,
          }}>
            Marquer comme lu
          </button>
        </div>
      </div>
    </article>
  )
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/>
      <path d="M3 10h18M8 2v4M16 2v4"/>
    </svg>
  )
}