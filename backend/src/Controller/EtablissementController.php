<?php
namespace App\Controller;

use App\Entity\Etablissement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/etablissement')]
class EtablissementController extends AbstractController
{
    // Voir les paramètres
    #[Route('/parametres', methods:['GET'])]
    #[IsGranted('ROLE_USER')]
    public function parametres(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $etab = $user->getEtablissement();
        if (!$etab) return $this->json(['signatureNumeriqueActive' => true]);

        return $this->json([
            'id'                       => $etab->getId(),
            'nom'                      => $etab->getName(),
            'signatureNumeriqueActive' => $etab->isSignatureNumeriqueActive(),
        ]);
    }

    // CPE/Admin : activer ou désactiver la signature
    #[Route('/signature-numerique', methods:['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function toggleSignature(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $etab = $user->getEtablissement();
        if (!$etab) return $this->json(['error' => 'Établissement non trouvé'], 404);

        $data = json_decode($req->getContent(), true);
        $etab->setSignatureNumeriqueActive($data['active'] ?? !$etab->isSignatureNumeriqueActive());
        $em->flush();

        return $this->json([
            'message'                  => 'Paramètre mis à jour',
            'signatureNumeriqueActive' => $etab->isSignatureNumeriqueActive(),
        ]);
    }
}
