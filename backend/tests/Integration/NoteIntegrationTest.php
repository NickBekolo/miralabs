<?php

namespace App\Tests\Integration;

use App\Entity\Note;
use App\Entity\User;
use App\Entity\Matiere;
use App\Entity\Etablissement;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Doctrine\ORM\EntityManagerInterface;

class NoteIntegrationTest extends KernelTestCase
{
    private EntityManagerInterface $em;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->em = static::getContainer()->get(EntityManagerInterface::class);
        $this->em->beginTransaction();
    }

    protected function tearDown(): void
    {
        $this->em->rollback();
        parent::tearDown();
    }

    public function testCreationNotePersistee(): void
    {
        $etablissement = $this->em->getRepository(Etablissement::class)->findOneBy([]);
        $matiere       = $this->em->getRepository(Matiere::class)->findOneBy(['etablissement' => $etablissement]);
        $eleve         = $this->em->getRepository(User::class)->findOneBy(['etablissement' => $etablissement]);
        $professeur    = $this->em->getRepository(User::class)->findOneBy(['etablissement' => $etablissement]);

        if (!$etablissement || !$matiere || !$eleve) {
            $this->markTestSkipped('Fixtures requises');
        }

        $note = new Note();
        $note->setValeur(16.0)
             ->setNoteSur(20.0)
             ->setTypeEvaluation('DS')
             ->setCommentaire('Très bon travail')
             ->setEleve($eleve)
             ->setProfesseur($professeur)
             ->setMatiere($matiere)
             ->setEtablissement($etablissement)
             ->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($note);
        $this->em->flush();

        $this->assertNotNull($note->getId());

        $noteEnBDD = $this->em->getRepository(Note::class)->find($note->getId());
        $this->assertSame(16.0, $noteEnBDD->getValeur());
        $this->assertSame('DS', $noteEnBDD->getTypeEvaluation());
        $this->assertSame($etablissement->getId(), $noteEnBDD->getEtablissement()->getId());
    }

    public function testIsolationMultiTenantNote(): void
    {
        $etablissements = $this->em->getRepository(Etablissement::class)->findAll();

        if (count($etablissements) < 2) {
            $this->markTestSkipped('2 établissements requis');
        }

        $etab1 = $etablissements[0];
        $etab2 = $etablissements[1];
        $this->assertNotSame($etab1->getId(), $etab2->getId());
        $this->assertNotSame($etab1->getCode(), $etab2->getCode());
    }

    public function testValeurNoteCoherence(): void
    {
        $note = new Note();
        $note->setValeur(18.0);
        $note->setNoteSur(20.0);
        $this->assertTrue($note->getValeur() <= $note->getNoteSur());
    }

    public function testRepositoryNoteParEtablissement(): void
    {
        $etablissement = $this->em->getRepository(Etablissement::class)->findOneBy([]);

        if (!$etablissement) {
            $this->markTestSkipped('Aucun établissement en base');
        }

        $notes = $this->em->getRepository(Note::class)->findBy(['etablissement' => $etablissement]);

        foreach ($notes as $note) {
            $this->assertSame($etablissement->getId(), $note->getEtablissement()->getId());
        }
    }
}
