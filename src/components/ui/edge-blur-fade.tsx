import { BlurView } from 'expo-blur';
import { View } from 'react-native';

/**
 * Dégradé de flou sur les bords gauche/droit d'un contenu scrollable
 * horizontal, pour que les éléments voisins s'estompent au lieu d'être
 * coupés net par le bord de l'écran (demande explicite sur le sélecteur de
 * mois des Démarches).
 *
 * Pas de flou progressif natif en React Native, et pas de
 * `expo-linear-gradient` dans les dépendances : on découpe la zone en
 * bandes **juxtaposées** dont le flou et l'opacité augmentent vers le bord.
 * Juxtaposées et non superposées : empiler des `BlurView` fait bien monter
 * le flou, mais sur le web les `backdrop-filter` imbriqués produisent des
 * franges de couleur (bandes cyan visibles à l'écran). Chaque bande
 * échantillonne donc le fond directement.
 *
 * Le voile de couleur par-dessus le flou est ce qui masque réellement la
 * coupure : le flou seul laisse une bordure nette au ras du bord.
 */
const BAND_COUNT = 8;
const SIDES = ['left', 'right'] as const;

type EdgeBlurFadeProps = {
  /** Couleur de fond de l'écran, vers laquelle les bords s'effacent. */
  color: string;
  /** Largeur de la zone estompée, de chaque côté. */
  width?: number;
  /** Flou de la bande la plus extérieure. */
  maxIntensity?: number;
  /** Opacité du voile sur la bande la plus extérieure. */
  maxOpacity?: number;
};

export function EdgeBlurFade({
  color,
  width = 80,
  maxIntensity = 60,
  maxOpacity = 0.92,
}: EdgeBlurFadeProps) {
  const bandWidth = width / BAND_COUNT;

  return (
    <>
      {SIDES.map((side) => (
        <View
          key={side}
          pointerEvents="none"
          className="absolute bottom-0 top-0"
          style={{ [side]: 0, width }}
        >
          {Array.from({ length: BAND_COUNT }, (_, index) => {
            // 0 = bande la plus intérieure (nette), BAND_COUNT - 1 = bord.
            const ratio = (index + 1) / BAND_COUNT;
            return (
              <BlurView
                // biome-ignore lint/suspicious/noArrayIndexKey: bandes fixes, identifiées uniquement par leur rang dans la rampe
                key={index}
                intensity={maxIntensity * ratio}
                tint="light"
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  [side]: (BAND_COUNT - 1 - index) * bandWidth,
                  width: bandWidth,
                }}
              >
                <View
                  pointerEvents="none"
                  style={{
                    flex: 1,
                    backgroundColor: color,
                    // Progression douce : le voile reste discret sur la
                    // moitié intérieure et ne devient opaque qu'au bord.
                    opacity: maxOpacity * ratio ** 2.2,
                  }}
                />
              </BlurView>
            );
          })}
        </View>
      ))}
    </>
  );
}
