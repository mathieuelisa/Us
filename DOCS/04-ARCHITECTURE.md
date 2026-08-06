---
title: Architecture technique — US
---

# Architecture technique

> Conventions de la stack. Référencé par le [Plan d'action](./02-ACTION-PLAN.md) —
> chaque phase du plan doit respecter ces choix, sauf décision explicite de les faire évoluer.

## Stack

| Domaine | Choix |
|---|---|
| Framework app | Expo (React Native), TypeScript strict |
| Navigation | Expo Router (file-based) |
| UI Kit | Hero UI Native |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions, Realtime) |
| Données serveur / cache | TanStack Query |
| Formulaires | TanStack Form |
| État client global | Jotai |
| Lint / format | Biome |
| Paiement premium | À trancher en phase MVP+1 (RevenueCat recommandé pour achat unique + restauration cross-plateforme) |
| Notifications push | Expo Notifications + Supabase Edge Functions (scheduling) |

## Répartition des responsabilités d'état

- **TanStack Query** : toute donnée qui vit côté serveur (Supabase) — `households`, `pregnancies`, `appointments`, `procedures`, `baby_*`, `mood_checkins`, etc. Pas de duplication manuelle dans Jotai.
- **Jotai** : état UI éphémère et transverse — rôle actif de l'utilisateur (enceinte/partenaire), thème/couleur d'accent en cours d'édition, état d'un formulaire multi-étapes (onboarding) avant soumission, état d'ouverture des bottom sheets.
- **TanStack Form** : tous les formulaires (onboarding multi-étapes, ajout RDV, ajout mesure/biberon/bain, profil, réglages).

Règle simple : si la donnée doit survivre à un redémarrage de l'app ou être partagée entre utilisateurs → Supabase + TanStack Query. Sinon → Jotai.

## Thématisation par rôle

Le design distingue systématiquement le fond "vue personne enceinte" (`#EAF5F0`)
du fond "vue partenaire" (`#FDF6E3`). À implémenter comme un **thème dérivé du
rôle courant** (atom Jotai `currentRoleAtom`), pas comme des écrans dupliqués.
Un seul jeu de composants d'écran, qui lisent la couleur de fond depuis le
thème actif.

## Modules applicatifs proposés (arborescence)

```
app/
  (auth)/                  # login, magic link
  (onboarding)/            # étapes 1a → 1g
  (tabs)/
    index/                 # Hub d'accueil (2b)
    ensemble/              # pilier 3
    sante/                 # pilier 4
    demarches/             # pilier 5
    aujourdhui/             # pilier 6
    bebe/                  # pilier 8 (premium)
    profil/                # 3y
    reglages/              # 10a
  naissance/               # 7a déclaration de naissance
features/
  onboarding/
  ensemble/
  sante/
  demarches/
  bebe/
  paywall/
  notifications/
lib/
  supabase/                # client + types générés
  query/                   # queryClient, query keys
  atoms/                   # atoms Jotai globaux
components/                # composants Hero UI Native partagés
```

## Supabase — points de vigilance

- **RLS** : chaque table métier scoped par `household_id`, policy `auth.uid() in (select user_id from household_members where household_id = ...)`.
- **Données de santé** (`important_info`, `symptoms_log`) : policies encore plus restrictives, envisager une table séparée avec accès audité.
- **Types générés** : utiliser `supabase gen types typescript` pour garder les types Postgres synchronisés avec le code TS — commande à intégrer dans un script `pnpm db:types`.
- **Realtime** : utile pour la synchro couple (check-in humeur vu par l'autre en direct, badge "2 démarches en attente") — activer sur les tables concernées uniquement.

## Qualité

- Biome pour lint + format (remplace ESLint/Prettier), configuré en pre-commit.
- TypeScript strict activé dès le scaffold initial (pas de relâchement progressif).
