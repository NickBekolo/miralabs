<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Crée la table password_reset_token pour la réinitialisation sécurisée des mots de passe.
 *
 * Sécurité :
 * - hashed_token : SHA-256 du token transmis par email (token brut jamais en BDD)
 * - expires_at   : durée de validité 1 heure
 * - used         : usage unique — marqué true dès la première utilisation
 * - ON DELETE CASCADE sur user_id — suppression auto des tokens si l'utilisateur est supprimé
 */
final class Version20261009_password_reset_token extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create password_reset_token table for secure password reset flow';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            CREATE TABLE password_reset_token (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER NOT NULL,
                hashed_token VARCHAR(64) NOT NULL,
                expires_at  TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                created_at  TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                used        BOOLEAN NOT NULL DEFAULT FALSE,
                CONSTRAINT fk_prt_user FOREIGN KEY (user_id)
                    REFERENCES "user" (id) ON DELETE CASCADE
            )
        ');

        $this->addSql('CREATE INDEX idx_prt_hashed_token ON password_reset_token (hashed_token)');
        $this->addSql('CREATE INDEX idx_prt_user_id ON password_reset_token (user_id)');
        $this->addSql('CREATE INDEX idx_prt_expires_at ON password_reset_token (expires_at)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS password_reset_token');
    }
}
