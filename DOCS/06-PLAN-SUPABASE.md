---
title: Plan d'action Supabase — US
---

# Plan d'action Supabase

> Tout ce qui reste à faire côté Supabase (base, règles d'accès, Auth,
> Edge Functions, Storage, Cron, Realtime) pour passer d'une app vérifiée en
> mode contournement DEV à une app qui tourne sur de vraies données — puis
> pour porter le premium et les notifications de la V1.
>
> Établi le 2026-11-11 après analyse complète du code et du projet cloud.
> Complète le [plan d'action général](./02-ACTION-PLAN.md) (phases produit)
> et renvoie à la [dette](./05-DETTE-ET-POINTS-OUVERTS.md) par numéro. Le
> schéma existant est catalogué dans [`migrations/README.md`](./migrations/README.md).

## Décisions prises (2026-11-11)

| # | Question | Décision |
|---|---|---|
| D1 | Le premium s'achète par personne ou par foyer ? | **Par foyer** : un achat débloque les deux parents. Le droit est porté par le foyer, pas par le compte. |
| D2 | Exercices et astuces du jour passent-ils en base pour le MVP ? | **Non, plus tard.** Le catalogue d'exercices (`EXERCISE_CATALOG`) et les astuces restent dans l'app pour l'instant. Le passage en base (et les illustrations dans Storage) est repoussé au [lot 6](#lot-6--plus-tard). |
| D3 | Le co-parent peut-il créer des rendez-vous ? | **Oui.** Les deux parents créent des rendez-vous. Voir [lot 3](#lot-3--compléments-mvp) pour la règle de visibilité qui en découle. |
| D4 | Qui voit un rendez-vous non partagé ? | **Son créateur seul**, quel que soit son rôle. Seul le créateur modifie ou supprime. |
| D5 | Comment se connecte-t-on ? | **Email + mot de passe, ou Google.** Le lien magique est abandonné (écart avec CONCEPT.md, dette n°58). |
| D6 | Que fait l'invitation du co-parent sans lien magique ? | **Elle enregistre l'adresse, sans email.** Le co-parent s'inscrit avec cette adresse et rejoint le foyer une fois son email confirmé. |
| D7 | Que contient le compte dans Réglages ? | Email et moyen de connexion, **changement de mot de passe**, **suppression du compte**. |

## Principes

- **Une migration par changement**, dans `supabase/migrations/`, jamais de
  modification directe dans le dashboard. Chaque migration est ajoutée au
  [catalogue](./migrations/README.md) dans le même commit.
- **RLS dans la même migration que la table**, jamais « pour plus tard » —
  règle de [CLAUDE.md](../CLAUDE.md), stricte pour toute donnée de santé.
- **Types régénérés après chaque `db push`** (`bun run db:types`), jamais
  édités à la main.
- **Projet à Paris (`eu-west-3`)** et rien hors UE : les Edge Functions
  tournent sur l'infrastructure Supabase, les services tiers (SMTP,
  RevenueCat, Expo Push) doivent être documentés comme sous-traitants.
- **Sécurité vérifiée par l'outil, pas seulement relue** : advisors de
  sécurité Supabase sans avertissement et tests RLS au vert avant chaque
  livraison.

## Fait le 2026-11-11

- Les 2 migrations en retard appliquées, plus 4 nouvelles : durcissement de
  sécurité (dont email confirmé exigé pour rejoindre un foyer), rendez-vous
  créés par les deux parents (D3, D4), mois de grossesse des démarches,
  émoji des gestes. Versions recalées : dépôt et cloud identiques.
- Types régénérés depuis le cloud, code de l'app adapté (Démarches,
  Ensemble, Rendez-vous, invitation sans email, exemples fictifs limités
  au mode DEV, état vide des Informations).
- Connexion/inscription par email + mot de passe et Google, mot de passe
  oublié, section Compte des Réglages (D5, D7).
- Edge Function `delete-account` déployée.
- Vérifié : règles des rendez-vous et rattachement du co-parent par
  simulation SQL annulée ; advisors de sécurité propres hors exceptions
  voulues ; fonction de suppression refusant un appel sans session.

**Reste à faire dans le dashboard** (le MCP Supabase n'a pas accès aux
réglages Auth) : activer Google (identifiants OAuth Google Cloud),
réactiver « Confirm email » avant production (désactivé pour les tests,
dette n°60), vérifier la longueur minimale des mots de passe (8),
activer si possible la protection contre les mots de passe compromis,
configurer le SMTP. Détail dans l'[architecture](./04-ARCHITECTURE.md#connexion--email--mot-de-passe-google).

## État des lieux (avant la mise à jour du 2026-11-11)

| Élément | État |
|---|---|
| Projet | `hsclyntlnoyevstdhgvu`, Paris. Ancien projet de Londres encore présent (dette n°4) |
| Tables | 16 en ligne, toutes avec RLS. 2 migrations du dépôt **non appliquées** (dette n°49) |
| Référentiels | Remplis : 8 démarches, 8 gestes, 30 articles de valise, 4 exercices, 9 tailles de bébé (semaines 8, 12… 40) |
| Données réelles | 2 comptes, **0 foyer** : aucun onboarding n'a été terminé pour de vrai (dette n°5) |
| Auth | Lien magique, service email mutualisé de Supabase, modèle en anglais, URL de redirection de développement ouvertes |
| Edge Functions, Storage, Cron, Realtime | Rien |
| Sécurité | 5 fonctions `SECURITY DEFINER` exécutables via l'API (dette n°50) |
| Tests | Aucun test des règles d'accès |

## Vue d'ensemble

| Lot | Contenu | Version | Prérequis |
|---|---|---|---|
| [0](#lot-0--remettre-le-projet-cloud-à-niveau) | Remettre le projet cloud à niveau et le sécuriser | MVP | — |
| [1](#lot-1--pouvoir-tester-sur-de-vraies-données) | Pouvoir tester sur de vraies données | MVP | Lot 0 |
| [2](#lot-2--tests-automatisés-des-règles-daccès) | Tests automatisés des règles d'accès | MVP | Lot 0 |
| [3](#lot-3--compléments-mvp) | Compléments MVP (rendez-vous à deux, invitation, avis, RGPD, suppression de compte) | MVP | Lots 1 et 2 |
| [4](#lot-4--premium-par-foyer-et-module-votre-bébé) | Premium par foyer, module « Votre bébé », match des prénoms | V1 | Lot 3 |
| [5](#lot-5--notifications-push) | Notifications push | V1 | Lot 3 |
| [6](#lot-6--plus-tard) | Plus tard : exercices et astuces en base, Realtime, export, photos | V1/V2 | — |

Les lots 1 et 2 peuvent avancer en parallèle une fois le lot 0 fait.

---

## Lot 0 — Remettre le projet cloud à niveau

Objectif : que la base en ligne corresponde au dépôt et ne présente plus
d'avertissement de sécurité. Petit, mais tout le reste en dépend.

- [x] **Appliquer les 2 migrations manquantes** (`bunx supabase db push`) :
      `20260814130000_household_info_items_blood_type` et
      `20260829120000_household_custom_checklist_items`. Vérifier ensuite
      avec `bunx supabase migration list`. → dette n°49
- [x] **Régénérer les types** (`bun run db:types`) et vérifier que le diff
      est vide ou attendu.
- [x] **Durcir les fonctions `SECURITY DEFINER`** (nouvelle migration) →
      dette n°50 :
  - `revoke execute ... from public, anon, authenticated` sur les fonctions
    de trigger : `handle_new_user`, `create_default_household_procedures`,
    `create_default_household_checklist_items` (un trigger n'a pas besoin
    de ce droit pour s'exécuter) ;
  - `revoke execute ... from public, anon` sur `is_household_member`,
    `household_role`, `accept_household_invite`, en gardant
    `authenticated` (les policies RLS et le rattachement du co-parent en
    ont besoin). Conséquence attendue : une requête anonyme sur une table
    protégée échouera (« permission denied ») au lieu de renvoyer une liste
    vide — sans effet sur l'app, qui n'interroge jamais ces tables sans
    session, mais à couvrir par les tests du lot 2 ;
  - relancer les advisors de sécurité : il ne doit rester que
    l'avertissement voulu sur `accept_household_invite` (porte d'entrée
    documentée du co-parent), ceux sur `is_household_member` /
    `household_role` (nécessaires aux policies) et celui sur les mots de
    passe compromis — **à traiter** depuis le passage au mot de passe
    (réglage du dashboard).
- [ ] **Supprimer l'ancien projet de Londres** et renommer « US app (Paris) »
      en « US app ». → dette n°4
- [ ] **Vérification CI des types** : ajouter une étape qui échoue si
      `database.types.ts` ne correspond pas aux migrations (génération
      depuis un Supabase local démarré dans la CI, puis `git diff
      --exit-code`). Évite que la dette n°49 se reproduise.

**Terminé quand** : `migration list` identique entre dépôt et cloud, advisors
de sécurité propres (hors exceptions documentées), types à jour.

## Lot 1 — Pouvoir tester sur de vraies données

Objectif : remplacer le mode contournement DEV par de vrais comptes, pour
que toutes les vérifications « jamais faites » (dette n°5, 21, 43, 51, 52)
puissent enfin l'être.

- [ ] **SMTP personnalisé** (Brevo recommandé : société française, données en
      UE, 300 emails/jour gratuits) — nécessite un nom de domaine pour
      SPF/DKIM. Débloque l'envoi réel des liens et des invitations.
      → dette n°8
- [ ] **Modèles d'email en français** (confirmation d'inscription,
      réinitialisation du mot de passe), au ton de l'app. → dette n°9
- [ ] **Réglages Auth du dashboard** : activer Google (dette n°56),
      réactiver « Confirm email » (dette n°60), vérifier la longueur
      minimale (8), protection
      contre les mots de passe compromis.
- [ ] **Jeu de données local** (`supabase/seed.sql`) pour le Supabase local :
      deux comptes de test (personne enceinte, co-parent), un foyer complet
      avec date de terme, quelques humeurs, symptômes, rendez-vous (partagés
      et non partagés), contacts et informations. Permet de tester chaque
      rôle sans email ni contournement.
- [x] **Retirer les données fictives de l'app** (`MOCK_APPOINTMENTS`,
      `MOCK_INFO_ITEMS`) au profit de vrais états vides — sans quoi un
      foyer réel verrait de faux rendez-vous et un faux groupe sanguin.
      Changement côté app, mais préalable à tout test réel. Fait : elles ne
      s'affichent plus qu'en mode contournement DEV.
- [ ] **Parcours de bout en bout sur le cloud**, avec deux vrais comptes :
      inscription, onboarding, création du foyer (vérifier que les triggers
      ont bien créé 8 démarches et les articles de valise), invitation,
      rattachement du co-parent, puis une écriture dans chaque pilier
      (humeur, symptôme, rendez-vous, démarche, valise, information,
      déclaration de naissance). Noter chaque résultat dans la dette.
- [ ] **Retours d'Auth par URL** (Google, confirmation d'email,
      réinitialisation) testés depuis un simulateur et un appareil réel.
      → dette n°6
- [ ] **Retirer le mode contournement DEV** une fois ce parcours validé.
      → dette n°1

**Terminé quand** : un couple réel termine l'onboarding et se rattache, et
chaque écran a lu et écrit au moins une fois dans Supabase.

## Lot 2 — Tests automatisés des règles d'accès

Objectif : que les règles de visibilité par rôle (les plus sensibles du MVP)
soient prouvées par des tests, pas seulement relues — demande explicite de
la Phase 2 du plan d'action.

- [ ] **Tests SQL avec pgTAP** dans `supabase/tests/`, lancés par
      `bunx supabase test db` sur le Supabase local.
- [ ] **Scénarios minimum**, chacun avec deux foyers pour vérifier
      l'étanchéité :

| Table | À prouver |
|---|---|
| Toutes | Un membre d'un foyer A ne lit, n'écrit, ne modifie ni ne supprime **rien** du foyer B ; un utilisateur non connecté ne voit rien |
| `symptoms_log` | La personne enceinte écrit ; le co-parent lit mais ne peut ni écrire ni modifier |
| `appointments` | Règle du lot 3 : chacun voit les siens et ceux que l'autre a partagés, jamais un rendez-vous non partagé de l'autre |
| `profiles` | On lit son profil et celui de son co-parent, on ne modifie que le sien (thème personnel) |
| `household_invites` / `accept_household_invite()` | Seule la personne invitée (email vérifié) rejoint ; impossible de rejoindre un foyer qui a déjà un co-parent |
| `household_procedures`, `household_checklist_items` | Mise à jour par les deux membres, aucune insertion côté client |
| `app_feedback` | Chacun ne lit que ses propres retours |

- [ ] **Exécution en CI** : démarrer le Supabase local dans GitHub Actions
      (Docker est disponible sur les runners), appliquer les migrations,
      lancer les tests.

**Terminé quand** : la suite tourne en CI et couvre chaque table du tableau.

## Lot 3 — Compléments MVP

Objectif : combler ce qui manque côté serveur pour les critères de sortie du
[MVP](./versions/MVP.md).

### Rendez-vous créés par les deux parents (D3)

Avant le 2026-11-11, seule la personne enceinte créait, modifiait et
supprimait ; elle voyait tout, le co-parent ne voyait que les rendez-vous
partagés. Règle en place depuis (D3, D4), **symétrique** :

| Action | Règle |
|---|---|
| Lire | Membre du foyer **et** (créateur du rendez-vous **ou** rendez-vous partagé) |
| Créer | Membre du foyer, `created_by` = soi-même |
| Modifier / supprimer | Le créateur seulement |

La personne enceinte ne voit donc plus les rendez-vous non partagés du
co-parent (choix confirmé, D4).

- [x] Migration `20261111120100_appointments_both_parents` (policies
      réécrites par `alter policy`, sans suppression).
- [x] App : formulaire et bouton d'ajout pour les deux rôles ; croix de
      suppression et badge « Partagé / Non partagé » sur ses propres
      rendez-vous, badge « De votre co-parent » sur ceux de l'autre.
- [x] App : **modification d'un rendez-vous** — toucher un de ses
      rendez-vous ouvre la feuille pré-remplie (« Enregistrer les
      modifications », « Supprimer »), sur la policy existante.
- [ ] Tests RLS du lot 2 mis à jour.

### Invitation du co-parent après l'onboarding

- [x] L'invitation n'envoie plus d'email (D6) : elle enregistre l'adresse,
      le co-parent s'inscrit avec. `accept_household_invite()` exige un
      email confirmé.
- [ ] Permettre d'envoyer ou de renvoyer l'invitation depuis le hub (bouton
      « Ajouter le co-parent ») : la table `household_invites` et
      `invitePartner()` existent, il manque le point d'entrée. → dette n°31
- [ ] **Email d'invitation personnalisé** (« Camille vous invite à
      rejoindre US ») : Edge Function `send-invite` qui crée l'invitation
      et envoie l'email via le SMTP du lot 1, plutôt que le lien de
      connexion standard.
- [ ] Trancher le texte de « Comment ça marche ? », qui décrit un code à
      6 chiffres et un QR code inexistants. → dette n°31

### Demande d'avis

- [ ] Brancher l'écran (bannière + note 5 étoiles) sur la table
      `app_feedback`, qui existe déjà avec ses policies.

### Consentement RGPD (données de santé)

- [ ] Table `consents` : `user_id`, type (`health_data`, `terms`), version
      du texte, date d'acceptation, date de retrait. RLS : chacun lit et
      écrit les siens uniquement.
- [ ] Recueillir le consentement explicite **avant** toute saisie de donnée
      de santé (Journal, informations importantes, humeur). Textes
      juridiques à faire rédiger. → dette n°3

### Suppression de compte

- [x] Edge Function `delete-account` (clé de service, jamais dans l'app),
      déployée le 2026-11-11, appelée depuis Réglages avec une
      confirmation qui explique les conséquences.
- [ ] **À trancher** : aujourd'hui, supprimer le compte de la personne
      enceinte supprime tout le foyer, co-parent compris (cascade) ; faut-il
      plutôt le transférer au co-parent ? → dette n°59

### Nettoyage du schéma

- [x] `procedure_templates.pregnancy_month` : sortir du code la
      correspondance démarche → mois (`PROCEDURE_PREGNANCY_MONTH`).
- [x] `gesture_suggestions.emoji` : remplacer l'association par texte
      exact.
- [ ] `baby_size_by_week` : compléter les semaines manquantes (aujourd'hui
      9 lignes, une toutes les 4 semaines).
- [ ] Décider du sort de `contacts.role_label` (plus rempli depuis le retrait
      du champ), `household_info_items.sort_order` (plus utilisé) et
      `exercises.image_url`.

**Terminé quand** : les deux parents créent des rendez-vous selon la règle
validée, l'invitation peut partir après l'onboarding, le consentement est
enregistré, un compte peut être supprimé, et les tests du lot 2 passent.

## Lot 4 — Premium par foyer et module Votre bébé

Objectif : rendre le premium réel et vérifié côté serveur, puis persister
le module bébé. Correspond à la Phase 3 du plan d'action (→ [V1](./versions/V1.md)).

### Droit premium (D1 : par foyer)

- [ ] Table `household_entitlements` : `household_id` (unique), produit,
      source (`revenuecat`, `promo`), date d'achat, date d'expiration
      éventuelle. **Aucune écriture depuis l'app** : lecture seule pour les
      membres du foyer.
- [ ] Fonction `has_premium(household_id)` (`stable`, `security definer`,
      `search_path` figé, exécutable par `authenticated` seulement) —
      utilisée par les policies des tables premium.
- [ ] Edge Function `revenuecat-webhook` : vérifie le secret du webhook,
      rattache l'achat au foyer de l'acheteur, écrit
      `household_entitlements`. L'identifiant envoyé à RevenueCat doit être
      celui du **foyer**, pour que la restauration d'achat fonctionne
      depuis le téléphone de l'un ou l'autre parent.
- [ ] Codes promo : ligne `source = 'promo'`, créée par une Edge Function
      qui valide le code.
- [ ] App : remplacer le paywall inerte par l'achat réel, et ne plus ouvrir
      les suivis bébé sans droit premium. → dette n°53

### Suivis bébé

Une table par suivi, calquée sur les champs déjà définis dans
`BABY_MODULES` (`features/baby/constants.ts`) :

| Table | Colonnes métier |
|---|---|
| `baby_growth_measurements` | date, taille (cm), poids (kg), périmètre crânien (cm) — au moins une des trois |
| `baby_feedings` | date, heure, type de lait (maternel / infantile), quantité (ml), commentaire |
| `baby_breastfeeding_sessions` | date, heure, sein (gauche / droit), durée (secondes) |
| `baby_care_events` | date, heure, type (bain / soins), commentaire |

Colonnes communes : `id`, `household_id`, `created_by`, `created_at`.
Policies : membre du foyer **et** `has_premium(household_id)`, en lecture
comme en écriture — les deux parents saisissent indifféremment (CONCEPT.md).

- [ ] Migration des 4 tables + policies + index (`household_id`, date).
- [ ] Table `household_baby_favorites` : modules choisis et leur ordre
      (écrans 8y/8a). Les favoris « sommeil », « couche », « visite
      médecin » restent à confirmer avant d'avoir leurs tables.
- [ ] Courbe de croissance : lecture simple de `baby_growth_measurements`,
      pas de calcul serveur nécessaire.

### Match des prénoms

- [ ] `baby_name_catalog` : référentiel (prénom, genre), lisible par tous,
      rempli par migration.
- [ ] `baby_name_votes` : `household_id`, `user_id`, prénom, aimé ou non.
      Chacun ne lit que **ses** votes, pour ne pas influencer l'autre.
- [ ] Fonction `get_name_matches(household_id)` (`security definer`) :
      renvoie uniquement les prénoms aimés par **les deux** parents — la
      seule façon de révéler un match sans exposer les votes de l'autre.
- [ ] Favoris : colonne sur `baby_name_votes` ou table dédiée, à trancher
      avec le design.

**Terminé quand** : un achat sur un téléphone débloque les deux parents,
les suivis persistent et sont refusés sans premium (prouvé par des tests
RLS), les matchs ne révèlent que les prénoms aimés par les deux.

## Lot 5 — Notifications push

Objectif : des notifications réellement envoyées (Phase 4 du plan d'action,
→ V1).

- [ ] Table `push_tokens` : `user_id`, token Expo, plateforme, date de
      dernière activité. RLS : chacun gère les siens.
- [ ] Le rythme est déjà choisi à l'onboarding
      (`households.reminder_frequency`) : vérifier s'il doit devenir
      personnel (`profiles`) plutôt que commun au foyer.
- [ ] Edge Function `send-notifications` : calcule ce qui est à envoyer et
      appelle l'API Expo Push ; nettoie les tokens invalides.
- [ ] Planification avec **Supabase Cron** (`pg_cron` + `pg_net`) qui
      appelle la fonction chaque jour.
- [ ] Premiers déclencheurs :
  - rappel de démarche (5c) — lit `household_procedures.reminder_enabled`,
    aujourd'hui sans effet (dette n°33) ;
  - geste du jour après plusieurs humeurs difficiles (3f) — branche
    `countTrailingDifficultMoodDays()`, aujourd'hui non appelé (dette n°25) ;
  - réassurance après un symptôme (4d).
- [ ] Table `notification_log` pour ne jamais envoyer deux fois la même
      notification et pour respecter le rythme choisi.

**Terminé quand** : une notification de rappel de démarche arrive sur un
appareil réel, et aucune n'est envoyée en double.

## Lot 6 — Plus tard

À planifier selon les retours d'usage.

- **Exercices en base** (D2) : compléter `exercises` (slug, durée, zone,
  description, étapes, trimestre) à partir d'`EXERCISE_CATALOG`, et mettre
  les illustrations dans un **bucket Storage public** en lecture seule. À
  faire relire par un professionnel de santé avant (dette n°47). → dette
  n°37, n°46
- **Astuces du jour en base** (D2) : table `daily_tips` (rôle, semaine ou
  mois de grossesse, texte). → dette n°29
- **Realtime** : abonnements ciblés (humeur du partenaire sur le hub,
  statuts de démarches, cases des valises) qui invalident le cache TanStack
  Query — seulement si l'actualisation à l'ouverture d'écran ne suffit pas
  à l'usage (cf. [architecture](./04-ARCHITECTURE.md#stratégie-de-synchronisation-temps-réel-décision-phase-0)).
- **Export des données** (V2) : Edge Function qui assemble toutes les
  données du foyer de l'utilisateur.
- **Photos** (profil, bébé) : bucket Storage **privé** par foyer, policies
  basées sur le chemin (`<household_id>/…`).
- **Statistiques d'usage** pour préparer la V2, sans donnée de santé.

## Avant la mise en production

Récapitulatif des réglages Supabase à faire au dernier moment :

- [ ] URL de redirection réduites à `us://**` (+ domaine web réel). → dette n°2
- [ ] Consentement, politique de confidentialité, durées de conservation, DPA
      Supabase signé. → dette n°3
- [ ] Advisors de sécurité et de performance relus.
- [ ] Sauvegardes : vérifier le plan (les sauvegardes quotidiennes et la
      restauration à un instant donné dépendent de l'offre Supabase).
- [ ] Tests RLS au vert en CI.
