# Instructions GitHub Copilot — US

Projet : app mobile Expo / React Native / TypeScript / Supabase / Hero UI
Native / TanStack Query / TanStack Form / Jotai / Biome.

Documentation complète avant toute suggestion de code non triviale :
[`DOCS/README.md`](../DOCS/README.md) (design, plan d'action, versionning,
architecture). Design source : [`design/onboarding-parental-us/`](../design/onboarding-parental-us/).

## Conventions à respecter dans les suggestions

- TypeScript strict, pas de `any`
- État serveur → TanStack Query. État UI éphémère (rôle courant, brouillon
  d'onboarding) → Jotai. Formulaires → état React contrôlé (`useState`),
  TanStack Form étant suspendu (cf. architecture). Ne pas mélanger.
- Composants : briques maison de `src/components/ui/` d'abord (cf.
  architecture, « Design system interne »), Hero UI Native en appoint
- Toute requête Supabase touchant des données de couple/santé doit passer
  par une policy RLS scoped `household_id` — ne jamais suggérer un accès
  non filtré
- Respecter le découpage de version en cours : le module premium "Votre
  bébé" et le paiement sont hors MVP (voir `DOCS/versions/MVP.md`) — ne pas
  suggérer leur implémentation avant que le MVP soit marqué complet
- Lint/format via Biome, pas ESLint/Prettier

Détail complet des conventions : [`DOCS/04-ARCHITECTURE.md`](../DOCS/04-ARCHITECTURE.md).
