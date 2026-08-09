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

## État d'avancement

| Étape | État |
|---|---|
| Phase 0 — Socle technique | ✅ terminée |
| 1.1 Coquille de navigation | ✅ terminée |
| 1.2 Onboarding et espace partagé | ✅ terminée, **vérification incomplète** (voir ci-dessous) |
| 1.3 Hub d'accueil | ✅ terminée |
| 1.4 Pilier Ensemble | ✅ implémentée, interface symétrique pour l'instant (demande explicite) |
| 1.5 Suivi santé + Mon partenaire | ✅ implémentée pour la **vue femme enceinte** ; vue co-parent reportée (demande explicite) |
| 1.6 Pilier Démarches | ✅ terminée |
| 1.7 Réglages MVP | ✅ terminée |
| Phases 2 à 5 | ⬜ à faire |

**Prochaine étape : [Phase 2 — Déclaration de naissance & durcissement MVP](#phase-2--déclaration-de-naissance--durcissement-mvp).**

⚠️ **La 1.2 porte une dette de vérification** : aucune écriture Supabase
authentifiée (création du foyer, invitation, rattachement du co-parent) n'a
jamais été exécutée, faute de SMTP configuré. Le détail et le reste des
points en suspens sont centralisés dans
[Dette et points ouverts](./05-DETTE-ET-POINTS-OUVERTS.md) — liste unique,
pour éviter que deux inventaires divergent.

## Phase 0 — Socle technique (aucune feature visible)

**✅ Terminée.**

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

**✅ Terminée.**

- [x] Barre de navigation basse à **4 onglets fixes** (et non 3) : **Home**
      (hub) / **User** (profil personnel) / **Information** (infos
      importantes partagées) / **Setting** (réglages) — cf. `CONCEPT.md`
      - [x] **Rendu personnalisé** (ajout ultérieur, demande explicite) :
        carte flottante arrondie avec icônes réelles (Ionicons, paire
        outline/pleine selon focus) et pastille active qui glisse
        (Reanimated), teintée du pastel de thème. Remplace les icônes
        emoji placeholder. Aucune maquette Hi-Fi ne montre de barre de ce
        type (juste des icônes nues en bas d'écran) — inspiré d'un
        moodboard de patterns fourni par l'utilisateur, pas de la
        maquette. Voir [`tab-bar.tsx`](../src/components/navigation/tab-bar.tsx).
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

**✅ Terminée**, mais avec une dette de vérification — voir
[État d'avancement](#état-davancement).

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

**✅ Terminée.**

- [x] **3 piliers de poids visuel égal** — Démarches, Ensemble, Suivi santé
      — chacun affichant un état contextuel (pas une description statique).
      L'état vient de la base (`household_procedures`, `mood_checkins`,
      `appointments`) ; à défaut de données, le libellé neutre de la section
      est affiché plutôt qu'un chiffre inventé.
- [x] **Bloc "Mon partenaire"** — section indépendante sous les piliers,
      **pas un 4e pilier**, accessible en un tap (voir 1.5).
      ⚠️ Affiché **en permanence**, alors que la maquette 2b ne le montrait
      qu'une fois l'espace partagé : depuis la 1.5, cet écran porte aussi la
      taille du bébé et les astuces du jour, utiles sans co-parent. Le
      masquer les rendait inatteignables. Seul le sous-titre s'adapte.
- [x] Bouton **"J'ai accouché"** — visible uniquement par la femme, en haut
      du hub à côté de la salutation (voir point ouvert en tête de document).
      ⚠️ Les maquettes 3c **et** 3d l'affichent pour les deux rôles :
      `CONCEPT.md` fait foi, il est réservé à la femme enceinte.

Les sections ouvertes depuis le hub (Démarches, Ensemble, Suivi santé, Mon
partenaire, J'ai accouché) mènent à des écrans d'attente jusqu'à leur phase
respective : la navigation est donc réelle et testable dès maintenant, et la
barre reste à 4 onglets fixes.

### 1.4 Pilier Ensemble

**✅ Implémentée**, avec un écart de périmètre assumé : voir plus bas.

Interface **non symétrique** : chaque utilisateur a sa propre vue adaptée à
son rôle, dans cet ordre précis :

1. [x] Check-in humeur du jour en un tap — persisté immédiatement à l'appui,
   avant même la popup du besoin (sans quoi quitter la popup sans répondre
   perdrait le check-in)
2. [x] Popup post-tap pour préciser un besoin (sommeil / câlin / parler / texte
   libre) → ce besoin devient visible pour le co-parent sur le hub, dans sa
   carte "Humeur du jour" (ex. "Camille aujourd'hui — a besoin d'un câlin").
   ⚠️ Le hub affiche le besoin tel quel (déjà en place depuis la 1.3), pas
   encore composé en phrase naturelle avec « a besoin de » — la grammaire
   varie par tag (« d'un câlin » vs « de sommeil ») et n'a pas été traitée.
3. [x] Calendrier hebdomadaire de tendance d'humeur — **qualitatif uniquement,
   jamais de chiffres ni d'historique jour par jour détaillé** (⚠️ corrige
   la maquette qui affichait un graphique à barres avec hauteurs variables —
   à ne pas reproduire tel quel). Un emoji par jour (L M M J V S D) reste
   qualitatif ; c'est la hauteur de barre, pas l'info par jour, qui posait
   problème.
4. [x] "Geste du jour" — sélection déterministe (même geste pour tout le
   monde du même rôle, toute la journée, change le lendemain), affiché en
   box emoji + message. Le **point d'extension** pour le déclenchement
   comportemental existe (`countTrailingDifficultMoodDays` dans
   `features/together/api.ts`) mais n'est pas encore branché dans l'écran —
   le déclenchement réel (notification) reste bien Phase 4.

⚠️ **Écart de périmètre** (demande explicite) : une seule interface pour
l'instant, pas encore la vue asymétrique par rôle que décrit CONCEPT.md — le
contenu (pool de gestes) est déjà personnalisé par rôle, mais l'écran est le
même pour les deux. L'asymétrie complète est reportée à une passe dédiée.

### 1.5 Pilier Suivi santé + section "Mon partenaire"

**✅ Implémentée pour la vue femme enceinte**, avec un écart de périmètre
assumé : voir plus bas.

4 onglets internes avec des **règles de visibilité strictes, différentes
par onglet** :

- [x] **Journal** (symptômes) — saisi et visible **uniquement par la femme
  enceinte**. N'apparaît **pas du tout** dans l'interface du co-parent,
  qui y accède uniquement en lecture seule via "Mon partenaire".
  L'onglet est **retiré de la liste** pour le co-parent, pas grisé ; la RLS
  lui refuse de toute façon l'écriture. Deux barrières indépendantes,
  volontairement — c'est une donnée de santé.
- [x] **Rendez-vous** — calendrier du mois + liste "Vos prochains rendez-vous".
  À la création, la femme choisit partagé/non partagé. Côté femme : tous
  ses rendez-vous. Côté co-parent (dans son propre onglet Rendez-vous) :
  uniquement les rendez-vous marqués partagés. Le filtrage par rôle est
  **entièrement porté par la RLS** (`appointments_select_scoped`), jamais
  redoublé côté client : deux implémentations d'une même règle de
  visibilité finiraient par diverger. Défaut : **non partagé**.
- [x] **Contacts** — visible et modifiable par les deux, réorganisable.
  Boutons haut/bas plutôt qu'un vrai glisser-déposer, comme l'onglet
  Information (même dette, cf. [05](./05-DETTE-ET-POINTS-OUVERTS.md) n° 12).
- [x] **Exercices** — visible par les deux, filtré automatiquement selon le
  trimestre de grossesse en cours, déduit de la date de terme.
  ⚠️ La maquette 4f liste les **trois** trimestres ; `CONCEPT.md` demande un
  filtrage. CLAUDE.md tranche pour `CONCEPT.md`. Repli assumé : si la date
  de terme est inconnue, on affiche les trois groupes plutôt que de deviner
  un trimestre.
  - [x] **Écran de détail** (hors maquette, ajout ultérieur) : chaque
    exercice ouvre une fiche avec titre, durée, et une section image
    (`exercises.image_url`). Même parti pris que Démarches — liste et
    détail dans un seul écran, basculé par état local. Le catalogue n'a
    aucune photo réelle pour l'instant (`image_url` toujours `null`) : un
    repli visuel neutre s'affiche à la place, voir
    [05](./05-DETTE-ET-POINTS-OUVERTS.md).

**Section "Mon partenaire"** (bloc hub indépendant, contenu partiellement
symétrique) :

- [x] Tendance d'humeur du partenaire sur la semaine (qualitative, réciproque)
- [ ] "Vos prochains rendez-vous" — reprise, pour le co-parent, des **mêmes
  rendez-vous partagés** que dans son onglet Suivi santé > Rendez-vous
  (jamais les non-partagés) — *bloc propre au co-parent, reporté*
- [x] Taille du bébé de la semaine (fruit/légume) + astuce **spécifique au
  rôle** (une carte pour la femme, une carte pour le co-parent) — partagé
  entre les deux. Les deux cartes sont affichées aux deux parents, avec le
  destinataire indiqué, puisque le contenu est explicitement partagé.
- [ ] **Pour le co-parent uniquement** : accès en lecture seule aux symptômes
  renseignés par sa partenaire dans le Journal (seule porte d'entrée, il n'a
  pas accès direct à l'onglet Journal) — *reporté avec la vue co-parent*

⚠️ **Écart de périmètre** (demande explicite) : seule la vue de la personne
enceinte est implémentée. Restent à faire, côté co-parent : la reprise de ses
rendez-vous partagés et l'accès en lecture seule aux symptômes — sa seule
porte d'entrée vers cette donnée de santé.

### 1.6 Pilier Démarches

**✅ Terminée.**

- [x] Référentiel **figé à 6 démarches pour la V1** : déclaration de
      naissance (mairie), CAF, sécurité sociale, mutuelle, congés employeur,
      mode de garde
- [x] Statuts À faire / En cours / Fait, modifiables par les deux parents —
      pas de règle de visibilité par rôle sur ce pilier, contrairement à
      Ensemble et Suivi santé.
- [x] Lien direct vers le téléservice officiel — **pas d'explication de
      procédure dans l'app**, juste la liste des documents à fournir.
      Les 5 URL (`service-public.fr`, `caf.fr`, `ameli.fr`,
      `demarches.interieur.gouv.fr`, `monenfant.fr`) ont été vérifiées par
      recherche web au moment d'écrire la migration, pas devinées de
      mémoire. « Mutuelle » reste sans lien : assureur privé propre à
      chaque foyer, aucun téléservice officiel générique n'existe.
- [x] Écran de détail : échéance calculée, sélecteur de statut 3 états,
      liste de documents, toggle de rappel/notification. Liste et détail
      vivent dans un seul écran (bascule par état local), même parti pris
      que le pilier Suivi santé.
- [x] "Déclaration de naissance à la mairie" — délai légal de 5 jours,
      échéance calculée **uniquement après validation via "J'ai accouché"**
      (ex. "jusqu'au 6 septembre") ; avant validation, affichage informatif
      sans date précise (ex. "5 jours à partir de la naissance").
      ⚠️ `households.birth_date` n'est encore jamais renseigné (la Phase 2
      n'est pas construite) : le calcul de date précise n'a donc jamais
      tourné en conditions réelles, seul l'affichage informatif l'a été.

### 1.7 Réglages MVP

**✅ Terminée.**

- [x] Personnels, **non partagés avec le partenaire** — écran propre à
      chaque compte (`profiles.theme`), déjà garanti par la policy RLS
      `profiles_update_own` existante.
- [x] Choix entre **4 thèmes visuels prédéfinis** (sauge / corail / lavande /
      ocre), appliqué instantanément (`Uniwind.setTheme`) et persisté en
      base pour survivre à une reconnexion.
- [x] Pas de sélecteur de langue (français uniquement)

⚠️ **Ambiguïté résolue** entre [MVP.md](./versions/MVP.md) (« Thème sombre et
couleur d'accent hors MVP ») et ce plan/`CONCEPT.md` (thèmes visuels
prédéfinis en scope) : ce sont deux mécanismes différents. MVP.md exclut le
couple « bascule clair/sombre + roue de couleur libre » de la maquette 10a ;
ce qui est implémenté ici est un choix fermé de 4 palettes nommées, pas un
sélecteur de couleur libre ni un mode sombre. Documenté dans le code
(`src/features/settings/constants.ts`, `src/app/(tabs)/reglages.tsx`).

⚠️ **Couleurs inventées** : seul le vert de marque (sauge, `#2D5E5A`) vient
du design ; corail/lavande/ocre n'ont aucune référence maquette — hex choisis
pour rester dans la même gamme de saturation/luminosité (texte blanc lisible
dessus). À ajuster si une charte graphique les définit un jour.

⚠️ **Mécanisme technique** : le re-thème s'appuie sur Uniwind
(`extraThemes` dans `metro.config.js` + variants CSS dans `src/global.css`),
et re-théme gratuitement tout écran qui lit déjà le token `accent`
(`bg-accent`/`text-accent`/`border-accent`) plutôt qu'une couleur codée en
dur — vérifié en changeant de thème depuis Réglages et en observant le hub
(bouton "J'ai accouché", "Inviter") changer de couleur sans modification
d'écran.

⚠️ **Fond de tous les écrans principaux dérivé du thème** (ajout après
coup, demande explicite) : hub, Suivi santé, Démarches, Ensemble et Mon
partenaire affichaient un fond fixe par rôle (`ROLE_BACKGROUND`, vert pâle
femme enceinte / crème co-parent). Ils affichent désormais tous un pastel
de la couleur d'accent active (`useThemeBackground`,
`src/features/settings/hooks.ts`), cohérent avec le fait que le thème est
personnel à chaque compte. `ROLE_BACKGROUND` a été retiré (plus aucun
usage) ; le rôle continue de piloter d'autres éléments (visibilité
d'onglets, contenu) sans lien avec la couleur de fond.

⚠️ **Thème par défaut forcé au montage** (bug corrigé après coup) : tant que
le profil n'est pas chargé (tout l'onboarding, avant la création du foyer),
Uniwind suivait le thème système — `dark` sur un appareil en mode sombre —
ce qui faisait apparaître les champs `Input` de Hero UI Native en noir (leurs
couleurs viennent du variant `dark` de la librairie, pas de nos couleurs de
marque). `src/app/_layout.tsx` appelle maintenant `Uniwind.setTheme(DEFAULT_THEME_ID)`
sans condition dès le montage, indépendamment du profil.

⚠️ **Libellés du footer traduits** (demande explicite, écart avec
CONCEPT.md) : CONCEPT.md nomme les 4 onglets en anglais (Home / User /
Information / Setting) ; ils s'affichent désormais en français (Accueil /
Profil / Information / Réglages) dans `src/app/(tabs)/_layout.tsx`. Les noms
de route ne changent pas.

⚠️ **Sous-section Confidentialité ajoutée aux Réglages** (demande
explicite, hors périmètre initial de la 1.7) : 3 liens (Politique de
confidentialité, Conditions d'utilisation, Mentions légales) vers un écran
générique (`src/app/(tabs)/legal.tsx`) qui dit franchement que le contenu
n'est pas encore rédigé — voir point bloquant n°3 de
[05](./05-DETTE-ET-POINTS-OUVERTS.md) (consentement RGPD).

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
