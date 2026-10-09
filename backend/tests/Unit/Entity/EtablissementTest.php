<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Etablissement;
use PHPUnit\Framework\TestCase;

class EtablissementTest extends TestCase
{
    private Etablissement $etablissement;

    protected function setUp(): void
    {
        $this->etablissement = new Etablissement();
    }

    public function testNameSetGet(): void
    {
        $this->etablissement->setName('Lycée Bilingue de Yaoundé');
        $this->assertSame('Lycée Bilingue de Yaoundé', $this->etablissement->getName());
    }

    public function testCodeSetGet(): void
    {
        $this->etablissement->setCode('LBY-001');
        $this->assertSame('LBY-001', $this->etablissement->getCode());
    }

    public function testTypeSetGet(): void
    {
        $this->etablissement->setType('lycee');
        $this->assertSame('lycee', $this->etablissement->getType());
    }

    public function testTypesValides(): void
    {
        $types = ['lycee', 'college', 'primaire', 'universite'];
        foreach ($types as $type) {
            $this->etablissement->setType($type);
            $this->assertSame($type, $this->etablissement->getType());
        }
    }

    public function testAdresseNullable(): void
    {
        $this->etablissement->setAdresse(null);
        $this->assertNull($this->etablissement->getAdresse());
    }

    public function testAdresseDefinie(): void
    {
        $this->etablissement->setAdresse('Avenue Kennedy, Yaoundé');
        $this->assertSame('Avenue Kennedy, Yaoundé', $this->etablissement->getAdresse());
    }

    public function testVilleNullable(): void
    {
        $this->assertNull($this->etablissement->getVille());
    }

    public function testVilleDefinie(): void
    {
        $this->etablissement->setVille('Yaoundé');
        $this->assertSame('Yaoundé', $this->etablissement->getVille());
    }

    public function testIsActiveTrue(): void
    {
        $this->etablissement->setIsActive(true);
        $this->assertTrue($this->etablissement->isActive());
    }

    public function testIsActiveFalse(): void
    {
        $this->etablissement->setIsActive(false);
        $this->assertFalse($this->etablissement->isActive());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTimeImmutable('2025-09-01');
        $this->etablissement->setCreatedAt($date);
        $this->assertSame($date, $this->etablissement->getCreatedAt());
    }

    public function testIdNullAvantPersistance(): void
    {
        $this->assertNull($this->etablissement->getId());
    }

    public function testIsolationMultiTenant(): void
    {
        $etab1 = new Etablissement();
        $etab1->setCode('ETAB-001');
        $etab2 = new Etablissement();
        $etab2->setCode('ETAB-002');
        $this->assertNotSame($etab1->getCode(), $etab2->getCode());
    }
}
