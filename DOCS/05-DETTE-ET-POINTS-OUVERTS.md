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

Dernière revue : 2026-08-07.

## 🔴 Bloquant avant toute mise en production

| # | Point | Où |
|---|---|---|
| 1 | **Retirer le bouton DEV** qui saute l'authentification pour atteindre l'onboarding. Protégé par `__DEV__` donc absent des builds de prod, mais le code doit disparaître. Procédure de suppression dans l'en-tête du fichier. | [`src/lib/atoms/dev-bypass.ts`](../src/lib/atoms/dev-bypass.ts) |
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

## 🟡 Contournements à remplacer

| # | Point | Où |
|---|---|---|
| 10 | **`OutlineButton` maison** : le variant `outline` de Hero UI Native (comme `secondary`, `tertiary`, `ghost`) ne résout pas sa couleur sur Expo Web et rend le texte quasi illisible. À supprimer si le problème est corrigé en amont ou par la configuration du thème. | [`src/components/outline-button.tsx`](../src/components/outline-button.tsx) |
| 11 | **TanStack Form inutilisé** alors que [l'architecture](./04-ARCHITECTURE.md) le mandate pour tous les formulaires. Le diagnostic ayant conclu à une réactivité cassée **n'est pas fiable** (établi avant de découvrir une source de faux positifs dans la méthode de test) : l'essai est à refaire proprement avant de trancher. | [`04-ARCHITECTURE.md`](./04-ARCHITECTURE.md) |
| 12 | **Réordonnancement par boutons haut/bas** dans l'onglet Information, là où le concept prévoit un vrai glisser-déposer. La persistance en base est correcte, seul le geste manque. | [`src/app/(tabs)/informations.tsx`](../src/app/%28tabs%29/informations.tsx) |
| 13 | **Sélecteur de date en colonnes défilables** au lieu des molettes iOS des maquettes — à défaut d'un picker natif commun aux trois plateformes. | [`src/components/onboarding/date-picker.tsx`](../src/components/onboarding/date-picker.tsx) |

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
| 20 | **Écrans d'attente ouverts depuis le hub** (Démarches, Ensemble, Suivi santé, Mon partenaire, J'ai accouché) : à remplacer par le contenu réel en phases 1.4 à 1.6 et 2. | [`src/components/coming-soon.tsx`](../src/components/coming-soon.tsx) |
