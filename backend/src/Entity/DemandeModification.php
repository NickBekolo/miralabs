<?php
namespace App\Entity;

use App\Repository\DemandeModificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DemandeModificationRepository::class)]
class DemandeModification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $demandeur = null;

    #[ORM\Column(length: 100)]
    private string $champ;

    #[ORM\Column(length: 500)]
    private string $nouvelleValeur;

    #[ORM\Column(length: 1000, nullable: true)]
    private ?string $message = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $justificatifPath = null;

    #[ORM\Column(length: 20)]
    private string $statut = 'en_attente'; // en_attente | approuvee | rejetee

    #[ORM\ManyToOne(targetEntity: User::class)]
    private ?User $traitePar = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $traiteAt = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $commentaireAdmin = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\ManyToOne(targetEntity: Etablissement::class)]
    private ?Etablissement $etablissement = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getDemandeur(): ?User { return $this->demandeur; }
    public function setDemandeur(?User $u): static { $this->demandeur = $u; return $this; }
    public function getChamp(): string { return $this->champ; }
    public function setChamp(string $c): static { $this->champ = $c; return $this; }
    public function getNouvelleValeur(): string { return $this->nouvelleValeur; }
    public function setNouvelleValeur(string $v): static { $this->nouvelleValeur = $v; return $this; }
    public function getMessage(): ?string { return $this->message; }
    public function setMessage(?string $m): static { $this->message = $m; return $this; }
    public function getJustificatifPath(): ?string { return $this->justificatifPath; }
    public function setJustificatifPath(?string $p): static { $this->justificatifPath = $p; return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $s): static { $this->statut = $s; return $this; }
    public function getTraitePar(): ?User { return $this->traitePar; }
    public function setTraitePar(?User $u): static { $this->traitePar = $u; return $this; }
    public function getTraiteAt(): ?\DateTimeImmutable { return $this->traiteAt; }
    public function setTraiteAt(?\DateTimeImmutable $d): static { $this->traiteAt = $d; return $this; }
    public function getCommentaireAdmin(): ?string { return $this->commentaireAdmin; }
    public function setCommentaireAdmin(?string $c): static { $this->commentaireAdmin = $c; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $e): static { $this->etablissement = $e; return $this; }
}
