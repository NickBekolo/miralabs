<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class GroupeMessage
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    private ?Groupe $groupe = null;

    #[ORM\ManyToOne]
    private ?User $sender = null;

    #[ORM\Column(type: 'text')]
    private string $content;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getGroupe(): ?Groupe { return $this->groupe; }
    public function setGroupe(?Groupe $g): static { $this->groupe = $g; return $this; }
    public function getSender(): ?User { return $this->sender; }
    public function setSender(?User $u): static { $this->sender = $u; return $this; }
    public function getContent(): string { return $this->content; }
    public function setContent(string $c): static { $this->content = $c; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    #[ORM\Column(nullable: true)]
    private ?int $replyToId = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $replyToText = null;

    public function getReplyToId(): ?int { return $this->replyToId; }
    public function setReplyToId(?int $id): static { $this->replyToId = $id; return $this; }
    public function getReplyToText(): ?string { return $this->replyToText; }
    public function setReplyToText(?string $t): static { $this->replyToText = $t; return $this; }

}