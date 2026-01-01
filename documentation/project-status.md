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
- Espace communaute:
  - Recommandations (fil communaute, envoyees, recues).
  - Activites (liste, creation, details, RSVP).
- Activites publiques / sur invitation avec capacite et suivi des participants.
- Invitations d'activite par selection de membres (y compris sans compte).
- Recommandations visibles par la communaute (texte prive).
- Montant visible lorsque la recommandation est validee.
- Creation de membre (admin) + invitation (admin/super admin).
- Actions rapides:
  - Regenerer un lien d'invitation.
  - Activer/desactiver un utilisateur.
- Journal d'audit pour les actions admin (creation membre, invitation, activation).
- Health check: `GET /api/health`.
- Seed de demo: `npm run seed:demo`.
- Navigation croisee admin/communaute pour guider les parcours.
- Personnalisation nav: prenom/nom, placeholder photo, bouton deconnexion.
- Checklist de bienvenue a la premiere connexion (onboarding).
- Acceptation d'invitation renforcee (validation token + conditions).
- Rotation de session et protection CSRF.

## Perimetre (scope)
- In: annuaire, invitations, comptes utilisateurs, activites publiques/privees, recommandations (MVP).
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
- Pages utilisant Prisma cote App Router marquees en `dynamic` pour eviter les prerender errors sans `DATABASE_URL`.

## Journal des evolutions
- 2025-12-30: espace admin et navigation complete, audit, health check, actions rapides, doc de suivi.
- 2025-12-30: ajout du skill `project-status-keeper` et mise a jour du document maitre.
- 2025-12-30: stabilisation Vercel (DIRECT_URL + retry migrations) et merge de l'admin MVP.
- 2025-12-30: pagination + export CSV admin, demarrage CRUD evenements (roles).
- 2025-12-30: CRUD evenements (creation/edition/annulation) avec roles merge.
- 2025-12-30: emails d'invitation (SMTP) en cours.
- 2025-12-30: choix de Brevo pour l'envoi d'emails (configuration a faire).
- 2025-12-30: pivot MVP vers activites et recommandations communautaires.
- 2025-12-30: espace communaute (recommandations + activites) et invitations ciblees.
- 2025-12-30: creation activite en rendu dynamique pour eviter l'erreur Prisma au build.
- 2025-12-30: clarifications de navigation admin <-> communaute.
- 2025-12-30: navigation croisee admin/communaute pour clarifier les flux.
- 2026-01-01: personnalisation nav (prenom/nom, placeholder photo, deconnexion).
- 2026-01-01: checklist d'onboarding a la premiere connexion.
- 2026-01-01: acceptation d'invitation renforcee (token + conditions).
- 2026-01-01: rotation de session + protection CSRF.
- 2026-01-01: tests npm test + lint OK.

## Prochaine etape (proposee)
1) Finaliser l'envoi d'emails (Brevo) pour invitations et notifications.
2) Tableau de bord KPI MVP (activites, participants, recommandations).
3) Clarifier les parcours utilisateur (landing + guidage).
4) Durcir les notifications (preferences, digest).
