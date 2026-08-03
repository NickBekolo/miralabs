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
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private MailerInterface $mailer,
        private EventLogService $eventLog,
    ) {}

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data     = json_decode($request->getContent(), true);
        $email    = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['message' => 'Email et mot de passe requis.'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Identifiants invalides.'], 401);
        }

        if (!$user->isActive()) {
            return $this->json(['message' => 'Compte désactivé. Contactez l\'administrateur.'], 403);
        }

        // Vérifier que l'utilisateur appartient à l'établissement sélectionné
        $etabId = $data['etablissementId'] ?? null;
        if ($etabId && $user->getEtablissement()?->getId() !== (int)$etabId) {
            return $this->json(['message' => 'Votre compte n\'est pas rattaché à cet établissement.'], 403);
        }

        $this->eventLog->log(
            type: EventLog::LOGIN,
            user: $user,
            metadata: [
                'ip'        => $request->getClientIp(),
                'userAgent' => $request->headers->get('User-Agent'),
            ]
        );

        $token = $this->jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user'  => [
                'id'                 => $user->getId(),
                'email'              => $user->getEmail(),
                'firstName'          => $user->getFirstName(),
                'lastName'           => $user->getLastName(),
                'roles'              => $user->getRoles(),
                'mustChangePassword' => $user->isMustChangePassword(),
                'etablissement'      => $user->getEtablissement() ? [
                    'id'   => $user->getEtablissement()->getId(),
                    'name' => $user->getEtablissement()->getName(),
                    'code' => $user->getEtablissement()->getCode(),
                ] : null,
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

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['message' => 'Si cet email existe, un lien a été envoyé.']);
        }

        $this->mailer->send((new Email())
            ->from('no-reply@miralabs.com')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe — Miralabs')
            ->html(sprintf(
                '<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                    <h2>Réinitialisation de mot de passe</h2>
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
                    <a href="http://localhost:5173/reset-password/%s"
                       style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">
                        Réinitialiser mon mot de passe
                    </a>
                    <p style="color:#888;font-size:12px;">Ce lien expire dans 1 heure.</p>
                </div>',
                $user->getFirstName(),
                $resetToken->getToken()
            ))
        );

        return $this->json([
            'message'   => 'Si cet email existe, un lien a été envoyé.',
            'dev_token' => $resetToken->getToken(),
        ]);
    }

    #[Route('/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data        = json_decode($request->getContent(), true);
        $token       = $data['token'] ?? null;
        $newPassword = $data['password'] ?? null;

        if (!$token || !$newPassword) {
            return $this->json(['message' => 'Token et mot de passe requis.'], 400);
        }

        if (strlen($newPassword) < 8) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], 400);
        }

        try {
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['message' => 'Token invalide ou expiré.'], 400);
        }

        $this->resetPasswordHelper->removeResetRequest($token);
        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $user->setMustChangePassword(false);
        $this->userRepository->save($user, true);

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
