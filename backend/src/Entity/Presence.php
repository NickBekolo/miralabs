<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Presence
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;
    #[ORM\ManyToOne(inversedBy:'presences')]
    private ?Appel $appel = null;
    #[ORM\ManyToOne]
    private ?User $eleve = null;
    #[ORM\Column(length:20)]
    private string $statut = 'absent';
    #[ORM\Column(nullable:true)]
    private ?\DateTimeImmutable $signedAt = null;
    #[ORM\Column]
    private bool $signed = false;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $signatureImage = null;
    public function getId(): ?int { return $this->id; }
    public function getAppel(): ?Appel { return $this->appel; }
    public function setAppel(?Appel $a): static { $this->appel=$a; return $this; }
    public function getEleve(): ?User { return $this->eleve; }
    public function setEleve(?User $u): static { $this->eleve=$u; return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $s): static { $this->statut=$s; return $this; }
    public function getSignedAt(): ?\DateTimeImmutable { return $this->signedAt; }
    public function isSigned(): bool { return $this->signed; }
    public function setSigned(bool $s): static { $this->signed=$s; if($s) $this->signedAt=new \DateTimeImmutable(); return $this; }
    public function getSignatureImage(): ?string { return $this->signatureImage; }
    public function setSignatureImage(?string $s): static { $this->signatureImage = $s; return $this; }
}
