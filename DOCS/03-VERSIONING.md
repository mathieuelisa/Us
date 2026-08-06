---
title: Plan de versionning — US
---

# Plan de versionning

> Ce document définit **comment** on découpe les livraisons. Le contenu
> détaillé de chaque version vit dans [`versions/`](./versions/). Ce plan est
> le pendant "quoi livrer et quand" du [Plan d'action](./02-ACTION-PLAN.md),
> qui est le pendant "comment on construit techniquement". Le contenu
> fonctionnel des deux documents s'appuie sur [`CONCEPT.md`](./CONCEPT.md)
> (référence produit prioritaire) et sur le
> [Design Overview](./01-DESIGN-OVERVIEW.md) pour le détail visuel des écrans.

## Convention de nommage

```
DOCS/versions/
  MVP.md   — première version livrée (parcours gratuit complet)
  V1.md    — premier palier payant (premium + module bébé)
  V2.md    — finitions & rétention (i18n, thèmes, reviews natives)
  V3.md, V4.md, ... — versions suivantes, même gabarit (pattern "VX.md")
```

Chaque fichier de version suit le même gabarit :

1. **Contenu ajouté** — mappé aux sections du [Design Overview](./01-DESIGN-OVERVIEW.md)
2. **Hors périmètre explicite** — ce qu'on reporte volontairement, et à quelle version
3. **Prérequis techniques** — dépendances d'infra/tooling à poser avant de coder les features
4. **Critères de sortie** — Definition of Done vérifiable, pas des vœux pieux
5. **Suite** — lien vers la version suivante

## Pourquoi ce découpage (MVP → V1 → V2)

Le design couvre 10 sections dont une seule (section 8, "Votre bébé") est
premium et dont deux (paiement, notifications push réelles) demandent une
infrastructure back-end non-triviale (RevenueCat/StoreKit, scheduler de
notifications). Séparer MVP et V1 permet de :

- valider la boucle de valeur gratuite (couple + grossesse) avant d'investir
  dans le paiement et le tracking bébé,
- éviter de bloquer la sortie du MVP sur une revue App Store liée aux achats
  intégrés (souvent le point le plus lent),
- garder V2 comme un backlog de finition qui peut être réordonné selon les
  retours utilisateurs du MVP/V1 sans remettre en cause l'architecture.

**Un principe transverse ne suit pas ce découpage** : `CONCEPT.md` établit
qu'il n'existe qu'**un seul jeu de données par couple**, synchronisé sans
étape visible pour les deux parents. Ce n'est pas une feature qu'on ajoute
en V2 — c'est structurant dès la Phase 0 du plan d'action (choix de la
stratégie de synchronisation temps réel) et dès le MVP pour les surfaces
partagées critiques (humeur, rendez-vous partagés, statuts de démarches).
Le bullet Realtime de [V2.md](./versions/V2.md) ne concerne que
l'**extension** de ce mécanisme aux surfaces restantes, pas son introduction.

## Correspondance avec le plan d'action

Le [Plan d'action](./02-ACTION-PLAN.md) est organisé en phases techniques
(Phase 0 → Phase 4). Chaque phase alimente une ou plusieurs versions :

| Phase du plan d'action | Version(s) livrée(s) |
|---|---|
| Phase 0 — Socle technique | (prérequis, pas de version livrable seule) |
| Phase 1 — Navigation, onboarding, hub, 3 piliers | [MVP](./versions/MVP.md) |
| Phase 2 — Déclaration de naissance & finitions MVP | [MVP](./versions/MVP.md) |
| Phase 3 — Paiement & module bébé | [V1](./versions/V1.md) |
| Phase 4 — Notifications push réelles | [V1](./versions/V1.md) |
| Phase 5 — i18n, thèmes, reviews natives, export | [V2](./versions/V2.md) |

Concrètement : quand la Phase 1 et la Phase 2 du plan d'action sont
"Done", le contenu de `MVP.md` doit être entièrement cochable. Si ce n'est
pas le cas, c'est que le découpage des phases doit être ajusté — les deux
documents doivent rester synchronisés.

## Points ouverts à trancher avec l'utilisateur

Ces écarts entre `CONCEPT.md` et les maquettes Hi-Fi ont un impact sur le
périmètre exact du MVP et de V1 — à confirmer avant que les phases
correspondantes du plan d'action soient considérées "prêtes à coder" :

- **Bouton "J'ai accouché"** — `CONCEPT.md` dit qu'il n'apparaît que sur le
  hub ; les maquettes le montrent sur presque tous les écrans. Impacte le
  périmètre exact de la Phase 1 (MVP).
- **Favoris "Votre bébé" au-delà des 4 confirmés** (sommeil, couche, visite
  médecin visibles dans la maquette 8a mais absents de `CONCEPT.md`) —
  impacte le périmètre exact de V1 (Phase 3).

## Versionning technique (numéros de build)

- SemVer côté app (`1.0.0` = MVP, `1.1.0` = V1, `1.2.0` = V2, etc.) — les
  correctifs sans nouveau contenu de `versions/` restent des patchs (`1.0.x`).
- Un changelog (`CHANGELOG.md` à la racine, à créer au premier tag) reprend
  les critères de sortie cochés de chaque `versions/*.md` au moment du
  passage en production.
