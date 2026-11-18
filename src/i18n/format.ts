/**
 * Formats de date dépendants de la langue, pour remplacer les noms de jours
 * et de mois écrits en dur. Toujours appelés avec la `locale` de
 * `useLocale()` (cf. `hooks.ts`), jamais une langue lue en global.
 */

const MONDAY_2024_01_01 = new Date(2024, 0, 1);

/**
 * Initiales des jours, lundi en tête : « L M M J V S D », « M T W T F S S »,
 * « L M X J V S D ».
 */
export function getWeekdayLetters(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  return Array.from({ length: 7 }, (_, index) =>
    format
      .format(
        new Date(
          MONDAY_2024_01_01.getFullYear(),
          MONDAY_2024_01_01.getMonth(),
          MONDAY_2024_01_01.getDate() + index,
        ),
      )
      .toLocaleUpperCase(locale),
  );
}

/** Noms des mois (« janvier »…), en minuscules comme `Intl` les donne. */
export function getMonthNames(
  locale: string,
  style: 'long' | 'short' = 'long',
): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: style });
  return Array.from({ length: 12 }, (_, index) =>
    format.format(new Date(2024, index, 1)),
  );
}

/** Noms des jours, lundi en tête (« lundi »…). */
export function getWeekdayNames(
  locale: string,
  style: 'long' | 'short' = 'long',
): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: style });
  return Array.from({ length: 7 }, (_, index) =>
    format.format(new Date(2024, 0, 1 + index)),
  );
}

/** Majuscule initiale, selon les règles de la langue. */
export function capitalizeFirst(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** « 16 novembre », « 16 November », « 16 de noviembre ». */
export function formatDayMonth(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  });
}
