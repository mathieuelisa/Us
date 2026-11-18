import type { ParseKeys } from 'i18next';

/**
 * Clé de traduction valide (`'settings.title'`…). Pour les constantes
 * déclarées hors composant : elles stockent la clé, et l'écran la traduit
 * au rendu avec `t(...)`, pour suivre un changement de langue.
 */
export type TranslationKey = ParseKeys;
