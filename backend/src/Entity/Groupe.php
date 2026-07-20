<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Groupe
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom;

    #[ORM\Column(length: 7, nullable: true)]
    private ?string $couleur = '#007AFF';

    #[ORM\ManyToOne]
    private ?User $createur = null;

    #[ORM\ManyToOne]
    private ?Etablissement $etablissement = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $lastMessageAt = null;

    #[ORM\ManyToMany(targetEntity: User::class)]
    private Collection $membres;

    #[ORM\OneToMany(mappedBy: 'groupe', targetEntity: GroupeMessage::class, cascade: ['persist','remove'])]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    private Collection $messages;

    public function __construct() {
        $this->createdAt = new \DateTimeImmutable();
        $this->membres   = new ArrayCollection();
        $this->messages  = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getNom(): string { return $this->nom; }
    public function setNom(string $n): static { $this->nom = $n; return $this; }
    public function getCouleur(): ?string { return $this->couleur; }
    public function setCouleur(?string $c): static { $this->couleur = $c; return $this; }
    public function getCreateur(): ?User { return $this->createur; }
    public function setCreateur(?User $u): static { $this->createur = $u; return $this; }
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $e): static { $this->etablissement = $e; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getLastMessageAt(): ?\DateTimeImmutable { return $this->lastMessageAt; }
    public function setLastMessageAt(?\DateTimeImmutable $d): static { $this->lastMessageAt = $d; return $this; }
    public function getMembres(): Collection { return $this->membres; }
    public function addMembre(User $u): static { if(!$this->membres->contains($u)) $this->membres->add($u); return $this; }
    public function getMessages(): Collection { return $this->messages; }
}
