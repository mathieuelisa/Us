import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
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

const CHART_HEIGHT = 190;
const PADDING = { top: 26, right: 18, bottom: 30, left: 38 };

type Point = { id: string; date: string; value: number };

/**
 * Courbe de croissance du suivi « Croissance » (demande explicite) : une
 * courbe par mesure — poids ou taille, au choix d'une gélule, leurs unités
 * n'ayant pas d'échelle commune. Courbe lissée sans dépassement (cubique
 * monotone), aire en dégradé dessous, un point par mesure, la dernière mise
 * en avant avec sa valeur, et l'évolution depuis la première en en-tête.
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
      <View className="flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text
            className="text-[16px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            Courbe de croissance
          </Text>
          <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
            {last
              ? `Dernière mesure : ${formatValue(last.value, meta.digits)} ${meta.unit}`
              : `Aucune mesure de ${meta.label.toLowerCase()} pour l’instant`}
          </Text>
        </View>
        <MetricToggle metric={metric} accent={accent} onChange={setMetric} />
      </View>

      {delta !== null ? (
        <View
          className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1"
          style={{ backgroundColor: hexToRgba(accent, 0.1) }}
        >
          <Ionicons
            name={delta >= 0 ? 'trending-up' : 'trending-down'}
            size={14}
            color={accent}
          />
          <Text className="text-[12px] font-bold" style={{ color: accent }}>
            {`${delta >= 0 ? '+' : '−'}${formatValue(Math.abs(delta), meta.digits)} ${
              meta.unit
            } depuis le ${formatShortDate(first.date)}`}
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
      style={{ backgroundColor: hexToRgba(accent, 0.08) }}
    >
      {METRICS.map((item) => {
        const isActive = item.key === metric;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.key)}
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: isActive ? accent : 'transparent' }}
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

  const gridValues = [
    max - (max - min) * 0.1,
    (max + min) / 2,
    min + (max - min) * 0.1,
  ];
  const lastCoord = coords[coords.length - 1];
  const lastValue = points[points.length - 1].value;
  const lastLabel = `${formatValue(lastValue, digits)} ${unit}`;
  // Largeur estimée d'un caractère gras en 12 px : ~7 px.
  const lastLabelHalfWidth = (lastLabel.length * 7) / 2;
  const labelIndexes = pickLabelIndexes(points.length);

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      <Defs>
        <LinearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={accent} stopOpacity={0.28} />
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
            {formatValue(value)}
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

      {coords.map((coord, index) => {
        const isLast = index === coords.length - 1;
        return (
          <Circle
            key={points[index].id}
            cx={coord.x}
            cy={coord.y}
            r={isLast ? 6 : 4}
            fill={isLast ? accent : '#ffffff'}
            stroke={accent}
            strokeWidth={isLast ? 3 : 2}
          />
        );
      })}
      {/* Halo de la dernière mesure. */}
      <Circle
        cx={lastCoord.x}
        cy={lastCoord.y}
        r={12}
        fill={hexToRgba(accent, 0.15)}
      />

      {/* Valeur de la dernière mesure, au-dessus de son point. Recentrée
          d'après sa longueur pour ne pas déborder du graphique — « 5,690 kg »
          est plus large que « 54 cm ». */}
      <SvgText
        x={Math.min(
          Math.max(lastCoord.x, PADDING.left + lastLabelHalfWidth),
          width - lastLabelHalfWidth - 2,
        )}
        y={Math.max(lastCoord.y - 16, 12)}
        fontSize={12}
        fontWeight="bold"
        fill={accent}
        textAnchor="middle"
      >
        {lastLabel}
      </SvgText>

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

/** « 4,2 » — une décimale au plus, virgule française. */
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

/** « 12/11 ». */
function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}
