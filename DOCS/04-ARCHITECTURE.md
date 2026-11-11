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
| UI Kit | Hero UI Native en principe — dans les faits, briques maison de `src/components/ui/` (voir [Design system interne](#design-system-interne)) |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions, Realtime) |
| Données serveur / cache | TanStack Query |
| Formulaires | TanStack Form en principe — **non installé**, tous les formulaires sont en `useState` (voir plus bas) |
| État client global | Jotai |
| Lint / format | Biome |
| Paiement premium | À trancher en phase MVP+1 (RevenueCat recommandé pour achat unique + restauration cross-plateforme) |
| Notifications push | Expo Notifications + Supabase Edge Functions (scheduling) — Phase 4, rien d'installé |
| Animations | Reanimated 4 (+ worklets), `react-native-svg` pour les doodles et formes, `expo-blur` pour le flou des écrans premium |
| Styles / theming | Tailwind v4 via [Uniwind](https://docs.uniwind.dev) — Hero UI Native est bâti dessus, `className` sur les composants plutôt que `StyleSheet.create` pour tout ce que le kit ne fournit pas déjà |
| Gestionnaire de paquets | [bun](https://bun.sh) (lockfile `bun.lock`) |
| Runtime Node | `.nvmrc` (v24.19.0, `engines` ≥ 24.19.0) — bun gère les paquets, certains sous-processus Expo/Metro/Husky s'appuient encore sur `node` |

L'app vit sous `src/` (convention du scaffold Expo par défaut : `src/app`,
`src/components`, `src/constants`, `src/hooks`, `src/lib`) plutôt qu'à la
racine du repo — la racine reste réservée à la config (`app.json`,
`biome.json`, `metro.config.js`, `tsconfig.json`, `DOCS/`, `design/`, `supabase/`).

## Répartition des responsabilités d'état

- **TanStack Query** : toute donnée qui vit côté serveur (Supabase) — `households`, `pregnancies`, `appointments`, `procedures`, `baby_*`, `mood_checkins`, etc. Pas de duplication manuelle dans Jotai.
- **Jotai** : état UI éphémère et transverse — rôle actif de l'utilisateur (enceinte/partenaire), thème/couleur d'accent en cours d'édition, état d'un formulaire multi-étapes (onboarding) avant soumission, état d'ouverture des bottom sheets.
- **TanStack Form** : tous les formulaires (onboarding multi-étapes, ajout RDV, ajout mesure/biberon/bain, profil, réglages). **Non appliqué à ce jour** — voir ci-dessous.

### TanStack Form — mandat suspendu (Phase 1.2)

L'onboarding a d'abord été écrit avec TanStack Form v1.33, puis basculé sur
de l'état React contrôlé (`useState`), comme l'écran de connexion. En l'état,
**aucun formulaire du projet n'utilise TanStack Form** et le paquet n'est pas
installé.

Ce qui a été observé pendant l'implémentation : la saisie mettait bien à jour
le store du formulaire, mais ni le rendu de `form.Field` ni un
`useStore(form.store, …)` ne se re-rendaient — champ figé et bouton
« Continuer » jamais activé. `"use no memo"` (échappatoire React Compiler)
n'y changeait rien.

⚠️ **Ce diagnostic n'est pas concluant** : il a été établi avant de découvrir
que plusieurs instances d'un même écran pouvaient être empilées dans le DOM
pendant les tests, ce qui a produit d'autres faux positifs. Il est possible
que la saisie ait porté sur une instance masquée. Avant de conclure que
TanStack Form est inutilisable ici (Expo SDK 57 / React 19 / Metro), il faut
donc **refaire l'essai proprement** sur une seule instance d'écran.

En attendant, `useState` est le motif de référence pour les formulaires du
projet — il fonctionne et reste trivial à remplacer.

Règle simple : si la donnée doit survivre à un redémarrage de l'app ou être partagée entre utilisateurs → Supabase + TanStack Query. Sinon → Jotai.

## Thématisation

Le design distinguait le fond « vue personne enceinte » (`#EAF5F0`) du fond
« vue partenaire » (`#FDF6E3`). **Ce n'est plus le rôle qui pilote la
couleur** depuis la Phase 1.7 : chaque compte choisit l'un des 4 thèmes
prédéfinis (sauge, corail, lavande, ocre — `profiles.theme`, personnel et non
partagé), appliqué via `Uniwind.setTheme`.

- **Accent** : `useThemeAccent()` pour les couleurs calculées en JS (ombres
  teintées, dégradés, SVG) ; token `accent` (`bg-accent`, `text-accent/10`…)
  pour les `className`. Ne jamais coder un vert en dur pour un état
  sélectionné.
- **Fond** : `useThemeBackground()` (pastel du thème) sur tous les écrans,
  y compris l'onboarding ; `useThemeBabyWallpaper()` pour le wallpaper de
  `/bebe`, décliné dans les 4 teintes.
- **Exception voulue** : « Mon partenaire » reste **rose** quel que soit le
  thème (`PARTNER_PINK`, `features/partner/constants.ts`) ; la barre
  d'onglets reprend ce rose quand la route est active.
- Le **rôle** (`currentRoleAtom`, synchronisé depuis le foyer par
  `useSyncCurrentRole`) continue de piloter la visibilité (onglet Journal,
  bouton « J'ai accouché ») et le contenu (gestes, astuces), jamais la
  couleur. Un seul composant d'écran pour les deux rôles, jamais dupliqué.
- **Polices** : Provicali (titres d'onboarding) et Tondu (slides de
  bienvenue), chargées dans `src/app/_layout.tsx` — licences à régulariser,
  cf. [point 42](./05-DETTE-ET-POINTS-OUVERTS.md).

## Design system interne

Les écrans ont été modernisés un par un d'après des captures de référence
(août → novembre 2026). Plutôt que Hero UI Native, ils reposent sur un petit
jeu de briques maison, à réutiliser avant d'en créer de nouvelles :

| Brique | Rôle |
|---|---|
| [`ui/glass-card.tsx`](../src/components/ui/glass-card.tsx) | Cartes « verre dépoli » à vague pastel, `IconTile`, `ChevronBubble`, doodles (`SparkLines`, `DashedLoopDoodle`), couleurs de texte `GLASS_TITLE_COLOR` / `GLASS_BODY_COLOR` |
| [`ui/pill-button.tsx`](../src/components/ui/pill-button.tsx) | Bouton principal en gélule d'accent (variante `compact`) — remplace les `Button` Hero UI |
| [`ui/icon-input.tsx`](../src/components/ui/icon-input.tsx) | Champ en gélule à pastille d'icône (`IconInput`, `IconBubble`) |
| [`ui/blob-fab.tsx`](../src/components/ui/blob-fab.tsx) | Bouton flottant « + », même langage que la bulle de la barre d'onglets |
| [`ui/blob-illustration.tsx`](../src/components/ui/blob-illustration.tsx) | Illustration de tête de modale (pictogramme sur tache d'accent) |
| [`ui/screen-corner-shapes.tsx`](../src/components/ui/screen-corner-shapes.tsx) | Ronds blancs translucides en fond d'écran |
| [`wheel-date-picker.tsx`](../src/components/wheel-date-picker.tsx) | **Seul sélecteur de date de l'app** : trois molettes jour/mois/année, variante `compact` pour les modales, `minDate` optionnel (date de terme et rendez-vous refusent une date passée) |
| [`navigation/tab-bar.tsx`](../src/components/navigation/tab-bar.tsx) | Barre d'onglets flottante à bulle débordante, + entrée « Premium » |
| [`hub/premium-*.tsx`](../src/components/hub/) | Vitrine premium : `PremiumLockedScreen`, `PremiumOffer`, `PremiumPaywallModal`, `PremiumTeaserCard` |

Hero UI Native n'est plus utilisé que dans 5 fichiers (fournisseur racine,
connexion, bienvenue, finalisation, `NeedNoteOverlay`) — décision à prendre,
cf. [point 54](./05-DETTE-ET-POINTS-OUVERTS.md). Les modales sont des `Modal`
React Native avec `animationType="none"` et une feuille qui glisse
(`SlideInDown`, Reanimated) : ne pas introduire un troisième langage de
modale.

## Arborescence réelle

```
src/
  app/
    _layout.tsx              # AuthGate : connexion → onboarding → app (Stack.Protected)
    (auth)/login.tsx         # 1a — connexion/inscription email + mot de passe, Google (+ bouton DEV, cf. dette n°1)
    (onboarding)/            # bienvenue (4 slides) → index (1/6 accompagnement)
                             # → prenoms (2/6) → bebe (3/6 date de terme)
                             # → statut (4/6) → priorites (5/6) → rappels (6/6)
                             # → reassurance (+ PaywallModal) → invitation
                             # (si co-parent) → finalisation (écrit tout en base)
    (tabs)/                  # 4 onglets + destinations `href: null`
      index.tsx              # hub
      profil.tsx  informations.tsx  reglages.tsx   # onglets fixes
      demarches.tsx ensemble.tsx sante.tsx organisation.tsx
      partenaire.tsx naissance.tsx                 # ouverts depuis le hub
      exercice.tsx           # détail d'exercice (depuis Suivi santé)
      bebe.tsx prenoms.tsx premium.tsx             # vitrine premium
      bebe-{croissance,biberon,allaitement,bain}.tsx
      legal.tsx              # depuis Réglages
  components/                # par domaine : baby, birth, health, household,
                             # hub, navigation, onboarding, organisation,
                             # procedures, settings, together, ui
  features/<domaine>/        # api.ts (appels Supabase), hooks.ts (TanStack
                             # Query), constants.ts (catalogues, formatage)
                             # domaines : auth, baby, birth, health, household,
                             # hub, onboarding, organisation, partner,
                             # procedures, profile, settings, together
  lib/
    supabase/                # client, auth-redirect (retours d'Auth par URL), database.types.ts
    query/                   # queryClient, keys.ts (une clé par domaine)
    atoms/                   # session, role, onboarding (brouillon), dev-bypass
    date.ts color.ts         # dates ISO locales, helpers de couleur
```

Convention par domaine : un écran n'appelle jamais Supabase directement, il
passe par `features/<domaine>/hooks.ts`, qui s'appuie sur `api.ts`. Les
listes et détails d'un même pilier vivent dans un seul écran, basculés par
état local (Démarches, Organisation, Suivi santé) — sauf quand un visuel doit
filer bord à bord (`exercice.tsx`, une route).

### Carte des routes

| Route | Écran | Données | Visibilité par rôle |
|---|---|---|---|
| `/` | Hub : salutation, « J'ai accouché », humeur du partenaire ou invitation, bloc « Aujourd'hui », 3 piliers + Organisation, teaser « Votre bébé », « Mon partenaire », « Nos prochains rendez-vous » | `households`, `mood_checkins`, `household_procedures`, `appointments`, `symptoms_log` | « J'ai accouché » réservé à la personne enceinte |
| `/demarches` | Liste par mois de grossesse (ouverte sur le mois en cours) + détail | `procedure_templates`, `household_procedures` | Aucune |
| `/ensemble` | Check-in humeur, besoin, semaine, geste du jour | `mood_checkins`, `gesture_suggestions` | Écran symétrique (dette n°22) |
| `/sante?tab=` | Journal, Rendez-vous, Contacts, Exercices | `symptoms_log`, `appointments`, `contacts`, catalogue client | Journal absent pour le co-parent ; les deux parents créent des rendez-vous, chacun voit les siens + ceux que l'autre a partagés (RLS) |
| `/exercice?slug=` | Fiche d'exercice illustrée | `EXERCISE_CATALOG` (client) | Aucune |
| `/organisation` | Valise de maternité, valise en salle de naissance (Maman/Bébé/Co-parent + articles personnalisés), teaser « Le match des prénoms » | `household_checklist_items`, `household_custom_checklist_items` | Sous-section Co-parent masquée si « Seul·e » |
| `/partenaire` | Humeur du partenaire, taille du bébé, astuces | `mood_checkins`, `baby_size_by_week` | Vue personne enceinte seulement (dette n°26) |
| `/naissance` | 7a — déclaration de naissance | `households.birth_date` | Personne enceinte |
| `/informations` | Informations importantes par catégorie | `household_info_items` | Aucune (les deux lisent et écrivent) |
| `/profil`, `/reglages`, `/legal` | Prénom, thème, compte (email, mot de passe, suppression), liens légaux | `profiles`, Auth, Edge Function `delete-account` | Personnel |
| `/bebe`, `/bebe-*`, `/prenoms`, `/premium` | Vitrine premium (paywall inerte) ; suivis bébé en état local | aucune | Dette n°53 |

## Mode contournement DEV et données fictives

Faute de SMTP configuré (dette n°8) et de comptes de test, un **mode contournement** (`devBypassAtom`, `__DEV__` uniquement) permet
de parcourir l'onboarding puis l'app sans session. Sans foyer réel, plusieurs
écrans s'appuient sur des fixtures ou des atomes dédiés : démarches et
checklists (`dev-fixture.ts`), prénom, type d'accompagnement et date de terme
saisis à l'onboarding (`devBypass*Atom`). Tout ce qui est modifié dans ce mode
reste en mémoire et disparaît au rechargement de la page.

Les **données fictives de rendu** (`MOCK_APPOINTMENTS` du hub,
`MOCK_INFO_ITEMS` des Informations) ne s'affichent plus qu'en mode
contournement : un vrai foyer sans données voit un état vide (corrigé le
2026-11-11). Elles disparaîtront avec le mode contournement.

## Supabase — points de vigilance

- **Schéma et RLS** : voir [`DOCS/migrations/README.md`](./migrations/README.md) pour le catalogue complet. `households` porte directement `pregnant_user_id`/`partner_user_id` (pas de table de jointure générique — un foyer ne dépasse jamais 2 personnes), et deux fonctions SQL `is_household_member(household_id)` / `household_role(household_id)` factorisent toutes les policies.
- **Données de santé** (`symptoms_log`) : lecture ouverte aux deux membres, écriture réservée à la personne enceinte — la policy la plus restrictive du schéma. Le co-parent lit les symptômes du jour depuis le bloc « Aujourd'hui » du hub (`usePregnantSymptomsForDate`), sans élargir aucune policy. `household_info_items` (groupe sanguin, allergies, n° de sécurité sociale) est lisible et modifiable par les deux membres.
- **Migrations à jour ?** Vérifier que le projet cloud a bien reçu toutes les migrations du dépôt (`bunx supabase migration list`) — au 2026-11-11, les deux dernières n'y sont pas (dette n°49).
- **Types générés** : `bun run db:types` génère depuis le projet **lié** (`--linked`), `bun run db:types:local` depuis le stack local (`bun run db:start`, requiert Docker). Régénérer après chaque `db push`, jamais éditer `database.types.ts` à la main.
- **CLI** : `supabase/config.toml` posé en Phase 0 via `supabase init`. Le projet Supabase cloud existe (`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_KEY` dans `.env`, jamais commité — `.env.example` ne contient que des placeholders). Sans ces variables, `src/lib/supabase/client.ts` fonctionne quand même avec des valeurs placeholder (l'app se lance, les appels Supabase échouent proprement).

### Connexion — email + mot de passe, Google

Depuis le 2026-11-11, on se connecte par **email + mot de passe** ou par
**Google** ; le lien magique est abandonné. Tout passe par
`src/features/auth/api.ts` (connexion, inscription, mot de passe oublié,
Google, changement de mot de passe, suppression du compte, messages
d'erreur en français). La session ouverte est captée par
`onAuthStateChange` dans le layout racine, qui route seul vers
l'onboarding (pas encore de foyer) ou le hub.

Trois parcours ramènent encore l'utilisateur dans l'app par une URL
portant ses jetons — retour de Google, lien de confirmation d'email, lien
de réinitialisation du mot de passe. Ils supposent deux réglages :

1. **Côté app** : `emailRedirectTo` / `redirectTo` sont calculés par
   `getAuthRedirectTo()` (`src/lib/supabase/auth-redirect.ts`) —
   l'origine courante en web, un deep link `Linking.createURL('/')` en
   natif. La récupération de session vit dans le même module :
   `initialSessionRecovery` (app **ouverte par** l'URL) et
   `useAuthRedirectListener()` (app **déjà lancée**). Les jetons arrivent
   dans le fragment `#` (flux « implicit » du client). En natif, Google
   s'ouvre dans une session de navigateur dédiée
   (`WebBrowser.openAuthSessionAsync`) et la session est créée à partir de
   l'URL de retour.
2. **Côté Supabase** (dashboard — **le MCP Supabase ne donne pas accès aux
   réglages Auth**) :

   | Réglage | Valeur |
   |---|---|
   | Providers → Email | Activé, avec mot de passe. « Confirm email » **désactivé depuis le 2026-11-11 pour les tests**, à réactiver avant production : sans lui, n'importe qui peut s'inscrire avec une adresse qui n'est pas la sienne et rejoindre un foyer invité (dette n°60) |
   | Providers → Google | À activer : identifiants OAuth créés dans Google Cloud, URL de rappel `https://hsclyntlnoyevstdhgvu.supabase.co/auth/v1/callback` |
   | Site URL | `us://` |
   | Redirect URLs | `us://**`, `exp://**`, `exp+us://**`, `http://localhost:8081/**` |
   | Password security | Longueur minimale 8 (l'app l'impose déjà), protection contre les mots de passe compromis si l'offre le permet |

   ⚠️ Les trois dernières Redirect URLs servent **au développement** (Expo
   Go, build de dev, web local) et sont **à retirer avant la mise en
   production**. Toute URL non listée est refusée silencieusement — le
   symptôme est un lien qui n'ouvre pas l'app.

**Co-parent** : l'invitation n'envoie plus d'email ; elle enregistre
l'adresse dans `household_invites`. Le co-parent s'inscrit avec cette
adresse et `accept_household_invite()` le rattache — seulement si son
email est **confirmé** (`auth.users.email_confirmed_at`), seule preuve
qu'il possède l'adresse.

**Suppression du compte** : Edge Function `delete-account`
(`supabase/functions/delete-account/`, `verify_jwt` activé) appelée depuis
Réglages. Elle supprime toujours l'appelant, jamais un autre compte ; les
données suivent par cascade (tout le foyer si c'est la personne enceinte,
seulement ses propres données si c'est le co-parent).

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

- Biome pour lint + format (remplace ESLint/Prettier). Le hook Husky
  `pre-commit` lance `biome check --staged` : un commit qui échoue au lint
  est refusé (y compris `useExhaustiveDependencies`).
- TypeScript strict activé dès le scaffold initial (pas de relâchement progressif).
- CI GitHub Actions (`.github/workflows/ci.yml`, sur PR et push `main`) :
  `bun install --frozen-lockfile`, `expo export --platform web` (génère les
  types Expo/Uniwind et sert de test de build), `bun run lint`,
  `bun run typecheck`.
- **Aucun test automatisé** à ce jour (ni unitaire, ni intégration RLS) — la
  vérification se fait à la main dans le navigateur, en mode contournement
  DEV. Les tests d'intégration des policies RLS sont demandés en Phase 2.
- Vérifications visuelles en web (`bun run web`, port 8081) : comportements
  propres au web à connaître — la molette de souris peut laisser une molette
  de date entre deux lignes, et un rechargement de page perd le mode
  contournement DEV (il faut rejouer l'onboarding).
