<?php
namespace App\Entity;

use App\Repository\MiraConversationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MiraConversationRepository::class)]
class MiraConversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'json')]
    private array $messages = [];

    #[ORM\Column(length: 50, options: ['default' => 'claude-haiku'])]
    private string $model = 'claude-haiku';

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $title = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getMessages(): array { return $this->messages; }
    public function setMessages(array $m): self { $this->messages = $m; return $this; }
    public function getModel(): string { return $this->model; }
    public function setModel(string $m): self { $this->model = $m; return $this; }
    public function getTitle(): ?string { return $this->title; }
    public function setTitle(?string $t): self { $this->title = $t; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(\DateTimeImmutable $d): self { $this->updatedAt = $d; return $this; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $u): self { $this->user = $u; return $this; }
}
