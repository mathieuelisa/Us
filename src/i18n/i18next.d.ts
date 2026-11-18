import 'i18next';

import type { fr } from './locales/fr';

/**
 * Clés typées : `t('settings.title')` est vérifié par `tsc`, et une clé
 * absente du français (la référence) ne compile pas.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof fr };
    returnNull: false;
  }
}
