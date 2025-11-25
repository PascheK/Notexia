# Notexia

Notexia est une application de prise de notes avec IA, open-source et auto-hébergeable. Monorepo pnpm/TurboRepo : backend NestJS + Prisma, frontend Next.js. Notes en Markdown, organisation par dossiers/tags, recherche, et fonctionnalités IA (réécriture, résumé, amélioration).

## Fonctionnalités (actuelles / à venir)
- Notes Markdown (éditeur web), épinglage/statut
- Dossiers et sous-dossiers
- Tags (many-to-many), filtrage
- Recherche
- IA : réécriture, résumé, amélioration (en cours)
- Auth JWT, multi-utilisateurs
- Web d’abord, futur desktop/mobile
- Auto-hébergeable (Docker pour Postgres)

## Architecture high-level
- `apps/api` : backend NestJS (auth, users, notes, folders, tags, ai, search)
- `apps/web` : frontend Next.js
- `packages/*` : à venir (UI partagée, config, utils…)

## Prérequis
- Node >= 20
- pnpm
- Docker + docker-compose (PostgreSQL)
- Git

## Installation
```bash
git clone <repo-url> notexia
cd notexia
pnpm install
```

## Lancement rapide
1) Base de données  
```bash
docker-compose up -d
```
2) Backend  
```bash
cd apps/api
pnpm start:dev
```
3) Frontend  
```bash
cd apps/web
pnpm dev
```

## Scripts (racine, via Turbo)
- `pnpm dev` : lancer les apps en mode dev (si configuré)
- `pnpm lint` : lint global
- `pnpm test` : tests (si présents)
- `pnpm build` : build des apps

## Contribution
- Fork, branche feature, PR
- Conventional Commits conseillé (`feat: ...`, `fix: ...`)
- Décrire les changements et ajouter des tests si possible

## Roadmap (exemple)
- V1 : Auth + CRUD notes/dossiers/tags, recherche basique
- V2 : IA (réécriture/résumé), mobile/desktop, sync avancée
- V3 : Plugins, permissions fines, offline

## Licence
MIT (à confirmer par les maintainers).
