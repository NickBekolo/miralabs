// src/components/foryou/utils.js

import {
  CARD_HEIGHT,
  PEEK_HEIGHT,
  CARD_GAP,
} from "./cardStyles";

/**
 * Moyenne générale sur 20
 */
export function average(notes = []) {
  if (!notes.length) return 0;

  const total = notes.reduce((sum, note) => {
    return sum + (note.valeur / note.noteSur) * 20;
  }, 0);

  return Math.round((total / notes.length) * 10) / 10;
}

/**
 * Convertit une note sur X vers /20
 */
export function noteTo20(note) {
  if (!note) return 0;

  return Math.round((note.valeur / note.noteSur) * 200) / 10;
}

/**
 * Position verticale d'une carte.
 *
 * Une seule carte est ouverte.
 * Les autres restent "repliées" et ne montrent
 * qu'une bande (PEEK_HEIGHT).
 */
export function getCardTop(index, activeIndex) {
  // cartes avant la carte ouverte
  if (index < activeIndex) {
    return index * PEEK_HEIGHT;
  }

  // carte ouverte
  if (index === activeIndex) {
    return activeIndex * PEEK_HEIGHT;
  }

  // cartes après la carte ouverte
  return (
    activeIndex * PEEK_HEIGHT +
    CARD_HEIGHT +
    CARD_GAP +
    (index - activeIndex - 1) * PEEK_HEIGHT
  );
}

/**
 * Hauteur totale du conteneur.
 */
export function getStackHeight(totalCards) {
  if (totalCards <= 0) return 0;

  return (
    CARD_HEIGHT * totalCards +
    (totalCards - 1) * PEEK_HEIGHT +
    CARD_GAP * 4
  );
}

/**
 * z-index :
 * la carte ouverte est toujours au-dessus.
 */
export function getCardZIndex(index, activeIndex, totalCards) {
  if (index === activeIndex) {
    return totalCards + 10;
  }

  return totalCards - index;
}

/**
 * Les cartes fermées sont légèrement réduites.
 */
export function getCardScale(index, activeIndex) {
  if (index === activeIndex) {
    return 1;
  }

  return 0.985;
}

/**
 * Opacité de l'ombre.
 */
export function getCardShadow(index, activeIndex) {
  return index === activeIndex ? 1 : 0.65;
}

/**
 * Indique si la carte est ouverte.
 */
export function isActive(index, activeIndex) {
  return index === activeIndex;
}

/**
 * Permet de passer à la carte suivante.
 */
export function nextCard(activeIndex, totalCards) {
  if (activeIndex >= totalCards - 1) {
    return activeIndex;
  }

  return activeIndex + 1;
}

/**
 * Permet de revenir à la carte précédente.
 */
export function previousCard(activeIndex) {
  if (activeIndex <= 0) {
    return 0;
  }

  return activeIndex - 1;
}