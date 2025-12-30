# Cahier des charges fonctionnel V1 — Application **Business Sud de France**
**Version :** 1.0 (V1/MVP)  
**Date :** 2025-12-30  
**Rôle rédacteur :** Product Owner + Business Analyst senior  
**Cible :** Équipe projet (Chef de projet, Front/Back, QA)  
**Contraintes techniques :** GitHub (code) • Vercel (déploiement) • Neon Postgres (DB) • Mobile-first (PWA responsive recommandée) • IA : **Gemini-3-Flash**

---

## Glossaire (normalisation des termes)
- **Membre** : personne appartenant au réseau (fiche annuaire). Peut exister **sans compte** (import, coordonnées incomplètes).
- **Utilisateur** : membre disposant d’un **compte** permettant de se connecter et d’agir.
- **Profil** : informations modifiables d’un utilisateur (coordonnées, adresse url profil linkedin, photo, bio, loisirs…).
- **Annuaire** : liste consultable des membres (fiches) avec recherche/filtre.
- **Recommandation** : action par laquelle un utilisateur (**émetteur**) recommande un **contact recommandé** à un **destinataire** (membre du réseau), avec un texte.
- **Contact recommandé** : personne externe au réseau (prospect/partenaire) décrite au minimum par nom/prénom.
- **Destinataire** : membre/utilisateur à qui la recommandation est adressée.
- **Statut de recommandation** : suivi (reçue → en cours / abandonnée / validée + CA).
- **Événement** : activité proposée à tout le réseau (apéro, rando…) avec date/lieu/inscription.
- **Activité entre membres** : activité “réalisée” entre 2 membres (ex : squash), déclarée par A avec B, sans doublon réciproque.

---

## 1) Résumé exécutif (≤ 10 lignes)
Application mobile-first pour fédérer les membres, faciliter les mises en relation et mesurer l’activité (recommandations, événements). V1 concentre : annuaire importé, comptes/roles, profils + loisirs, création & suivi de recommandations avec relance à J+30, événements simples, classements. Notifications **in-app** en V1, extension **push/email** en V2. IA générative (Gemini-3-Flash) en V1 pour améliorer la rédaction des recommandations (assistée, optionnelle, sans stockage de données sensibles). Déploiement sur Vercel, données sur Neon Postgres, code versionné GitHub. MVP pragmatique, extensible V2 (activités entre membres, anti-spam avancé, analytics, push natif, modération, imports récurrents).

### Périmètre MVP vs V2
| Module | MVP (V1) | V2 (évolution) |
|---|---|---|
| Plateforme | **PWA responsive** (mobile-first) déployée Vercel, Neon Postgres | App mobile native/hybride si besoin (Flutter/React Native) + stores |
| Auth / rôles | RBAC 3 rôles, invitation, profil | SSO/LinkedIn, gestion équipes/chapitres |
| Annuaire | Import Excel initial + recherche/filtre, fiche membre | Import incrémental, enrichissement, tags, export |
| Recommandations | Création + notif in-app, suivi J+30, CA si validée | Workflow avancé, pièces jointes, commentaires, relances multiples |
| Loisirs | Catalogue + niveau + consultation | Matching automatique, suggestions de mises en relation |
| Événements | Création + diffusion + inscription simple | Billetterie, listes d’attente, check-in, récurrence |
| Leaderboards | Top donneurs/receveurs/organisateurs (total + mensuel) | Pondérations, anti-spam avancé, badges |
| Activités entre membres | **V2 recommandée** | Historique, validation par l’autre membre |
| Notifications | In-app (MVP), préférences basiques | Push + email, digest hebdo, centre de notif |
| IA | Reformulation/suggestions du texte | Ton par persona, résumé, extraction champs contact |

---

## 2) Personas / acteurs + hypothèses clés
### Acteurs
- **Super Admin** : paramétrage global, création admins/utilisateurs, import annuaire.
- **Admin** : création/invitation utilisateurs, support.
- **Utilisateur** : consulte annuaire, gère profil + loisirs, crée recommandations & événements, reçoit notifications.
- **Membre non connecté** : visible dans l’annuaire (selon RGPD), peut être invité à créer un compte.

### Hypothèses clés (à valider)
1. **Mobile-first** : V1 en **PWA responsive** suffit (rapidité + compatibilité Vercel/Neon).
2. **Auth** : connexion **par email** (magic link/OTP) en V1 ; membres sans email = “en attente”.
3. **Données sensibles** : IA ne reçoit que le texte (éviter PII et données client sensibles).
4. **Relance J+30** : via **Vercel Cron** (batch quotidien) + pop-up au prochain login si besoin.
5. **Annuaire & RGPD** : visibilité coordonnées/loisirs contrôlée par consentement.

---

## 3) Parcours utilisateurs (6)
### P1 — Onboarding / connexion
1. Invitation (email) → lien de connexion.
2. Connexion (magic link/OTP) → acceptation CGU + consentements.
3. Complétion profil (email/tél manquants).
4. Préférences notifications (MVP : in-app activé par défaut).

### P2 — Consultation annuaire + recherche
1. Accès onglet Annuaire.
2. Recherche + filtres (loisirs, etc.).
3. Ouverture fiche membre (champs selon RGPD).
4. Action rapide : “Recommander un contact à ce membre”.

### P3 — Création recommandation + notification
1. “Nouvelle recommandation”.
2. Saisie contact recommandé.
3. Choix destinataire (liste déroulante).
4. Rédaction texte + option IA “Améliorer mon texte”.
5. Envoi → notif in-app destinataire.

### P4 — Suivi à 30 jours + saisie CA
1. À J+30 : notification + pop-up au destinataire.
2. Choix statut : en cours / abandonnée / validée.
3. Si validée : saisie CA.
4. Notif in-app à l’émetteur (statut + CA si validée).

### P5 — Loisirs (édition + consultation)
1. Onglet Loisirs → sélection + niveau.
2. Consultation sur fiches membres + filtre annuaire.

### P6 — Création événement + diffusion
1. Création événement (titre/date/lieu/desc…).
2. Publication → visible à tous + notif in-app.
3. Inscription (oui/non).

---

## 4) Exigences fonctionnelles (FR-xxx)

> **Règle de présentation** : pour chaque FR → **Description** • **Règles métiers** • **Champs de données** • **États** • **Erreurs/edge cases**

### A. Auth / comptes / rôles
**FR-001 — Authentification email (magic link/OTP)**  
- Description : connexion via email (lien unique ou OTP).  
- Règles : email unique ; expiration 15 min ; limitation tentatives.  
- Données : email, otp_hash, otp_expire_at, last_login_at.  
- États : Non inscrit / Invité / Actif / Désactivé.  
- Edge : email manquant → compte non activable ; cooldown après trop d’essais.

**FR-002 — Invitation utilisateur**  
- Description : Admin/Super Admin invite un membre à activer son compte.  
- Règles : invitation seulement si email présent ; token unique expirant.  
- Données : invite_token_hash, invite_sent_at, invite_expire_at, accepted_at.  
- États : Envoyée / Acceptée / Expirée.  
- Edge : renvoi invitation ; email invalide.

**FR-003 — RBAC (Super Admin / Admin / User)**  
- Description : permissions selon rôle.  
- Règles : rôle assigné par Admin/Super Admin ; interdiction d’auto-promotion.  
- Données : role (ENUM).  
- États : n/a.  
- Edge : tentative accès interdit → 403 + log.

**FR-004 — Gestion des comptes (activation/désactivation)**  
- Description : Admin/Super Admin désactive un utilisateur.  
- Règles : désactivation bloque connexion ; conserve historique.  
- Données : is_active, deactivated_at, deactivated_by.  
- États : Actif / Désactivé.  
- Edge : utilisateur désactivé organisateur → événements restent visibles.

**FR-005 — Gestion du profil utilisateur**  
- Description : user modifie coordonnées et infos publiques.  
- Règles : email unique ; téléphone format E.164 (ou validation locale FR).  
- Données : firstname, lastname, company, email, phone, linkedin_url, photo_url, bio.  
- États : Profil complet / incomplet.  
- Edge : changement email → re-vérification.

**FR-006 — Import annuaire depuis Excel (administration)**  
- Description : Super Admin importe Excel (nom, prénom, société, email, téléphone, linkedin_url).  
- Règles : mapping colonnes ; dédoublonnage (email prioritaire sinon nom+prénom+société).  
- Données : import_batch_id, source_row, import_errors.  
- États : En cours / Terminé / Terminé avec erreurs.  
- Edge : colonnes manquantes ; lignes vides ; emails dupliqués.

### B. Annuaire
**FR-007 — Affichage annuaire (liste paginée)**  
- Description : liste des membres mobile-first.  
- Règles : pagination/scroll infini ; tri par nom.  
- Données : member_id, firstname, lastname, company, linkedin_url, flags visibilité.  
- États : n/a.  
- Edge : fiches incomplètes affichées.

**FR-008 — Recherche multi-champs**  
- Description : recherche par nom/prénom/société.  
- Règles : insensible à la casse et accents.  
- Données : query.  
- États : n/a.  
- Edge : performance → indexation/FTS.

**FR-009 — Fiche membre**  
- Description : affichage détail membre.  
- Règles : coordonnées/loisirs selon consentement + rôle.  
- Données : coordonnées, loisirs.  
- États : Visible / Masqué (si suppression).  
- Edge : membre sans compte → pas d’actions privées.

**FR-010 — Complétion coordonnées manquantes**  
- Description : l’utilisateur complète email/tél.  
- Règles : validations + unicité email.  
- Données : email, phone.  
- États : Incomplet → Complet.  
- Edge : email déjà pris → message clair.

### C. Recommandations
**FR-011 — Création recommandation**  
- Description : créer reco (contact recommandé + destinataire + texte).  
- Règles : destinataire ≠ émetteur ; texte min 40 caractères ; plafond X/j (ex 10).  
- Données : sender_user_id, recipient_member_id, text, created_at.  
- États : Envoyée.  
- Edge : destinataire sans compte → notif stockée.

**FR-012 — Contact recommandé (données)**  
- Description : saisir contact recommandé.  
- Règles : nom+prénom requis ; coordonnées optionnelles selon politique RGPD.  
- Données : rec_firstname, rec_lastname, rec_company?, rec_email?, rec_phone?.  
- États : n/a.  
- Edge : si politique interdit PII → champs désactivés et rejet serveur si fournis.

**FR-013 — Envoi et horodatage**  
- Description : à l’envoi, figer texte et horodater.  
- Règles : reco envoyée non éditable (sauf admin).  
- Données : sent_at, received_at (=sent_at).  
- États : Envoyée / Reçue.  
- Edge : échec notif → retry.

**FR-014 — Consultation recos reçues / envoyées**  
- Description : écrans “reçues” et “envoyées”.  
- Règles : filtres par statut et période.  
- Données : status, dates, CA.  
- États : Reçue / En cours / Abandonnée / Validée.  
- Edge : membre supprimé → libellé “indisponible”.

**FR-015 — Relance automatique à J+30**  
- Description : demander le statut au destinataire à J+30.  
- Règles : cron quotidien ; une relance unique MVP ; pop-up au login si non répondu.  
- Données : followup_due_at, followup_sent_at.  
- États : À relancer / Relancé / Répondu.  
- Edge : destinataire inactif → relance au prochain accès.

**FR-016 — Mise à jour statut recommandation**  
- Description : destinataire renseigne statut.  
- Règles : seul destinataire modifie ; historisation des changements.  
- Données : status, status_updated_at, status_updated_by, history.  
- États : En cours / Abandonnée / Validée.  
- Edge : multiples changements → conserver historique.

**FR-017 — Saisie CA si “Validée”**  
- Description : saisir CA si validée.  
- Règles : montant ≥ 0 ; devise EUR par défaut ; date validation.  
- Données : revenue_amount, revenue_currency, revenue_date.  
- États : Validée (avec CA).  
- Edge : CA inconnu → autoriser 0 + champ “à compléter” (option).

### D. Notifications
**FR-018 — Notification in-app à l’envoi**  
- Description : notif destinataire à l’envoi d’une reco.  
- Règles : notification créée au send.  
- Données : type=RECO_RECEIVED, payload.  
- États : Non lue / Lue.  
- Edge : destinataire sans compte → stocker en attente.

**FR-019 — Centre de notifications**  
- Description : liste notifs (90 jours).  
- Règles : marquer lu, tout marquer lu.  
- Données : created_at, read_at.  
- États : Lu / Non lu.  
- Edge : purge/archivage.

**FR-020 — Préférences notifications (MVP)**  
- Description : activer/désactiver certains types (in-app critique forcé).  
- Règles : reco reçue + relance J+30 non désactivables.  
- Données : prefs JSON (type/canal).  
- États : n/a.  
- Edge : préférence off vs critique → forcer.

### E. Loisirs
**FR-021 — Catalogue loisirs administrable**  
- Description : liste de loisirs gérée par Admin/Super Admin.  
- Règles : ajouter/masquer ; pas de suppression dure.  
- Données : hobby_id, label, is_active.  
- États : Actif / Masqué.  
- Edge : loisir masqué conserve historiques.

**FR-022 — Échelle niveau loisir (proposée)**  
- Description : niveau 4 paliers.  
- Règles : 0 Pas intéressé / 1 Curieux / 2 Pratiquant / 3 Passionné.  
- Données : level (0..3).  
- États : n/a.  
- Edge : niveau non renseigné → “non indiqué”.

**FR-023 — Édition loisirs par l’utilisateur**  
- Description : sélection loisirs + niveau.  
- Règles : max 20 loisirs ; pas de doublon.  
- Données : user_id, hobby_id, level, updated_at.  
- États : n/a.  
- Edge : offline → sauvegarde au retour réseau (si PWA).

**FR-024 — Consultation loisirs sur fiche membre**  
- Description : afficher loisirs (si consentement).  
- Règles : contrôle via consent_share_hobbies.  
- Données : share_hobbies.  
- États : Visible / Masqué.  
- Edge : masqué → “non partagé”.

**FR-025 — Filtre annuaire par loisir**  
- Description : filtrer annuaire par loisir (+ niveau min option).  
- Règles : multi-sélection.  
- Données : hobby_id[], min_level?.  
- États : n/a.  
- Edge : aucun résultat → message.

### F. Événements
**FR-026 — Création d’événement**  
- Description : tout user crée un événement.  
- Règles : titre requis ; date future ; lieu requis.  
- Données : title, type, start_at, location, description, capacity?.  
- États : Publié / Annulé.  
- Edge : date passée → erreur.

**FR-027 — Diffusion événement à tous**  
- Description : publication visible à tous + notif in-app.  
- Règles : notif type EVENT_PUBLISHED.  
- Données : notif payload (titre/date).  
- États : n/a.  
- Edge : gros volume → insertion batch.

**FR-028 — Liste événements (à venir / passés)**  
- Description : vues “À venir” et “Passés”.  
- Règles : tri par start_at.  
- Données : start_at.  
- États : n/a.  
- Edge : fuseau horaire configurable (défaut Europe/Paris).

**FR-029 — Inscription à un événement (RSVP)**  
- Description : inscription oui/non + commentaire optionnel.  
- Règles : capacité si renseignée ; empêcher double.  
- Données : rsvp_status (GOING/NOT_GOING), rsvp_at, comment?.  
- États : Inscrit / Désinscrit.  
- Edge : capacité atteinte → blocage (V2: liste d’attente).

**FR-030 — Annulation / modification événement**  
- Description : créateur modifie/annule.  
- Règles : MVP notif annulation ; V2 notif modification aux inscrits.  
- Données : updated_at, canceled_at.  
- États : Publié / Annulé.  
- Edge : annulation conserve historique.

### G. Leaderboards
**FR-031 — Leaderboard recommandations données**  
- Description : classement par nb reco envoyées.  
- Règles : total + mensuel ; exclure brouillons ; anti-spam minimal.  
- Données : count_sent_total, count_sent_month.  
- États : n/a.  
- Edge : égalités (cf section 8).

**FR-032 — Leaderboard recommandations reçues**  
- Description : classement par nb reco reçues.  
- Règles : basé sur recipient_member_id (même sans compte).  
- Données : count_received_total, count_received_month.  
- États : n/a.  
- Edge : visibilité selon RGPD/paramètres.

**FR-033 — Leaderboard événements créés**  
- Description : classement par nb événements publiés.  
- Règles : exclure annulés.  
- Données : count_events_total, count_events_month.  
- États : n/a.  
- Edge : événements tests (V2) : marquer “privé”.

**FR-034 — Écran leaderboards**  
- Description : onglet classements + filtres période.  
- Règles : top 10 + position utilisateur.  
- Données : leaderboard_type, period.  
- États : n/a.  
- Edge : faible volume → afficher quand même.

### H. Activités entre membres (V2 recommandée)
**FR-035 — Déclaration d’une activité entre membres (V2)**  
- Description : A enregistre “activité X avec B” (date).  
- Règles : anti-doublon réciproque : (A,B,type,date) unique et interdit (B,A,type,date).  
- Données : actor_user_id, partner_member_id, activity_type, occurred_on.  
- États : Déclarée.  
- Edge : A=B interdit ; partenaire sans compte OK.

**FR-036 — Consultation historique activités (V2)**  
- Description : historique des activités.  
- Règles : filtres type/date.  
- Données : liste activités.  
- États : n/a.  
- Edge : membre supprimé → anonymisation.

### I. IA (Gemini-3-Flash)
**FR-037 — Bouton “Améliorer mon texte”**  
- Description : reformulation IA du texte de reco.  
- Règles : opt-in ; 2–3 variantes ; l’utilisateur choisit ou ignore.  
- Données : input_text, ai_suggestions[] (non persistées par défaut).  
- États : n/a.  
- Edge : IA indisponible → fallback.

**FR-038 — Garde-fous IA**  
- Description : prévention données sensibles + ton pro.  
- Règles : avertissement UI ; détection basique email/tél → alerte (soft).  
- Données : safety_flags.  
- États : n/a.  
- Edge : contenu refusé → message + recommandations.

---

## 5) Matrice des permissions
| Action | Super Admin | Admin | User |
|---|:---:|:---:|:---:|
| Import Excel annuaire | ✅ | ❌ | ❌ |
| Créer un Admin | ✅ | ❌ | ❌ |
| Créer / inviter un utilisateur | ✅ | ✅ | ❌ |
| Désactiver un compte | ✅ | ✅ | ❌ |
| Modifier son profil | ✅ | ✅ | ✅ |
| Modifier profil d’un autre | ✅ | ✅ | ❌ |
| Consulter annuaire / rechercher | ✅ | ✅ | ✅ |
| Créer une recommandation | ✅ | ✅ | ✅ |
| Voir recommandations reçues | ✅ | ✅ | ✅ |
| Changer statut reco (destinataire) | ✅ | ✅ | ✅ (si destinataire) |
| Saisir CA (destinataire) | ✅ | ✅ | ✅ (si destinataire) |
| Gérer catalogue loisirs | ✅ | ✅ | ❌ |
| Éditer ses loisirs | ✅ | ✅ | ✅ |
| Créer événement | ✅ | ✅ | ✅ |
| Modifier/annuler son événement | ✅ | ✅ | ✅ |
| Accéder leaderboards | ✅ | ✅ | ✅ |
| (V2) Déclarer activité entre membres | ✅ | ✅ | ✅ |

---

## 6) Matrice notifications (MVP)
> MVP : **In-app** (push/email en V2)

| Déclencheur | Destinataire | Canal MVP | Contenu attendu | Préférences |
|---|---|---|---|---|
| Reco envoyée | Destinataire | In-app | “Nouvelle recommandation de {Prénom Nom}” + lien | In-app forcé |
| Relance J+30 | Destinataire | In-app + pop-up | “Indiquez le statut” + CTA | In-app forcé |
| Statut mis à jour | Émetteur | In-app | “Statut : {statut}” (+ CA si validée) | Désactivable |
| Événement publié | Tous | In-app | “Nouvel événement : {titre} le {date}” | Désactivable |
| Événement annulé | Inscrits | In-app | “Événement annulé : {titre}” | In-app forcé |
| Invitation compte | Invité | Email | Lien/OTP + instructions | n/a |

---

## 7) Modèle de données (niveau fonctionnel)

### Entités & attributs
- **Member** : member_id (PK), firstname, lastname, company, email?, phone?, linkedin_url?, created_at, updated_at, consent_share_contact(bool), consent_share_hobbies(bool), linked_user_id?(FK)
- **User** : user_id (PK), member_id (FK unique), role(ENUM), is_active, auth_email(unique), email_verified_at, last_login_at, created_at, updated_at
- **Invitation** : invitation_id, email, member_id?, role, token_hash, sent_at, expire_at, accepted_at
- **Recommendation** : reco_id, sender_user_id(FK), recipient_member_id(FK), rec_contact_firstname, rec_contact_lastname, rec_contact_company?, rec_contact_email?, rec_contact_phone?, text, sent_at, followup_due_at, followup_sent_at, status(ENUM), status_updated_at, revenue_amount?, revenue_currency?, revenue_date?, created_at, updated_at
- **RecommendationStatusHistory** : id, reco_id(FK), old_status, new_status, changed_by_user_id, changed_at
- **Notification** : notif_id, recipient_user_id(FK), type(ENUM), payload(JSON), created_at, read_at?
- **Hobby** : hobby_id, label, is_active, created_at
- **UserHobby** : user_id(FK), hobby_id(FK), level(0..3), updated_at (PK composite user_id+hobby_id)
- **Event** : event_id, created_by_user_id(FK), title, type, start_at, location, description, capacity?, status(PUBLISHED/CANCELED), created_at, updated_at
- **EventRsvp** : event_id(FK), user_id(FK), rsvp_status(GOING/NOT_GOING), rsvp_at, comment? (PK composite event_id+user_id)
- **(Option) LeaderboardSnapshot** : id, period, type, entries(JSON), generated_at
- **(V2) MemberActivity** : activity_id, actor_user_id(FK), partner_member_id(FK), activity_type, occurred_on, created_at

### Relations (texte type ERD)
- Member 1—0..1 User  
- User 1—N Recommendation (sender)  
- Member 1—N Recommendation (recipient)  
- Recommendation 1—N RecommendationStatusHistory  
- User 1—N Notification  
- User N—N Hobby (via UserHobby)  
- User 1—N Event  
- Event 1—N EventRsvp  

### Contraintes clés
- User.auth_email unique ; Member.email unique si présent (nullable).  
- Recommandation : émetteur ≠ destinataire (même member_id).  
- Statuts : Recommendation.status ∈ {SENT, IN_PROGRESS, ABANDONED, VALIDATED}.  
- followup_due_at = sent_at + 30 jours.  
- Historique de statut conservé.  
- Soft-delete recommandé (deleted_at) pour RGPD.  
- (V2) activités : unicité anti-doublon sur paire non ordonnée + type + date.

---

## 8) Règles leaderboards (calcul, périodes, égalités, anti-spam)

### Périodes
- **TOTAL** : depuis lancement  
- **MENSUEL** : mois civil en cours (Europe/Paris par défaut)

### Formules (MVP)
- **Top donneurs** = COUNT(Recommendation) par sender_user_id sur période (status ≠ brouillon).  
- **Top receveurs** = COUNT(Recommendation) par recipient_member_id sur période.  
- **Top créateurs d’événements** = COUNT(Event) par created_by_user_id sur période (status=PUBLISHED).  

### Égalités (tie-break)
1. Nb de **validées** (si calculable facilement)  
2. Sinon date la plus récente (sent_at/created_at)  
3. Sinon ordre alphabétique (lastname)

### Anti-spam minimal (MVP)
- Plafond recommandations/jour (ex 10)  
- Texte min 40 caractères  
- Blocage répétition exacte (hash) sur 24h  
- Interdiction auto-recommandation  
- (V2) pondération par statut + badges

---

## 9) IA (V1) — Gemini-3-Flash

### Cas d’usage
- Reformulation “pro, claire, actionnable” du texte de recommandation
- 2–3 variantes : courte / standard / détaillée

### Limites
- Pas d’enrichissement automatique des contacts
- Pas de vérification “vérité”
- Pas de mémorisation des suggestions par défaut

### Prompts internes (proposition)
- **System** : “Tu es un assistant de rédaction professionnel. Tu reformules sans inventer de faits.”  
- **User** : “Reformule ce message en français professionnel, ton chaleureux, avec intro + contexte + action attendue. Texte : {TEXT}”  
- Variante : “Propose 3 versions (60/120/180 mots).”

### Sécurité / RGPD
- Avertissement UI : “Ne mettez pas de données sensibles (IBAN, santé, infos confidentielles client).”
- Option admin : interdire stockage email/tél du contact recommandé
- Détection basique de PII → alerte (soft warning)

### UX
- Bouton : “✨ Améliorer mon texte”  
- Résultat : 3 suggestions + “Utiliser cette version”  
- Fallback : message d’erreur + conservation du texte

---

## 10) Exigences non-fonctionnelles

### Contraintes techniques
- **NF-001** : code sur GitHub (PR, revue, releases)  
- **NF-002** : déploiement Vercel (dev/staging/prod)  
- **NF-003** : Neon Postgres (migrations, pooling, sauvegardes)  
- **NF-004** : compatibilité mobile (PWA responsive, Add to Home Screen)

### RGPD (obligatoire)
- **NF-005 — Consentements** : visibilité coordonnées + loisirs (opt-in, modifiable)  
- **NF-006 — Export** : export des données utilisateur (CSV/JSON) (MVP si possible, sinon V2 cadrée)  
- **NF-007 — Suppression** : suppression compte → anonymisation historique (reco/events) + suppression coordonnées  
- **NF-008 — Minimisation** : option admin pour interdire stockage coordonnées du contact recommandé

### Sécurité
- **NF-009** : RBAC strict côté API + UI  
- **NF-010** : logs/audit actions admin (import, gestion comptes)  
- **NF-011** : rate limiting auth + endpoints sensibles ; validation serveur

### Performance / disponibilité
- **NF-012** : annuaire < 2s sur 4G (1ère page), pagination  
- **NF-013** : index DB sur recherches/tri  
- **NF-014** : sauvegardes Neon + procédure de restore testée

---

## 11) Checklist validation + risques + décisions

### Critères d’acceptation globaux
1. Import Excel avec rapport d’erreurs par ligne.
2. Connexion email OK ; RBAC vérifiable.
3. Annuaire consultable + recherche + fiche conforme RGPD.
4. Création reco + notif in-app destinataire.
5. Relance J+30 + pop-up tant que statut non renseigné.
6. Statut modifiable uniquement par destinataire ; CA requis si validée.
7. Loisirs : catalogue + niveaux + filtre annuaire.
8. Événements : création, publication, inscription, annulation.
9. Leaderboards : total + mensuel, égalités gérées, anti-spam actif.
10. IA : bouton, 3 variantes, fallback.
11. RGPD : consentements + suppression/anonymisation (+ export si MVP).
12. Déploiement Vercel + Neon opérationnel, logs admin disponibles.

### Risques
- **R1** : emails manquants → onboarding incomplet (adoption).
- **R2** : RGPD PII (coordonnées + contacts recommandés) → minimisation stricte.
- **R3** : cron J+30 → dette opérationnelle si mal paramétré.
- **R4** : gaming leaderboards → garde-fous nécessaires dès V1.
- **R5** : limites PWA (push iOS/UX) → V2 native si besoin.

### Décisions à trancher (structurantes)
1. Auth : email-only V1 (recommandé) vs SMS.
2. Visibilité annuaire : coordonnées visibles par défaut ou opt-in strict.
3. Stockage PII contact recommandé : autorisé ou interdit.
4. Notifications : in-app MVP vs push/email dès V1.
5. Activités entre membres : V2 (recommandée) ou MVP.
6. Leaderboard : simple counts MVP vs pondération (validée + CA) en V2.

---

**Fin du document.**
