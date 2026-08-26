<?php
namespace App\Entity;

use App\Repository\RetardRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RetardRepository::class)]
class Retard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(nullable: true)]
    private ?string $duree = null;

    #[ORM\Column(nullable: true)]
    private ?string $motif = null;

    #[ORM\Column]
    private bool $justifie = false;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $eleve = null;

    #[ORM\ManyToOne]
    private ?User $saisiepar = null;

    #[ORM\ManyToOne]
    private ?Etablissement $etablissement = null;

    public function getId(): ?int { return $this->id; }
    public function getDate(): ?\DateTimeInterface { return $this->date; }
    public function setDate(\DateTimeInterface $date): static { $this->date = $date; return $this; }
    public function getDuree(): ?string { return $this->duree; }
    public function setDuree(?string $duree): static { $this->duree = $duree; return $this; }
    public function getMotif(): ?string { return $this->motif; }
    public function setMotif(?string $motif): static { $this->motif = $motif; return $this; }
    public function isJustifie(): bool { return $this->justifie; }
    public function setJustifie(bool $justifie): static { $this->justifie = $justifie; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function setCreatedAt(\DateTimeInterface $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getEleve(): ?User { return $this->eleve; }
    public function setEleve(?User $eleve): static { $this->eleve = $eleve; return $this; }
    public function getSaisiepar(): ?User { return $this->saisiepar; }
    public function setSaisiepar(?User $saisiepar): static { $this->saisiepar = $saisiepar; return $this; }
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $etablissement): static { $this->etablissement = $etablissement; return $this; }
}
