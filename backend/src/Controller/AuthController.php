<?php
namespace App\Controller;

use App\Repository\UserRepository;
use App\Service\EventLogService;
use App\Service\LoginAttemptService;
use App\Service\PasswordResetService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private MailerInterface $mailer,
        private EventLogService $eventLog,
        private LoginAttemptService $loginAttemptService,
        private ValidatorInterface $validator,
        private PasswordResetService $passwordResetService,
    ) {}

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $ip = $request->getClientIp() ?? '0.0.0.0';

        // ── Protection brute force ──────────────────────────────────────────
        if ($this->loginAttemptService->isBlocked($ip)) {
            $seconds = $this->loginAttemptService->getSecondsUntilUnlock($ip);
            $minutes = (int) ceil($seconds / 60);

            return $this->json([
                'message'     => sprintf('Trop de tentatives échouées. Réessayez dans %d minute(s).', $minutes),
                'retry_after' => $seconds,
            ], 429);
        }

        // ── Validation du format des entrées ────────────────────────────────
        $data            = json_decode($request->getContent(), true);
        $email           = trim($data['email'] ?? '');
        $password        = $data['password'] ?? '';
        $etablissementId = $data['etablissementId'] ?? null;

        if (!$email || !$password) {
            return $this->json(['message' => 'Email et mot de passe requis.'], 400);
        }

        // Validation format email avant requête en base
        $errors = $this->validator->validate($email, new Assert\Email(message: 'Format d\'email invalide.'));
        if (count($errors) > 0) {
            return $this->json(['message' => 'Format d\'email invalide.'], 400);
        }

        // ── Authentification ────────────────────────────────────────────────
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->loginAttemptService->recordFailure($ip);
            $remaining = $this->loginAttemptService->getRemainingAttempts($ip);

            $message = 'Identifiants invalides.';
            if ($remaining <= 2 && $remaining > 0) {
                $message .= sprintf(' (%d tentative(s) restante(s) avant blocage temporaire)', $remaining);
            }

            return $this->json(['message' => $message], 401);
        }

        if (!$user->isActive()) {
            return $this->json(['message' => 'Compte désactivé. Contactez votre administrateur.'], 403);
        }

        if ($etablissementId && $user->getEtablissement()?->getId() !== (int)$etablissementId) {
            $this->loginAttemptService->recordFailure($ip);
            return $this->json(['message' => 'Ce compte n\'appartient pas à cet établissement.'], 401);
        }

        // ── Login réussi : réinitialise le compteur de tentatives ───────────
        $this->loginAttemptService->resetAttempts($ip);

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
        $email = trim($data['email'] ?? '');

        if (!$email) {
            return $this->json(['message' => 'Email requis.'], 400);
        }

        // Validation format email
        $errors = $this->validator->validate($email, new Assert\Email());
        if (count($errors) > 0) {
            return $this->json(['message' => 'Format d\'email invalide.'], 400);
        }

        // Réponse identique que l'utilisateur existe ou non (anti-énumération)
        $user = $this->userRepository->findOneBy(['email' => $email]);
        if ($user && $user->isActive()) {
            try {
                $this->passwordResetService->generateAndSend($user);
            } catch (\Exception) {
                // Silencieux — on ne révèle pas les erreurs d'envoi
            }
        }

        return $this->json([
            'message' => 'Si cet email existe, un lien de réinitialisation valable 1 heure a été envoyé.',
        ]);
    }

    #[Route('/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data        = json_decode($request->getContent(), true);
        $rawToken    = trim($data['token'] ?? '');
        $newPassword = $data['password'] ?? '';

        if (!$rawToken || !$newPassword) {
            return $this->json(['message' => 'Token et nouveau mot de passe requis.'], 400);
        }

        // Validation de la complexité du mot de passe
        $passwordErrors = $this->validator->validate($newPassword, [
            new Assert\NotBlank(),
            new Assert\Length(
                min: 8,
                minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères.'
            ),
            new Assert\Regex(
                pattern: '/[A-Z]/',
                message: 'Le mot de passe doit contenir au moins une lettre majuscule.'
            ),
            new Assert\Regex(
                pattern: '/[0-9]/',
                message: 'Le mot de passe doit contenir au moins un chiffre.'
            ),
        ]);

        if (count($passwordErrors) > 0) {
            $messages = [];
            foreach ($passwordErrors as $error) {
                $messages[] = $error->getMessage();
            }
            return $this->json(['message' => implode(' ', $messages)], 400);
        }

        // Validation du token (hash SHA-256 comparé en base)
        $tokenEntity = $this->passwordResetService->validateToken($rawToken);
        if (!$tokenEntity) {
            return $this->json([
                'message' => 'Lien invalide ou expiré. Veuillez faire une nouvelle demande.',
            ], 400);
        }

        // Consomme le token (usage unique) et met à jour le mot de passe
        $this->passwordResetService->consumeAndReset($tokenEntity, $newPassword);

        return $this->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}
