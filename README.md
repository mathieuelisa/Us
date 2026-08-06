# US

Application mobile Expo / React Native / TypeScript pour couples pendant la
grossesse et les premiers mois du bébé.

> La documentation complète (design, plan d'action, versioning,
> architecture) vit dans [`DOCS/`](./DOCS/README.md) — à lire avant toute
> implémentation de feature.

## Stack

- [Expo](https://expo.dev) + React Native + TypeScript strict + Expo Router
- [Supabase](https://supabase.com) (Auth, Postgres, RLS, Storage, Edge Functions)
- TanStack Query (données serveur) / TanStack Form (formulaires) / Jotai (état UI éphémère)
- Hero UI Native (composants)
- Biome (lint + format)
- Bun (gestionnaire de paquets)

## Prérequis

- [Bun](https://bun.sh) `1.3.11` (voir `packageManager` dans `package.json`)
- Node `>= 24.19.0`
- Un compte et un projet [Supabase](https://supabase.com)

## Démarrage

```bash
bun install
cp .env.example .env
# renseigner EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY
# (Project Settings > API sur supabase.com)

bun run start
```

Puis lancer sur iOS, Android ou Web :

```bash
bun run ios
bun run android
bun run web
```

## Scripts utiles

| Commande            | Description                                      |
| ------------------- | ------------------------------------------------- |
| `bun run start`      | Démarre le serveur de dev Expo                    |
| `bun run lint`       | Vérifie le code avec Biome                        |
| `bun run lint:fix`   | Corrige automatiquement ce qui peut l'être         |
| `bun run format`     | Formate le code avec Biome                         |
| `bun run typecheck`  | Vérifie les types TypeScript (`tsc --noEmit`)      |
| `bun run db:start`   | Démarre Supabase en local (nécessite Docker)       |
| `bun run db:types`   | Régénère les types TypeScript depuis le schéma DB  |

## Base de données

Le schéma Supabase (tables, RLS) est versionné sous forme de migrations SQL
dans [`supabase/migrations/`](./supabase/migrations/), cataloguées dans
[`DOCS/migrations/README.md`](./DOCS/migrations/README.md). Pour pousser les
migrations vers le projet distant :

```bash
bunx supabase login
bunx supabase link --project-ref <project-ref>
bunx supabase db push
```

## Documentation

Voir [`DOCS/README.md`](./DOCS/README.md) pour l'index complet : concept
produit, synthèse du design, plan d'action, versioning et architecture
technique.
