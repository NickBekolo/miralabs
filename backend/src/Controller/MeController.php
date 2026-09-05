<?php
namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class MeController extends AbstractController
{
    #[Route('/api/me', methods: ['GET'])]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json([
            'id'               => $user->getId(),
            'email'            => $user->getEmail(),
            'firstName'        => $user->getFirstName(),
            'lastName'         => $user->getLastName(),
            'roles'            => $user->getRoles(),
            'isActive'         => $user->isActive(),
            'genre'            => $user->getGenre(),
            'telephone'        => $user->getTelephone(),
            'adresse'          => $user->getAdresse(),
            'dateNaissance'    => $user->getDateNaissance()?->format('d/m/Y'),
            'photoUrl'         => $user->getPhotoUrl(),
            'createdAt'        => $user->getCreatedAt()?->format('d/m/Y'),
            'etablissement'    => $user->getEtablissement()?->getName(),
            'mustChangePassword' => $user->isMustChangePassword(),
        ]);
    }
}
