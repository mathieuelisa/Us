---
title: Plan d'action de développement — US
---

# Plan d'action de développement

> Découpage technique en phases. Chaque phase alimente une version précise
> du [Plan de versionning](./03-VERSIONING.md) — voir le tableau de
> correspondance en bas de ce document. S'appuie sur le
> [Design Overview](./01-DESIGN-OVERVIEW.md) pour le contenu fonctionnel et
> sur [l'Architecture](./04-ARCHITECTURE.md) pour les choix techniques.

## Phase 0 — Socle technique (aucune feature visible)

Objectif : avoir un projet qui compile, se lint, se déploie sur device, et
qui parle à Supabase — avant d'écrire le moindre écran métier.

- [ ] Scaffold Expo + TypeScript strict + Expo Router
- [ ] Intégration Hero UI Native (thème de base, couleur de marque `#2D5E5A`)
- [ ] Configuration Biome (lint + format) + pre-commit hook
- [ ] Projet Supabase créé, client configuré, script `db:types` (génération des types TS)
- [ ] Auth Supabase par magic link fonctionnelle (écran 1a minimal, sans le reste de l'onboarding)
- [ ] Setup TanStack Query (queryClient, provider, conventions de query keys)
- [ ] Setup Jotai (atoms globaux : rôle courant, session)
- [ ] CI minimale (lint + typecheck sur PR)

## Phase 1 — Onboarding, hub, et les 3 piliers gratuits (→ MVP)

Construire dans l'ordre du parcours utilisateur réel, pas dans l'ordre des
sections du design :

1. **Onboarding complet** (écrans 1a → 1f, 1y) — formulaire multi-étapes
   avec TanStack Form, état d'avancement en Jotai, persistance finale en
   Supabase (`households`, `pregnancies`, `onboarding_answers`)
2. **Écran 1g (paywall)** — affiché mais désactivé, cf. [MVP.md](./versions/MVP.md)
3. **Hub d'accueil** (2a, 2b) — lecture des sections disponibles selon l'état du household
4. **Invitation partenaire** (2d) — génération de lien/code, rattachement au household
5. **Pilier Ensemble** (section 3 complète) — check-in humeur, overlay besoin,
   geste du jour, profil, infos importantes (⚠️ RLS stricte dès le départ,
   ne pas la reporter)
6. **Pilier Suivi santé** (section 4 complète) — journal, rendez-vous,
   contacts, exercices (contenu exercices seedé en base ou en fichier statique — à trancher avant de coder l'écran)
7. **Pilier Démarches** (section 5 complète) — référentiel de démarches
   françaises à seeder (déclaration naissance, CAF, sécu, mutuelle, congé,
   mode de garde), logique de deadline
8. **Aujourd'hui** (section 6) — vue résumé cross-pilier, référentiel "taille du bébé par semaine"

## Phase 2 — Déclaration de naissance & durcissement MVP

- [ ] Écran 7a + logique de recalcul des échéances de démarches à la
      confirmation de naissance (c'est l'événement pivot le plus délicat du
      MVP — à tester avec des dates limites, fuseaux horaires, etc.)
- [ ] Réglages MVP (compte, langue FR seule, infos importantes, aide & support, légal)
- [ ] Demande d'avis MVP (stockage du feedback, sans store review natif)
- [ ] Passage complet des critères de sortie de [MVP.md](./versions/MVP.md)
- [ ] Tests device réels iOS + Android (pas seulement simulateur)

**Livrable de fin de Phase 2 : [MVP](./versions/MVP.md) prêt à shipper.**

## Phase 3 — Paiement & module "Votre bébé" (→ V1)

- [ ] Décision + intégration du provider de paiement (RevenueCat recommandé,
      cf. [Architecture](./04-ARCHITECTURE.md#stack))
- [ ] Écran 1g/paywall rendu fonctionnel (achat, restauration, code promo)
- [ ] Système de favoris (8y, 8a) — liste ordonnée, activable/désactivable
- [ ] Écran principal bébé (8b) + les 5 modules (croissance, biberon,
      allaitement, bain, sommeil/couche/visite médecin selon favoris)
- [ ] Vérification serveur du statut premium (jamais uniquement client-side)

## Phase 4 — Notifications push réelles (→ V1)

- [ ] Infrastructure Expo Notifications (tokens, permissions)
- [ ] Scheduler backend (Supabase Edge Functions + cron, ou service dédié)
- [ ] Câblage des 3 familles de notifications déjà maquettées : rappel de
      démarche (5c), geste du jour (3f), réassurance symptôme (4d)

**Livrable de fin de Phase 4 : [V1](./versions/V1.md) prêt à shipper.**

## Phase 5 — Finitions & rétention (→ V2)

- [ ] Localisation anglaise (extraction des chaînes FR en cours de route dès Phase 1 pour éviter un gros chantier ici)
- [ ] Thème sombre + couleurs d'accent (réglages 10a)
- [ ] Export de données utilisateur
- [ ] Store review natif (SKStoreReviewController / Android In-App Review)
- [ ] Realtime Supabase pour la synchro couple si les retours utilisateurs le justifient

**Livrable de fin de Phase 5 : [V2](./versions/V2.md) prêt à shipper.**

## Correspondance phases ↔ versions

| Phase | Version livrée |
|---|---|
| 0 | — (socle) |
| 1, 2 | [MVP](./versions/MVP.md) |
| 3, 4 | [V1](./versions/V1.md) |
| 5 | [V2](./versions/V2.md) |

## Recommandation de séquencement pour l'agent qui implémente

Ne pas commencer par "Implémenter US Hi-Fi.dc.html" au sens littéral (rejouer
chaque écran dans l'ordre du design). Commencer par la Phase 0, puis suivre
l'ordre du parcours utilisateur de la Phase 1 — c'est l'ordre qui permet de
tester l'app de bout en bout au plus tôt, plutôt que de construire section
par section sans pouvoir naviguer entre elles.
