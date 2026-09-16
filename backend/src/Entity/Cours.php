<?php

namespace App\Entity;

use App\Repository\CoursRepository;
use App\Entity\User;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CoursRepository::class)]
class Cours
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Matiere $matiere = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $salle = null;

    #[ORM\Column(length: 5)]
    private ?string $heureDebut = null;

    #[ORM\Column(length: 5)]
    private ?string $heureFin = null;

    #[ORM\Column]
    private ?int $jourSemaine = null;

    #[ORM\ManyToOne]
    private ?Classe $classe = null;

    #[ORM\ManyToOne]
    private ?User $enseignant = null;

    #[ORM\Column]
    private ?bool $isAnnule = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMatiere(): ?Matiere
    {
        return $this->matiere;
    }

    public function setMatiere(?Matiere $matiere): static
    {
        $this->matiere = $matiere;

        return $this;
    }

    public function getSalle(): ?string
    {
        return $this->salle;
    }

    public function setSalle(?string $salle): static
    {
        $this->salle = $salle;

        return $this;
    }

    public function getHeureDebut(): ?string
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(string $heureDebut): static
    {
        $this->heureDebut = $heureDebut;

        return $this;
    }

    public function getHeureFin(): ?string
    {
        return $this->heureFin;
    }

    public function setHeureFin(string $heureFin): static
    {
        $this->heureFin = $heureFin;

        return $this;
    }

    public function getJourSemaine(): ?int
    {
        return $this->jourSemaine;
    }

    public function setJourSemaine(int $jourSemaine): static
    {
        $this->jourSemaine = $jourSemaine;

        return $this;
    }

    public function getClasse(): ?Classe
    {
        return $this->classe;
    }

    public function setClasse(?Classe $classe): static
    {
        $this->classe = $classe;

        return $this;
    }

    public function getEnseignant(): ?User
    {
        return $this->enseignant;
    }

    public function setEnseignant(?User $enseignant): static
    {
        $this->enseignant = $enseignant;

        return $this;
    }

    public function isAnnule(): ?bool
    {
        return $this->isAnnule;
    }

    public function setIsAnnule(bool $isAnnule): static
    {
        $this->isAnnule = $isAnnule;

        return $this;
    }
    #[ORM\ManyToOne]
    private ?Etablissement $etablissement = null;
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $e): static { $this->etablissement = $e; return $this; }

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $couleur = null;
    public function getCouleur(): ?string { return $this->couleur; }
    public function setCouleur(?string $couleur): static { $this->couleur = $couleur; return $this; }
}
