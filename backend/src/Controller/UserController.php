<?php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class UserController extends AbstractController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('/api/me/ping', name: 'me_ping', methods: ['POST'])]
    public function ping(#[CurrentUser] User $user): JsonResponse
    {
        $user->setLastSeenAt(new \DateTime());
        $this->em->flush();
        return $this->json(['ok' => true]);
    }

    #[Route('/api/users/{id}/online', name: 'user_online', methods: ['GET'])]
    public function isOnline(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) return $this->json(['online' => false]);
        return $this->json(['online' => $user->isOnline()]);
    }
}
