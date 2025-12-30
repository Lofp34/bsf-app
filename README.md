# Business Sud de France MVP

MVP mobile-first pour l'annuaire, les recommandations, les evenements et les classements, deployable sur Vercel avec Neon Postgres.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + Neon Postgres

## Demarrage local
1. Installer les dependances :
   ```bash
   npm install
   ```
2. Copier les variables d'environnement :
   ```bash
   cp .env.example .env
   ```
3. Renseigner `DATABASE_URL` (et `DIRECT_URL` si besoin).
4. Optionnel: ajuster `SESSION_TTL_DAYS` et `SESSION_COOKIE_NAME`.
4. Generer le client Prisma :
   ```bash
   npx prisma generate
   ```
5. Lancer l'app :
   ```bash
   npm run dev
   ```

## Migrations Prisma
- Migration initiale : `prisma/migrations/0001_init`
- En prod (Vercel), le build lance `prisma migrate deploy` si `DATABASE_URL` est defini.

## Decisions MVP
- Consentements par defaut : `consent_share_contact = true`, `consent_share_hobbies = true` pour favoriser l'engagement, modifiables par l'utilisateur.
- Relation Member <-> User : 1-1 via `User.memberId` (un membre peut exister sans compte).
- Stockage PII contact recommande : email et telephone autorises (avec garde-fous cote UI/API a venir).
- Auth : email + mot de passe (sessions en base, cookie HTTPOnly).

## Scripts utiles
- `npm run dev`: dev server
- `npm run build`: build avec Prisma generate + migrate deploy conditionnel
- `npm run lint`: lint
- `npm test`: validations Prisma + schemas zod + RBAC

## Import Excel (MVP)
- UI: page `app/admin` (Super Admin uniquement).
- API: `POST /api/admin/import-members` (multipart form-data, champ `file`).

## Deploiement Vercel + Neon
1. Deployer sans `DATABASE_URL` (migration skippee).
2. Connecter l'integration Neon et definir `DATABASE_URL` (et `DIRECT_URL`).
3. Redeployer pour appliquer `prisma migrate deploy`.
