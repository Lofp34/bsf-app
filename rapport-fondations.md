# Rapport d'analyse approfondie — Fondations de l'app

## Contexte
Analyse basée sur l'état actuel du dépôt `/workspace/bsf-app`.

## ✅ Points solides

### 1) Stack moderne et cohérente
- Next.js (App Router) + TypeScript + Prisma + Postgres : stack éprouvée pour MVP et montée en charge.
- Procédure de déploiement claire (Vercel + Neon).

### 2) Modèle de données riche et bien structuré
- Séparation `User` / `Member` (relation 1–1 via `User.memberId`) adaptée à l'annuaire.
- Tables clés déjà présentes : sessions, invitations, audit logs, recommendations, events, hobbies, notifications.
- Index utiles sur dates/statuts/relations.
- Cycle de vie prévu (soft delete / anonymisation / désactivation).

### 3) Authentification fonctionnelle et sécurisée (MVP)
- Sessions persistées en base + cookie HTTP-only.
- Hash bcrypt pour les mots de passe.
- Limitation des tentatives de login + verrouillage temporaire.

### 4) Validation centralisée des inputs
- Schémas Zod pour les entrées API critiques.

### 5) Audit log déjà branché
- Enregistrement des actions sensibles (invitations, création membres, etc.).

### 6) Tests de base présents
- Vérifications schemas + RBAC.

---

## ⚠️ Points à renforcer (risques structurels)

### 1) Couverture fonctionnelle API incomplète
- Existence d'entités (notifications, RSVP, status history) sans endpoints dédiés.
- Peu de routes de listing / lecture (GET) pour events / recommendations.

### 2) Protection CSRF / sécurité avancée absente
- Cookie `SameSite=lax` ok pour MVP, mais pas de mécanisme CSRF explicite.

### 3) RBAC binaire
- Contrôle d'accès global par rôle, mais pas de permissions fines par ressource.

### 4) Soft delete prévu mais pas appliqué
- Champs `deletedAt` / `anonymizedAt` non exploités dans les queries.

### 5) Observabilité minimale
- Health check présent, mais pas de logging structuré ni d'alerting.

---

## ✅ Recommandations prioritaires

1. **Compléter l’API métier**
   - Ajouter endpoints GET/list + mise à jour des statuts.
   - Gérer RSVP/notifications en API.

2. **Renforcer le contrôle d’accès**
   - Centraliser les guards (role + ownership + tenant).

3. **Normaliser le soft-delete**
   - Filtrage par défaut des entités `deletedAt`.
   - Stratégie d’anonymisation réelle.

4. **Durcir l’auth**
   - Rotation des sessions / tokens.
   - CSRF tokens si formulaires cross-site.

5. **Étendre les tests**
   - Scénarios API (login, invitations, permissions, events, recommendations).

---

## Conclusion
Les fondations sont **globalement solides** (stack, modèle de données, auth, validation, audit). Le principal enjeu est maintenant de **compléter la couverture API** et de **durcir la sécurité/permissions** pour accompagner la montée en charge.

---

## Fichiers observés (exemples)
- `prisma/schema.prisma`
- `lib/auth.ts`
- `lib/validation.ts`
- `app/api/auth/*`
- `app/api/admin/*`
- `app/api/events/*`
- `app/api/recommendations/*`

