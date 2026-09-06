#!/bin/sh
echo "=== Démarrage entrypoint.sh ==="
echo "PORT=$PORT"

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

echo "=== Migrations ==="
php bin/console doctrine:migrations:migrate --no-interaction --env=prod 2>&1
echo "=== Fin migrations ==="

echo "=== Démarrage PHP sur port ${PORT:-8000} ==="
exec php -S 0.0.0.0:${PORT:-8000} -t public
