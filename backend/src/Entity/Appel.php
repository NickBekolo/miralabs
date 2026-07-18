<?php
namespace App\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Appel
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;
    #[ORM\ManyToOne]
    private ?Cours $cours = null;
    #[ORM\ManyToOne]
    private ?User $enseignant = null;
    #[ORM\Column(type:'datetime')]
    private ?\DateTimeInterface $dateHeure = null;
    #[ORM\Column(length:20)]
    private string $statut = 'en_cours';
    #[ORM\Column(length:255, nullable:true)]
    private ?string $codeSignature = null;
    #[ORM\OneToMany(mappedBy:'appel', targetEntity:Presence::class, cascade:['persist','remove'])]
    private Collection $presences;
    public function __construct() {
        $this->presences = new ArrayCollection();
        $this->dateHeure = new \DateTime();
        $this->codeSignature = strtoupper(substr(md5(uniqid()), 0, 6));
    }
    public function getId(): ?int { return $this->id; }
    public function getCours(): ?Cours { return $this->cours; }
    public function setCours(?Cours $c): static { $this->cours=$c; return $this; }
    public function getEnseignant(): ?User { return $this->enseignant; }
    public function setEnseignant(?User $u): static { $this->enseignant=$u; return $this; }
    public function getDateHeure(): ?\DateTimeInterface { return $this->dateHeure; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $s): static { $this->statut=$s; return $this; }
    public function getCodeSignature(): ?string { return $this->codeSignature; }
    public function getPresences(): Collection { return $this->presences; }
}
