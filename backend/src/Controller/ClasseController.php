<?php
namespace App\Controller;

use App\Entity\Classe;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/classes')]
#[IsGranted('ROLE_USER')]
class ClasseController extends AbstractController
{
    use EtablissementTrait;
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $etab = $this->getEtablissement($em);
        $qb = $em->getRepository(Classe::class)->createQueryBuilder('c');
        if ($etab) $qb->andWhere('c.etablissement = :etab')->setParameter('etab', $etab);
        $classes = $qb->getQuery()->getResult();
        return $this->json(array_map(fn($c) => [
            'id'     => $c->getId(),
            'name'   => $c->getName(),
            'niveau' => $c->getNiveau(),
        ], $classes));
    }

    #[Route('/{id}/eleves', methods:['GET'])]
    public function eleves(int $id, EntityManagerInterface $em): JsonResponse
    {
        $classe = $em->getRepository(Classe::class)->find($id);
        if (!$classe) return $this->json(['error' => 'Classe non trouvée'], 404);

        $eleves = $em->getRepository(User::class)->createQueryBuilder('u')
            ->where('u.classe = :classe')
            ->setParameter('classe', $classe)
            ->orderBy('u.lastName', 'ASC')
            ->getQuery()->getResult();

        return $this->json(array_map(fn($e) => [
            'id'        => $e->getId(),
            'firstName' => $e->getFirstName(),
            'lastName'  => $e->getLastName(),
            'email'     => $e->getEmail(),
        ], $eleves));
    }

    #[Route('', methods: ['POST'])]
    #[\Symfony\Component\Security\Http\Attribute\IsGranted('ROLE_ADMIN')]
    public function create(\Symfony\Component\HttpFoundation\Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['name'])) return $this->json(['message' => 'Nom requis'], 400);

        $classe = new \App\Entity\Classe();
        $classe->setName($data['name']);
        if (!empty($data['niveau'])) $classe->setNiveau($data['niveau']);

        $etabId = $data['etablissementId'] ?? null;
        if (!$etabId) {
            // Utiliser le premier établissement
            $etab = $em->getRepository(\App\Entity\Etablissement::class)->findOneBy([]);
        } else {
            $etab = $em->getRepository(\App\Entity\Etablissement::class)->find($etabId);
        }
        if ($etab) $classe->setEtablissement($etab);

        $em->persist($classe);
        $em->flush();

        return $this->json(['id' => $classe->getId(), 'name' => $classe->getName(), 'niveau' => $classe->getNiveau()], 201);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[\Symfony\Component\Security\Http\Attribute\IsGranted('ROLE_ADMIN')]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $classe = $em->getRepository(\App\Entity\Classe::class)->find($id);
        if (!$classe) return $this->json(['message' => 'Classe introuvable'], 404);
        $em->remove($classe);
        $em->flush();
        return $this->json(['message' => 'Supprimée'], 200);
    }
}