<?php

namespace App\Controller;

use App\Entity\Cours;
use App\Repository\CoursRepository;
use App\Repository\ClasseRepository;
use App\Repository\MatiereRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api/cours')]
class CoursController extends AbstractController
{
    use EtablissementTrait;
    public function __construct(
        private CoursRepository    $coursRepo,
        private ClasseRepository   $classeRepo,
        private MatiereRepository  $matiereRepo,
        private UserRepository     $userRepo,
        private EntityManagerInterface $em,
    ) {}

    private function serialize(Cours $c): array
    {
        return [
            'id'          => $c->getId(),
            'heureDebut'  => $c->getHeureDebut(),
            'heureFin'    => $c->getHeureFin(),
            'jourSemaine' => $c->getJourSemaine(),
            'salle'       => $c->getSalle(),
            'isAnnule'    => $c->isAnnule(),
            'couleur'     => $c->getCouleur(),
            'matiere'     => [
                'id'  => $c->getMatiere()->getId(),
                'nom' => $c->getMatiere()->getNom(),
            ],
            'classe' => $c->getClasse() ? [
                'id'   => $c->getClasse()->getId(),
                'name' => $c->getClasse()->getName(),
            ] : null,
            'enseignant' => $c->getEnseignant() ? [
                'id'        => $c->getEnseignant()->getId(),
                'firstName' => $c->getEnseignant()->getFirstName(),
                'lastName'  => $c->getEnseignant()->getLastName(),
            ] : null,
        ];
    }

    /**
     * Cours du jour pour l'utilisateur connecté
     */
    #[Route('/today', name: 'cours_today', methods: ['GET'])]
    public function today(#[CurrentUser] User $user): JsonResponse
    {
        $jourSemaine = (int) date('N');
        $etab = $user->getEtablissement();
        $cours = $this->coursRepo->findBy(['jourSemaine' => $jourSemaine, 'etablissement' => $etab]);
        return $this->json(array_map([$this, 'serialize'], $cours));
    }

    /**
     * Emploi du temps complet (tous les jours)
     */
    #[Route('/edt', name: 'cours_edt', methods: ['GET'])]
    public function edt(): JsonResponse
    {
        $user = $this->getUser();
        $etab = $user?->getEtablissement();
        $criteria = $etab ? ['etablissement' => $etab] : [];
        $cours = $this->coursRepo->findBy($criteria, ['jourSemaine' => 'ASC', 'heureDebut' => 'ASC']);
        return $this->json(array_map([$this, 'serialize'], $cours));
    }

    /**
     * Créer un cours (superadmin ou service péda)
     */
    #[Route('', name: 'cours_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        foreach (['matiereId', 'heureDebut', 'heureFin', 'jourSemaine'] as $f) {
            if (empty($data[$f])) {
                return $this->json(['message' => "Champ '$f' requis."], 400);
            }
        }

        $matiere = $this->matiereRepo->find($data['matiereId']);
        if (!$matiere) return $this->json(['message' => 'Matière introuvable.'], 404);

        $cours = new Cours();
        $cours->setMatiere($matiere);
        $cours->setHeureDebut($data['heureDebut']);
        $cours->setHeureFin($data['heureFin']);
        $cours->setJourSemaine((int)$data['jourSemaine']);
        $cours->setSalle($data['salle'] ?? null);
        $cours->setIsAnnule(false);
        if (!empty($data['couleur'])) $cours->setCouleur($data['couleur']);
        // Assigner l'établissement de l'admin
        $admin = $this->getUser();
        if ($admin && $admin->getEtablissement()) $cours->setEtablissement($admin->getEtablissement());

        if (!empty($data['classeId'])) {
            $classe = $this->classeRepo->find($data['classeId']);
            if ($classe) $cours->setClasse($classe);
        }

        if (!empty($data['enseignantId'])) {
            $enseignant = $this->userRepo->find($data['enseignantId']);
            if ($enseignant) $cours->setEnseignant($enseignant);
        }

        $this->em->persist($cours);
        $this->em->flush();

        return $this->json($this->serialize($cours), 201);
    }

    /**
     * Annuler / réactiver un cours
     */
    #[Route('/{id}/toggle', name: 'cours_toggle', methods: ['PATCH'])]
    public function toggle(int $id): JsonResponse
    {
        $cours = $this->coursRepo->find($id);
        if (!$cours) return $this->json(['message' => 'Cours introuvable.'], 404);

        $cours->setIsAnnule(!$cours->isAnnule());
        $this->em->flush();

        return $this->json(['isAnnule' => $cours->isAnnule()]);
    }

    /**
     * Supprimer un cours
     */
    #[Route('/{id}', name: 'cours_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $cours = $this->coursRepo->find($id);
        if (!$cours) return $this->json(['message' => 'Cours introuvable.'], 404);

        $this->em->remove($cours);
        $this->em->flush();

        return $this->json(['message' => 'Cours supprimé.']);
    }

    #[Route('/admin/all', name: 'cours_admin_all', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminAll(EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $etab = $user->getEtablissement();
        $cours = $em->getRepository(Cours::class)->findBy(['etablissement' => $etab]);
        return $this->json(array_map(fn(Cours $c) => [
            'id'          => $c->getId(),
            'heureDebut'  => $c->getHeureDebut(),
            'heureFin'    => $c->getHeureFin(),
            'jourSemaine' => $c->getJourSemaine(),
            'salle'       => $c->getSalle(),
            'isAnnule'    => $c->isAnnule(),
            'couleur'     => $c->getCouleur(),
            'matiere'     => ['id'=>$c->getMatiere()->getId(),'nom'=>$c->getMatiere()->getNom()],
            'classe'      => $c->getClasse() ? ['id'=>$c->getClasse()->getId(),'name'=>$c->getClasse()->getName()] : null,
            'enseignant'  => $c->getEnseignant() ? ['id'=>$c->getEnseignant()->getId(),'firstName'=>$c->getEnseignant()->getFirstName(),'lastName'=>$c->getEnseignant()->getLastName()] : null,
        ], $cours));
    }

    #[Route('/{id}', name: 'cours_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $cours = $em->getRepository(Cours::class)->find($id);
        if (!$cours) return $this->json(['error' => 'Cours introuvable'], 404);
        
        $data = json_decode($req->getContent(), true);
        if (isset($data['heureDebut']))  $cours->setHeureDebut($data['heureDebut']);
        if (isset($data['heureFin']))    $cours->setHeureFin($data['heureFin']);
        if (isset($data['jourSemaine'])) $cours->setJourSemaine($data['jourSemaine']);
        if (isset($data['salle']))       $cours->setSalle($data['salle']);
        if (isset($data['couleur']))     $cours->setCouleur($data['couleur']);
        
        $em->flush();
        return $this->json(['message' => 'Cours mis à jour']);
    }
}
