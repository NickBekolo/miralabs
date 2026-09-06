#!/bin/sh
echo "=== Démarrage entrypoint.sh ==="
echo "PORT=$PORT"
echo "JWT_PASSPHRASE=$JWT_PASSPHRASE"

if [ -n "$JWT_SECRET_KEY_BASE64" ]; then
    mkdir -p config/jwt
    echo "$JWT_SECRET_KEY_BASE64" | base64 -d > config/jwt/private.pem
    chmod 600 config/jwt/private.pem
    echo "✅ Clé privée JWT décodée"
fi

if [ -n "$JWT_PUBLIC_KEY_BASE64" ]; then
    mkdir -p config/jwt
    echo "$JWT_PUBLIC_KEY_BASE64" | base64 -d > config/jwt/public.pem
    echo "✅ Clé publique JWT décodée"
fi

mkdir -p public/uploads/justificatifs public/uploads/photos

echo "=== Création schéma ==="
php bin/console doctrine:schema:create --env=prod 2>&1 || echo "Schéma existe déjà"

echo "=== Marquage migrations comme exécutées ==="
php bin/console doctrine:migrations:version --add --all --no-interaction --env=prod 2>&1 || true

echo "=== Démarrage PHP sur port ${PORT:-8000} ==="
exec php -S 0.0.0.0:${PORT:-8000} -t public
