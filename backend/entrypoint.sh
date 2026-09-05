#!/bin/bash
set -e

# Décoder les clés JWT depuis les variables d'environnement
if [ -n "$JWT_SECRET_KEY_BASE64" ]; then
    mkdir -p config/jwt
    echo "$JWT_SECRET_KEY_BASE64" | base64 -d > config/jwt/private.pem
    echo "✅ Clé privée JWT décodée"
fi

if [ -n "$JWT_PUBLIC_KEY_BASE64" ]; then
    mkdir -p config/jwt
    echo "$JWT_PUBLIC_KEY_BASE64" | base64 -d > config/jwt/public.pem
    echo "✅ Clé publique JWT décodée"
fi

# Créer les dossiers uploads
mkdir -p public/uploads/justificatifs public/uploads/photos
chmod -R 775 public/uploads

# Migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=prod

# Démarrer le serveur
exec php -S 0.0.0.0:${PORT:-8000} -t public
