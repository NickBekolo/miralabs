<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Lecon
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;
    #[ORM\Column(length:255)]
    private ?string $titre = null;
    #[ORM\Column(type:'text', nullable:true)]
    private ?string $contenu = null;
    #[ORM\Column(type:'text', nullable:true)]
    private ?string $objectifs = null;
    #[ORM\Column(type:'date')]
    private ?\DateTimeInterface $date = null;
    #[ORM\ManyToOne]
    private ?Matiere $matiere = null;
    #[ORM\ManyToOne]
    private ?User $enseignant = null;
    #[ORM\Column(length:100, nullable:true)]
    private ?string $classe = null;
    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getTitre(): ?string { return $this->titre; }
    public function setTitre(string $t): static { $this->titre=$t; return $this; }
    public function getContenu(): ?string { return $this->contenu; }
    public function setContenu(?string $c): static { $this->contenu=$c; return $this; }
    public function getObjectifs(): ?string { return $this->objectifs; }
    public function setObjectifs(?string $o): static { $this->objectifs=$o; return $this; }
    public function getDate(): ?\DateTimeInterface { return $this->date; }
    public function setDate(\DateTimeInterface $d): static { $this->date=$d; return $this; }
    public function getMatiere(): ?Matiere { return $this->matiere; }
    public function setMatiere(?Matiere $m): static { $this->matiere=$m; return $this; }
    public function getEnseignant(): ?User { return $this->enseignant; }
    public function setEnseignant(?User $u): static { $this->enseignant=$u; return $this; }
    public function getClasse(): ?string { return $this->classe; }
    public function setClasse(?string $c): static { $this->classe=$c; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    #[ORM\ManyToOne]
    private ?Etablissement $etablissement = null;
    public function getEtablissement(): ?Etablissement { return $this->etablissement; }
    public function setEtablissement(?Etablissement $e): static { $this->etablissement = $e; return $this; }

}
