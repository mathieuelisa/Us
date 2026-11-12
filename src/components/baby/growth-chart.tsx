import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import type { BabyEntry } from '@/features/baby/constants';
import { hexToRgba } from '@/lib/color';

type Metric = 'weight' | 'height';
type McIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * `digits` : précision d'affichage des mesures, celle de la molette de
 * saisie — au gramme pour le poids (« 5,690 kg »), au millimètre pour la
 * taille. Les graduations de l'axe restent au dixième.
 */
const METRICS: { key: Metric; label: string; unit: string; digits: number }[] =
  [
    { key: 'weight', label: 'Poids', unit: 'kg', digits: 3 },
    { key: 'height', label: 'Taille', unit: 'cm', digits: 1 },
  ];

/**
 * Tuiles de dernière mesure sous la courbe (capture de référence) : poids
 * et taille, qui choisissent aussi la courbe affichée, et le périmètre
 * crânien, affiché seulement — il n'a pas de courbe.
 */
const STAT_TILES: {
  key: Metric | 'headCircumference';
  label: string;
  unit: string;
  digits: number;
  icon: McIconName;
}[] = [
  {
    key: 'weight',
    label: 'Poids',
    unit: 'kg',
    digits: 3,
    icon: 'scale-bathroom',
  },
  { key: 'height', label: 'Taille', unit: 'cm', digits: 1, icon: 'ruler' },
  {
    key: 'headCircumference',
    label: 'Périmètre crânien',
    unit: 'cm',
    digits: 1,
    icon: 'head-outline',
  },
];

const CHART_HEIGHT = 210;
// Marge haute large : l'infobulle de la dernière mesure se pose au-dessus
// de son point.
const PADDING = { top: 50, right: 18, bottom: 30, left: 38 };

type Point = { id: string; date: string; value: number };

const BUBBLE_HEIGHT = 28;

/**
 * Courbe de croissance du suivi « Croissance » (demande explicite) : une
 * courbe par mesure — poids ou taille, au choix d'une gélule, leurs unités
 * n'ayant pas d'échelle commune. Courbe lissée sans dépassement (cubique
 * monotone), aire en dégradé dessous, un point par mesure, la dernière mise
 * en avant avec sa valeur, et l'évolution depuis la première en en-tête.
 *
 * Habillage d'après une capture de référence (demande explicite) : tuile
 * d'icône en en-tête, gélule blanche, dernière valeur en infobulle pleine
 * d'accent, et tuiles de dernière mesure (poids, taille, périmètre
 * crânien) sous la courbe.
 *
 * Dessinée en SVG (`react-native-svg`, déjà utilisé partout) plutôt qu'avec
 * une bibliothèque de graphiques : quelques mesures, un seul type de courbe.
 * Les mesures arrivent de l'écran parent ; une mesure sans la valeur
 * choisie est simplement ignorée.
 */
export function GrowthChart({
  entries,
  accent,
}: {
  entries: BabyEntry[];
  accent: string;
}) {
  const [metric, setMetric] = useState<Metric>('weight');
  const [width, setWidth] = useState(0);
  const meta = METRICS.find((item) => item.key === metric) ?? METRICS[0];

  const points: Point[] = entries
    .map((entry) => ({
      id: entry.id,
      date: entry.date,
      value: Number.parseFloat(entry.values[metric] ?? ''),
    }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));

  const first = points[0];
  const last = points[points.length - 1];
  const delta =
    first && last && points.length > 1 ? last.value - first.value : null;

  return (
    <View className="gap-3.5">
      <View className="flex-row items-center gap-3">
        {/* Tuile d'icône teintée, comme les en-têtes de cartes du hub. */}
        <View
          className="h-11 w-11 items-center justify-center rounded-[14px]"
          style={{
            backgroundColor: hexToRgba(accent, 0.1),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Ionicons name="stats-chart" size={20} color={accent} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="text-[16.5px] font-extrabold"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
          >
            Courbe de croissance
          </Text>
          <Text
            numberOfLines={1}
            className="text-[12.5px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {last
              ? `Dernière mesure : ${formatValue(last.value, meta.digits)} ${meta.unit}`
              : `Aucune mesure de ${meta.label.toLowerCase()}`}
          </Text>
        </View>
        <MetricToggle metric={metric} accent={accent} onChange={setMetric} />
      </View>

      {delta !== null ? (
        <View
          className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5"
          style={{ backgroundColor: hexToRgba(accent, 0.09) }}
        >
          <Ionicons
            name={delta >= 0 ? 'trending-up' : 'trending-down'}
            size={15}
            color={accent}
          />
          <Text className="text-[12.5px] font-bold" style={{ color: accent }}>
            {`${delta >= 0 ? '+' : '−'}${formatDelta(Math.abs(delta), meta)} depuis le ${formatShortDate(first.date)}`}
          </Text>
        </View>
      ) : null}

      <View
        onLayout={(event: LayoutChangeEvent) =>
          setWidth(event.nativeEvent.layout.width)
        }
        style={{ height: CHART_HEIGHT }}
      >
        {points.length === 0 ? (
          <EmptyChart accent={accent} label={meta.label} />
        ) : width > 0 ? (
          <ChartSvg
            points={points}
            width={width}
            accent={accent}
            unit={meta.unit}
            digits={meta.digits}
          />
        ) : null}
      </View>

      <View className="flex-row gap-2">
        {STAT_TILES.map((tile) => (
          <StatTile
            key={tile.key}
            label={tile.label}
            icon={tile.icon}
            value={latestValue(entries, tile.key)}
            unit={tile.unit}
            digits={tile.digits}
            accent={accent}
            isActive={tile.key === metric}
            onPress={
              tile.key === 'headCircumference'
                ? undefined
                : () => setMetric(tile.key as Metric)
            }
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Dernière valeur d'une mesure, par date ; `null` si jamais mesurée. Lue
 * sur toutes les entrées, pas seulement celles de la courbe affichée.
 */
function latestValue(entries: BabyEntry[], key: string): number | null {
  let latest: { date: string; value: number } | null = null;
  for (const entry of entries) {
    const value = Number.parseFloat(entry.values[key] ?? '');
    if (!Number.isFinite(value)) continue;
    if (!latest || entry.date > latest.date) {
      latest = { date: entry.date, value };
    }
  }
  return latest?.value ?? null;
}

/**
 * Tuile « dernière mesure » : icône, libellé, valeur. Celle de la courbe
 * affichée est teintée d'accent et ornée de petits traits ; un appui sur
 * poids ou taille change de courbe, comme la gélule de l'en-tête.
 */
function StatTile({
  label,
  icon,
  value,
  unit,
  digits,
  accent,
  isActive,
  onPress,
}: {
  label: string;
  icon: McIconName;
  value: number | null;
  unit: string;
  digits: number;
  accent: string;
  isActive: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: isActive } : undefined}
      accessibilityLabel={`${label} : ${
        value === null ? 'non mesuré' : `${formatValue(value, digits)} ${unit}`
      }`}
      disabled={!onPress}
      onPress={onPress}
      className="flex-1 gap-1.5 rounded-[18px] px-2.5 py-2.5"
      style={{
        backgroundColor: isActive
          ? hexToRgba(accent, 0.1)
          : 'rgba(255, 255, 255, 0.85)',
        borderWidth: 1,
        borderColor: isActive ? hexToRgba(accent, 0.18) : 'rgba(0, 0, 0, 0.05)',
      }}
    >
      {isActive ? <Sparkle color={accent} /> : null}
      <View className="flex-row items-center gap-1.5">
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{
            backgroundColor: isActive ? '#ffffff' : hexToRgba(accent, 0.08),
          }}
        >
          <MaterialCommunityIcons name={icon} size={16} color={accent} />
        </View>
        <Text
          numberOfLines={2}
          className="flex-1 text-[11px] leading-[13px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="text-[15px] font-extrabold"
        style={{ color: isActive ? accent : GLASS_TITLE_COLOR }}
      >
        {value === null ? '—' : `${formatValue(value, digits)} ${unit}`}
      </Text>
    </Pressable>
  );
}

/** Trois petits traits d'accent en coin, l'éclat des cartes du design. */
function Sparkle({ color }: { color: string }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: -9, right: 4 }}
    >
      <Svg width={18} height={14}>
        <Line
          x1={3}
          y1={9}
          x2={1}
          y2={3}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={8}
          y1={8}
          x2={10}
          y2={2}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={12}
          y1={11}
          x2={17}
          y2={8}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function MetricToggle({
  metric,
  accent,
  onChange,
}: {
  metric: Metric;
  accent: string;
  onChange: (metric: Metric) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full p-1"
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {METRICS.map((item) => {
        const isActive = item.key === metric;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.key)}
            className="rounded-full px-3.5 py-1.5"
            style={
              isActive
                ? {
                    backgroundColor: accent,
                    shadowColor: accent,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }
                : undefined
            }
          >
            <Text
              className="text-[12.5px] font-bold"
              style={{ color: isActive ? '#ffffff' : accent }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EmptyChart({ accent, label }: { accent: string; label: string }) {
  return (
    <View
      className="flex-1 items-center justify-center gap-2 rounded-[20px]"
      style={{
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: hexToRgba(accent, 0.25),
      }}
    >
      <Ionicons
        name="analytics-outline"
        size={28}
        color={hexToRgba(accent, 0.6)}
      />
      <Text
        className="px-6 text-center text-[13px] leading-[18px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        {`Ajoutez une mesure de ${label.toLowerCase()} pour voir la courbe se dessiner.`}
      </Text>
    </View>
  );
}

function ChartSvg({
  points,
  width,
  accent,
  unit,
  digits,
}: {
  points: Point[];
  width: number;
  accent: string;
  unit: string;
  digits: number;
}) {
  const innerWidth = width - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  // Un peu d'air au-dessus et en dessous ; une seule valeur garde une
  // échelle lisible plutôt qu'un écart nul.
  const span = rawMax - rawMin || Math.max(rawMax * 0.1, 1);
  const min = rawMin - span * 0.2;
  const max = rawMax + span * 0.2;

  const times = points.map((point) => dateToTime(point.date));
  const firstTime = times[0];
  const lastTime = times[times.length - 1];
  const timeSpan = lastTime - firstTime;

  const coords = points.map((point, index) => ({
    x:
      PADDING.left +
      (timeSpan === 0
        ? innerWidth / 2
        : ((times[index] - firstTime) / timeSpan) * innerWidth),
    y: PADDING.top + (1 - (point.value - min) / (max - min)) * innerHeight,
  }));

  const linePath = monotonePath(coords);
  const baseline = PADDING.top + innerHeight;
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
      : '';

  // Graduations « rondes » (50,8 · 50,9 ; 5,50 · 5,52) plutôt que des
  // valeurs arbitraires : pas de 1, 2 ou 5 × 10ⁿ, et juste assez de
  // décimales pour que deux graduations ne s'écrivent pas pareil.
  // Pas large d'abord ; s'il ne laisse qu'une graduation, on resserre.
  let gridStep = niceStep((max - min) / 2);
  if (ticksBetween(min, max, gridStep).length < 2) {
    gridStep = niceStep((max - min) / 4);
  }
  const gridValues = ticksBetween(min, max, gridStep);
  const gridDigits = Math.min(
    Math.max(-Math.floor(Math.log10(gridStep) + 1e-9), 0),
    3,
  );
  const lastCoord = coords[coords.length - 1];
  const lastValue = points[points.length - 1].value;
  const lastLabel = `${formatValue(lastValue, digits)} ${unit}`;
  // Largeur estimée d'un caractère gras en 13 px : ~7,6 px, plus les marges.
  const bubbleWidth = lastLabel.length * 7.6 + 22;
  // Place laissée à droite pour l'éclat en coin.
  const bubbleX = Math.min(
    Math.max(lastCoord.x - bubbleWidth / 2, 2),
    width - bubbleWidth - 14,
  );
  const bubbleY = Math.max(lastCoord.y - BUBBLE_HEIGHT - 16, 10);
  const labelIndexes = pickLabelIndexes(points.length);

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      <Defs>
        <LinearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={accent} stopOpacity={0.3} />
          <Stop offset="0.7" stopColor={accent} stopOpacity={0.06} />
          <Stop offset="1" stopColor={accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {gridValues.map((value) => {
        const y = PADDING.top + (1 - (value - min) / (max - min)) * innerHeight;
        return (
          <Line
            key={value}
            x1={PADDING.left}
            x2={width - PADDING.right}
            y1={y}
            y2={y}
            stroke="rgba(0, 0, 0, 0.06)"
            strokeDasharray="4 6"
          />
        );
      })}
      {gridValues.map((value) => {
        const y = PADDING.top + (1 - (value - min) / (max - min)) * innerHeight;
        return (
          <SvgText
            key={`label-${value}`}
            x={PADDING.left - 8}
            y={y + 4}
            fontSize={10.5}
            fill="#a3a1b0"
            textAnchor="end"
          >
            {formatValue(value, gridDigits)}
          </SvgText>
        );
      })}

      {areaPath ? <Path d={areaPath} fill="url(#growth-area)" /> : null}
      {coords.length > 1 ? (
        <Path
          d={linePath}
          stroke={accent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}

      {/* Ligne verticale discrète sous la dernière mesure. */}
      <Line
        x1={lastCoord.x}
        x2={lastCoord.x}
        y1={lastCoord.y}
        y2={baseline}
        stroke={hexToRgba(accent, 0.18)}
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />

      {coords.slice(0, -1).map((coord, index) => (
        <Circle
          key={points[index].id}
          cx={coord.x}
          cy={coord.y}
          r={4.5}
          fill="#ffffff"
          stroke={accent}
          strokeWidth={2.5}
        />
      ))}
      {/* Dernière mesure : halo, puis point plein cerclé de blanc. */}
      <Circle
        cx={lastCoord.x}
        cy={lastCoord.y}
        r={14}
        fill={hexToRgba(accent, 0.14)}
      />
      <Circle
        cx={lastCoord.x}
        cy={lastCoord.y}
        r={7}
        fill={accent}
        stroke="#ffffff"
        strokeWidth={3}
      />

      {/* Infobulle de la dernière valeur, au-dessus de son point, pointe
          vers lui. Recentrée d'après sa largeur pour ne pas déborder du
          graphique — « 5,690 kg » est plus large que « 54 cm ». */}
      <Rect
        x={bubbleX}
        y={bubbleY}
        width={bubbleWidth}
        height={BUBBLE_HEIGHT}
        rx={BUBBLE_HEIGHT / 2}
        fill={accent}
      />
      <Path
        d={`M ${lastCoord.x - 6} ${bubbleY + BUBBLE_HEIGHT - 0.5} L ${lastCoord.x} ${
          bubbleY + BUBBLE_HEIGHT + 6
        } L ${lastCoord.x + 6} ${bubbleY + BUBBLE_HEIGHT - 0.5} Z`}
        fill={accent}
      />
      <SvgText
        x={bubbleX + bubbleWidth / 2}
        y={bubbleY + BUBBLE_HEIGHT / 2 + 4.5}
        fontSize={13}
        fontWeight="bold"
        fill="#ffffff"
        textAnchor="middle"
      >
        {lastLabel}
      </SvgText>
      {/* Éclat en coin de l'infobulle. */}
      <Line
        x1={bubbleX + bubbleWidth + 1}
        y1={bubbleY - 2}
        x2={bubbleX + bubbleWidth + 4}
        y2={bubbleY - 8}
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={bubbleX + bubbleWidth + 5}
        y1={bubbleY + 3}
        x2={bubbleX + bubbleWidth + 11}
        y2={bubbleY}
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {labelIndexes.map((index) => (
        <SvgText
          key={`date-${index}`}
          x={coords[index].x}
          y={CHART_HEIGHT - 8}
          fontSize={10.5}
          fill="#a3a1b0"
          textAnchor="middle"
        >
          {formatShortDate(points[index].date)}
        </SvgText>
      ))}
    </Svg>
  );
}

/** Multiples de `step` compris entre `min` et `max`. */
function ticksBetween(min: number, max: number, step: number): number[] {
  const ticks: number[] = [];
  for (
    let tick = Math.ceil(min / step - 1e-9) * step;
    tick <= max + 1e-9;
    tick += step
  ) {
    ticks.push(Math.round(tick * 1000) / 1000);
  }
  return ticks;
}

/** Pas « rond » (1, 2 ou 5 × 10ⁿ) le plus proche au-dessus de `rough`. */
function niceStep(rough: number): number {
  if (!(rough > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

/**
 * Courbe cubique monotone (Fritsch–Carlson) : lisse, sans dépasser les
 * valeurs mesurées — une courbe de croissance ne doit pas inventer un pic
 * entre deux pesées.
 */
function monotonePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const n = points.length;
  const dx: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x || 1e-6);
    slopes.push((points[i + 1].y - points[i].y) / dx[i]);
  }

  const tangents: number[] = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    tangents.push(
      slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2,
    );
  }
  tangents.push(slopes[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const sum = a * a + b * b;
    if (sum > 9) {
      const t = 3 / Math.sqrt(sum);
      tangents[i] = t * a * slopes[i];
      tangents[i + 1] = t * b * slopes[i];
    }
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const third = dx[i] / 3;
    path += ` C ${points[i].x + third} ${points[i].y + tangents[i] * third}, ${
      points[i + 1].x - third
    } ${points[i + 1].y - tangents[i + 1] * third}, ${points[i + 1].x} ${
      points[i + 1].y
    }`;
  }
  return path;
}

/** Au plus 4 dates sous l'axe : la première, la dernière, et entre deux. */
function pickLabelIndexes(count: number): number[] {
  if (count <= 4) return Array.from({ length: count }, (_, index) => index);
  const step = (count - 1) / 3;
  return [0, Math.round(step), Math.round(step * 2), count - 1];
}

function dateToTime(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/**
 * « 5,690 » : `digits` décimales, zéros compris (une pesée au gramme se lit
 * avec ses trois chiffres), sauf pour un nombre rond — « 54 », pas « 54,0 ».
 */
function formatValue(value: number, digits = 1): string {
  const scale = 10 ** digits;
  const rounded = Math.round(value * scale) / scale;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(digits);
  return text.replace('.', ',');
}

/**
 * Évolution affichée en en-tête : en grammes sous le kilo (« +30 g » se lit
 * mieux que « +0,030 kg »), sinon dans l'unité de la courbe.
 */
function formatDelta(
  delta: number,
  meta: { key: Metric; unit: string; digits: number },
): string {
  if (meta.key === 'weight' && delta < 1) {
    return `${Math.round(delta * 1000)} g`;
  }
  return `${formatValue(delta, meta.digits)} ${meta.unit}`;
}

/** « 12/11 ». */
function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}
