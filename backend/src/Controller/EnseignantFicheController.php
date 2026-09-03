<?php
namespace App\Controller;

use App\Entity\User;
use App\Entity\Cours;
use App\Entity\Note;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/enseignants')]
class EnseignantFicheController extends AbstractController
{
    #[Route('/{id}', methods: ['GET'])]
    public function fiche(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) return $this->json(['message' => 'Enseignant introuvable'], 404);

        // Cours
        $cours = $em->getRepository(Cours::class)->findBy(['enseignant' => $user]);
        
        // Matières uniques
        $matieres = array_values(array_unique(array_filter(
            array_map(fn($c) => $c->getMatiere()?->getNom(), $cours)
        )));

        // Classes uniques
        $classes = array_values(array_unique(array_filter(
            array_map(fn($c) => $c->getClasse()?->getName(), $cours)
        )));

        // Emploi du temps
        $edt = array_map(fn($c) => [
            'id'         => $c->getId(),
            'matiere'    => $c->getMatiere()?->getNom(),
            'classe'     => $c->getClasse()?->getName(),
            'jour'       => $c->getJourSemaine(),
            'heureDebut' => $c->getHeureDebut()?->format('H:i'),
            'heureFin'   => $c->getHeureFin()?->format('H:i'),
            'salle'      => $c->getSalle(),
            'isAnnule'   => $c->isIsAnnule(),
        ], $cours);

        // Notes saisies par cet enseignant
        $notes = $em->getRepository(Note::class)->findBy(['professeur' => $user]);
        $nbNotes = count($notes);
        $nbEleves = count(array_unique(array_map(fn($n) => $n->getEleve()?->getId(), $notes)));

        return $this->json([
            'id'              => $user->getId(),
            'firstName'       => $user->getFirstName(),
            'lastName'        => $user->getLastName(),
            'email'           => $user->getEmail(),
            'genre'           => $user->getGenre(),
            'telephone'       => $user->getTelephone(),
            'adresse'         => $user->getAdresse(),
            'dateNaissance'   => $user->getDateNaissance()?->format('d/m/Y'),
            'isActive'        => $user->isActive(),
            'createdAt'       => $user->getCreatedAt()?->format('d/m/Y'),
            'matieres'        => $matieres,
            'classes'         => $classes,
            'nbCours'         => count($cours),
            'nbNotesSaisies'  => $nbNotes,
            'nbEleves'        => $nbEleves,
            'edt'             => $edt,
        ]);
    }
}
