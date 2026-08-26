<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260826081435 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE "user" ADD date_naissance DATE DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD telephone VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD adresse VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD photo_url VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD parent_nom VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD parent_email VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD parent_telephone VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE "user" DROP date_naissance');
        $this->addSql('ALTER TABLE "user" DROP telephone');
        $this->addSql('ALTER TABLE "user" DROP adresse');
        $this->addSql('ALTER TABLE "user" DROP photo_url');
        $this->addSql('ALTER TABLE "user" DROP parent_nom');
        $this->addSql('ALTER TABLE "user" DROP parent_email');
        $this->addSql('ALTER TABLE "user" DROP parent_telephone');
    }
}
