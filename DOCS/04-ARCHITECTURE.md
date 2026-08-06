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
| Styles / theming | Tailwind v4 via [Uniwind](https://docs.uniwind.dev) — Hero UI Native est bâti dessus, `className` sur les composants plutôt que `StyleSheet.create` pour tout ce que le kit ne fournit pas déjà |
| Gestionnaire de paquets | npm |

L'app vit sous `src/` (convention du scaffold Expo par défaut : `src/app`,
`src/components`, `src/constants`, `src/hooks`, `src/lib`) plutôt qu'à la
racine du repo — la racine reste réservée à la config (`app.json`,
`biome.json`, `metro.config.js`, `tsconfig.json`, `DOCS/`, `design/`, `supabase/`).

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
src/
  app/
    (auth)/                  # login, magic link
    (onboarding)/            # étapes 1a → 1g
    (tabs)/
      index/                 # Hub d'accueil (2b)
      ensemble/              # pilier 3
      sante/                 # pilier 4
      demarches/             # pilier 5
      aujourdhui/            # pilier 6
      bebe/                  # pilier 8 (premium)
      profil/                # 3y — onglet "User"
      informations/          # 3z — onglet "Information" (infos importantes)
      reglages/              # 10a — onglet "Setting"
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
    supabase/                # client + types générés (database.types.ts)
    query/                   # queryClient, query keys
    atoms/                   # atoms Jotai globaux (session, rôle)
  components/                # composants Hero UI Native partagés
```

Posé en Phase 0 : `src/lib/supabase/client.ts`, `src/lib/query/query-client.ts`
+ `keys.ts`, `src/lib/atoms/session.ts` + `role.ts`. Le reste de l'arborescence
(`features/`, les onglets du hub) se construit au fil de la Phase 1.

## Supabase — points de vigilance

- **RLS** : chaque table métier scoped par `household_id`, policy `auth.uid() in (select user_id from household_members where household_id = ...)`.
- **Données de santé** (`important_info`, `symptoms_log`) : policies encore plus restrictives, envisager une table séparée avec accès audité.
- **Types générés** : `npm run db:types` (= `supabase gen types typescript --local --schema public > src/lib/supabase/database.types.ts`). Nécessite le stack Supabase local (`npm run db:start`, requiert Docker) ou un projet lié (`supabase link`).
- **CLI** : `supabase/config.toml` posé en Phase 0 via `supabase init`. **La création du projet Supabase cloud (compte, URL, clé anon) reste une étape manuelle utilisateur** — copier `.env.example` en `.env` et renseigner `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > API sur supabase.com). Sans ça, `src/lib/supabase/client.ts` fonctionne avec des valeurs placeholder (l'app se lance, les appels Supabase échoueront).

### Stratégie de synchronisation temps réel (décision Phase 0)

`CONCEPT.md` impose un seul jeu de données par couple, à jour "sans étape de
synchronisation visible" pour les deux parents. Décision : **TanStack Query
seul suffit pour le MVP**, pas de souscription Supabase Realtime dès la
Phase 0/1.

- TanStack Query avec `refetchOnWindowFocus`/`refetchOnReconnect` (actifs par
  défaut) + invalidation ciblée après chaque mutation (check-in humeur,
  changement de statut de démarche, création de rendez-vous) couvre le besoin
  réel : l'autre parent voit la donnée à jour en rouvrant/revenant sur l'écran,
  ce qui correspond à l'usage d'une app mobile (pas un dashboard temps réel
  permanent à l'écran).
- **Supabase Realtime** (souscription websocket par table) est réservé aux
  surfaces où un utilisateur peut raisonnablement avoir l'écran ouvert pendant
  que l'autre agit (ex. badge "2 démarches en attente" sur le hub) — à activer
  au cas par cas en Phase 1+ si l'expérience TanStack Query seule s'avère
  insuffisante à l'usage, pas par défaut sur toutes les tables.
- Ce choix est réversible : la convention de `query/keys.ts` (une clé par
  domaine) permet d'ajouter une souscription Realtime qui appelle
  `queryClient.invalidateQueries` sans changer la forme des données consommées
  par les écrans.

## Qualité

- Biome pour lint + format (remplace ESLint/Prettier), configuré en pre-commit.
- TypeScript strict activé dès le scaffold initial (pas de relâchement progressif).
