import { BookCover } from './BookCover'
import { BookSpine } from './BookSpine'
import { Button } from '../ui/Button'
import { useBooks } from '../../hooks/useBooks'

/**
 * Section bibliothèque complète.
 * Couverture à gauche + épines à droite + navigation + bouton créer.
 */
export function Library({ onCreateDoc }) {
  const { visible, currentBook, selected, canPrev, canNext,
          selectBook, prevPage, nextPage } = useBooks()

  return (
    <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:18, overflow:'hidden' }}>

      {/* En-tête */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 20px' }}>
        <span style={{ fontSize:14, fontWeight:700, letterSpacing:'-0.2px' }}>
          Mes cours & documents
        </span>
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          <NavArrow direction="←" onClick={prevPage} disabled={!canPrev} />
          <NavArrow direction="→" onClick={nextPage} disabled={!canNext} />
          <Button variant="primary" onClick={onCreateDoc} style={{ fontSize:11, padding:'6px 14px' }}>
            + Créer un document
          </Button>
        </div>
      </div>

      {/* Corps : couverture + épines */}
      <div style={{ display:'flex', alignItems:'flex-end', padding:'0 20px' }}>
        <BookCover book={currentBook} />
        <div style={{ width:16, flexShrink:0 }}/>
        <div style={{ display:'flex', alignItems:'flex-end', gap:0 }}>
          {visible.map((book, i) => (
            <BookSpine key={book.id} book={book}
              isSelected={i === selected}
              onClick={() => selectBook(i)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NavArrow({ direction, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:28, height:28, borderRadius:'50%', border:'1.5px solid #e8e8e8',
      background:'#fff', cursor: disabled ? 'default' : 'pointer',
      fontSize:12, opacity: disabled ? 0.3 : 1,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {direction}
    </button>
  )
}
