---
title: Plan d'action de développement — US
---

# Plan d'action de développement

> Découpage technique en phases. Chaque phase alimente une version précise
> du [Plan de versionning](./03-VERSIONING.md) — voir le tableau de
> correspondance en bas de ce document. S'appuie sur
> [CONCEPT.md](./CONCEPT.md) (référence produit prioritaire) et le
> [Design Overview](./01-DESIGN-OVERVIEW.md) pour le contenu fonctionnel, et
> sur [l'Architecture](./04-ARCHITECTURE.md) pour les choix techniques.

> ❓ **Point ouvert non tranché** : `CONCEPT.md` indique que le bouton
> "J'ai accouché" n'apparaît que sur le hub (écran d'accueil), alors que les
> maquettes Hi-Fi le montrent sur la quasi-totalité des écrans (Ensemble,
> Suivi santé, Démarches, Aujourd'hui...). Tant que ce n'est pas confirmé par
> l'utilisateur, la Phase 1 implémente le bouton **uniquement sur le hub**
> (le concept écrit fait foi par défaut), à corriger si l'utilisateur préfère
> le comportement des maquettes.

## Phase 0 — Socle technique (aucune feature visible)

Objectif : avoir un projet qui compile, se lint, se déploie sur device, et
qui parle à Supabase — avant d'écrire le moindre écran métier.

- [x] Scaffold Expo + TypeScript strict + Expo Router
- [x] Intégration Hero UI Native (thème de base, couleur de marque `#2D5E5A`)
- [x] Configuration Biome (lint + format) + pre-commit hook
- [x] Projet Supabase créé, client configuré, script `db:types` (génération des types TS)
- [x] Auth Supabase par magic link fonctionnelle (écran 1a minimal, sans le reste de l'onboarding)
- [x] Setup TanStack Query (queryClient, provider, conventions de query keys)
- [x] Setup Jotai (atoms globaux : rôle courant, session)
- [x] **Modèle "espace partagé" posé dès le socle** : un household = un seul
      jeu de données (pas de copie par utilisateur). Décider ici la stratégie
      de synchronisation temps réel (Supabase Realtime vs invalidation
      agressive de query TanStack Query) pour que les écrans partagés
      (humeur, rendez-vous partagés, statuts de démarches) soient à jour sans
      action manuelle — voir [Architecture](./04-ARCHITECTURE.md). Ce n'est
      **pas** un chantier V2, c'est structurant dès le MVP.
- [x] CI minimale (lint + typecheck sur PR)

## Phase 1 — Coquille de navigation, onboarding, hub, 3 piliers gratuits (→ MVP)

Construire dans l'ordre du parcours utilisateur réel, pas dans l'ordre des
sections du design.

### 1.1 Coquille de navigation

- [x] Barre de navigation basse à **4 onglets fixes** (et non 3) : **Home**
      (hub) / **User** (profil personnel) / **Information** (infos
      importantes partagées) / **Setting** (réglages) — cf. `CONCEPT.md`
- [x] Onglet **User** : écran de profil propre à chaque utilisateur (nom
      affiché modifiable ; avatar = fonctionnalité future, ne pas bloquer dessus)
- [x] Onglet **Information** : fiche partagée et modifiable par les deux
      parents (groupe sanguin, allergies, n° sécu, adresse maternité...),
      **réorganisable** — ⚠️ données de santé, RLS stricte dès
      l'implémentation (déjà en place depuis la migration
      `household_info_items`). Réordonnancement implémenté via boutons
      haut/bas (persisté en base) plutôt qu'un vrai geste de
      glisser-déposer — à remplacer par un geste tactile (Reanimated +
      Gesture Handler) dans une passe dédiée si le besoin se confirme.

### 1.2 Onboarding et mise en place de l'espace partagé

1. [x] **Onboarding complet** (écrans 1a → 1f, 1y) — magic link (email seul,
   aucune identité obligatoire), prénoms des deux parents (obligatoire),
   date d'accouchement prévue, statut pro, mode d'accompagnement (couple /
   coparentalité / seul·e / autre), priorités, rythme de notifications.
   Formulaire multi-étapes, état d'avancement en Jotai, persistance finale
   en Supabase.
   - Tout est écrit dans `households` (+ `profiles.first_name`) : les
     tables `pregnancies` et `onboarding_answers` mentionnées ici n'ont
     jamais existé, le schéma les a volontairement pliées dans `households`
     (cf. [migrations](./migrations/README.md#décisions-de-modélisation)).
   - ⚠️ **Écrit sans TanStack Form**, contrairement à
     [l'architecture](./04-ARCHITECTURE.md#stack) — voir la note « TanStack
     Form » là-bas.
2. [x] **Écran 1g (paywall)** — affiché en toute fin d'onboarding mais
   désactivé/non fonctionnel, cf. [MVP.md](./versions/MVP.md)
3. [x] **Invitation automatique du co-parent** en fin d'onboarding — le premier
   parent (la mère) configure l'espace puis un email d'invitation part
   automatiquement ; l'espace devient partagé dès que le second parent
   clique le lien et crée son compte (écrans 2a, 2b, 2d)
   - Rattachement côté base par `accept_household_invite()` (`security
     definer`, matching sur l'email vérifié du JWT) : sans elle, l'invité
     n'est membre de rien au moment du clic et les policies RLS lui
     interdisent de voir son invitation.
   - ⚠️ **Limite MVP** : l'email envoyé est le template « lien de
     connexion » standard de Supabase, pas une invitation personnalisée au
     nom du premier parent — cela suppose une Edge Function et un SMTP
     configuré (le projet utilise encore le service mutualisé Supabase,
     limité à quelques emails par heure).

**Reste à vérifier sur la 1.2** : le parcours a été validé écran par écran
(navigation, validations, branches avec/sans co-parent), mais les écritures
Supabase réelles — création du foyer, envoi de l'invitation, acceptation par
le co-parent — n'ont pas pu être testées de bout en bout, faute de session
authentifiée disponible en vérification automatisée.

### 1.3 Hub d'accueil

- [ ] **3 piliers de poids visuel égal** — Démarches, Ensemble, Suivi santé
      — chacun affichant un état contextuel (pas une description statique)
- [ ] **Bloc "Mon partenaire"** — section indépendante sous les piliers,
      **pas un 4e pilier**, accessible en un tap (voir 1.5)
- [ ] Bouton **"J'ai accouché"** — visible uniquement par la femme, en haut
      du hub à côté de la salutation (voir point ouvert en tête de document)

### 1.4 Pilier Ensemble

Interface **non symétrique** : chaque utilisateur a sa propre vue adaptée à
son rôle, dans cet ordre précis :

1. Check-in humeur du jour en un tap
2. Popup post-tap pour préciser un besoin (sommeil / câlin / parler / texte
   libre) → ce besoin devient visible pour le co-parent sur le hub, dans sa
   carte "Humeur du jour" (ex. "Camille aujourd'hui — a besoin d'un câlin")
3. Calendrier hebdomadaire de tendance d'humeur — **qualitatif uniquement,
   jamais de chiffres ni d'historique jour par jour détaillé** (⚠️ corrige
   la maquette qui affichait un graphique à barres avec hauteurs variables —
   à ne pas reproduire tel quel)
4. "Geste du jour" — suggestion concrète pour aider le partenaire ;
   **peut être déclenché comportementalement** (plusieurs jours consécutifs
   d'humeur difficile détectés) — prévoir dès cette phase un point
   d'extension pour la règle de déclenchement, même si le déclenchement réel
   par notification est câblé en Phase 4

### 1.5 Pilier Suivi santé + section "Mon partenaire"

4 onglets internes avec des **règles de visibilité strictes, différentes
par onglet** :

- **Journal** (symptômes) — saisi et visible **uniquement par la femme
  enceinte**. N'apparaît **pas du tout** dans l'interface du co-parent,
  qui y accède uniquement en lecture seule via "Mon partenaire"
- **Rendez-vous** — calendrier du mois + liste "Vos prochains rendez-vous".
  À la création, la femme choisit partagé/non partagé. Côté femme : tous
  ses rendez-vous. Côté co-parent (dans son propre onglet Rendez-vous) :
  uniquement les rendez-vous marqués partagés
- **Contacts** — visible et modifiable par les deux, réorganisable par
  drag-and-drop
- **Exercices** — visible par les deux, filtré automatiquement selon le
  trimestre de grossesse en cours

**Section "Mon partenaire"** (bloc hub indépendant, contenu partiellement
symétrique) :

- Tendance d'humeur du partenaire sur la semaine (qualitative, réciproque)
- "Vos prochains rendez-vous" — reprise, pour le co-parent, des **mêmes
  rendez-vous partagés** que dans son onglet Suivi santé > Rendez-vous
  (jamais les non-partagés)
- Taille du bébé de la semaine (fruit/légume) + astuce **spécifique au
  rôle** (une carte pour la femme, une carte pour le co-parent) — partagé
  entre les deux
- **Pour le co-parent uniquement** : accès en lecture seule aux symptômes
  renseignés par sa partenaire dans le Journal (seule porte d'entrée, il n'a
  pas accès direct à l'onglet Journal)

### 1.6 Pilier Démarches

- [ ] Référentiel **figé à 6 démarches pour la V1** : déclaration de
      naissance (mairie), CAF, sécurité sociale, mutuelle, congés employeur,
      mode de garde
- [ ] Statuts À faire / En cours / Fait, modifiables par les deux parents
- [ ] Lien direct vers le téléservice officiel — **pas d'explication de
      procédure dans l'app**, juste la liste des documents à fournir
- [ ] Écran de détail : échéance calculée, sélecteur de statut 3 états,
      liste de documents, toggle de rappel/notification
- [ ] "Déclaration de naissance à la mairie" — délai légal de 5 jours,
      échéance calculée **uniquement après validation via "J'ai accouché"**
      (ex. "jusqu'au 6 septembre") ; avant validation, affichage informatif
      sans date précise (ex. "5 jours à partir de la naissance")

### 1.7 Réglages MVP

- [ ] Personnels, **non partagés avec le partenaire**
- [ ] Choix entre 3 ou 4 thèmes visuels prédéfinis
- [ ] Pas de sélecteur de langue en V1 (français uniquement)

## Phase 2 — Déclaration de naissance & durcissement MVP

- [ ] Bouton/flux "J'ai accouché" (7a) + recalcul des échéances de
      démarches à la confirmation (c'est l'événement pivot le plus délicat
      du MVP — à tester avec dates limites, fuseaux horaires, etc.)
- [ ] Demande d'avis MVP (stockage du feedback, sans store review natif)
- [ ] Vérification de bout en bout des règles de visibilité par rôle
      (Journal, Rendez-vous non partagés, Réglages) — ce sont les policies
      RLS les plus sensibles du MVP, à tester explicitement par des tests
      d'intégration (pas seulement une revue manuelle)
- [ ] Passage complet des critères de sortie de [MVP.md](./versions/MVP.md)
- [ ] Tests device réels iOS + Android (pas seulement simulateur)

**Livrable de fin de Phase 2 : [MVP](./versions/MVP.md) prêt à shipper.**

## Phase 3 — Paiement & module "Votre bébé" (→ V1)

- [ ] Décision + intégration du provider de paiement (RevenueCat recommandé,
      cf. [Architecture](./04-ARCHITECTURE.md#stack))
- [ ] Écran 1g/paywall rendu fonctionnel (achat unique, restauration, code promo)
- [ ] Système de favoris (8y, 8a) — liste ordonnée, activable/désactivable
      par drag-and-drop
- [ ] **4 modules confirmés par CONCEPT.md** : biberons, mesures
      (poids/taille + courbe de croissance), bain, allaitement — saisis
      indifféremment par l'un ou l'autre parent, visibles instantanément des
      deux côtés
- [ ] ❓ Les favoris "sommeil", "couche", "visite médecin" apparaissent dans
      la maquette (écran 8a) mais ne sont pas confirmés dans `CONCEPT.md` —
      à clarifier avant de les développer. Par défaut : les laisser listés
      comme "à venir" dans le sélecteur de favoris, sans écran de saisie
      fonctionnel en V1
- [ ] Traitement visuel distinct (palette plus sombre ou accent doré, badge
      "Premium" sur la carte du hub et dans les écrans de la section)
- [ ] Vérification serveur du statut premium (jamais uniquement client-side)

## Phase 4 — Notifications push réelles (→ V1)

- [ ] Infrastructure Expo Notifications (tokens, permissions)
- [ ] Scheduler backend (Supabase Edge Functions + cron, ou service dédié)
- [ ] Notifications courtes et actionnables, déclenchées par le
      comportement plutôt que purement planifiées : rappel de démarche
      (5c), geste du jour **avec règle de déclenchement sur humeur
      difficile répétée** (3f), réassurance symptôme (4d)

**Livrable de fin de Phase 4 : [V1](./versions/V1.md) prêt à shipper.**

## Phase 5 — Finitions & rétention (→ V2)

- [ ] Localisation anglaise (extraction des chaînes FR en cours de route dès Phase 1 pour éviter un gros chantier ici)
- [ ] Thèmes visuels supplémentaires si besoin au-delà des 3-4 prédéfinis du MVP
- [ ] Export de données utilisateur
- [ ] Store review natif (SKStoreReviewController / Android In-App Review)
- [ ] Extension du temps réel Supabase aux surfaces restantes si les
      retours utilisateurs le justifient (le cœur du temps réel — humeur,
      rendez-vous partagés, statuts de démarches — est déjà posé dès la
      Phase 0/1, ce n'est pas une introduction ex nihilo en V2)

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
par section sans pouvoir naviguer entre elles. En cas de désaccord entre
`CONCEPT.md` et les maquettes Hi-Fi, `CONCEPT.md` fait foi par défaut (c'est
la spécification écrite la plus récente et la plus précise sur les règles de
visibilité) — mais signaler l'écart plutôt que de trancher silencieusement,
comme pour le bouton "J'ai accouché" en tête de ce document.
