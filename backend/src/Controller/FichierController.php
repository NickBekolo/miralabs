<?php
namespace App\Controller;

use App\Entity\DemandeModification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/fichiers')]
class FichierController extends AbstractController
{
    private string $uploadDir;

    public function __construct()
    {
        $this->uploadDir = __DIR__.'/../../public/uploads';
    }

    #[Route('/justificatif/{id}', methods: ['GET'])]
    public function justificatif(int $id, EntityManagerInterface $em, #[CurrentUser] User $user): Response
    {
        $demande = $em->getRepository(DemandeModification::class)->find($id);
        if (!$demande) return $this->json(['message' => 'Introuvable.'], 404);

        // Vérifier que c'est le demandeur ou un admin
        $roles = $user->getRoles();
        $isAdmin = in_array('ROLE_SUPER_ADMIN', $roles) || in_array('ROLE_ADMIN', $roles);
        if (!$isAdmin && $demande->getUser()?->getId() !== $user->getId()) {
            return $this->json(['message' => 'Accès refusé.'], 403);
        }

        $path = $this->uploadDir.'/justificatifs/'.basename($demande->getJustificatifPath());
        if (!file_exists($path)) return $this->json(['message' => 'Fichier introuvable.'], 404);

        return new BinaryFileResponse($path);
    }
}
