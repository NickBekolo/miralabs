<?php
namespace App\Controller;

use App\Entity\DemandeModification;
use App\Entity\Absence;
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

    // Enregistrer signature personnelle
    #[Route('/signature', methods: ['POST'])]
    public function signature(Request $req, EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        $base64 = $data['signature'] ?? null;
        if (!$base64) return $this->json(['message' => 'Signature manquante.'], 400);

        if (str_contains($base64, ',')) {
            $base64 = explode(',', $base64)[1];
        }
        $imageData = base64_decode($base64);
        $filename  = 'signature_'.$user->getId().'.png';
        $filepath  = $this->uploadDir.'/../signatures/'.$filename;

        if (!is_dir(dirname($filepath))) {
            mkdir(dirname($filepath), 0775, true);
        }

        file_put_contents($filepath, $imageData);
        $user->setSignatureUrl('/signatures/'.$filename);
        $em->flush();

        return $this->json(['signatureUrl' => '/signatures/'.$filename]);
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

    #[Route('/justificatif-absence/{id}', methods: ['POST'])]
    public function justificatifAbsence(int $id, Request $req, EntityManagerInterface $em, #[CurrentUser] User $user): JsonResponse
    {
        $absence = $em->getRepository(Absence::class)->find($id);
        if (!$absence) return $this->json(['message' => 'Absence introuvable.'], 404);

        $file = $req->files->get('fichier');
        if (!$file) {
            // Pas de fichier — juste mettre à jour le statut
            $data = json_decode($req->getContent(), true);
            $absence->setStatutJustification('en_attente');
            $absence->setMotifJustification($data['motif'] ?? null);
            $absence->setTypeJustification($data['type'] ?? null);
            $em->flush();
            return $this->json(['statut' => 'en_attente']);
        }

        $ext     = $file->getClientOriginalExtension();
        $allowed = ['jpg','jpeg','png','pdf','webp'];
        if (!in_array(strtolower($ext), $allowed)) {
            return $this->json(['message' => 'Format non autorisé.'], 400);
        }

        if (!is_dir($this->uploadDir.'/justificatifs')) {
            mkdir($this->uploadDir.'/justificatifs', 0775, true);
        }

        $filename = 'justif_absence_'.$id.'_'.time().'.'.$ext;
        $file->move($this->uploadDir.'/justificatifs', $filename);

        $absence->setStatutJustification('en_attente');
        $em->flush();

        return $this->json(['statut' => 'en_attente', 'fichier' => '/uploads/justificatifs/'.$filename]);
    }
}