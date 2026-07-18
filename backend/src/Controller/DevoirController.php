<?php

namespace App\Controller;

use App\Entity\Devoir;
use App\Repository\DevoirRepository;
use App\Repository\ClasseRepository;
use App\Repository\MatiereRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api/devoirs')]
class DevoirController extends AbstractController
{
    use EtablissementTrait;
    public function __construct(
        private DevoirRepository   $devoirRepo,
        private ClasseRepository   $classeRepo,
        private MatiereRepository  $matiereRepo,
        private EntityManagerInterface $em,
    ) {}

    private function serialize(Devoir $d): array
    {
        return [
            'id'          => $d->getId(),
            'titre'       => $d->getTitre(),
            'description' => $d->getDescription(),
            'dateRendu'   => $d->getDateRendu()?->format('d/m/Y'),
            'urgent'      => $d->isUrgent(),
            'matiere'     => $d->getMatiere() ? [
                'id'  => $d->getMatiere()->getId(),
                'nom' => $d->getMatiere()->getNom(),
            ] : null,
            'classe'      => $d->getClasse() ? [
                'id'   => $d->getClasse()->getId(),
                'name' => $d->getClasse()->getName(),
            ] : null,
        ];
    }

    /**
     * Liste tous les devoirs à venir
     */
    #[Route('', name: 'devoirs_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $today   = new \DateTime();
        $devoirs = $this->devoirRepo->createQueryBuilder('d')
            ->where('d.dateRendu >= :today')
            ->setParameter('today', $today)
            ->orderBy('d.dateRendu', 'ASC')
            ->getQuery()
            ->getResult();

        return $this->json(array_map([$this, 'serialize'], $devoirs));
    }

    /**
     * Créer un devoir
     */
    #[Route('', name: 'devoirs_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['titre']) || empty($data['dateRendu'])) {
            return $this->json(['message' => 'Titre et date de rendu requis.'], 400);
        }

        $devoir = new Devoir();
        $devoir->setTitre($data['titre']);
        $devoir->setDescription($data['description'] ?? null);
        $devoir->setDateRendu(new \DateTime($data['dateRendu']));
        $devoir->setUrgent($data['urgent'] ?? false);

        if (!empty($data['matiereId'])) {
            $m = $this->matiereRepo->find($data['matiereId']);
            if ($m) $devoir->setMatiere($m);
        }

        if (!empty($data['classeId'])) {
            $c = $this->classeRepo->find($data['classeId']);
            if ($c) $devoir->setClasse($c);
        }

        $this->em->persist($devoir);
        $this->em->flush();

        return $this->json($this->serialize($devoir), 201);
    }

    /**
     * Supprimer un devoir
     */
    #[Route('/{id}', name: 'devoirs_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $devoir = $this->devoirRepo->find($id);
        if (!$devoir) return $this->json(['message' => 'Devoir introuvable.'], 404);

        $this->em->remove($devoir);
        $this->em->flush();

        return $this->json(['message' => 'Devoir supprimé.']);
    }
}