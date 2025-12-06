# Notexia – API backend (NestJS + Prisma)

API REST de Notexia : auth JWT, utilisateurs, notes, dossiers, tags, endpoints IA et recherche.

## Stack
- NestJS 11
- Prisma 7
- PostgreSQL (Docker)
- JWT Auth (Passport + @nestjs/jwt)
- TypeScript

## Architecture (modules principaux)
- `auth/` : register/login, stratégie JWT, guard, DTO
- `users/` : profil courant, future gestion utilisateur
- `notes/` : CRUD notes, filtrage
- `folders/` : dossiers/sous-dossiers
- `tags/` : tags et associations note-tag
- `ai/` : endpoints IA (réécriture, etc.)
- `search/` : recherche
- `prisma/` : PrismaService + module global
- `common/` : décorateurs, guards partagés, types JWT

## Configuration
Variables d’environnement (apps/api/.env) :
```
DATABASE_URL=postgresql://notexia:notexia@localhost:5433/notexia?schema=public
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
```
Prisma 7 utilise `prisma.config.ts` pour la datasource (DATABASE_URL).

## Base de données
- Démarrer Postgres : `docker-compose up -d`
- Migrations : `pnpm prisma migrate dev`
- Génération client : `pnpm prisma generate`

## Lancement dev
```bash
cd apps/api
pnpm start:dev
```

## Endpoints (principaux, certains TODO)
- POST `/auth/register`
- POST `/auth/login`
- GET `/users/me` (JWT)
- CRUD `/notes`, `/folders`, `/tags`
- `/ai/...` (futur)
- `/search` (futur)

## Structure du code
Pattern Nest : Controller → Service → Prisma → DB. Modules organisés par domaine, PrismaService global pour l’accès DB.

## Tests
TODO : ajouter tests unitaires/e2e (Jest).
