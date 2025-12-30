# Project Status (MVP)

## Objectif
Livrer un MVP mobile-first, fluide et professional, avec un espace admin pour piloter l'annuaire, les invitations et la qualite des donnees.

## Rituels de mise a jour
- Ce document est le document maitre.
- Il est mis a jour a chaque PR mergee.
- Chaque PR doit ajouter une ligne courte dans "Journal des evolutions".

## Ce qui est en place
- Authentification email + mot de passe, sessions en base.
- Espace admin avec navigation et pages:
  - Vue d'ensemble /admin
  - Membres /admin/members
  - Invitations /admin/invitations
  - Utilisateurs /admin/users
  - Evenements /admin/events
  - Etat /admin/status
  - Journal d'audit /admin/audit
- Creation de membre (admin) + invitation (admin/super admin).
- Actions rapides:
  - Regenerer un lien d'invitation.
  - Activer/desactiver un utilisateur.
- Journal d'audit pour les actions admin (creation membre, invitation, activation).
- Health check: `GET /api/health`.
- Seed de demo: `npm run seed:demo`.

## Perimetre (scope)
- In: annuaire, invitations, comptes utilisateurs, evenements, recommandations (MVP).
- Out: facturation, CRM externe, analytics avancees, mobile natif, SSO.

## Decisions prises
- Auth par email + mot de passe (sessions en base).
- Migrations Prisma via `prisma migrate deploy`.
- `DIRECT_URL` pour les migrations, `DATABASE_URL` pour l'app (Vercel + Neon).
- Import Excel retire temporairement (creation manuelle + admin forms).
- Document maitre maintenu par le skill `project-status-keeper`.
- Retry automatique sur `prisma migrate deploy` en build (stabilite Vercel).

## Risques / Blocages
- Deploiement bloque si `DIRECT_URL` absent sur Vercel.
- Locks Prisma en cas de deploys concurrents (attenue par retry, eviter les redeploys multiples).

## Architecture (essentiel)
- Next.js App Router + TypeScript + Tailwind CSS.
- Prisma + Neon Postgres.
- Migrations Prisma gerees via `prisma migrate deploy`.

## Dev & Build
- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run seed:demo`

## Deployment (Vercel + Neon)
- `DATABASE_URL` pour l'app.
- `DIRECT_URL` pour les migrations (evite les timeouts du pooler).
- Build: `scripts/vercel-build.mjs` utilise `DIRECT_URL` si present.

## Journal des evolutions
- 2025-12-30: espace admin et navigation complete, audit, health check, actions rapides, doc de suivi.
- 2025-12-30: ajout du skill `project-status-keeper` et mise a jour du document maitre.
- 2025-12-30: stabilisation Vercel (DIRECT_URL + retry migrations) et merge de l'admin MVP.
- 2025-12-30: pagination + export CSV admin, demarrage CRUD evenements (roles).

## Prochaine etape (proposee)
1) Pagination + export CSV sur les listes admin.
2) Historique des modifications par membre (audit detaille).
3) CRUD evenements (creation/edition/annulation) avec roles. (en cours)
4) Notifications (email) pour invitations.
5) Tableau de bord KPI plus riche (tendances, activite).
