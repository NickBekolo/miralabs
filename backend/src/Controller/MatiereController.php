<?php
namespace App\Controller;

use App\Entity\Matiere;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/matieres')]
class MatiereController extends AbstractController
{
    use EtablissementTrait;
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $etab = $this->getEtablissement($em);
        $qb = $em->getRepository(Matiere::class)->createQueryBuilder('m');
        if ($etab) $qb->andWhere('m.etablissement = :etab')->setParameter('etab', $etab);
        $matieres = $qb->getQuery()->getResult();
        return $this->json(array_map(fn($m) => [
            'id'  => $m->getId(),
            'nom' => $m->getNom(),
        ], $matieres));
    }
}
