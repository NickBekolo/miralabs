<?php

namespace App\Controller;

use App\Entity\Etablissement;
use App\Entity\User;
use App\Repository\EtablissementRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[Route('/api/platform')]
class EtablissementController extends AbstractController
{
    public function __construct(
        private EtablissementRepository $etablissementRepo,
        private UserRepository $userRepo,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private MailerInterface $mailer,
    ) {}

    private function generatePassword(): string
    {
        $words    = ['Soleil','Lune','Etoile','Nuage','Riviere','Montagne','Ocean','Foret'];
        $specials = ['!','@','#','$','*'];
        return $words[array_rand($words)] . rand(10, 99) . $words[array_rand($words)] . $specials[array_rand($specials)];
    }

    private function serializeEtab(Etablissement $e): array
    {
        return [
            'id'        => $e->getId(),
            'name'      => $e->getName(),
            'code'      => $e->getCode(),
            'type'      => $e->getType(),
            'adresse'   => $e->getAdresse(),
            'isActive'  => $e->isActive(),
            'createdAt' => $e->getCreatedAt()?->format('d/m/Y'),
        ];
    }

    /**
     * Liste tous les établissements
     * Accessible uniquement par ROLE_SUPER_ADMIN_PLATEFORME
     */
    #[Route('/etablissements', name: 'platform_etab_list', methods: ['GET'])]
    public function listEtablissements(): JsonResponse
    {
        $etabs = $this->etablissementRepo->findAll();
        return $this->json(array_map([$this, 'serializeEtab'], $etabs));
    }

    /**
     * Liste publique des établissements actifs (pour l'écran de sélection à la connexion)
     * PUBLIC — pas d'authentification requise
     */
    #[Route('/etablissements/public', name: 'platform_etab_public', methods: ['GET'])]
    public function listEtablissementsPublic(Request $request): JsonResponse
    {
        $search = $request->query->get('search', '');
        $etabs  = $this->etablissementRepo->findBy(['isActive' => true]);

        if ($search) {
            $etabs = array_filter($etabs, function (Etablissement $e) use ($search) {
                return stripos($e->getName(), $search) !== false
                    || stripos($e->getCode(), $search) !== false;
            });
        }

        return $this->json(array_map(fn(Etablissement $e) => [
            'id'   => $e->getId(),
            'name' => $e->getName(),
            'code' => $e->getCode(),
            'type' => $e->getType(),
        ], array_values($etabs)));
    }

    /**
     * Crée un établissement ET son superadmin
     * Body : { name, code, type, adresse, adminFirstName, adminLastName, adminEmail }
     */
    #[Route('/etablissements', name: 'platform_etab_create', methods: ['POST'])]
    public function createEtablissement(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation
        $required = ['name', 'code', 'type', 'adminFirstName', 'adminLastName', 'adminEmail'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(['message' => "Le champ '$field' est requis."], 400);
            }
        }

        // Code unique
        if ($this->etablissementRepo->findOneBy(['code' => strtoupper($data['code'])])) {
            return $this->json(['message' => 'Ce code établissement est déjà utilisé.'], 409);
        }

        // Email superadmin unique
        if ($this->userRepo->findOneBy(['email' => $data['adminEmail']])) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 409);
        }

        // Création de l'établissement
        $etab = new Etablissement();
        $etab->setName($data['name']);
        $etab->setCode(strtoupper($data['code']));
        $etab->setType($data['type']);
        $etab->setAdresse($data['adresse'] ?? null);
        $etab->setIsActive(true);
        $etab->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($etab);

        // Création du superadmin de l'établissement
        $plainPassword = $this->generatePassword();
        $admin = new User();
        $admin->setEmail($data['adminEmail']);
        $admin->setFirstName($data['adminFirstName']);
        $admin->setLastName($data['adminLastName']);
        $admin->setRoles(['ROLE_SUPER_ADMIN']);
        $admin->setIsActive(true);
        $admin->setMustChangePassword(true);
        $admin->setCreatedAt(new \DateTimeImmutable());
        $admin->setEtablissement($etab);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, $plainPassword));

        $this->em->persist($admin);
        $this->em->flush();

        // Email au superadmin
        try {
            $this->mailer->send((new Email())
                ->from('no-reply@miralabs.com')
                ->to($admin->getEmail())
                ->subject('Votre espace Miralabs est prêt')
                ->html(sprintf(
                    '<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                        <h2>Bienvenue sur Miralabs</h2>
                        <p>Bonjour <strong>%s %s</strong>,</p>
                        <p>L\'espace Miralabs de <strong>%s</strong> a été créé.</p>
                        <p>Voici vos identifiants administrateur :</p>
                        <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
                            <strong>Code établissement :</strong> %s<br>
                            <strong>Email :</strong> %s<br>
                            <strong>Mot de passe temporaire :</strong> %s
                        </div>
                        <p>Connectez-vous sur <a href="http://localhost:5173">Miralabs</a> et changez votre mot de passe.</p>
                    </div>',
                    $admin->getFirstName(), $admin->getLastName(),
                    $etab->getName(), $etab->getCode(),
                    $admin->getEmail(), $plainPassword
                ))
            );
        } catch (\Exception) {}

        return $this->json([
            'message'      => 'Établissement créé avec succès.',
            'etablissement' => $this->serializeEtab($etab),
            'admin' => [
                'email'     => $admin->getEmail(),
                'firstName' => $admin->getFirstName(),
                'lastName'  => $admin->getLastName(),
            ],
        ], 201);
    }

    /**
     * Active ou désactive un établissement
     */
    #[Route('/etablissements/{id}/toggle', name: 'platform_etab_toggle', methods: ['PATCH'])]
    public function toggleEtablissement(int $id): JsonResponse
    {
        $etab = $this->etablissementRepo->find($id);
        if (!$etab) {
            return $this->json(['message' => 'Établissement introuvable.'], 404);
        }

        $etab->setIsActive(!$etab->isActive());
        $this->em->flush();

        return $this->json([
            'message'  => 'Statut mis à jour.',
            'isActive' => $etab->isActive(),
        ]);
    }

    /**
     * Supprime un établissement et tous ses utilisateurs
     */
    #[Route('/etablissements/{id}', name: 'platform_etab_delete', methods: ['DELETE'])]
    public function deleteEtablissement(int $id): JsonResponse
    {
        $etab = $this->etablissementRepo->find($id);
        if (!$etab) {
            return $this->json(['message' => 'Établissement introuvable.'], 404);
        }

        $this->em->remove($etab);
        $this->em->flush();

        return $this->json(['message' => 'Établissement supprimé.']);
    }
}