<?php
namespace App\Controller;

use App\Entity\Etablissement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/public')]
class PublicEtablissementController extends AbstractController
{
    #[Route('/villes', methods:['GET'])]
    public function villes(EntityManagerInterface $em): JsonResponse
    {
        $etabs = $em->getRepository(Etablissement::class)->findBy(['isActive' => true]);
        $villes = array_unique(array_map(fn($e) => $e->getVille(), $etabs));
        sort($villes);
        return $this->json(array_values($villes));
    }

    #[Route('/etablissements', methods:['GET'])]
    public function etablissements(EntityManagerInterface $em): JsonResponse
    {
        $etabs = $em->getRepository(Etablissement::class)->findBy(['isActive' => true]);
        return $this->json(array_map(fn($e) => [
            'id'    => $e->getId(),
            'name'  => $e->getName(),
            'code'  => $e->getCode(),
            'type'  => $e->getType(),
            'ville' => $e->getVille(),
            'api_url' => $e->getApiUrl() ?? 'http://127.0.0.1:8000',
        ], $etabs));
    }

    #[Route('/etablissements/ville/{ville}', methods:['GET'])]
    public function parVille(string $ville, EntityManagerInterface $em): JsonResponse
    {
        $etabs = $em->getRepository(Etablissement::class)->createQueryBuilder('e')
            ->where('e.ville = :ville')
            ->andWhere('e.isActive = true')
            ->setParameter('ville', $ville)
            ->getQuery()->getResult();

        return $this->json(array_map(fn($e) => [
            'id'      => $e->getId(),
            'name'    => $e->getName(),
            'code'    => $e->getCode(),
            'type'    => $e->getType(),
            'ville'   => $e->getVille(),
            'api_url' => $e->getApiUrl() ?? 'http://127.0.0.1:8000',
        ], $etabs));
    }
}
