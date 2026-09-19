<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    const ALLOWED_ROLES = [
        'ROLE_DIRECTEUR',
        'ROLE_DIRECTEUR_ADJOINT',
        'ROLE_SERVICE_PEDAGOGIQUE',
        'ROLE_CPE',
        'ROLE_SECRETARIAT',
        'ROLE_COMPTABILITE',
        'ROLE_SURVEILLANT',
        'ROLE_TEACHER',
        'ROLE_STUDENT',
        'ROLE_PARENT',
    ];

    const ROLE_LABELS = [
        'ROLE_DIRECTEUR'           => 'Directeur',
        'ROLE_DIRECTEUR_ADJOINT'   => 'Directeur Adjoint',
        'ROLE_SERVICE_PEDAGOGIQUE' => 'Service Pédagogique',
        'ROLE_CPE'                 => 'CPE',
        'ROLE_SECRETARIAT'         => 'Secrétariat',
        'ROLE_COMPTABILITE'        => 'Comptabilité',
        'ROLE_SURVEILLANT'         => 'Surveillant',
        'ROLE_TEACHER'             => 'Enseignant',
        'ROLE_STUDENT'             => 'Étudiant',
        'ROLE_PARENT'              => 'Parent',
    ];

    const UNIQUE_ROLES = [
        'ROLE_DIRECTEUR',
        'ROLE_DIRECTEUR_ADJOINT',
        'ROLE_SERVICE_PEDAGOGIQUE',
        'ROLE_CPE',
        'ROLE_SECRETARIAT',
        'ROLE_COMPTABILITE',
    ];

    public function __construct(
        private UserRepository $userRepo,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private MailerInterface $mailer,
        private NotificationService $notifService,
    ) {}

    private function generatePassword(): string
    {
        $words    = ['Soleil','Lune','Etoile','Nuage','Riviere','Montagne','Ocean','Foret','Vallee','Prairie'];
        $specials = ['!','@','#','$','*'];
        return $words[array_rand($words)] . rand(10, 99) . $words[array_rand($words)] . $specials[array_rand($specials)];
    }

    private function serialize(User $u, ?\Doctrine\ORM\EntityManagerInterface $em = null): array
    {
        return [
            'id'               => $u->getId(),
            'email'            => $u->getEmail(),
            'firstName'        => $u->getFirstName(),
            'lastName'         => $u->getLastName(),
            'roles'            => $u->getRoles(),
            'isActive'         => $u->isActive(),
            'mustChangePassword' => $u->isMustChangePassword(),
            'createdAt'        => $u->getCreatedAt()?->format('d/m/Y'),
            'classe'           => $u->getClasse() ? ['id'=>$u->getClasse()->getId(),'nom'=>$u->getClasse()->getName()] : null,
            'genre'            => $u->getGenre(),
            'photoUrl'         => $u->getPhotoUrl(),
            'matieres'         => array_values(array_unique(array_map(
                fn($c) => $c->getMatiere()?->getNom(),
                array_filter($em->getRepository(\App\Entity\Cours::class)->findBy(['enseignant'=>$u]), fn($c) => $c->getMatiere() !== null)
            ))),
        ];
    }

    private function roleAlreadyTaken(string $role): ?User
    {
        if (!in_array($role, self::UNIQUE_ROLES)) {
            return null;
        }
        foreach ($this->userRepo->findAll() as $user) {
            if (in_array($role, $user->getRoles())) {
                return $user;
            }
        }
        return null;
    }

    #[Route('/users', name: 'admin_users_list', methods: ['GET'])]
    public function listUsers(\Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        return $this->json(array_map(fn($u) => $this->serialize($u, $em), $this->userRepo->findAll()));
    }

    #[Route('/users', name: 'admin_users_create', methods: ['POST'])]
    public function createUser(Request $request, #[CurrentUser] User $admin, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        foreach (['email', 'firstName', 'lastName', 'role'] as $field) {
            if (empty($data[$field])) {
                return $this->json(['message' => "Le champ '$field' est requis."], 400);
            }
        }

        if (!in_array($data['role'], self::ALLOWED_ROLES)) {
            return $this->json(['message' => 'Rôle invalide.', 'allowed' => self::ALLOWED_ROLES], 400);
        }

        $existing = $this->roleAlreadyTaken($data['role']);
        if ($existing) {
            $label = self::ROLE_LABELS[$data['role']] ?? $data['role'];
            return $this->json([
                'message' => sprintf(
                    'Le poste "%s" est déjà occupé par %s %s (%s).',
                    $label, $existing->getFirstName(), $existing->getLastName(), $existing->getEmail()
                ),
            ], 409);
        }

        if ($this->userRepo->findOneBy(['email' => $data['email']])) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 409);
        }

        $plainPassword = $this->generatePassword();
        $roleLabel     = self::ROLE_LABELS[$data['role']] ?? $data['role'];

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setRoles([$data['role']]);
        $user->setIsActive(true);
        $user->setMustChangePassword(true); // Forcé à changer au premier login
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));

        $this->em->persist($user);
        $this->em->flush();

        // Email avec identifiants — seul moyen pour l'utilisateur de connaître son mot de passe
        try {
            $this->mailer->send((new Email())
                ->from('no-reply@miralabs.com')
                ->to($user->getEmail())
                ->subject('Vos identifiants Miralabs')
                ->html(sprintf(
                    '<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                        <h2 style="color:#111;">Bienvenue sur Miralabs</h2>
                        <p>Bonjour <strong>%s %s</strong>,</p>
                        <p>Votre compte a été créé avec le rôle <strong>%s</strong>.</p>
                        <p style="background:#f5f5f5;padding:16px;border-radius:8px;">
                            <strong>Email :</strong> %s<br>
                            <strong>Mot de passe temporaire :</strong> %s
                        </p>
                        <p>Connectez-vous sur <a href="http://localhost:5173">Miralabs</a>.</p>
                        <p style="color:#888;font-size:12px;">
                            Vous serez invité à changer votre mot de passe lors de votre première connexion.
                        </p>
                    </div>',
                    $user->getFirstName(), $user->getLastName(),
                    $roleLabel, $user->getEmail(), $plainPassword
                ))
            );
            $emailSent = true;
        } catch (\Exception) {
            $emailSent = false;
        }

        // Notification de bienvenue
        $this->notifService->sendToUser(
            sender: $admin,
            recipient: $user,
            type: NotificationService::ACCOUNT_CREATED,
            title: 'Bienvenue sur Miralabs',
            message: "Votre compte $roleLabel a été créé. Connectez-vous et changez votre mot de passe.",
            link: '/login'
        );

        return $this->json([
            'message'   => 'Compte créé avec succès. Les identifiants ont été envoyés par email.',
            'emailSent' => $emailSent,
            'user'      => $this->serialize($user, $em),
            // tempPassword retiré — le superadmin ne voit jamais le mot de passe
        ], 201);
    }

    #[Route('/users/{id}/toggle', name: 'admin_users_toggle', methods: ['PATCH'])]
    public function toggleUser(int $id): JsonResponse
    {
        $user = $this->userRepo->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }
        $user->setIsActive(!$user->isActive());
        $this->em->flush();
        return $this->json(['message' => 'Statut mis à jour.', 'isActive' => $user->isActive()]);
    }

    #[Route('/users/{id}', name: 'admin_users_delete', methods: ['DELETE'])]
    public function deleteUser(int $id): JsonResponse
    {
        $user = $this->userRepo->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable.'], 404);
        }
        $this->em->remove($user);
        $this->em->flush();
        return $this->json(['message' => 'Utilisateur supprimé.']);
    }

    #[Route('/roles', name: 'admin_roles_list', methods: ['GET'])]
    public function listRoles(): JsonResponse
    {
        $roles = [];
        foreach (self::ALLOWED_ROLES as $role) {
            $existing = $this->roleAlreadyTaken($role);
            $roles[]  = [
                'value'   => $role,
                'label'   => self::ROLE_LABELS[$role] ?? $role,
                'unique'  => in_array($role, self::UNIQUE_ROLES),
                'taken'   => $existing !== null,
                'takenBy' => $existing ? [
                    'id'        => $existing->getId(),
                    'firstName' => $existing->getFirstName(),
                    'lastName'  => $existing->getLastName(),
                ] : null,
            ];
        }
        return $this->json($roles);
    }
}