import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import {
  type AppLanguage,
  FALLBACK_LANGUAGE,
  getDeviceLanguage,
  getLocaleTag,
  isAppLanguage,
} from './languages';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';

export const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
} as const;

/**
 * Copie locale du choix de langue : sert avant la connexion (écran de
 * connexion, onboarding) et au démarrage, avant que le profil ne soit
 * chargé. La référence, une fois connecté, reste `profiles.language`.
 */
const STORAGE_KEY = 'us.language';

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: ['fr', 'en', 'es'],
  // React échappe déjà le texte.
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

function applyDocumentLanguage(language: AppLanguage) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
}
applyDocumentLanguage(i18n.language as AppLanguage);
i18n.on('languageChanged', (lng) => {
  if (isAppLanguage(lng)) applyDocumentLanguage(lng);
});

/** Langue de l'interface en cours. */
export function getAppLanguage(): AppLanguage {
  return isAppLanguage(i18n.language) ? i18n.language : FALLBACK_LANGUAGE;
}

/** Étiquette `Intl` de la langue en cours, hors composants (notifications). */
export function getAppLocaleTag(): string {
  return getLocaleTag(getAppLanguage());
}

/**
 * Change la langue de l'interface et retient le choix sur le téléphone.
 * `null` = revenir à la langue du téléphone.
 */
export async function setAppLanguage(
  language: AppLanguage | null,
): Promise<void> {
  const next = language ?? getDeviceLanguage();
  if (i18n.language !== next) await i18n.changeLanguage(next);
  try {
    if (language) await AsyncStorage.setItem(STORAGE_KEY, language);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Stockage indisponible : la langue vaut pour cette session seulement.
  }
}

/**
 * Applique au démarrage la langue retenue sur le téléphone. Attendue par le
 * layout racine avant d'afficher le premier écran, pour ne pas le montrer
 * une fraction de seconde dans la langue du téléphone.
 */
export const languageRestored: Promise<void> = (async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (isAppLanguage(stored) && stored !== i18n.language) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // Pas de stockage (navigation privée…) : langue du téléphone.
  }
})();

export default i18n;
