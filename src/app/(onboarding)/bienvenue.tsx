import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { CARD_SHADOW } from '@/features/hub/constants';
import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * ⚠️ Contenu inventé (titres, descriptions, émojis) : ni les maquettes ni
 * CONCEPT.md ne spécifient cet écran d'accueil en 4 étapes — demande
 * explicite de l'utilisateur, qui n'a fourni qu'un seul exemple (« Partager
 * vos émotions »). Les 3 autres reprennent les 3 piliers déjà définis
 * ailleurs dans l'app (Ensemble, Suivi santé, Démarches — mêmes émojis que
 * sur les cartes du hub, `src/app/(tabs)/index.tsx`), pour rester cohérent
 * plutôt que d'inventer un propos sans lien avec le reste du produit.
 *
 * Émoji en grand en attendant de vraies illustrations : aucun asset image
 * n'existe dans `design/` pour cet écran.
 */
const SLIDES = [
  {
    emoji: '💞',
    title: 'Bienvenue sur US',
    description:
      'L’application pensée pour les couples qui attendent un enfant. Simplifiez votre quotidien, à deux, du premier trimestre aux premiers mois.',
  },
  {
    emoji: '💬',
    title: 'Partagez vos émotions',
    description:
      'Grâce à US, vous saurez ce que ressent votre partenaire au quotidien — d’un simple geste, restez connectés malgré la fatigue et le stress.',
  },
  {
    emoji: '🩺',
    title: 'Suivez la grossesse ensemble',
    description:
      'Rendez-vous, symptômes, taille du bébé semaine après semaine : toutes les infos essentielles centralisées et partagées à deux.',
  },
  {
    emoji: '📋',
    title: 'Ne ratez aucune démarche',
    description:
      'CAF, sécurité sociale, déclaration de naissance… US vous rappelle quoi faire et quand, pour ne rien oublier après l’arrivée de bébé.',
  },
];

/**
 * Écran d'accueil de l'onboarding — 4 slides de présentation, hors du
 * parcours numéroté (« Étape X sur 6 »). Bascule par état local plutôt que
 * 4 routes séparées, même parti pris que les autres piliers à liste/détail
 * de l'app.
 */
export default function WelcomeCarousel() {
  const [index, setIndex] = useState(0);
  const backgroundColor = useThemeBackground();

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const goToOnboarding = () => router.push('/');

  const goNext = () => {
    if (isLast) {
      goToOnboarding();
      return;
    }
    setIndex((current) => current + 1);
  };

  const goPrevious = () => {
    setIndex((current) => Math.max(current - 1, 0));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 px-7 pt-4">
        <View className="h-9 flex-row items-center justify-between">
          {index > 0 ? (
            <Pressable
              accessibilityLabel="Étape précédente"
              accessibilityRole="button"
              hitSlop={12}
              onPress={goPrevious}
              style={CARD_SHADOW}
              className="h-9 w-9 items-center justify-center rounded-full bg-white"
            >
              <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            accessibilityRole="button"
            onPress={goToOnboarding}
            hitSlop={8}
          >
            <Text className="text-[14px] font-medium text-[#6b6b6b]">
              Passer
            </Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center gap-5">
          <Text className="text-[116px]">{slide.emoji}</Text>
          <Text
            style={{ fontFamily: 'Provicali' }}
            className="text-center text-[36px] leading-8 text-[#1a1a1a]"
          >
            {slide.title}
          </Text>
          <Text className="px-2 text-center text-[14px] leading-5 text-[#6b6b6b]">
            {slide.description}
          </Text>
        </View>

        <View className="gap-5 pb-2">
          <View className="flex-row items-center justify-center gap-2">
            {SLIDES.map((item, slideIndex) => (
              <View
                key={item.title}
                className={`h-2 rounded-full ${
                  slideIndex === index ? 'w-6 bg-accent' : 'w-2 bg-[#d8d8d8]'
                }`}
              />
            ))}
          </View>

          <Button onPress={goNext} className="w-52 self-center">
            <Button.Label>{isLast ? 'Commencer' : 'Suivant'}</Button.Label>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
