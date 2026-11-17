import { router, useFocusEffect } from 'expo-router';
import { Button } from 'heroui-native';
import { useCallback, useState } from 'react';
import { BackHandler, Image, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { LeaveOnboardingModal } from '@/components/onboarding/leave-onboarding-modal';
import { SlideInText } from '@/components/onboarding/slide-in-text';
import { CARD_SHADOW } from '@/features/hub/constants';
import { useMyProfile } from '@/features/profile/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';

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
    imgUrl: require('@/assets/images/Family.png'),
    title: 'Bienvenue sur US',
    description:
      'L’application pensée pour les couples qui attendent un enfant. Simplifiez votre quotidien, à deux, du premier trimestre aux premiers mois.',
  },
  {
    imgUrl: require('@/assets/images/Father_feelings_mother.png'),
    title: 'Partagez vos émotions',
    description:
      'Grâce à US, vous saurez ce que ressent votre partenaire au quotidien — d’un simple geste, restez connectés malgré la fatigue et le stress.',
  },
  {
    imgUrl: require('@/assets/images/Father_speak_with_mother.png'),
    title: 'Suivez la grossesse ensemble',
    description:
      'Rendez-vous, symptômes, taille du bébé semaine après semaine : toutes les infos essentielles centralisées et partagées à deux.',
  },
  {
    imgUrl: require('@/assets/images/Mother_with_calendar.png'),
    title: 'Ne ratez aucune démarche',
    description:
      'CAF, sécurité sociale, déclaration de naissance… US vous rappelle quoi faire et quand, pour ne rien oublier après l’arrivée de bébé.',
  },
];

/** Glissement minimal (pt) ou vitesse (pt/s) pour changer de slide. */
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 600;
/** Le contenu suit le doigt avec cette résistance, puis revient en place. */
const DRAG_RESISTANCE = 0.35;

/**
 * Écran d'accueil de l'onboarding — 4 slides de présentation, hors du
 * parcours numéroté (« Étape X sur 6 »). Bascule par état local plutôt que
 * 4 routes séparées, même parti pris que les autres piliers à liste/détail
 * de l'app.
 *
 * Navigation au bouton « Suivant » ou par glissement horizontal (demande
 * explicite) : vers la gauche pour la slide suivante, vers la droite pour
 * la précédente. Sur la dernière slide, le glissement ne fait rien : seul
 * « Commencer » quitte la présentation, pour éviter une sortie par mégarde.
 *
 * Premier écran après l'inscription : sur la première slide, la flèche ‹
 * (et le retour système Android) propose de revenir à la connexion, ce qui
 * déconnecte — confirmation dans `LeaveOnboardingModal` (demande
 * explicite). Le glissement vers la droite, lui, ne sort jamais.
 */
export default function WelcomeCarousel() {
  const [index, setIndex] = useState(0);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();
  const { data: profile, isPending: isProfilePending } = useMyProfile();

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  // Après la présentation (vue par les deux parents, demande explicite) :
  // le ou la partenaire (`profiles.is_partner`) passe à « Faisons
  // connaissance » puis au code d'espace, la personne enceinte à son
  // onboarding.
  const goToOnboarding = () =>
    router.push(profile?.is_partner ? '/faire-connaissance' : '/');

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

  const goBack = () => {
    if (index === 0) setIsLeaveModalOpen(true);
    else goPrevious();
  };

  // Retour système Android : même règle que la flèche, au lieu de fermer
  // l'app (rien sous cet écran dans la pile).
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (index === 0) setIsLeaveModalOpen(true);
          else setIndex(index - 1);
          return true;
        },
      );
      return () => subscription.remove();
    }, [index]),
  );

  const swipeNext = () => {
    setIndex((current) => Math.min(current + 1, SLIDES.length - 1));
  };

  const dragX = useSharedValue(0);

  // Horizontal seulement ; les appuis (boutons, « Passer ») restent des taps.
  const swipe = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onUpdate((event) => {
      dragX.value = event.translationX * DRAG_RESISTANCE;
    })
    .onEnd((event) => {
      const goesLeft =
        event.translationX < -SWIPE_DISTANCE ||
        event.velocityX < -SWIPE_VELOCITY;
      const goesRight =
        event.translationX > SWIPE_DISTANCE || event.velocityX > SWIPE_VELOCITY;
      if (goesLeft) runOnJS(swipeNext)();
      else if (goesRight) runOnJS(goPrevious)();
      dragX.value = withSpring(0, { damping: 18, stiffness: 200 });
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  // Rien à l'écran tant que le profil n'est pas connu : la fin de la
  // présentation en dépend.
  if (isProfilePending) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <GestureDetector gesture={swipe}>
        <View className="flex-1 px-7 pt-4">
          <View className="h-9 flex-row items-center justify-between">
            <Pressable
              accessibilityLabel={
                index === 0 ? 'Revenir à la connexion' : 'Étape précédente'
              }
              accessibilityRole="button"
              hitSlop={12}
              onPress={goBack}
              style={CARD_SHADOW}
              className="h-9 w-9 items-center justify-center rounded-full bg-white"
            >
              <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
            </Pressable>

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

          <Animated.View
            className="flex-1 items-center justify-center gap-5"
            style={dragStyle}
          >
            {/* <Text className='text-[116px]'>{slide.emoji}</Text> */}
            <Image
              source={slide.imgUrl}
              className="w-50 h-50"
              resizeMode="contain"
            />

            <SlideInText direction="left" resetKey={index}>
              <Text
                style={{ fontFamily: 'Tondu' }}
                className="text-center text-[36px] leading-8 text-[#1a1a1a]"
              >
                {slide.title}
              </Text>
            </SlideInText>
            <SlideInText direction="right" resetKey={index}>
              <Text className="px-2 text-center text-[14px] leading-5 text-[#6b6b6b]">
                {slide.description}
              </Text>
            </SlideInText>
          </Animated.View>

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
      </GestureDetector>

      <LeaveOnboardingModal
        visible={isLeaveModalOpen}
        accent={accent}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </SafeAreaView>
  );
}
