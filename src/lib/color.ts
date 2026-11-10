/**
 * Assombrit une couleur hex de `amount` (0–1, fraction de 255 soustraite à
 * chaque canal). Utilisé pour dériver un fond légèrement plus foncé que le
 * pastel de thème (`useThemeBackground`) sans maintenir une deuxième table
 * de couleurs par thème — le calcul s'adapte automatiquement si le pastel
 * change.
 */
export function darkenHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = Number.parseInt(clean, 16);
  const shift = Math.round(255 * amount);

  const channel = (value: number) =>
    Math.max(0, Math.min(255, value - shift))
      .toString(16)
      .padStart(2, '0');

  return `#${channel((num >> 16) & 0xff)}${channel((num >> 8) & 0xff)}${channel(num & 0xff)}`;
}

/** Inverse de `darkenHex` : éclaircit chaque canal de `amount` (0–1). */
export function lightenHex(hex: string, amount: number): string {
  return darkenHex(hex, -amount);
}

/** `#rrggbb` + opacité (0–1) → `rgba(…)`, pour teinter bordures et ombres. */
export function hexToRgba(hex: string, alpha: number): string {
  const num = Number.parseInt(hex.replace('#', ''), 16);
  return `rgba(${(num >> 16) & 0xff}, ${(num >> 8) & 0xff}, ${num & 0xff}, ${alpha})`;
}
