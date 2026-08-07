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
