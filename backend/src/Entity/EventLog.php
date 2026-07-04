<?php

namespace App\Entity;

use App\Repository\EventLogRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EventLogRepository::class)]
#[ORM\Table(name: 'event_log')]
#[ORM\Index(columns: ['event_type'],  name: 'idx_event_type')]
#[ORM\Index(columns: ['created_at'],  name: 'idx_event_created_at')]
#[ORM\Index(columns: ['etablissement_id'], name: 'idx_event_etablissement')]
class EventLog
{
    // Types d'événements
    const LOGIN              = 'LOGIN';
    const LOGOUT             = 'LOGOUT';
    const NOTE_CREATED       = 'NOTE_CREATED';
    const ABSENCE_CREATED    = 'ABSENCE_CREATED';
    const EDT_PUBLISHED      = 'EDT_PUBLISHED';
    const BULLETIN_READY     = 'BULLETIN_READY';
    const ACCOUNT_CREATED    = 'ACCOUNT_CREATED';
    const MIRA_QUESTION      = 'MIRA_QUESTION';
    const DOCUMENT_UPLOADED  = 'DOCUMENT_UPLOADED';
    const EXERCISE_COMPLETED = 'EXERCISE_COMPLETED';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $eventType = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $metadata = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $userAccount = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Etablissement $etablissement = null;

    public function getId(): ?int { return $this->id; }

    public function getEventType(): ?string { return $this->eventType; }
    public function setEventType(string $eventType): static { $this->eventType = $eventType; return $this; }

    public function getMetadata(): ?array { return $this->metadata; }
    public function setMetadata(?array $metadata): static { $this->metadata = $metadata; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }

    public function getUserAccount(): ?User { return $this->userAccount; }
    public function setUserAccount(?User $userAccount): static { $this->userAccount = $userAccount; return $this; }

    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $etablissement): static { $this->etablissement = $etablissement; return $this; }
}