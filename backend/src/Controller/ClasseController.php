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
#[IsGranted('ROLE_TEACHER')]
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
}
