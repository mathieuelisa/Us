-- Comment parler de la personne (demande explicite du 2026-11-15, parcours
-- partenaire) : « il », « elle » ou « neutre » (avec le prénom seulement).
-- Sert uniquement à accorder les textes de l'app (« Bram est épanoui »,
-- « il/elle ») ; demandé au partenaire dans « Faisons connaissance », avec
-- son prénom (`first_name`, déjà présent). `null` = pas renseigné.
--
-- Aucune règle d'accès nouvelle : `profiles_update_own` ne laisse chacun
-- modifier que son propre profil ; l'autre parent du foyer le lit via
-- `profiles_select_household_partner`, comme le prénom.

alter table public.profiles
  add column if not exists pronoun text
    check (pronoun in ('il', 'elle', 'neutre'));
