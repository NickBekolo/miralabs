<?php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/apprenants')]
class ApprenantController extends AbstractController
{
    #[Route('/{id}', methods: ['GET'])]
    public function fiche(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) return $this->json(['message' => 'Apprenant introuvable'], 404);

        // Notes
        $notes = $em->getRepository(\App\Entity\Note::class)->findBy(['eleve' => $user]);
        $notesData = array_map(fn($n) => [
            'id'             => $n->getId(),
            'valeur'         => $n->getValeur(),
            'noteSur'        => $n->getNoteSur(),
            'typeEvaluation' => $n->getTypeEvaluation(),
            'commentaire'    => $n->getCommentaire(),
            'matiere'        => $n->getMatiere()?->getNom(),
            'createdAt'      => $n->getCreatedAt()?->format('d/m/Y'),
        ], $notes);

        // Calcul moyenne générale
        $moyenne = count($notes) > 0
            ? round(array_sum(array_map(fn($n) => $n->getValeur() / $n->getNoteSur() * 20, $notes)) / count($notes), 2)
            : null;

        // Moyenne par matière
        $moyennesParMatiere = [];
        foreach ($notes as $n) {
            $mat = $n->getMatiere()?->getNom() ?? 'Autre';
            if (!isset($moyennesParMatiere[$mat])) $moyennesParMatiere[$mat] = ['notes'=>[], 'nom'=>$mat];
            $moyennesParMatiere[$mat]['notes'][] = $n->getValeur() / $n->getNoteSur() * 20;
        }
        $moyennesParMatiere = array_map(fn($m) => [
            'matiere' => $m['nom'],
            'moyenne' => round(array_sum($m['notes']) / count($m['notes']), 2),
            'nbNotes' => count($m['notes']),
        ], $moyennesParMatiere);

        // Absences
        $absences = $em->getRepository(\App\Entity\Absence::class)->findBy(['eleve' => $user]);
        $absencesData = array_map(fn($a) => [
            'id'         => $a->getId(),
            'date'       => $a->getDate()?->format('d/m/Y'),
            'motif'      => $a->getMotif(),
            'justifiee'  => $a->isJustifiee(),
        ], $absences);

        // Retards
        $retards = $em->getRepository(\App\Entity\Retard::class)->findBy(['eleve' => $user]);
        $retardsData = array_map(fn($r) => [
            'id'       => $r->getId(),
            'date'     => $r->getDate()?->format('d/m/Y'),
            'duree'    => $r->getDuree(),
            'justifie' => $r->isJustifie(),
        ], $retards);

        // Appréciations
        $appreciations = $em->getRepository(\App\Entity\Appreciation::class)->findBy(['eleve' => $user]);
        $appreciationsData = array_map(fn($a) => [
            'id'          => $a->getId(),
            'contenu'     => $a->getContenu(),
            'matiere'     => $a->getMatiere()?->getNom(),
            'professeur'  => $a->getProfesseur()?->getFirstName().' '.$a->getProfesseur()?->getLastName(),
            'periode'     => $a->getPeriode(),
            'createdAt'   => $a->getCreatedAt()?->format('d/m/Y'),
        ], $appreciations);

        // Sanctions
        $sanctions = $em->getRepository(\App\Entity\Sanction::class)->findBy(['eleve' => $user]);
        $sanctionsData = array_map(fn($s) => [
            'id'    => $s->getId(),
            'type'  => $s->getType(),
            'motif' => $s->getMotif(),
            'date'  => $s->getDate()?->format('d/m/Y'),
        ], $sanctions);

        return $this->json([
            'id'              => $user->getId(),
            'firstName'       => $user->getFirstName(),
            'lastName'        => $user->getLastName(),
            'email'           => $user->getEmail(),
            'genre'           => $user->getGenre(),
            'dateNaissance'   => $user->getDateNaissance()?->format('d/m/Y'),
            'telephone'       => $user->getTelephone(),
            'adresse'         => $user->getAdresse(),
            'photoUrl'        => $user->getPhotoUrl(),
            'classe'          => $user->getClasse() ? ['id'=>$user->getClasse()->getId(),'nom'=>$user->getClasse()->getName()] : null,
            'isActive'        => $user->isActive(),
            'createdAt'       => $user->getCreatedAt()?->format('d/m/Y'),
            'parentNom'       => $user->getParentNom(),
            'parentEmail'     => $user->getParentEmail(),
            'parentTelephone' => $user->getParentTelephone(),
            'moyenne'         => $moyenne,
            'moyennesParMatiere' => array_values($moyennesParMatiere),
            'notes'           => $notesData,
            'absences'        => $absencesData,
            'nbAbsences'      => count($absencesData),
            'nbAbsencesJustifiees' => count(array_filter($absencesData, fn($a) => $a['justifiee'])),
            'retards'         => $retardsData,
            'nbRetards'       => count($retardsData),
            'appreciations'   => $appreciationsData,
            'sanctions'       => $sanctionsData,
        ]);
    }
}
