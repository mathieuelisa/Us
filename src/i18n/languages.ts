import { getLocales } from 'expo-localization';

/**
 * Langues de l'interface (demande explicite du 2026-11-18). Le français
 * reste la référence : c'est lui qui fixe la forme des fichiers de
 * traduction, et la langue de repli quand celle du téléphone n'est pas
 * proposée (les contenus en base et les démarches restent français).
 */
export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es'] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: AppLanguage = 'fr';

/**
 * Nom de chaque langue dans sa propre langue : le sélecteur de Réglages ne
 * les traduit pas, pour qu'on retrouve la sienne même dans une interface
 * qu'on ne lit pas.
 */
export const LANGUAGE_OPTIONS: { id: AppLanguage; label: string }[] = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

/**
 * Région par défaut quand le téléphone parle une autre langue que celle
 * choisie. `en-GB` plutôt que `en-US` : jour avant mois, comme les
 * molettes de date de l'app.
 */
const DEFAULT_LOCALE_TAG: Record<AppLanguage, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
};

export function isAppLanguage(value: unknown): value is AppLanguage {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  );
}

/** Première langue du téléphone que l'app sait parler, sinon le français. */
export function getDeviceLanguage(): AppLanguage {
  for (const locale of getLocales()) {
    if (isAppLanguage(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}

/**
 * Étiquette BCP 47 pour `Intl` (dates, nombres) : celle du téléphone s'il
 * parle déjà cette langue (un téléphone en `es-MX` garde ses formats), une
 * région par défaut sinon.
 */
export function getLocaleTag(language: AppLanguage): string {
  const device = getLocales().find((l) => l.languageCode === language);
  return device?.languageTag ?? DEFAULT_LOCALE_TAG[language];
}
