# Notexia – Web app (Next.js)

Interface web principale pour créer et organiser des notes.

## Stack
- Next.js (récente)
- TypeScript
- (Proposé) Tailwind CSS / shadcn/ui si besoin
- App router ou Pages router selon la version (adapter)

## Fonctionnalités UI (cibles)
- Connexion / inscription
- Liste des notes
- Éditeur Markdown
- Dossiers, tags, recherche
- Intégrations IA (réécriture/résumé) à venir

## Lancement
```bash
cd apps/web
pnpm dev
```

## Configuration
- URL API : `NEXT_PUBLIC_API_URL` (ex: http://localhost:3000)

## Structure suggérée
- `app/` (ou `pages/`), `components/`, `lib/`, `styles/`, `hooks/`
- Intégration auth (JWT) côté client à définir (fetch, React Query, etc.)

## Tests / CI
TODO : ajouter tests (Playwright/RTL) et pipeline CI.
