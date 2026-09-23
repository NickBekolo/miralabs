# Miralabs

![CI](https://github.com/$(git -C "/Users/test/Desktop/Projet fin d'annee Ed/educationApp" remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git//')/actions/workflows/ci.yml/badge.svg)

Plateforme de gestion scolaire multi-rôles développée en React + Symfony + PostgreSQL.

## Stack technique

- **Frontend** : React 18 + Vite, déployé sur Railway
- **Backend** : Symfony 6, API REST + JWT, déployé sur Railway
- **Base de données** : PostgreSQL
- **Containerisation** : Docker
- **CI/CD** : GitHub Actions + Railway

## URLs de production

- Frontend : https://miralabs.up.railway.app
- Backend : https://educationapp-production.up.railway.app

## Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@miralabs.com | superadmin123 | Administrateur |
| enseignant@miralabs.com | password | Enseignant |
| test@miralabs.com | nouveauPass123 | Étudiant |

## Lancer en local

```bash
# Backend
cd backend && php -S 127.0.0.1:8000 -t public

# Frontend
cd frontend && npm run dev
```

## Tests

```bash
cd backend && php bin/phpunit
```
