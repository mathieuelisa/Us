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

/**
 * Fonce un pastel **sans le griser** : baisse sa luminosité de `amount`
 * (0–1) et relève sa saturation d'autant ×3 (plafonnée), en HSL.
 * `darkenHex` retire la même quantité à chaque canal et tire donc les
 * pastels vers le gris ; ici `#EAF5F0` (sauge) donne une menthe franche.
 */
export function deepenPastel(hex: string, amount: number): string {
  const num = Number.parseInt(hex.replace('#', ''), 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  hue = (hue * 60 + 360) % 360;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  const nextLightness = Math.max(0, lightness - amount);
  const nextSaturation = Math.min(0.75, saturation + amount * 3);

  const chroma = (1 - Math.abs(2 * nextLightness - 1)) * nextSaturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = nextLightness - chroma / 2;
  const [r1, g1, b1] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];

  const channel = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r1)}${channel(g1)}${channel(b1)}`;
}
