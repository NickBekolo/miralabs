<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
#[ORM\Table(name: 'session_notes')]
class SessionNotes
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private int $id;

    #[ORM\ManyToOne]
    private ?Classe $classe = null;

    #[ORM\ManyToOne]
    private ?Matiere $matiere = null;

    #[ORM\ManyToOne]
    private ?User $enseignant = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $typeEvaluation = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $dateSession = null;

    #[ORM\Column]
    private int $noteSur = 20;

    #[ORM\Column(length: 20)]
    private string $statut = 'en_cours';

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\OneToMany(mappedBy: 'session', targetEntity: Note::class)]
    private Collection $notes;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->notes = new ArrayCollection();
    }

    public function getId(): int { return $this->id; }
    public function getClasse(): ?Classe { return $this->classe; }
    public function setClasse(?Classe $c): self { $this->classe = $c; return $this; }
    public function getMatiere(): ?Matiere { return $this->matiere; }
    public function setMatiere(?Matiere $m): self { $this->matiere = $m; return $this; }
    public function getEnseignant(): ?User { return $this->enseignant; }
    public function setEnseignant(?User $u): self { $this->enseignant = $u; return $this; }
    public function getTypeEvaluation(): ?string { return $this->typeEvaluation; }
    public function setTypeEvaluation(?string $t): self { $this->typeEvaluation = $t; return $this; }
    public function getDateSession(): ?\DateTimeInterface { return $this->dateSession; }
    public function setDateSession(?\DateTimeInterface $d): self { $this->dateSession = $d; return $this; }
    public function getNoteSur(): int { return $this->noteSur; }
    public function setNoteSur(int $n): self { $this->noteSur = $n; return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $s): self { $this->statut = $s; return $this; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getNotes(): Collection { return $this->notes; }
}
