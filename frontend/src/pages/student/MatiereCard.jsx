const ft = '-apple-system,"SF Pro Text","SF Pro Display",BlinkMacSystemFont,"Helvetica Neue",sans-serif'

const PALETTE = {
  cardBg:    '#fff',
  border:    '#E5E7EB',
  shadow:    'rgba(0,0,0,0.05)',
  textMain:  '#111111',
  textMuted: '#8A8A8A',
  green:     '#166534',
  red:       '#ef4444',
  rowBorder: '#EFEFEF',
}

const SEUIL = 10 // moyenne de passage sur 20

/**
 * MatiereCard — carte regroupant toutes les notes d'une matière.
 *
 * - Le pill de moyenne est plein vert forêt si la moyenne ≥ 10, plein rouge vif sinon.
 * - La bordure de la carte elle-même devient rouge vif (fine) si la moyenne est sous 10.
 * - Chaque note individuelle sous 10 est affichée pleine rouge vif avec texte blanc ;
 *   les autres restent neutres (fond blanc, texte noir, bordure grise).
 *
 * Props :
 *   matiere : string   — nom de la matière
 *   moyenne : number   — moyenne de la matière (sur 20)
 *   notes   : {
 *     score: number,
 *     type: string,        — ex: "Évaluation", "Travail dirigé", "Cours"
 *     coefficient: number,
 *     date: string,        — ex: "12 juin"
 *   }[]
 */
export default function MatiereCard({ matiere, moyenne, notes = [] }) {
  const moyenneOk = moyenne >= SEUIL
  const moyenneColor = moyenneOk ? PALETTE.green : PALETTE.red

  return (
    <div style={{
      fontFamily: ft, width:'100%', borderRadius:40,
      background: PALETTE.cardBg, padding:'24px 26px',
      border: `1px solid ${moyenneOk ? PALETTE.border : PALETTE.red}`,
      boxShadow:`0 1px 3px ${PALETTE.shadow}`,
      marginBottom:16,
    }}>
      {/* Header : matière + moyenne */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ fontSize:22, fontWeight:600, color:PALETTE.textMain, letterSpacing:'-0.4px' }}>
          {matiere}
        </div>
        <div style={{
          fontSize:13, fontWeight:700, color:'#fff',
          background:moyenneColor, border:`1px solid ${moyenneColor}`,
          padding:'4px 14px', borderRadius:980,
        }}>
          {moyenne.toFixed(1)} moy.
        </div>
      </div>

      {/* Liste des notes */}
      <div style={{ marginTop:14 }}>
        {notes.map((n, i) => {
          const low = n.score < SEUIL
          return (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:14, padding:'13px 0',
              borderBottom: i < notes.length - 1 ? `1px solid ${PALETTE.rowBorder}` : 'none',
            }}>
              <div style={{
                fontSize:13, fontWeight:700,
                color: low ? '#fff' : PALETTE.textMain,
                background: low ? PALETTE.red : '#fff',
                border: `1px solid ${low ? PALETTE.red : PALETTE.border}`,
                padding:'5px 11px', borderRadius:12,
                flexShrink:0, minWidth:42, textAlign:'center',
              }}>
                {n.score}/20
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:PALETTE.textMain }}>{n.type}</div>
                <div style={{ fontSize:11, color:PALETTE.textMuted, marginTop:1 }}>Coefficient {n.coefficient}</div>
              </div>
              <div style={{ fontSize:12, color:PALETTE.textMuted, flexShrink:0, whiteSpace:'nowrap' }}>
                {n.date}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}