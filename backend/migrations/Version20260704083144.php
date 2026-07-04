<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260704083144 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event_log DROP CONSTRAINT fk_9ef0ad16ff631228');
        $this->addSql('ALTER TABLE event_log DROP CONSTRAINT fk_9ef0ad163c0c9956');
        $this->addSql('ALTER TABLE event_log ADD CONSTRAINT FK_9EF0AD16FF631228 FOREIGN KEY (etablissement_id) REFERENCES etablissement (id) ON DELETE SET NULL NOT DEFERRABLE');
        $this->addSql('ALTER TABLE event_log ADD CONSTRAINT FK_9EF0AD163C0C9956 FOREIGN KEY (user_account_id) REFERENCES "user" (id) ON DELETE SET NULL NOT DEFERRABLE');
        $this->addSql('CREATE INDEX idx_event_type ON event_log (event_type)');
        $this->addSql('CREATE INDEX idx_event_created_at ON event_log (created_at)');
        $this->addSql('ALTER INDEX idx_9ef0ad16ff631228 RENAME TO idx_event_etablissement');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event_log DROP CONSTRAINT FK_9EF0AD163C0C9956');
        $this->addSql('ALTER TABLE event_log DROP CONSTRAINT FK_9EF0AD16FF631228');
        $this->addSql('DROP INDEX idx_event_type');
        $this->addSql('DROP INDEX idx_event_created_at');
        $this->addSql('ALTER TABLE event_log ADD CONSTRAINT fk_9ef0ad163c0c9956 FOREIGN KEY (user_account_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE event_log ADD CONSTRAINT fk_9ef0ad16ff631228 FOREIGN KEY (etablissement_id) REFERENCES etablissement (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_event_etablissement RENAME TO idx_9ef0ad16ff631228');
    }
}
