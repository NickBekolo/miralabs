<?php

namespace App\Entity;

use App\Repository\PasswordResetTokenRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Jeton de réinitialisation de mot de passe.
 *
 * Sécurité :
 * - Le token brut (32 octets aléatoires) est transmis par email puis haché en SHA-256 avant stockage.
 * - Le token expire après 1 heure.
 * - Le jeton est marqué "utilisé" dès la première utilisation (usage unique).
 * - Un seul jeton actif par utilisateur (les anciens sont invalidés à la génération d'un nouveau).
 */
#[ORM\Entity(repositoryClass: PasswordResetTokenRepository::class)]
#[ORM\Table(name: 'password_reset_token')]
class PasswordResetToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /** Token haché en SHA-256 — jamais stocké en clair */
    #[ORM\Column(length: 64)]
    private string $hashedToken;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $expiresAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'boolean')]
    private bool $used = false;

    public function __construct(User $user, string $hashedToken, \DateTimeImmutable $expiresAt)
    {
        $this->user        = $user;
        $this->hashedToken = $hashedToken;
        $this->expiresAt   = $expiresAt;
        $this->createdAt   = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }

    public function getHashedToken(): string { return $this->hashedToken; }

    public function getExpiresAt(): \DateTimeImmutable { return $this->expiresAt; }

    public function isUsed(): bool { return $this->used; }

    public function isExpired(): bool
    {
        return $this->expiresAt < new \DateTimeImmutable();
    }

    public function markAsUsed(): void
    {
        $this->used = true;
    }
}
