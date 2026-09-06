#!/bin/sh
set -e

# Décoder les clés JWT
if [ -n "$JWT_SECRET_KEY_BASE64" ]; then
    mkdir -p config/jwt
    echo "$JWT_SECRET_KEY_BASE64" | base64 -d > config/jwt/private.pem
    chmod 600 config/jwt/private.pem
fi

if [ -n "$JWT_PUBLIC_KEY_BASE64" ]; then
    mkdir -p config/jwt
    echo "$JWT_PUBLIC_KEY_BASE64" | base64 -d > config/jwt/public.pem
fi

mkdir -p public/uploads/justificatifs public/uploads/photos

# Migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=prod 2>/dev/null || true

# Démarrer
exec php -S 0.0.0.0:${PORT:-8000} -t public
