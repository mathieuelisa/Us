import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Pressable,
  Share,
  type StyleProp,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { darkenHex, hexToRgba, lightenHex } from '@/lib/color';

/**
 * Illustration fournie (fond transparent) : téléphone avec l'icône de l'app,
 * avion en papier et boucle pointillée. Violette, elle ne suit pas le thème.
 */
const PHONE_ILLUSTRATION = require('@/assets/images/Share_app_phone.png');

/** Largeur d'écran à partir de laquelle le bouton rejoint la colonne de texte. */
const WIDE_LAYOUT_MIN_WIDTH = 520;

/**
 * Bloc « Partagez US » des Réglages, d'après une capture de référence
 * (demande explicite : plus design et moderne) : téléphone illustré avec
 * l'icône de l'app et un avion en papier, titre dont « US » prend l'accent,
 * description, puis bouton gélule en dégradé (icône de partage, flèche).
 * Le bouton ouvre la feuille de partage native (`Share` de React Native) ;
 * sur le web sans `navigator.share`, un message le signale.
 *
 * Titre, bouton et fond suivent l'accent du thème personnel. Sur téléphone, le bouton passe
 * sous l'illustration et le texte, sur toute la largeur de la carte.
 */
export function ShareAppCard({
  accent,
  cardStyle,
}: {
  accent: string;
  cardStyle: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  const [shareError, setShareError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_MIN_WIDTH;

  const share = async () => {
    setShareError(null);
    try {
      // ⚠️ Pas encore de lien de téléchargement : l'app n'est publiée sur
      // aucun store. Le message ne contient que le nom de l'app ; ajouter le
      // lien dès qu'il existe.
      await Share.share({ message: t('settings.share.message') });
    } catch {
      setShareError(t('settings.share.unavailable'));
    }
  };

  const button = <ShareButton accent={accent} onPress={share} />;

  return (
    <View className="overflow-hidden rounded-[28px]" style={cardStyle}>
      <LinearGradient
        colors={['#ffffff', hexToRgba(accent, 0.07)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />
      {/* Taches décoratives, en haut à droite et en bas. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -40,
          top: -30,
          width: 150,
          height: 120,
          borderRadius: 75,
          backgroundColor: hexToRgba(accent, 0.06),
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -30,
          bottom: -50,
          width: 180,
          height: 110,
          borderRadius: 90,
          backgroundColor: hexToRgba(accent, 0.05),
        }}
      />

      <View className="gap-4 px-4 pb-5 pt-5">
        <View className="flex-row items-center gap-3">
          <Image
            source={PHONE_ILLUSTRATION}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            style={{ width: 104, height: 116 }}
          />

          <View className="flex-1 gap-1.5">
            <Text
              className="text-[23px] font-extrabold leading-7"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.5 }}
            >
              {t('settings.share.titleBefore')}{' '}
              <Text style={{ color: accent }}>US</Text>
            </Text>
            <Text
              className="text-[13.5px] leading-[19px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {t('settings.share.description')}
            </Text>
            {isWide ? <View className="mt-2">{button}</View> : null}
          </View>
        </View>

        {isWide ? null : button}

        {shareError ? (
          <Text className="text-center text-[12.5px] text-[#d14b3a]">
            {shareError}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Gélule en dégradé d'accent : icône de partage, libellé, flèche. */
function ShareButton({
  accent,
  onPress,
}: {
  accent: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('settings.share.button')}
        onPress={onPress}
        className="h-14 overflow-hidden rounded-full"
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: accent,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 18,
          elevation: 5,
        })}
      >
        <LinearGradient
          colors={[lightenHex(accent, 0.16), accent, darkenHex(accent, 0.06)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />
        {/* Reflet clair à droite, sous la flèche. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -20,
            top: -16,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <View className="flex-1 flex-row items-center px-5">
          <Ionicons name="share-social-outline" size={21} color="#ffffff" />
          <Text className="flex-1 text-center text-[16px] font-bold text-white">
            {t('settings.share.button')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </View>
      </Pressable>
      <SparkLines
        color={hexToRgba(accent, 0.7)}
        style={{ right: -4, top: -20 }}
      />
    </View>
  );
}
