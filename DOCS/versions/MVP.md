---
title: MVP — US
status: à venir
depends_on: ../02-ACTION-PLAN.md#phase-1—mvp
---

# MVP (V1.0)

> Objectif : livrer le **parcours gratuit complet** de la grossesse à la
> naissance, sans le module premium "Votre bébé" ni les paiements. Le but est
> de valider la boucle de valeur principale (couple qui suit sa grossesse
> ensemble) avant d'investir dans le suivi bébé payant.

## Contenu inclus

Correspondance avec les sections du [Design Overview](../01-DESIGN-OVERVIEW.md#carte-des-écrans-10-sections-45-écrans) :

| Inclus | Section design | Détail |
|---|---|---|
| ✅ | 1 — Onboarding | Connexion par magic link (Supabase Auth), 6 étapes complètes, écran de réassurance sociale |
| ⚠️ | 1g — Paywall | Écran affiché tel quel, mais **bouton "Débloquer" désactivé / "bientôt disponible"** — pas d'intégration paiement en MVP |
| ✅ | 2 — Hub post-onboarding | Hub complet, invitation partenaire (email/téléphone → lien de rattachement au household) |
| ✅ | 3 — Pilier Ensemble | Check-in humeur, historique 7j, overlay "besoin de...", geste du jour, profil, infos importantes |
| ✅ | 4 — Pilier Suivi santé | Journal symptômes, rendez-vous (CRUD), contacts (CRUD + réordonnancement), exercices (contenu statique par trimestre) |
| ✅ | 5 — Pilier Démarches | Liste + détail + statuts, référentiel de démarches françaises seedé en base, lien téléservice officiel |
| ✅ | 6 — Aujourd'hui | État du jour croisé, taille du bébé par semaine (référentiel statique) |
| ✅ | 7 — Déclaration de naissance | Formulaire + recalcul des échéances de démarches |
| ❌ | 8 — Votre bébé (premium) | **Hors MVP** — écran d'accès affiché comme "verrouillé", contenu réel reporté à [V1](./V1.md) |
| ⚠️ | 9 — Demande d'avis | Bannière + note 5 étoiles, sans intégration store review native (juste stockage du feedback) |
| ⚠️ | 10 — Réglages | Compte, langue FR uniquement, infos importantes, aide & support, légal. **Thème sombre et couleur d'accent hors MVP** |

## Hors périmètre explicite (reporté)

- Paiement premium réel (IAP / RevenueCat)
- Module "Votre bébé" (croissance, biberon, allaitement, bain, sommeil, couche, visite médecin)
- Notifications push réelles (les écrans de notif existent en design mais le déclenchement backend est reporté)
- Localisation anglaise, thème sombre, couleurs d'accent
- Export de données
- Intégration store review native (SKStoreReviewController / In-App Review Android)

## Critères de sortie (Definition of Done MVP)

- [ ] Un couple peut s'inscrire, se rattacher, et terminer l'onboarding de bout en bout
- [ ] Les 3 piliers gratuits sont fonctionnels avec persistance Supabase (pas de mock)
- [ ] La déclaration de naissance recalcule correctement les échéances de démarches
- [ ] RLS Supabase vérifiée sur toutes les tables (un household ne voit jamais les données d'un autre)
- [ ] Testé sur iOS et Android (Expo), pas seulement en simulateur
- [ ] Aucun crash bloquant sur le parcours principal (onboarding → hub → 3 piliers)

## Suite

Voir [V1](./V1.md) pour le déblocage du premium et du module bébé.
