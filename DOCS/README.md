# Documentation — US

App mobile Expo / React Native / TypeScript / Supabase / Hero UI Native /
TanStack Query / TanStack Form / Jotai / Biome, pour couples pendant la
grossesse et les premiers mois du bébé.

## Sommaire

0. [Concept produit](./CONCEPT.md) — référence produit prioritaire (règles de visibilité par rôle, structure du hub, etc.)
1. [Synthèse du design](./01-DESIGN-OVERVIEW.md) — ce que contiennent les maquettes Claude Design (10 sections, ~45 écrans), modèle de données inféré
2. [Plan d'action de développement](./02-ACTION-PLAN.md) — découpage en phases techniques
3. [Plan de versionning](./03-VERSIONING.md) — MVP → V1 → V2, et convention pour les versions suivantes
4. [Architecture technique](./04-ARCHITECTURE.md) — stack, conventions d'état, arborescence, Supabase
5. [Dette et points ouverts](./05-DETTE-ET-POINTS-OUVERTS.md) — contournements temporaires, vérifications jamais faites, décisions prises par défaut. **À relire avant chaque jalon**

Le contenu détaillé de chaque version livrable vit dans [`versions/`](./versions/) :
[MVP](./versions/MVP.md), [V1](./versions/V1.md), [V2](./versions/V2.md).

Le catalogue des migrations SQL (schéma Supabase, RLS) vit dans
[`migrations/README.md`](./migrations/README.md).

## Comment ces documents se relient

- Le **Design Overview** est la source de vérité fonctionnelle (ce que montrent les maquettes).
- Le **Plan d'action** traduit le design en phases de construction techniques.
- Le **Plan de versionning** regroupe ces phases en versions livrables (MVP/V1/V2), avec un tableau de correspondance explicite dans les deux sens.
- L'**Architecture** encadre les choix techniques que le plan d'action doit respecter.

Si l'un de ces documents change (ex : une phase est retardée), vérifier
l'impact sur les autres — ils sont volontairement croisés pour éviter les
dérives silencieuses entre "ce qu'on construit" et "ce qu'on annonce livrer".

## Design source

Les fichiers originaux exportés depuis Claude Design sont conservés dans
[`../design/onboarding-parental-us/`](../design/onboarding-parental-us/) :
`US Hi-Fi.dc.html` (maquettes Hi-Fi, référence principale), `Onboarding US
Wireframes.dc.html` (wireframes antérieurs), et les scripts d'assistance du
prototype (`ios-frame.jsx`, `support.js`, `image-slot.js` — outils de rendu
du prototype, pas du code à réutiliser tel quel).
