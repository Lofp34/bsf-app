# Project Status (MVP)

## Objectif
Livrer un MVP mobile-first, fluide et professional, avec un espace admin qui permet de piloter l'annuaire, les invitations et la qualite des donnees.

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

## Prochaine etape (proposee)
1) Pagination + export CSV sur les listes admin.
2) Historique des modifications par membre (audit detaille).
3) CRUD evenements (creation/edition) avec roles.
4) Notifications (email) pour invitations.
5) Tableau de bord KPI plus riche (tendances, activite).
