<?php
namespace App\Controller;

use App\Entity\Classe;
use App\Entity\User;
use App\Entity\Cours;
use App\Entity\Note;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin/classes')]
class ClasseAdminController extends AbstractController
{
    #[Route('/{id}', methods: ['GET'])]
    public function detail(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $c = $em->getRepository(Classe::class)->find($id);
        if (!$c) return $this->json(['message'=>'Classe introuvable'], 404);

        $apprenants = $em->getRepository(User::class)->findBy(['classe' => $c]);
        $cours      = $em->getRepository(Cours::class)->findBy(['classe' => $c]);
        $enseignants = array_values(array_unique(array_filter(array_map(fn($co) => $co->getEnseignant()?->getFirstName().' '.$co->getEnseignant()?->getLastName(), $cours))));
        $matieres    = array_values(array_unique(array_filter(array_map(fn($co) => $co->getMatiere()?->getNom(), $cours))));

        $toutesNotes = [];
        $apprenantsData = array_map(function($a) use ($em, &$toutesNotes) {
            $notes = $em->getRepository(Note::class)->findBy(['eleve' => $a]);
            foreach ($notes as $n) $toutesNotes[] = $n->getValeur() / $n->getNoteSur() * 20;
            $moyenne = count($notes) > 0 ? round(array_sum(array_map(fn($n) => $n->getValeur() / $n->getNoteSur() * 20, $notes)) / count($notes), 2) : null;
            return [
                'id'        => $a->getId(),
                'firstName' => $a->getFirstName(),
                'lastName'  => $a->getLastName(),
                'email'     => $a->getEmail(),
                'genre'     => $a->getGenre(),
                'isActive'  => $a->isActive(),
                'moyenne'   => $moyenne,
            ];
        }, $apprenants);

        return $this->json([
            'id'            => $c->getId(),
            'nom'           => $c->getName(),
            'niveau'        => $c->getNiveau(),
            'anneeScolaire' => $c->getAnneeScolaire(),
            'nbApprenants'  => count($apprenants),
            'nbCours'       => count($cours),
            'enseignants'   => $enseignants,
            'matieres'      => $matieres,
            'apprenants'    => $apprenantsData,
            'moyenneClasse' => count($toutesNotes) > 0 ? round(array_sum($toutesNotes) / count($toutesNotes), 2) : null,
        ]);
    }

    #[Route('', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $etablissement = $user->getEtablissement();

        $classes = $em->getRepository(Classe::class)->findBy(['etablissement' => $etablissement]);

        return $this->json(array_map(function($c) use ($em) {
            $apprenants = $em->getRepository(User::class)->findBy(['classe' => $c]);
            $cours      = $em->getRepository(Cours::class)->findBy(['classe' => $c]);
            $enseignants = array_values(array_unique(array_filter(
                array_map(fn($co) => $co->getEnseignant()?->getFirstName().' '.$co->getEnseignant()?->getLastName(), $cours)
            )));
            $matieres = array_values(array_unique(array_filter(
                array_map(fn($co) => $co->getMatiere()?->getNom(), $cours)
            )));

            return [
                'id'           => $c->getId(),
                'nom'          => $c->getName(),
                'niveau'       => $c->getNiveau(),
                'anneeScolaire'=> $c->getAnneeScolaire(),
                'nbApprenants' => count($apprenants),
                'nbCours'      => count($cours),
                'enseignants'  => $enseignants,
                'matieres'     => $matieres,
            ];
        }, $classes));
    }
}
