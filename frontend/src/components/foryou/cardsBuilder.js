import { average, noteTo20 } from "./utils";

/**
 * Construit la liste de cards pour ForYou
 * à partir des données API.
 */
export function buildCards({ notes, cours, devoirs, navigate }) {
  const cards = [];

  const moyenne       = average(notes);
  const prochainCours = cours.find(c => !c.isAnnule);
  const annules       = cours.filter(c => c.isAnnule);
  const devoirUrgent  = devoirs.find(d => d.urgent);
  const derniereNote  = notes[0];
  const noteBasse     = notes.find(n => (n.valeur / n.noteSur) * 20 < 10);

  // Prochain cours
  if (prochainCours) {
    cards.push({
      emoji: "📅",
      subtitle: "Basé sur votre journée",
      title: `Prépare-moi\npour ce cours`,
      urgent: false,
      badge: { label: "Auj.", value: prochainCours.heureDebut },
      main: prochainCours.matiere.nom,
      sub: prochainCours.salle + (prochainCours.enseignant
        ? ` · ${prochainCours.enseignant.firstName} ${prochainCours.enseignant.lastName}`
        : ""),
      onClick: () => navigate("/student/edt"),
    });
  }

  // Devoir urgent
  if (devoirUrgent) {
    cards.push({
      emoji: "⚠️",
      subtitle: "Devoir urgent à rendre",
      title: `Rendre\n${devoirUrgent.titre}`,
      urgent: true,
      badge: { label: "URGENT", value: devoirUrgent.dateRendu },
      main: devoirUrgent.titre,
      sub: devoirUrgent.matiere?.nom,
      onClick: null,
    });
  }

  // Cours annulé
  if (annules[0]) {
    cards.push({
      emoji: "❌",
      subtitle: "Cours annulé aujourd'hui",
      title: `${annules[0].matiere.nom}\nest annulé`,
      urgent: true,
      badge: { label: "Annulé", value: annules[0].heureDebut },
      main: annules[0].matiere.nom,
      sub: annules[0].salle,
      onClick: null,
    });
  }

  // Note basse
  if (noteBasse) {
    const s = noteTo20(noteBasse);
    cards.push({
      emoji: "⚠️",
      subtitle: "Note en dessous de la moyenne",
      title: `Travailler\n${noteBasse.matiere.nom}`,
      urgent: true,
      badge: { label: "Note", value: `${s}/20` },
      main: noteBasse.matiere.nom,
      sub: noteBasse.commentaire,
      onClick: () => navigate("/student/notes"),
    });
  } else if (derniereNote) {
    const s = noteTo20(derniereNote);
    cards.push({
      emoji: "📊",
      subtitle: "Dernière note reçue",
      title: `Voir ma\nnouvelle note`,
      urgent: false,
      badge: { label: "Note", value: `${s}/20` },
      main: derniereNote.matiere.nom,
      sub: derniereNote.commentaire || "Note reçue",
      onClick: () => navigate("/student/notes"),
    });
  }

  // Moyenne générale
  if (notes.length > 0) {
    cards.push({
      emoji: "🎯",
      subtitle: "Votre progression",
      title: `Moyenne\nà ${moyenne}/20`,
      urgent: moyenne < 10,
      badge: { label: "Notes", value: String(notes.length) },
      main: `${moyenne} sur 20`,
      sub: moyenne >= 10 ? "Au dessus de la moyenne" : "En dessous de la moyenne",
      onClick: () => navigate("/student/notes"),
    });
  }

  // Prochain devoir non urgent
  const prochainDevoir = devoirs.find(d => !d.urgent);
  if (prochainDevoir) {
    cards.push({
      emoji: "📚",
      subtitle: "À préparer bientôt",
      title: `Ne pas oublier\n${prochainDevoir.titre}`,
      urgent: false,
      badge: { label: "", value: prochainDevoir.dateRendu },
      main: prochainDevoir.titre,
      sub: prochainDevoir.matiere?.nom,
      onClick: null,
    });
  }

  return cards;
}