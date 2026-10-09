<?php

namespace App\Service;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use App\Repository\PasswordResetTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Gère le cycle de vie complet de la réinitialisation de mot de passe.
 *
 * Flow sécurisé :
 *  1. generateAndSend()  — génère un token aléatoire, le hache en SHA-256,
 *                          stocke le hash en base et envoie le token brut par email.
 *  2. validateToken()    — reçoit le token brut depuis l'URL, le rehache
 *                          et compare avec la base (timing-safe via hash_equals).
 *  3. consumeAndReset()  — marque le token comme utilisé et met à jour le mot de passe.
 *
 * Le token brut ne transite JAMAIS en base de données.
 */
class PasswordResetService
{
    private const TOKEN_TTL_SECONDS = 3600; // 1 heure

    public function __construct(
        private readonly PasswordResetTokenRepository $tokenRepo,
        private readonly EntityManagerInterface $em,
        private readonly MailerInterface $mailer,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly string $frontendUrl,
    ) {}

    /**
     * Génère un token sécurisé, l'envoie par email et le persiste haché.
     *
     * @throws \Exception si la génération d'octets aléatoires échoue
     */
    public function generateAndSend(User $user): void
    {
        // Invalide tous les tokens précédents pour cet utilisateur
        $this->tokenRepo->invalidateAllForUser($user);

        // Génère 32 octets aléatoires cryptographiquement sûrs → token URL-safe base64
        $rawToken  = bin2hex(random_bytes(32)); // 64 caractères hexadécimaux
        $hashedToken = hash('sha256', $rawToken);
        $expiresAt = new \DateTimeImmutable(sprintf('+%d seconds', self::TOKEN_TTL_SECONDS));

        $entity = new PasswordResetToken($user, $hashedToken, $expiresAt);
        $this->em->persist($entity);
        $this->em->flush();

        $resetLink = sprintf('%s/reset-password?token=%s', $this->frontendUrl, $rawToken);

        $this->mailer->send(
            (new Email())
                ->from('no-reply@miralabs.com')
                ->to($user->getEmail())
                ->subject('Réinitialisation de votre mot de passe Miralabs')
                ->html($this->buildEmailHtml($user, $resetLink))
        );
    }

    /**
     * Valide un token brut reçu depuis l'URL.
     * Retourne l'entité PasswordResetToken si valide, null sinon.
     */
    public function validateToken(string $rawToken): ?PasswordResetToken
    {
        if (empty($rawToken) || strlen($rawToken) !== 64) {
            return null;
        }

        $hashedToken = hash('sha256', $rawToken);

        return $this->tokenRepo->findValidToken($hashedToken);
    }

    /**
     * Consomme le token (usage unique) et met à jour le mot de passe.
     */
    public function consumeAndReset(PasswordResetToken $tokenEntity, string $newPassword): void
    {
        $user = $tokenEntity->getUser();

        $tokenEntity->markAsUsed();
        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $user->setMustChangePassword(false);

        $this->em->flush();
    }

    private function buildEmailHtml(User $user, string $resetLink): string
    {
        return sprintf(
            '<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
                <h2 style="color:#1B3A5C;">Réinitialisation de mot de passe</h2>
                <p>Bonjour <strong>%s %s</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe Miralabs.</p>
                <p>
                    <a href="%s"
                       style="display:inline-block;background:#0F6B75;color:#fff;padding:12px 24px;
                              border-radius:6px;text-decoration:none;font-weight:bold;">
                        Réinitialiser mon mot de passe
                    </a>
                </p>
                <p style="color:#666;font-size:13px;">
                    Ce lien est valable pendant <strong>1 heure</strong>.<br>
                    Si vous n\'avez pas fait cette demande, ignorez cet email.
                </p>
                <p style="color:#999;font-size:11px;">
                    Lien direct : <a href="%s">%s</a>
                </p>
            </div>',
            htmlspecialchars($user->getFirstName()),
            htmlspecialchars($user->getLastName()),
            $resetLink,
            $resetLink,
            $resetLink
        );
    }
}
