/**
 * Date ISO **locale**, pas UTC : à 23 h à Paris, `toISOString()` bascule
 * déjà au lendemain, ce qui ferait paraître manquant un check-in du jour.
 * Extrait de `features/hub/api.ts` dès qu'un deuxième appelant en a eu
 * besoin (`features/together`), pour ne pas dupliquer cette subtilité.
 */
export function toLocalIsoDate(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function todayIso(): string {
  return toLocalIsoDate(new Date());
}

export function shiftIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return toLocalIsoDate(new Date(year, month - 1, day + days));
}

/** Nombre de jours entiers de `fromIso` à `toIso` (négatif si `toIso` est avant). */
export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd).getTime();
  const to = new Date(ty, tm - 1, td).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Choix déterministe du jour dans un référentiel : tout le monde voit la
 * même chose toute la journée, et ça change le lendemain — plutôt qu'un
 * tirage aléatoire qui changerait à chaque ouverture d'écran.
 */
export function pickForToday<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[getDayOfYear() % items.length];
}
