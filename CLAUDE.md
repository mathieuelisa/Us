# CLAUDE.md

Ce fichier guide Claude Code (et tout agent compatible) sur ce dépôt.

## Projet

**US** — application mobile Expo / React Native / TypeScript pour couples
pendant la grossesse et les premiers mois du bébé. Voir
[`DOCS/README.md`](./DOCS/README.md) pour l'index complet de la
documentation (design, plan d'action, versionning, architecture).

**Avant toute implémentation de feature**, lire dans l'ordre :

1. [`DOCS/01-DESIGN-OVERVIEW.md`](./DOCS/01-DESIGN-OVERVIEW.md) — ce que montrent les maquettes
2. [`DOCS/02-ACTION-PLAN.md`](./DOCS/02-ACTION-PLAN.md) — la phase en cours
3. [`DOCS/04-ARCHITECTURE.md`](./DOCS/04-ARCHITECTURE.md) — les conventions à respecter
4. [`DOCS/03-VERSIONING.md`](./DOCS/03-VERSIONING.md) et [`DOCS/versions/`](./DOCS/versions/) — le périmètre exact de la version en cours (MVP/V1/V2)

## Design source

Les maquettes originales (export Claude Design) sont dans
[`design/onboarding-parental-us/`](./design/onboarding-parental-us/). Le
fichier `project/US Hi-Fi.dc.html` est la référence Hi-Fi. Les fichiers
`ios-frame.jsx` / `support.js` / `image-slot.js` sont des outils de rendu du
prototype (device frame HTML) — **ne pas les copier tels quels dans le code
de l'app**, ils servent uniquement à visualiser les maquettes.

Objectif : recréer le rendu visuel des maquettes fidèlement en React Native
avec Hero UI Native, pas reproduire la structure HTML/CSS du prototype.

## Stack (voir DOCS/04-ARCHITECTURE.md pour le détail)

- Expo + React Native + TypeScript strict + Expo Router
- Supabase (Auth, Postgres, RLS, Storage, Edge Functions)
- TanStack Query (données serveur) / TanStack Form (formulaires) / Jotai (état UI éphémère)
- Hero UI Native (composants)
- Biome (lint + format)

## Règles spécifiques à ce projet

- Ne pas commencer par ré-implémenter les écrans dans l'ordre du design.
  Suivre l'ordre du parcours utilisateur défini dans le plan d'action
  (onboarding → hub → 3 piliers gratuits en premier).
- Le module "Votre bébé" (premium) et le paiement sont **hors périmètre
  MVP** — voir [`DOCS/versions/MVP.md`](./DOCS/versions/MVP.md) avant d'y
  toucher.
- Les écrans changent de fond/contenu selon le rôle (personne
  enceinte/partenaire) — traiter ça comme un thème dérivé du rôle courant,
  pas comme des écrans dupliqués (détail dans `DOCS/04-ARCHITECTURE.md`).
- Toute table touchant des données de santé (`important_info`,
  `symptoms_log`) doit avoir une policy RLS Supabase revue explicitement, ne
  jamais la reporter "pour plus tard".
- Si une ambiguïté apparaît dans le design (comportement non spécifié), la
  signaler et demander confirmation avant d'implémenter — ne pas deviner
  silencieusement (cf. recommandation du bundle de handoff Claude Design).
