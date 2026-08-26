<?php
namespace App\Entity;

use App\Repository\AppreciationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AppreciationRepository::class)]
class Appreciation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    private ?string $contenu = null;

    #[ORM\Column(nullable: true)]
    private ?string $periode = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $eleve = null;

    #[ORM\ManyToOne]
    private ?User $professeur = null;

    #[ORM\ManyToOne]
    private ?Matiere $matiere = null;

    #[ORM\ManyToOne]
    private ?Etablissement $etablissement = null;

    public function getId(): ?int { return $this->id; }
    public function getContenu(): ?string { return $this->contenu; }
    public function setContenu(string $contenu): static { $this->contenu = $contenu; return $this; }
    public function getPeriode(): ?string { return $this->periode; }
    public function setPeriode(?string $periode): static { $this->periode = $periode; return $this; }
    public function getCreatedAt(): ?\DateTimeInterface { return $this->createdAt; }
    public function setCreatedAt(\DateTimeInterface $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getEleve(): ?User { return $this->eleve; }
    public function setEleve(?User $eleve): static { $this->eleve = $eleve; return $this; }
    public function getProfesseur(): ?User { return $this->professeur; }
    public function setProfesseur(?User $professeur): static { $this->professeur = $professeur; return $this; }
    public function getMatiere(): ?Matiere { return $this->matiere; }
    public function setMatiere(?Matiere $matiere): static { $this->matiere = $matiere; return $this; }
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $etablissement): static { $this->etablissement = $etablissement; return $this; }
}
