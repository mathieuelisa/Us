---
title: Synthèse du design — US
source: design/onboarding-parental-us/project/US Hi-Fi.dc.html
---

# Synthèse du design — application "US"

> Ce document synthétise le fichier Hi-Fi exporté depuis Claude Design
> (conservé tel quel dans [`design/onboarding-parental-us/`](../design/onboarding-parental-us/)).
> Il sert de **référence fonctionnelle** pour le [Plan d'action](./02-ACTION-PLAN.md)
> et le [Plan de versionning](./03-VERSIONING.md).

## Pitch produit

**US** est une application mobile destinée aux couples (ou parents solo/en
coparentalité) qui traversent une grossesse puis les premiers mois du bébé.
Elle centralise trois piliers du quotidien :

- **Démarches** — suivi des formalités administratives (CAF, sécurité
  sociale, mutuelle, congé employeur, mode de garde, déclaration de
  naissance en mairie).
- **Ensemble** — suivi de l'état émotionnel du couple, "gestes du jour"
  suggérés à l'un pour prendre soin de l'autre, demandes d'aide rapides.
- **Suivi santé** — journal de symptômes, rendez-vous médicaux partagés,
  contacts (gynécologue, sage-femme, urgences), exercices par trimestre.

Un quatrième pilier, **"Votre bébé"**, est **premium** (paiement unique
14,99 €) et ne se débloque qu'après la naissance : courbe de croissance,
biberons, allaitement, bain, sommeil, couches, visites médecin — avec un
système de "favoris" personnalisables.

## Identité visuelle

- Couleur de marque : `#2D5E5A` (vert sauge foncé)
- Fond "vue personne enceinte" : `#EAF5F0` (menthe pâle)
- Fond "vue partenaire" : `#FDF6E3` (crème) — **le fond de couleur change selon le rôle de l'utilisateur dans le couple**, à traiter comme un thème par rôle, pas juste par écran.
- Accent premium : `#e8c874` (or), badge "PREMIUM" sur fond dégradé sombre `#1a1a1a → #2d2d2d`
- Police : système (`-apple-system` / SF Pro), coins très arrondis (14–24px), pas d'ombres fortes
- Navigation basse à 3 onglets : **Accueil / Profil / Réglages**

## Carte des écrans (10 sections, ~45 écrans)

| # | Section | Écrans clés | Notes |
|---|---------|-------------|-------|
| 1 | Onboarding | 1a Accueil/connexion (magic link, pas de mot de passe) · 1d Type d'accompagnement · 1z Prénoms · 1b Date bébé + 1er enfant · 1c Statut pro + région · 1e Priorités (multi-choix) · 1f Rythme rappels · 1y Réassurance sociale (50k+ téléchargements, 4.8★) · 1g Paywall (14,99€) | 6 étapes avec barre de progression |
| 2 | Hub post-onboarding | 2a Transition/loading · 2b Hub d'accueil (liste des sections) · 2d Invitation partenaire · 2c Notification push | Le hub est l'écran d'accueil permanent après onboarding |
| 3 | Pilier "Ensemble" | 3c/3d Hub par rôle (vue enceinte / vue partenaire) · 3a/3g Check-in humeur (5 emojis + historique 7 jours + graphique) · 3b Overlay "besoin de..." (tags rapides + texte libre) · 3e Geste du jour (détail) · 3f Notif · 3y Mon profil · 3z Infos importantes (données médicales partagées) | Coloration différente pour chaque rôle |
| 4 | Pilier "Suivi santé" | 4a Journal du jour (symptômes, calendrier) · 4z Vue lecture seule partenaire · 4b Rendez-vous (calendrier mensuel, partagé/non partagé) · 4g Ajout RDV (bottom sheet) · 4c Contacts (réordonnables, urgence en rouge) · 4f Exercices (par trimestre) · 4d Notif réassurance | Sous-onglets : Journal / Rendez-vous / Contacts / Exercices |
| 5 | Pilier "Démarches" | 5a Liste (statuts À faire / En cours / Fait) · 5b Détail démarche (documents requis, deadline, lien téléservice officiel, toggle rappel) · 5c Notif rappel | Contenu probablement semi-statique (référentiel de démarches FR) |
| 6 | "Aujourd'hui" | 6a/6b État du jour par rôle (humeur partenaire, conseil du jour, prochains RDV, taille du bébé de la semaine avec métaphore fruit/légume) | Vue résumé cross-pilier |
| 7 | Déclaration de naissance | 7a Formulaire date de naissance — déclenche la transition grossesse → bébé | Action pivot : recalcule toutes les échéances de démarches |
| 8 | "Votre bébé" (PREMIUM) | 8y Choix initial des sections suivies · 8a Gérer favoris (glisser-déposer, ajout/retrait) · 8b Écran principal (grille de tuiles) · 8c Courbe de croissance (graphique SVG taille/poids) · 8d Ajouter mesure · 8f Ajouter bain · 8g Ajouter allaitement (minuteur sein gauche/droit/les deux) · 8h Ajouter biberon (lait maternel/infantile) | Système de favoris = liste ordonnée par utilisateur |
| 9 | Demande d'avis | 9a Bannière "Vous aimez US ?" (👍/👎) intégrée au hub · 9b Note 5 étoiles + commentaire libre | Pattern classique de demande d'avis in-app |
| 10 | Réglages | Langue (FR/EN), thème sombre, couleur d'accent (4 choix), infos importantes, notifications, noter l'app, aide & support, export de données, CGU/confidentialité | |

Le fichier source complet (avec tout le HTML/CSS des maquettes) reste consultable dans
[`design/onboarding-parental-us/project/US Hi-Fi.dc.html`](../design/onboarding-parental-us/project/US%20Hi-Fi.dc.html).
Un second fichier, [`Onboarding US Wireframes.dc.html`](../design/onboarding-parental-us/project/Onboarding%20US%20Wireframes.dc.html),
contient des wireframes antérieurs (basse-fidélité) — à consulter seulement si le Hi-Fi laisse un doute sur une intention.

## Modèle de données inféré

Ce modèle n'est **pas un schéma final** — c'est la base de discussion pour le
schéma Supabase (voir [Architecture](./04-ARCHITECTURE.md)).

- **`users`** — un compte par personne (auth Supabase, magic link/OTP email)
- **`households`** (ou `couples`) — regroupe 1 ou 2 `users` ; type d'accompagnement (`en_couple` / `coparentalite` / `seul` / `autre`) ; prénoms
- **`pregnancies`** — rattachée à un household : date de début, terme prévu, 1er enfant (bool), date de naissance réelle (nulle avant l'accouchement)
- **`onboarding_answers`** — statut pro, région, priorités (array), rythme de rappels
- **`mood_checkins`** — user_id, date, emoji/score, historique hebdo
- **`daily_gestures`** — contenu suggéré (probablement un référentiel statique + logique de sélection quotidienne)
- **`help_requests`** — "besoin de..." (tag ou texte libre), envoyé au partenaire
- **`symptoms_log`** — user_id, date, liste de symptômes cochés
- **`appointments`** — titre, date, heure, adresse, notes, `shared: boolean`, household_id
- **`contacts`** — nom, rôle, adresse, `is_emergency: boolean`, ordre d'affichage
- **`exercises`** — référentiel statique par trimestre (probablement seedé, pas éditable par l'utilisateur)
- **`procedures`** (démarches) — référentiel FR (CAF, sécu, mutuelle, etc.) + statut par household (`a_faire` / `en_cours` / `fait`), deadline calculée depuis la date de naissance, rappel (bool)
- **`important_info`** — données sensibles partagées (groupe sanguin, allergies, n° sécu, sage-femme, maternité) — **données de santé, à chiffrer / restreindre en RLS Supabase**
- **`baby_favorites`** — liste ordonnée de modules activés par household (`growth`, `bottle`, `bath`, `breastfeeding`, `sleep`, `diaper`, `doctor_visit`)
- **`baby_measurements`** — taille/poids + date + commentaire
- **`baby_feedings`** — type (`lait_maternel` / `lait_infantile` / `allaitement`), quantité (ml) ou durée + côté (allaitement), date/heure
- **`baby_baths`**, **`baby_sleep`**, **`baby_diapers`**, **`baby_doctor_visits`** — journaux simples horodatés
- **`subscriptions`** — statut premium (achat unique, restauration d'achat)
- **`app_feedback`** — note 1-5 + commentaire libre (demande d'avis)
- **`settings`** — langue, thème, couleur d'accent, notifications

## Points d'attention pour l'implémentation

- **Double vue par rôle** : presque tous les écrans changent de couleur de fond et de contenu selon que l'utilisateur est la personne enceinte ou le·la partenaire. Prévoir un contexte de rôle global plutôt que dupliquer les écrans.
- **Données de santé sensibles** (`important_info`, `symptoms_log`) → RLS Supabase stricte, accès limité aux membres du household, chiffrement à évaluer.
- **Transition grossesse → bébé** (écran 7a) est un événement pivot qui change la navigation (le pilier "Votre bébé" apparaît/se débloque, "Aujourd'hui" change de contenu).
- **Achat unique premium** (pas d'abonnement) → intégration RevenueCat ou StoreKit/Billing direct à valider ; restauration d'achat obligatoire (Apple/Google review).
- **Notifications push** apparaissent dans plusieurs flux (rappels démarches, gestes du jour, réassurance) → nécessite Expo Notifications + un scheduler côté backend (Supabase Edge Functions + cron, ou service externe).
