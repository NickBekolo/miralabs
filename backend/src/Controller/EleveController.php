<?php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Trait\EtablissementTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/eleves')]
#[IsGranted('ROLE_TEACHER')]
class EleveController extends AbstractController
{
    use EtablissementTrait;
    #[Route('', methods:['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $eleves = $em->getRepository(User::class)->createQueryBuilder('u')
            ->where('u.roles LIKE :role')
            ->setParameter('role', '%ROLE_STUDENT%')
            ->orderBy('u.lastName', 'ASC')
            ->getQuery()
            ->getResult();

        return $this->json(array_map(fn($e) => [
            'id'        => $e->getId(),
            'firstName' => $e->getFirstName(),
            'lastName'  => $e->getLastName(),
            'email'     => $e->getEmail(),
        ], $eleves));
    }
}
