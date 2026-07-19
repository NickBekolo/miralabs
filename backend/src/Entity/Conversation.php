<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Conversation
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    private ?User $participant1 = null;

    #[ORM\ManyToOne]
    private ?User $participant2 = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $lastMessageAt = null;

    #[ORM\OneToMany(mappedBy: 'conversation', targetEntity: Message::class, cascade: ['persist','remove'])]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    private Collection $messages;

    public function __construct() {
        $this->createdAt = new \DateTimeImmutable();
        $this->messages  = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getParticipant1(): ?User { return $this->participant1; }
    public function setParticipant1(?User $u): static { $this->participant1 = $u; return $this; }
    public function getParticipant2(): ?User { return $this->participant2; }
    public function setParticipant2(?User $u): static { $this->participant2 = $u; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getLastMessageAt(): ?\DateTimeImmutable { return $this->lastMessageAt; }
    public function setLastMessageAt(?\DateTimeImmutable $d): static { $this->lastMessageAt = $d; return $this; }
    public function getMessages(): Collection { return $this->messages; }
    public function getOtherParticipant(User $user): ?User {
        return $this->participant1?->getId() === $user->getId() ? $this->participant2 : $this->participant1;
    }
}
