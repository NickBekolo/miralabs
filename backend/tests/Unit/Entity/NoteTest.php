<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Note;
use App\Entity\User;
use App\Entity\Matiere;
use PHPUnit\Framework\TestCase;

class NoteTest extends TestCase
{
    private Note $note;

    protected function setUp(): void
    {
        $this->note = new Note();
    }

    public function testValeurValide(): void
    {
        $this->note->setValeur(15.5);
        $this->assertSame(15.5, $this->note->getValeur());
    }

    public function testValeurZeroEstValide(): void
    {
        $this->note->setValeur(0.0);
        $this->assertSame(0.0, $this->note->getValeur());
    }

    public function testNoteSurDefaut(): void
    {
        $note = new Note();
        $this->assertSame(20.0, $note->getNoteSur());
    }

    public function testNoteSurPersonnalisee(): void
    {
        $this->note->setNoteSur(10.0);
        $this->assertSame(10.0, $this->note->getNoteSur());
    }

    public function testCommentaireNullable(): void
    {
        $this->note->setCommentaire(null);
        $this->assertNull($this->note->getCommentaire());
    }

    public function testCommentaireDefini(): void
    {
        $this->note->setCommentaire('Bon travail, continuez ainsi.');
        $this->assertSame('Bon travail, continuez ainsi.', $this->note->getCommentaire());
    }

    public function testTypeEvaluationDS(): void
    {
        $this->note->setTypeEvaluation('DS');
        $this->assertSame('DS', $this->note->getTypeEvaluation());
    }

    public function testTypeEvaluationValeurs(): void
    {
        $typesValides = ['DS', 'TP', 'Devoir', 'Interrogation', 'Examen'];
        foreach ($typesValides as $type) {
            $this->note->setTypeEvaluation($type);
            $this->assertSame($type, $this->note->getTypeEvaluation());
        }
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTimeImmutable('2025-03-15 10:00:00');
        $this->note->setCreatedAt($date);
        $this->assertSame($date, $this->note->getCreatedAt());
    }

    public function testAssociationEleve(): void
    {
        $eleve = new User();
        $this->note->setEleve($eleve);
        $this->assertSame($eleve, $this->note->getEleve());
    }

    public function testAssociationProfesseur(): void
    {
        $professeur = new User();
        $this->note->setProfesseur($professeur);
        $this->assertSame($professeur, $this->note->getProfesseur());
    }

    public function testAssociationMatiere(): void
    {
        $matiere = new Matiere();
        $this->note->setMatiere($matiere);
        $this->assertSame($matiere, $this->note->getMatiere());
    }

    public function testIdNullAvantPersistance(): void
    {
        $this->assertNull($this->note->getId());
    }

    public function testFluentInterface(): void
    {
        $result = $this->note
            ->setValeur(14.0)
            ->setNoteSur(20.0)
            ->setCommentaire('Bien')
            ->setTypeEvaluation('DS');
        $this->assertInstanceOf(Note::class, $result);
    }

    public function testNoteMaximale(): void
    {
        $this->note->setValeur(20.0);
        $this->note->setNoteSur(20.0);
        $this->assertTrue($this->note->getValeur() <= $this->note->getNoteSur());
    }
}
