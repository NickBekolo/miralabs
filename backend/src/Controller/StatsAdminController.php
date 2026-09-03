<?php
namespace App\Controller;

use App\Entity\Classe;
use App\Entity\User;
use App\Entity\Note;
use App\Entity\Absence;
use App\Entity\Retard;
use App\Entity\Cours;
use App\Entity\Matiere;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/admin/stats')]
class StatsAdminController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function stats(EntityManagerInterface $em, #[CurrentUser] User $admin): JsonResponse
    {
        $etab    = $admin->getEtablissement();
        $classes = $em->getRepository(Classe::class)->findBy(['etablissement' => $etab]);

        $effectifs    = [];
        $moyennes     = [];
        $absences     = [];
        $retards      = [];
        $parMatiere   = [];

        foreach ($classes as $cl) {
            $apprenants = $em->getRepository(User::class)->findBy(['classe' => $cl]);
            $actifs     = array_filter($apprenants, fn($u) => $u->isActive());

            // Effectifs
            $effectifs[] = [
                'name'    => $cl->getName(),
                'total'   => count($apprenants),
                'actifs'  => count($actifs),
                'inactifs'=> count($apprenants) - count($actifs),
            ];

            // Moyennes
            $toutesNotes = [];
            foreach ($apprenants as $a) {
                $notes = $em->getRepository(Note::class)->findBy(['eleve' => $a]);
                foreach ($notes as $n) $toutesNotes[] = $n->getValeur() / $n->getNoteSur() * 20;
            }
            $moyennes[] = [
                'name'    => $cl->getName(),
                'moyenne' => count($toutesNotes) > 0 ? round(array_sum($toutesNotes)/count($toutesNotes), 2) : 0,
            ];

            // Absences
            $nbAbs = 0;
            foreach ($apprenants as $a) {
                $nbAbs += count($em->getRepository(Absence::class)->findBy(['eleve' => $a]));
            }
            $absences[] = ['name' => $cl->getName(), 'absences' => $nbAbs];

            // Retards
            $nbRet = 0;
            foreach ($apprenants as $a) {
                $nbRet += count($em->getRepository(Retard::class)->findBy(['eleve' => $a]));
            }
            $retards[] = ['name' => $cl->getName(), 'retards' => $nbRet];
        }

        // Moyennes par matière
        $matieres = $em->getRepository(Matiere::class)->findBy(['etablissement' => $etab]);
        foreach ($matieres as $m) {
            $notes = $em->getRepository(Note::class)->findBy(['matiere' => $m]);
            if (count($notes) === 0) continue;
            $vals = array_map(fn($n) => $n->getValeur() / $n->getNoteSur() * 20, $notes);
            $parMatiere[] = [
                'name'    => $m->getNom(),
                'moyenne' => round(array_sum($vals)/count($vals), 2),
            ];
        }

        return $this->json([
            'effectifs'  => $effectifs,
            'moyennes'   => $moyennes,
            'absences'   => $absences,
            'retards'    => $retards,
            'parMatiere' => $parMatiere,
        ]);
    }
}
