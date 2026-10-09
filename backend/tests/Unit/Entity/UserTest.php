<?php

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use App\Entity\Etablissement;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        $this->user = new User();
    }

    public function testEmailSetGet(): void
    {
        $this->user->setEmail('nick@miralabs.com');
        $this->assertSame('nick@miralabs.com', $this->user->getEmail());
    }

    public function testGetUserIdentifierRetourneEmail(): void
    {
        $this->user->setEmail('ritah@miralabs.com');
        $this->assertSame('ritah@miralabs.com', $this->user->getUserIdentifier());
    }

    public function testRolesContientToujoursRoleUser(): void
    {
        $this->user->setRoles(['ROLE_TEACHER']);
        $roles = $this->user->getRoles();
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testRoleStudent(): void
    {
        $this->user->setRoles(['ROLE_STUDENT']);
        $this->assertContains('ROLE_STUDENT', $this->user->getRoles());
    }

    public function testRoleTeacher(): void
    {
        $this->user->setRoles(['ROLE_TEACHER']);
        $this->assertContains('ROLE_TEACHER', $this->user->getRoles());
    }

    public function testRoleAdmin(): void
    {
        $this->user->setRoles(['ROLE_ADMIN']);
        $this->assertContains('ROLE_ADMIN', $this->user->getRoles());
    }

    public function testRoleSuperAdmin(): void
    {
        $this->user->setRoles(['ROLE_SUPER_ADMIN']);
        $this->assertContains('ROLE_SUPER_ADMIN', $this->user->getRoles());
    }

    public function testPasswordSetGet(): void
    {
        $hash = '$2y$13$abcdefghijklmnopqrstuuVGZzEtYnG5k1bJtOcqOaGCQjSHFnfRi';
        $this->user->setPassword($hash);
        $this->assertSame($hash, $this->user->getPassword());
    }

    public function testFirstNameSetGet(): void
    {
        $this->user->setFirstName('Nick');
        $this->assertSame('Nick', $this->user->getFirstName());
    }

    public function testLastNameSetGet(): void
    {
        $this->user->setLastName('Bekolo');
        $this->assertSame('Bekolo', $this->user->getLastName());
    }

    public function testIsActiveTrue(): void
    {
        $this->user->setIsActive(true);
        $this->assertTrue($this->user->isActive());
    }

    public function testIsActiveFalse(): void
    {
        $this->user->setIsActive(false);
        $this->assertFalse($this->user->isActive());
    }

    public function testMustChangePassword(): void
    {
        $this->user->setMustChangePassword(true);
        $this->assertTrue($this->user->isMustChangePassword());
    }

    public function testAssociationEtablissement(): void
    {
        $etablissement = new Etablissement();
        $this->user->setEtablissement($etablissement);
        $this->assertSame($etablissement, $this->user->getEtablissement());
    }

    public function testTelephoneNullable(): void
    {
        $this->user->setTelephone(null);
        $this->assertNull($this->user->getTelephone());
    }

    public function testTelephoneDefini(): void
    {
        $this->user->setTelephone('+237690000000');
        $this->assertSame('+237690000000', $this->user->getTelephone());
    }

    public function testCreatedAt(): void
    {
        $date = new \DateTimeImmutable('2025-01-01');
        $this->user->setCreatedAt($date);
        $this->assertSame($date, $this->user->getCreatedAt());
    }

    public function testEraseCredentialsNeRienFait(): void
    {
        $this->user->setPassword('hash');
        $this->user->eraseCredentials();
        $this->assertSame('hash', $this->user->getPassword());
    }

    public function testParentInfosNullables(): void
    {
        $this->assertNull($this->user->getParentNom());
        $this->assertNull($this->user->getParentEmail());
        $this->assertNull($this->user->getParentTelephone());
    }

    public function testParentInfosDefinies(): void
    {
        $this->user->setParentNom('Bekolo Jean');
        $this->user->setParentEmail('parent@example.com');
        $this->user->setParentTelephone('+237699000000');
        $this->assertSame('Bekolo Jean', $this->user->getParentNom());
        $this->assertSame('parent@example.com', $this->user->getParentEmail());
        $this->assertSame('+237699000000', $this->user->getParentTelephone());
    }
}
