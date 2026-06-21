import { useState } from 'react'
import { INITIAL_BOOKS } from '../data/teacher.data'

/**
 * Hook de gestion de la bibliothèque de documents.
 * Encapsule la logique de sélection, pagination et création.
 */
export function useBooks() {
  const [books, setBooks]   = useState(INITIAL_BOOKS)
  const [selected, setSelected] = useState(0)
  const [offset, setOffset]     = useState(0)
  const VISIBLE = 7

  const visible = books.slice(offset, offset + VISIBLE)
  const currentBook = visible[selected] ?? visible[0] ?? null

  const selectBook = (i) => setSelected(i)

  const prevPage = () => {
    if (offset > 0) { setOffset(o => o - 1); setSelected(0) }
  }

  const nextPage = () => {
    if (offset + VISIBLE < books.length) { setOffset(o => o + 1); setSelected(0) }
  }

  const addBook = (book) => {
    setBooks(prev => [{ id: Date.now(), ...book }, ...prev])
    setOffset(0)
    setSelected(0)
  }

  return {
    books, visible, currentBook, selected, offset,
    canPrev: offset > 0,
    canNext: offset + VISIBLE < books.length,
    selectBook, prevPage, nextPage, addBook,
  }
}
