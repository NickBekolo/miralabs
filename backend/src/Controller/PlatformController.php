<?php
namespace App\Controller;

use App\Entity\Etablissement;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/platform')]
#[IsGranted('ROLE_SUPER_ADMIN_PLATEFORME')]
class PlatformController extends AbstractController
{
    // ─── GET /api/platform/etablissements ───────────────────
    // Liste tous les établissements avec le nombre d'utilisateurs
    #[Route('/etablissements', methods: ['GET'])]
    public function etablissements(EntityManagerInterface $em): JsonResponse
    {
        $etabs = $em->getRepository(Etablissement::class)->findAll();

        return $this->json(array_map(fn($e) => [
            'id'       => $e->getId(),
            'name'     => $e->getName(),
            'code'     => $e->getCode(),
            'type'     => $e->getType(),
            'ville'    => $e->getVille(),
            'isActive' => $e->isActive(),
            'users'    => count($em->getRepository(User::class)->findBy(['etablissement' => $e])),
        ], $etabs));
    }

    // ─── POST /api/platform/etablissements ──────────────────
    // Créer un nouvel établissement
    #[Route('/etablissements', methods: ['POST'])]
    public function createEtablissement(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Vérification des champs obligatoires
        if (empty($data['name']) || empty($data['code'])) {
            return $this->json(['error' => 'Nom et code sont obligatoires'], 400);
        }

        $etab = new Etablissement();
        $etab->setName($data['name'])
             ->setCode($data['code'])
             ->setType($data['type'] ?? 'lycee')
             ->setVille($data['ville'] ?? '')
             ->setAdresse($data['adresse'] ?? '')
             ->setIsActive(true)
             ->setCreatedAt(new \DateTimeImmutable())
             ->setApiUrl('http://127.0.0.1:8000');

        $em->persist($etab);
        $em->flush();

        return $this->json([
            'id'   => $etab->getId(),
            'name' => $etab->getName()
        ], 201);
    }

    // ─── PATCH /api/platform/etablissements/{id}/toggle ─────
    // Activer ou désactiver un établissement
    #[Route('/etablissements/{id}/toggle', methods: ['PATCH'])]
    public function toggleEtablissement(int $id, EntityManagerInterface $em): JsonResponse
    {
        $etab = $em->getRepository(Etablissement::class)->find($id);

        if (!$etab) {
            return $this->json(['error' => 'Établissement introuvable'], 404);
        }

        $etab->setIsActive(!$etab->isActive());
        $em->flush();

        return $this->json(['isActive' => $etab->isActive()]);
    }

    // ─── DELETE /api/platform/etablissements/{id} ───────────
    // Supprimer un établissement
    #[Route('/etablissements/{id}', methods: ['DELETE'])]
    public function deleteEtablissement(int $id, EntityManagerInterface $em): JsonResponse
    {
        $etab = $em->getRepository(Etablissement::class)->find($id);

        if (!$etab) {
            return $this->json(['error' => 'Établissement introuvable'], 404);
        }

        $em->remove($etab);
        $em->flush();

        return $this->json(['success' => true]);
    }

    // ─── GET /api/platform/analytics/overview ───────────────
    // Statistiques globales de la plateforme
    #[Route('/analytics/overview', methods: ['GET'])]
    public function overview(EntityManagerInterface $em): JsonResponse
    {
        $etabs   = $em->getRepository(Etablissement::class)->findAll();
        $users   = $em->getRepository(User::class)->findAll();

        $students  = array_filter($users, fn($u) => in_array('ROLE_STUDENT',  $u->getRoles()));
        $teachers  = array_filter($users, fn($u) => in_array('ROLE_TEACHER',  $u->getRoles()));
        $parents   = array_filter($users, fn($u) => in_array('ROLE_PARENT',   $u->getRoles()));
        $admins    = array_filter($users, fn($u) => in_array('ROLE_ADMIN',    $u->getRoles()));

        return $this->json([
            'etablissements' => ['total' => count($etabs)],
            'utilisateurs'   => ['total' => count($users)],
            'etudiants'      => ['total' => count($students)],
            'connexions'     => ['today' => 0],
            'repartition'    => [
                'etudiants'   => count($students),
                'enseignants' => count($teachers),
                'parents'     => count($parents),
                'admins'      => count($admins),
            ]
        ]);
    }
}
