FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-scripts

RUN mkdir -p public/uploads/justificatifs public/uploads/photos
RUN chmod -R 775 public/uploads
RUN chmod +x entrypoint.sh

EXPOSE 8000
CMD ["sh", "entrypoint.sh"]
