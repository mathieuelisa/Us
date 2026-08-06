# AGENTS.md

Instructions pour les agents de codage (OpenAI Codex, et tout agent lisant
ce standard) travaillant sur ce dépôt.

## Projet

**US** — application mobile Expo / React Native / TypeScript / Supabase /
Hero UI Native / TanStack Query / TanStack Form / Jotai / Biome, pour couples
pendant la grossesse et les premiers mois du bébé.

Documentation complète : [`DOCS/README.md`](./DOCS/README.md).

## À lire avant de coder

1. [`DOCS/01-DESIGN-OVERVIEW.md`](./DOCS/01-DESIGN-OVERVIEW.md) — fonctionnel, écrans, modèle de données
2. [`DOCS/02-ACTION-PLAN.md`](./DOCS/02-ACTION-PLAN.md) — phases de construction
3. [`DOCS/04-ARCHITECTURE.md`](./DOCS/04-ARCHITECTURE.md) — conventions techniques obligatoires
4. [`DOCS/versions/`](./DOCS/versions/) — périmètre exact de la version en cours (MVP.md en premier)

Le design source (export Claude Design) est dans
[`design/onboarding-parental-us/`](./design/onboarding-parental-us/) —
`project/US Hi-Fi.dc.html` est la référence Hi-Fi à recréer visuellement en
React Native, pas à copier tel quel (c'est du HTML/CSS de prototype).

## Conventions de code

- TypeScript strict partout, pas de `any` non justifié
- Biome pour lint/format — lancer `biome check --write` avant de considérer une tâche terminée
- Composants UI via Hero UI Native, pas de styles inline dupliquant ce que le kit fournit déjà
- État serveur → TanStack Query uniquement. État UI éphémère → Jotai. Formulaires → TanStack Form.
- Toute nouvelle table Supabase doit avoir sa policy RLS écrite dans le même changement, jamais différée

## Commandes

Gestionnaire de paquets : **bun** (`.nvmrc` pointe la version Node LTS à
utiliser en parallèle — bun gère les paquets, certains sous-processus
d'Expo/Metro s'appuient encore sur Node).

```
bun install
bun run lint        # biome check .
bun run lint:fix    # biome check --write .
bun run typecheck   # tsc --noEmit
bun run start        # expo start
bun run db:start     # supabase start (local, requiert Docker)
bun run db:types     # régénère src/lib/supabase/database.types.ts
```

Copier `.env.example` en `.env` et renseigner les clés Supabase avant de
tester l'auth (magic link) ou toute requête réseau — voir
[`DOCS/04-ARCHITECTURE.md`](./DOCS/04-ARCHITECTURE.md#supabase--points-de-vigilance).

## Périmètre

Ne pas implémenter le module premium "Votre bébé" ni l'intégration de
paiement tant que [`DOCS/versions/MVP.md`](./DOCS/versions/MVP.md) n'est pas
entièrement coché — ces éléments appartiennent à
[`DOCS/versions/V1.md`](./DOCS/versions/V1.md).

En cas d'ambiguïté sur un comportement du design, demander confirmation
plutôt que de deviner.
