# Migrations SQL

> Catalogue documenté des migrations Supabase du projet. **Les fichiers SQL
> exécutables vivent dans [`supabase/migrations/`](../../supabase/migrations/)**
> — c'est l'emplacement que le CLI Supabase (`supabase db push`,
> `supabase migration up`, `supabase db reset`) attend obligatoirement. Ce
> dossier ne duplique pas le SQL (pour éviter que les deux versions divergent)
> — chaque ligne ci-dessous pointe vers le fichier réel.

Schéma conçu à partir de [`../CONCEPT.md`](../CONCEPT.md) et
[`../01-DESIGN-OVERVIEW.md`](../01-DESIGN-OVERVIEW.md#modèle-de-données-inféré).
Périmètre : les tables du [MVP](../versions/MVP.md) uniquement (Phase 1 du
[plan d'action](../02-ACTION-PLAN.md)) — le module premium "Votre bébé" (V1)
n'a pas encore de migration, il en aura une propre en Phase 3.

## Hébergement — `eu-west-3` (Paris)

Le projet Supabase est hébergé **à Paris**, et doit le rester : `symptoms_log`
(symptômes), `mood_checkins` (santé mentale) et `household_info_items`
(groupe sanguin, allergies, n° de sécurité sociale) sont des **données de
santé** au sens de l'article 4(15) du RGPD — la définition tient à ce que la
donnée révèle de l'état de santé, indépendamment de toute intervention
médicale. Rester intra-UE évite d'avoir à documenter un transfert vers un
pays tiers.

Le projet a d'abord été créé par erreur en `eu-west-2` (Londres, hors UE
depuis le Brexit — les transferts n'y reposent que sur une décision
d'adéquation révocable), puis recréé à Paris le 2026-08-07 alors que la base
était encore vide. **La région d'un projet Supabase ne se change pas après
création** : la corriger plus tard aurait imposé une migration de données de
santé réelles.

⚠️ L'hébergement n'est qu'une pièce du sujet. Restent à traiter : le
consentement explicite (article 9), la politique de confidentialité, les
durées de conservation et le DPA Supabase.

## Comment appliquer ces migrations

```bash
npm run db:start                        # démarre Supabase en local (requiert Docker)
supabase link --project-ref hsclyntlnoyevstdhgvu   # relie le projet cloud (1x, demande le mot de passe DB)
supabase db push                         # applique les migrations en attente sur le projet lié
npm run db:types                         # régénère src/lib/supabase/database.types.ts
```

## Catalogue

| Fichier | Tables | Description |
|---|---|---|
| [`20260806150000_profiles.sql`](../../supabase/migrations/20260806150000_profiles.sql) | `profiles` | Un profil par utilisateur (prénom, thème), créé automatiquement à l'inscription via trigger sur `auth.users` |
| [`20260806150100_households.sql`](../../supabase/migrations/20260806150100_households.sql) | `households` | L'espace partagé du couple — un seul jeu de données, colonnes `pregnant_user_id`/`partner_user_id` directes (max 2 membres). Fonctions `is_household_member()` / `household_role()` réutilisées par toutes les policies suivantes |
| [`20260806150200_household_invites.sql`](../../supabase/migrations/20260806150200_household_invites.sql) | `household_invites` | Suivi de l'invitation du co-parent par email |
| [`20260806150300_mood_checkins.sql`](../../supabase/migrations/20260806150300_mood_checkins.sql) | `mood_checkins` | Check-in humeur quotidien (pilier Ensemble), 1 par utilisateur par jour, note de besoin optionnelle |
| [`20260806150400_gesture_suggestions.sql`](../../supabase/migrations/20260806150400_gesture_suggestions.sql) | `gesture_suggestions` | Référentiel statique des "gestes du jour" par rôle (seedé) |
| [`20260806150500_symptoms_log.sql`](../../supabase/migrations/20260806150500_symptoms_log.sql) | `symptoms_log` | Journal de symptômes — écriture réservée à la personne enceinte, lecture ouverte aux deux (donnée de santé, RLS la plus stricte du schéma) |
| [`20260806150600_appointments.sql`](../../supabase/migrations/20260806150600_appointments.sql) | `appointments` | Rendez-vous, `is_shared` contrôlant la visibilité côté partenaire |
| [`20260806150700_contacts.sql`](../../supabase/migrations/20260806150700_contacts.sql) | `contacts` | Carnet de contacts partagé, éditable par les deux |
| [`20260806150800_exercises.sql`](../../supabase/migrations/20260806150800_exercises.sql) | `exercises` | Référentiel statique d'exercices par trimestre (seedé) |
| [`20260806150900_procedures.sql`](../../supabase/migrations/20260806150900_procedures.sql) | `procedure_templates`, `household_procedures` | Les 6 démarches administratives V1 (seedées) + statut par foyer, auto-créé par trigger à la création du household |
| [`20260806151000_baby_size_by_week.sql`](../../supabase/migrations/20260806151000_baby_size_by_week.sql) | `baby_size_by_week` | Référentiel statique "taille du bébé par semaine" (seedé) |
| [`20260806151100_household_info_items.sql`](../../supabase/migrations/20260806151100_household_info_items.sql) | `household_info_items` | Onglet "Information" — liste libre et réorganisable (drag-and-drop), pas de colonnes figées |
| [`20260806151200_app_feedback.sql`](../../supabase/migrations/20260806151200_app_feedback.sql) | `app_feedback` | Retours de la demande d'avis in-app, personnels (non partagés avec le partenaire) |
| [`20260807120000_onboarding_and_invites.sql`](../../supabase/migrations/20260807120000_onboarding_and_invites.sql) | `households`, fonction `accept_household_invite()` | Manques révélés par la Phase 1.2 : `households.partner_first_name` (prénom saisi avant que le co-parent ait un compte), index uniques « un foyer par utilisateur et par rôle », et la fonction de rattachement du co-parent invité |
| [`20260808100000_procedure_official_links.sql`](../../supabase/migrations/20260808100000_procedure_official_links.sql) | `procedure_templates` | Renseigne `official_link` pour 5 des 6 démarches d'origine (absent de la migration initiale) — URL vérifiées par recherche web, pas de mémoire. « Mutuelle » reste sans lien : assureur privé propre à chaque foyer |
| [`20260808110000_exercises_image_url.sql`](../../supabase/migrations/20260808110000_exercises_image_url.sql) | `exercises` | Ajoute `image_url` (nullable) pour l'écran de détail d'exercice — aucune photo réelle disponible pour l'instant |
| [`20260809120000_declaration_naissance_description.sql`](../../supabase/migrations/20260809120000_declaration_naissance_description.sql) | `procedure_templates` | Remplace la description courte de "Déclaration de naissance" par un paragraphe explicatif (texte fourni par l'utilisateur) |
| [`20260809130000_procedures_descriptions_and_new_items.sql`](../../supabase/migrations/20260809130000_procedures_descriptions_and_new_items.sql) | `procedure_templates`, `household_procedures` | Étoffe les descriptions de CAF/sécurité sociale/mutuelle/congé employeur/mode de garde, et étend le référentiel de 6 à 8 démarches (ajoute assurance habitation, administration fiscale — écart assumé avec CONCEPT.md). Rattrape aussi `household_procedures` pour les foyers déjà créés, le trigger de seed ne s'exécutant qu'à la création du foyer |
| [`20260813120000_organisation_checklists.sql`](../../supabase/migrations/20260813120000_organisation_checklists.sql) | `checklist_item_templates`, `household_checklist_items` | Listes à cocher "La Valise de maternité" et "Le sac en salle d'accouchement" — même schéma catalogue + statut par foyer que `procedure_templates`/`household_procedures`, auto-seedé par trigger à la création du foyer |
| [`20260814100000_checklist_categories.sql`](../../supabase/migrations/20260814100000_checklist_categories.sql) | `checklist_item_templates` | "La Valise de maternité" se décline en 3 sous-sections Maman/Bébé/Co-parent (colonne `category` nullable — "sac-naissance" reste une liste plate) |
| [`20260814110000_sac_naissance_categories.sql`](../../supabase/migrations/20260814110000_sac_naissance_categories.sql) | `checklist_item_templates` | Même déclinaison Maman/Bébé/Co-parent pour « La valise en salle de naissance » (ex « Le sac en salle d'accouchement », renommage client uniquement) |
| [`20260814120000_household_info_items_category.sql`](../../supabase/migrations/20260814120000_household_info_items_category.sql) | `household_info_items` | Ajoute `category` (téléphone/adresse/date/allergie/n° sécurité sociale/point de vigilance) pour que l'écran "Informations importantes" affiche une icône et un formulaire dédiés par type plutôt qu'une liste libellé/valeur générique. RLS déjà couvert par la policy table-level existante — pas de nouvelle policy |

## Décisions de modélisation

- **`households.pregnant_user_id` / `partner_user_id` en colonnes directes**,
  pas de table de jointure générique `household_members` : le foyer ne
  dépasse jamais 2 personnes (couple / coparentalité / seul·e), donc une
  table de jointure aurait été une abstraction inutile. Simplifie aussi
  radicalement les policies RLS (`auth.uid() in (pregnant_user_id,
  partner_user_id)` plutôt qu'un sous-`select` sur une table tierce).
- **Champs onboarding pliés dans `households`** (`professional_status`,
  `region`, `priorities`, `reminder_frequency`, `due_date`,
  `is_first_child`) plutôt qu'une table `onboarding_answers` séparée : ce
  sont des données 1:1 avec le foyer, pas un historique à versionner.
- **`household_info_items` en liste libre** (`label`/`value`/`sort_order`)
  plutôt qu'en colonnes figées (groupe sanguin, allergies, etc.) : le
  concept exige que ces cartes soient réorganisables par
  glisser-déposer — une liste ordonnée sert directement ce besoin sans
  migration future.
- **`household_procedures` auto-peuplée par trigger** : les clients n'ont
  jamais besoin d'un droit `INSERT` dessus, seulement `UPDATE` du statut.
- **Pas d'échéance stockée** sur `household_procedures` : elle se calcule à
  la volée (`households.birth_date` + `procedure_templates.deadline_days_after_birth`)
  pour garder `birth_date` comme unique source de vérité (cf. la démarche
  "déclaration de naissance").
- **`accept_household_invite()` en `security definer`** : le co-parent
  invité n'est membre d'aucun foyer au moment où il clique le lien, donc
  `is_household_member()` est faux et les policies RLS l'empêchent à la fois
  de voir son invitation et de se rattacher. La fonction est la seule porte
  d'entrée ; elle ne prend **aucun paramètre** et matche uniquement sur
  l'email vérifié du JWT de l'appelant, donc il n'y a rien à falsifier côté
  client. Elle refuse de rejoindre un foyer ayant déjà un co-parent, ou le
  foyer dont l'appelant est lui-même le parent porteur.
