import { useTranslation } from 'react-i18next';

import { type AppLanguage, getLocaleTag, isAppLanguage } from './languages';

/** Langue de l'interface, et re-rendu quand elle change. */
export function useAppLanguage(): AppLanguage {
  const { i18n } = useTranslation();
  return isAppLanguage(i18n.language) ? i18n.language : 'fr';
}

/**
 * Étiquette BCP 47 pour `Intl` / `toLocaleDateString`. À passer
 * explicitement aux fonctions de formatage de date : avec le React
 * Compiler, une fonction qui lirait la langue en global garderait son
 * résultat mémorisé après un changement de langue.
 */
export function useLocale(): string {
  return getLocaleTag(useAppLanguage());
}
