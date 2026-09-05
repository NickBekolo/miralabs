<?php
namespace App\Controller;

use App\Entity\DemandeModification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/upload')]
class UploadController extends AbstractController
{
    private string $uploadDir;

    public function __construct()
    {
        $this->uploadDir = __DIR__.'/../../public/uploads';
    }

    // Upload justificatif pour une demande
    #[Route('/justificatif/{id}', methods: ['POST'])]
    public function justificatif(int $id, Request $req, EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $demande = $em->getRepository(DemandeModification::class)->find($id);
        if (!$demande) return $this->json(['message' => 'Demande introuvable.'], 404);

        $file = $req->files->get('fichier');
        if (!$file) return $this->json(['message' => 'Aucun fichier reçu.'], 400);

        $ext      = $file->getClientOriginalExtension();
        $allowed  = ['jpg','jpeg','png','pdf','webp'];
        if (!in_array(strtolower($ext), $allowed)) {
            return $this->json(['message' => 'Format non autorisé. Utilisez JPG, PNG ou PDF.'], 400);
        }

        $filename = 'justif_'.$id.'_'.time().'.'.$ext;
        $file->move($this->uploadDir.'/justificatifs', $filename);

        $demande->setJustificatifPath('/uploads/justificatifs/'.$filename);
        $em->flush();

        return $this->json(['path' => '/uploads/justificatifs/'.$filename]);
    }

    // Upload photo de profil
    #[Route('/photo', methods: ['POST'])]
    public function photo(Request $req, EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $file = $req->files->get('photo');
        if (!$file) return $this->json(['message' => 'Aucun fichier reçu.'], 400);

        $ext     = $file->getClientOriginalExtension();
        $allowed = ['jpg','jpeg','png','webp'];
        if (!in_array(strtolower($ext), $allowed)) {
            return $this->json(['message' => 'Format non autorisé. Utilisez JPG ou PNG.'], 400);
        }

        $filename = 'photo_'.$user->getId().'_'.time().'.'.$ext;
        $file->move($this->uploadDir.'/photos', $filename);

        $user->setPhotoUrl('/uploads/photos/'.$filename);
        $em->flush();

        return $this->json(['photoUrl' => '/uploads/photos/'.$filename]);
    }
}
