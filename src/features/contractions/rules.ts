/**
 * Assistant contractions & départ maternité : modèle côté app, calculs et
 * règle de départ. Tout se déduit des heures de début et de fin enregistrées
 * (voir la migration `contractions`) — durée = fin − début, intervalle =
 * début − début précédent, la mesure usuelle des maternités.
 *
 * ⚠️ Contenu médical rédigé pour l'app, **sans relecture professionnelle**
 * (même réserve que les conseils de symptômes, dette n°47) : seuils et
 * messages à faire valider par une sage-femme avant mise en production.
 * L'app conseille, elle ne décide pas : les signes d'urgence renvoient
 * toujours vers la maternité, quel que soit le calcul.
 */

export type Contraction = {
  id: string;
  startedAt: string;
  /** `null` : contraction en cours. */
  endedAt: string | null;
};

export type ContractionSession = {
  id: string;
  startedAt: string;
  /** `null` : suivi en cours. */
  endedAt: string | null;
  /** Dans l'ordre chronologique. */
  contractions: Contraction[];
};

/**
 * Règle française classique (choix explicite) : des contractions qui
 * reviennent toutes les 5 minutes ou moins, de façon régulière, depuis 2 h
 * pour un premier bébé, depuis 1 h pour les suivants.
 */
export const DEPARTURE_INTERVAL_MS = 5 * 60_000;
/** Marge sur l'intervalle : un écart de 5 min 20 reste « toutes les 5 min ». */
const INTERVAL_TOLERANCE_MS = 30_000;
const FIRST_CHILD_WINDOW_MS = 2 * 60 * 60_000;
const NEXT_CHILD_WINDOW_MS = 60 * 60_000;

/**
 * Durée pendant laquelle les contractions doivent rester régulières. Rang
 * du bébé inconnu (onboarding passé) : la fenêtre courte, par prudence —
 * mieux vaut conseiller de partir un peu tôt que trop tard.
 */
export function departureWindowMs(isFirstChild: boolean | null): number {
  return isFirstChild === true ? FIRST_CHILD_WINDOW_MS : NEXT_CHILD_WINDOW_MS;
}

export type ContractionAnalysis = {
  count: number;
  /** Contraction en cours, s'il y en a une. */
  current: Contraction | null;
  lastDurationMs: number | null;
  /** Moyennes sur les 6 dernières contractions (ou intervalles). */
  averageDurationMs: number | null;
  averageIntervalMs: number | null;
  /** Depuis combien de temps les contractions restent à ≤ 5 min d'écart. */
  regularForMs: number;
  windowMs: number;
  /** Avancement vers la règle de départ, entre 0 et 1. */
  progress: number;
  shouldLeave: boolean;
};

const RECENT_COUNT = 6;

export function analyzeContractions(
  contractions: Contraction[],
  now: number,
  isFirstChild: boolean | null,
): ContractionAnalysis {
  const windowMs = departureWindowMs(isFirstChild);
  const starts = contractions.map((c) => Date.parse(c.startedAt));
  const completed = contractions.filter((c) => c.endedAt !== null);
  const durations = completed.map(
    (c) => Date.parse(c.endedAt as string) - Date.parse(c.startedAt),
  );
  const intervals = starts
    .slice(1)
    .map((start, index) => start - starts[index]);

  // Série régulière en cours : on remonte depuis la dernière contraction
  // tant que l'écart avec la précédente reste dans la règle. Une série dont
  // la dernière contraction est trop ancienne est interrompue.
  let regularForMs = 0;
  const lastStart = starts.at(-1);
  if (
    lastStart !== undefined &&
    now - lastStart <= DEPARTURE_INTERVAL_MS + INTERVAL_TOLERANCE_MS
  ) {
    let first = starts.length - 1;
    while (
      first > 0 &&
      starts[first] - starts[first - 1] <=
        DEPARTURE_INTERVAL_MS + INTERVAL_TOLERANCE_MS
    ) {
      first -= 1;
    }
    regularForMs = lastStart - starts[first];
  }

  return {
    count: contractions.length,
    current: contractions.find((c) => c.endedAt === null) ?? null,
    lastDurationMs: durations.at(-1) ?? null,
    averageDurationMs: average(durations.slice(-RECENT_COUNT)),
    averageIntervalMs: average(intervals.slice(-RECENT_COUNT)),
    regularForMs,
    windowMs,
    progress: Math.min(1, regularForMs / windowMs),
    shouldLeave: regularForMs >= windowMs,
  };
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Chronomètre : « 04:07 », ou « 1:04:07 » au-delà d'une heure. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Durée lisible : « 48 s », « 1 min 05 », « 1 h 20 ». */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    const seconds = totalSeconds % 60;
    return seconds === 0
      ? `${totalMinutes} min`
      : `${totalMinutes} min ${String(seconds).padStart(2, '0')}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0
    ? `${hours} h`
    : `${hours} h ${String(minutes).padStart(2, '0')}`;
}

/** Heure de début d'une contraction : « 14:32 ». */
export function formatTimeOfDay(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}
