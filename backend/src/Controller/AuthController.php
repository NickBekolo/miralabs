<?php
namespace App\Controller;

use App\Entity\EventLog;
use App\Repository\UserRepository;
use App\Service\EventLogService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private MailerInterface $mailer,
        private EventLogService $eventLog,
    ) {}

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data     = json_decode($request->getContent(), true);
        $email    = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $etablissementId = $data['etablissementId'] ?? null;

        if (!$email || !$password) {
            return $this->json(['message' => 'Email et mot de passe requis.'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Identifiants invalides.'], 401);
        }

        if (!$user->isActive()) {
            return $this->json(['message' => 'Compte désactivé.'], 403);
        }

        $token = $this->jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user'  => [
                'id'                 => $user->getId(),
                'email'              => $user->getEmail(),
                'firstName'          => $user->getFirstName(),
                'lastName'           => $user->getLastName(),
                'roles'              => $user->getRoles(),
                'isActive'           => $user->isActive(),
                'genre'              => $user->getGenre(),
                'photoUrl'           => $user->getPhotoUrl(),
                'mustChangePassword' => $user->isMustChangePassword(),
            ],
        ]);
    }

    #[Route('/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data  = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        if (!$email) {
            return $this->json(['message' => 'Email requis.'], 400);
        }
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['message' => 'Si cet email existe, un lien a été envoyé.']);
        }
        return $this->json(['message' => 'Si cet email existe, un lien a été envoyé.']);
    }

    #[Route('/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        return $this->json(['message' => 'Fonctionnalité temporairement indisponible.'], 503);
    }
}
