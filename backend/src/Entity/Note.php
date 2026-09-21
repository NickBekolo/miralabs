<?php

namespace App\Entity;

use App\Repository\NoteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NoteRepository::class)]
class Note
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'float')]
    private ?float $valeur = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $typeEvaluation = null; // DS, TP, Devoir, Interrogation, Examen

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $eleve = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $professeur = null;

    #[ORM\ManyToOne(targetEntity: Matiere::class, inversedBy: 'notes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Matiere $matiere = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $noteSur = 20.0;

    public function getId(): ?int { return $this->id; }

    public function getValeur(): ?float { return $this->valeur; }
    public function setValeur(float $valeur): static { $this->valeur = $valeur; return $this; }

    public function getTypeEvaluation(): ?string { return $this->typeEvaluation; }
    public function setTypeEvaluation(?string $t): static { $this->typeEvaluation = $t; return $this; }

    public function getCommentaire(): ?string { return $this->commentaire; }
    public function setCommentaire(?string $commentaire): static { $this->commentaire = $commentaire; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }

    public function getEleve(): ?User { return $this->eleve; }
    public function setEleve(?User $eleve): static { $this->eleve = $eleve; return $this; }

    public function getProfesseur(): ?User { return $this->professeur; }
    public function setProfesseur(?User $professeur): static { $this->professeur = $professeur; return $this; }

    public function getMatiere(): ?Matiere { return $this->matiere; }
    public function setMatiere(?Matiere $matiere): static { $this->matiere = $matiere; return $this; }

    public function getNoteSur(): ?float { return $this->noteSur; }
    public function setNoteSur(?float $noteSur): static { $this->noteSur = $noteSur; return $this; }
    #[ORM\ManyToOne]
    private ?Etablissement $etablissement = null;
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $e): static { $this->etablissement = $e; return $this; }


    #[ORM\ManyToOne(targetEntity: SessionNotes::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?SessionNotes $session = null;

    public function getSession(): ?SessionNotes { return $this->session; }
    public function setSession(?SessionNotes $s): self { $this->session = $s; return $this; }
}