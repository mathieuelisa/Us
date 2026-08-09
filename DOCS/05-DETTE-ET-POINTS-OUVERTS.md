---
title: Dette et points ouverts — US
---

# Dette et points ouverts

> Inventaire des détails à ne pas perdre : contournements temporaires,
> vérifications jamais faites, décisions prises par défaut faute d'arbitrage.
> Rien ici ne bloque le développement au jour le jour — c'est précisément
> pour ça que ça s'oublie.
>
> **Convention** : quand un point est réglé, le retirer d'ici et le refléter
> dans le document concerné ([plan d'action](./02-ACTION-PLAN.md),
> [architecture](./04-ARCHITECTURE.md)…). Ce fichier ne doit contenir que du
> vivant, jamais d'historique.

Dernière revue : 2026-08-08.

## 🔴 Bloquant avant toute mise en production

| # | Point | Où |
|---|---|---|
| 1 | **Retirer le bouton DEV** qui saute l'authentification pour atteindre l'onboarding, et son fixture d'écran Démarches (données locales, jamais écrites en base). Protégés par `__DEV__` donc absents des builds de prod, mais le code doit disparaître. Procédure de suppression dans l'en-tête de chaque fichier. | [`src/lib/atoms/dev-bypass.ts`](../src/lib/atoms/dev-bypass.ts), [`src/features/procedures/dev-fixture.ts`](../src/features/procedures/dev-fixture.ts) |
| 2 | **Restreindre les URL de redirection Supabase.** `exp://**`, `exp+us://**` et `http://localhost:8081/**` sont des commodités de développement : elles élargissent la surface d'open-redirect. Ne garder que `us://**` (et le domaine web réel le jour où il existe). | Dashboard Supabase → `Authentication > URL Configuration` |
| 3 | **Consentement explicite RGPD (article 9).** L'app traite des données de santé (symptômes, humeur, groupe sanguin, n° de sécurité sociale) : leur traitement suppose un consentement explicite, donc une action dédiée — pas des CGU acceptées implicitement. À accompagner d'une politique de confidentialité, de durées de conservation et du DPA Supabase. | — |
| 4 | **Supprimer l'ancien projet Supabase de Londres** (`lmocuevvrznpnglcunea`, en pause) et renommer « US app (Paris) » en « US app ». Tant qu'il existe, il occupe un des 2 emplacements gratuits. | Dashboard Supabase |

## 🟠 Jamais vérifié

Ces éléments sont implémentés mais n'ont **jamais tourné pour de vrai**. Ne
pas les considérer comme acquis.

| # | Point | Ce qui bloque |
|---|---|---|
| 5 | **Aucune écriture Supabase authentifiée n'a jamais été exécutée** : création du foyer en fin d'onboarding, envoi de l'invitation, rattachement du co-parent par `accept_household_invite()`. | Nécessite une vraie session, et deux comptes pour le co-parent. |
| 6 | **Retour du lien magique dans l'app sur mobile.** La config serveur est correcte, mais cliquer le lien depuis un navigateur de bureau ne peut pas ouvrir `us://` — il faut ouvrir le lien **depuis le simulateur/appareil**. | Méthode de test, pas le code. |
| 7 | **iOS et Android n'ont jamais été lancés** dans une vérification complète : tout a été validé en web. Le geste de retour au swipe, notamment, n'est pas vérifiable en web. | — |
| 8 | **SMTP personnalisé non configuré.** Le projet utilise le service mutualisé Supabase, limité à quelques emails par heure — impraticable pour tester l'invitation du co-parent. Brevo recommandé (société française, données en UE, 300 emails/jour gratuits) ; nécessite un nom de domaine pour SPF/DKIM. | Prérequis n° 1 pour débloquer le point 5. |
| 9 | **Template d'email en anglais** (« Your sign-in link ») dans un parcours entièrement français. | À personnaliser en même temps que le SMTP. |
| 21 | **Écriture du check-in humeur jamais exécutée** (pilier Ensemble, Phase 1.4) : même limite que le point 5 — vérifié en navigation/rendu, pas en persistance, faute de session réelle. | Même prérequis que le point 5. |

## 🟡 Contournements à remplacer

| # | Point | Où |
|---|---|---|
| 10 | **`OutlineButton` maison** : le variant `outline` de Hero UI Native (comme `secondary`, `tertiary`, `ghost`) ne résout pas sa couleur sur Expo Web et rend le texte quasi illisible. À supprimer si le problème est corrigé en amont ou par la configuration du thème. | [`src/components/outline-button.tsx`](../src/components/outline-button.tsx) |
| 40 | **`PlainInput` maison, généralisée à tout le formulaire de l'app** : contournement initial d'un défaut de variables Hero UI Native pour nos 4 thèmes custom (`--field-background` etc.), depuis corrigé à la racine dans `global.css` — voir Phase 1.7 du [plan d'action](./02-ACTION-PLAN.md). `PlainInput` reste en place par choix : `TextInput` brut, indépendant de la logique interne de la librairie, plus simple à maintenir que de dépendre d'un design system tiers pour un champ texte basique. Même raisonnement pour le cercle `Avatar` maison (`profil.tsx`). À fusionner avec les composants Hero UI Native si un jour ça devient plus simple que de les maintenir séparément. | [`src/components/plain-input.tsx`](../src/components/plain-input.tsx) |
| 11 | **TanStack Form inutilisé** alors que [l'architecture](./04-ARCHITECTURE.md) le mandate pour tous les formulaires. Le diagnostic ayant conclu à une réactivité cassée **n'est pas fiable** (établi avant de découvrir une source de faux positifs dans la méthode de test) : l'essai est à refaire proprement avant de trancher. | [`04-ARCHITECTURE.md`](./04-ARCHITECTURE.md) |
| 12 | **Réordonnancement par boutons haut/bas** dans l'onglet Information, là où le concept prévoit un vrai glisser-déposer. La persistance en base est correcte, seul le geste manque. | [`src/app/(tabs)/informations.tsx`](../src/app/%28tabs%29/informations.tsx) |
| 13 | **Sélecteur de date en colonnes défilables** au lieu des molettes iOS des maquettes — à défaut d'un picker natif commun aux trois plateformes. | [`src/components/onboarding/date-picker.tsx`](../src/components/onboarding/date-picker.tsx) |
| 39 | **`navigation` typé `unknown` + cast local dans `AppTabBar`** : `@react-navigation/bottom-tabs` n'est pas une dépendance directe (expo-router embarque sa copie sans l'exposer), donc son vrai type `NavigationHelpers` générique n'est pas importable proprement. Un type local (`AppTabBarNavigation`) redécrit juste les deux méthodes utilisées (`emit`, `navigate`). À refaire proprement si `@react-navigation/bottom-tabs` devient un jour une dépendance directe résolue. | [`src/components/navigation/tab-bar.tsx`](../src/components/navigation/tab-bar.tsx) |

## 🔵 À trancher

Décisions prises par défaut, à confirmer ou corriger.

| # | Question | Choix actuel |
|---|---|---|
| 14 | **Bouton « J'ai accouché »** : `CONCEPT.md` dit « uniquement sur le hub », les maquettes Hi-Fi le montrent sur presque tous les écrans. | Hub uniquement (le concept écrit fait foi). |
| 15 | **Position du bouton retour** de l'onboarding : demandé en haut à droite, implémenté en haut à **gauche** — convention des deux plateformes, et côté d'où part le swipe de retour. | Gauche. |
| 16 | **Prénom du co-parent** : obligatoire selon `CONCEPT.md`, « facultatif » avec une option « Passer cette étape » dans la maquette 1z. | Obligatoire, et uniquement quand il y a effectivement un co-parent. |
| 17 | **Invitation par SMS** : la maquette 2d propose « Email ou numéro ». | Email seul — le rattachement repose sur un lien magique. Le SMS supposerait un fournisseur et un autre mécanisme. |
| 18 | **Navigation avant au swipe** : demandée « de step en step », mais une pile de navigation ne permet le geste que vers l'arrière. | Retour au swipe ; l'avance reste sur « Continuer », qui porte la validation. Un vrai carrousel demanderait une autre architecture (pager). |
| 19 | **Visibilité de « J'ai accouché »** : les maquettes 3c **et** 3d l'affichent, `CONCEPT.md` le réserve à la femme enceinte. | Femme enceinte uniquement. |
| 20 | **Écrans d'attente ouverts depuis le hub** : il ne reste que Démarches (1.6) et J'ai accouché (Phase 2). Ensemble, Suivi santé et Mon partenaire ont désormais leur vrai contenu. | [`src/components/coming-soon.tsx`](../src/components/coming-soon.tsx) |
| 22 | **Interface Ensemble symétrique** : une seule vue pour les deux rôles, alors que CONCEPT.md décrit une interface non symétrique. Demande explicite pour cette phase — le contenu (pool de gestes) est déjà personnalisé par rôle, l'écran ne l'est pas encore. | [`src/app/(tabs)/ensemble.tsx`](../src/app/%28tabs%29/ensemble.tsx) |
| 23 | **Besoin affiché brut sur le hub**, pas composé en phrase naturelle (« a besoin d'un câlin ») : la grammaire varie par tag et n'a pas été traitée. | [`src/app/(tabs)/index.tsx`](../src/app/%28tabs%29/index.tsx) |
| 24 | **Émoji du geste du jour associé par correspondance de texte exact**, faute de colonne dédiée en base (évite une migration pour un champ décoratif). Se dégrade silencieusement vers un emoji par défaut si le texte est reformulé en base. | [`src/features/together/constants.ts`](../src/features/together/constants.ts) |
| 25 | **Point d'extension du déclenchement comportemental posé mais pas branché** : `countTrailingDifficultMoodDays()` existe, n'est pas encore appelé depuis l'écran. Le déclenchement réel (notification) reste Phase 4. | [`src/features/together/api.ts`](../src/features/together/api.ts) |
| 26 | **Vue co-parent du pilier Suivi santé et de « Mon partenaire »** : reste à faire la reprise de ses rendez-vous partagés et l'accès **en lecture seule** aux symptômes du Journal — sa seule porte d'entrée vers cette donnée de santé. L'onglet Journal lui est déjà correctement masqué. | [`src/app/(tabs)/sante.tsx`](../src/app/%28tabs%29/sante.tsx), [`partenaire.tsx`](../src/app/%28tabs%29/partenaire.tsx) |
| 27 | **Filtrage des exercices par trimestre jamais exercé** : sans foyer réel, la date de terme est inconnue et c'est toujours le repli « trois trimestres » qui s'affiche. Le calcul de semaine d'aménorrhée n'a donc pas été vérifié en conditions réelles. | [`src/features/health/constants.ts`](../src/features/health/constants.ts) |
| 28 | **Catalogue de symptômes en constante client**, pas en base contrairement à `exercises` / `gesture_suggestions` : liste fermée qui fait partie de l'interface. À basculer en base si elle doit devenir configurable. | [`src/features/health/constants.ts`](../src/features/health/constants.ts) |
| 29 | **Astuces du jour en constante client** (« Mon partenaire »), même raisonnement que le point 28. Distinctes du « geste du jour », qui vit bien en base. | [`src/features/partner/constants.ts`](../src/features/partner/constants.ts) |
| 30 | **Modification d'un rendez-vous impossible** : création et suppression seulement. Changer l'heure ou le statut partagé impose de supprimer puis recréer. | [`src/components/health/appointments-tab.tsx`](../src/components/health/appointments-tab.tsx) |
| 31 | **Le bouton « Inviter » du hub ne permet pas d'inviter** : il ouvre « Mon partenaire », où l'on ne peut rien envoyer non plus. L'invitation n'existe que pendant l'onboarding — si elle a été passée, il n'y a aujourd'hui **aucun moyen de l'envoyer plus tard**. Complétion de la Phase 1.2 (`invitePartner()` existe déjà côté API). | [`src/app/(tabs)/index.tsx`](../src/app/%28tabs%29/index.tsx) |
| 32 | **Calcul d'échéance de la déclaration de naissance jamais exercé en conditions réelles** : `households.birth_date` reste `null` tant que la Phase 2 n'est pas construite ; seul l'affichage informatif par défaut (« 5 jours à partir de la naissance ») a pu être vérifié. | [`src/features/procedures/constants.ts`](../src/features/procedures/constants.ts) |
| 33 | **Rappel de démarche sans effet réel** : le toggle « Me rappeler avant l'échéance » persiste bien `reminder_enabled`, mais rien ne le lit encore — les notifications sont câblées en Phase 4. | [`src/app/(tabs)/demarches.tsx`](../src/app/%28tabs%29/demarches.tsx) |
| 34 | **Écran Démarches vérifié via fixture locale, pas via Supabase réel.** Sans foyer, `useProcedures()` reste vide : en mode contournement DEV, l'écran affiche 6 démarches statiques modifiables localement (jamais écrites en base) pour rester explorable. Le vrai chemin Supabase (lecture ET écriture) n'a toujours pas tourné une seule fois — même limite que les autres piliers, juste rendue visible autrement ici. | [`src/features/procedures/dev-fixture.ts`](../src/features/procedures/dev-fixture.ts) |
| 35 | **Couleurs corail/lavande/ocre des 3 thèmes non-sauge inventées** : aucune maquette ne les spécifie (seule leur existence — « 3 ou 4 thèmes visuels prédéfinis » — est demandée). Choisies pour rester dans la même gamme de saturation/luminosité que le sauge de référence (`#2D5E5A`). À ajuster si une charte graphique les définit un jour. | [`src/features/settings/constants.ts`](../src/features/settings/constants.ts) |
| 36 | **Suivi système clair/sombre désactivé dès qu'un thème non-`light`/`dark` est actif** : Uniwind ne traite `light`/`dark` comme adaptatifs au thème système que pour ces deux noms précis (`isAdaptiveTheme` codé en dur dans la lib) — choisir sauge/corail/lavande/ocre fige donc le rendu, sans suivre le mode sombre du téléphone. Sans conséquence aujourd'hui : le mode sombre est hors MVP et n'a de toute façon aucun rendu distinct dans l'app. | [`node_modules/uniwind/src/core/config/config.common.ts`](../node_modules/uniwind/src/core/config/config.common.ts) |
| 37 | **Aucune photo réelle pour les exercices** : `exercises.image_url` existe (écran de détail, Suivi santé > Exercices) mais reste `null` pour les 4 entrées du catalogue — aucun asset image n'existe dans `design/`. L'écran affiche un repli visuel neutre (« Illustration à venir ») tant que le champ n'est pas renseigné en base. À combler avec de vraies illustrations/photos avant mise en production. | [`supabase/migrations/20260808110000_exercises_image_url.sql`](../supabase/migrations/20260808110000_exercises_image_url.sql) |
| 38 | **Le paywall (1g) n'est plus une route** : `presentation: 'modal'` d'expo-router a été essayé pour l'afficher en pop-up, mais casse la navigation suivante sur web (l'écran ouvert juste après reste caché derrière le paywall précédent). Remplacé par un composant `Modal` React Native monté depuis `reassurance.tsx`. Si le besoin d'une vraie route dédiée revient (deep-link direct vers le paywall, par ex.), refaire cet essai en testant spécifiquement sur device natif, pas seulement web. | [`src/components/onboarding/paywall-modal.tsx`](../src/components/onboarding/paywall-modal.tsx), [`src/app/(onboarding)/reassurance.tsx`](../src/app/%28onboarding%29/reassurance.tsx) |
