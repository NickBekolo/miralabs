<?php

namespace App\Controller;

use App\Repository\UserRepository;
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
            return $this->json(['message' => 'Compte désactivé.'], 403);
        }

        $token = $this->jwtManager->create($user);

        return $this->json([
            'token' => $token,
            'user'  => [
                'id'        => $user->getId(),
                'email'     => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName'  => $user->getLastName(),
                'roles'     => $user->getRoles(),
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

        // Réponse générique pour ne pas révéler si l'email existe
        if (!$user) {
            return $this->json(['message' => 'Si cet email existe, un lien a été envoyé.']);
        }

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['message' => 'Si cet email existe, un lien a été envoyé.']);
        }

        $emailMessage = (new Email())
            ->from('no-reply@miralabs.com')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe')
            ->html(sprintf(
                '<p>Bonjour %s,</p>
                <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
                <a href="http://localhost:5173/reset-password/%s">Réinitialiser mon mot de passe</a>
                <p>Ce lien expire dans 1 heure.</p>',
                $user->getFirstName(),
                $resetToken->getToken()
            ));

        $this->mailer->send($emailMessage);

        return $this->json([
            'message'   => 'Si cet email existe, un lien a été envoyé.',
            // À retirer en production — utile uniquement en dev
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

        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $newPassword)
        );

        $this->userRepository->save($user, true);

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}