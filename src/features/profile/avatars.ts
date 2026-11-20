import type { ImageSourcePropType } from 'react-native';

/**
 * Avatars du profil (demande explicite : « de simples avatars, 5 ou 6 dans
 * un premier temps ») : un animal illustré dans un rond pastel (images
 * fournies le 2026-11-20, à la place des émojis), l'ourson en tête
 * (mascotte de l'app). Le profil n'en stocke que la clé (`profiles.avatar`,
 * valeurs limitées en base) ; `null` = l'initiale.
 *
 * `bg` reprend la couleur de fond de l'illustration : il remplit le rond le
 * temps que l'image s'affiche.
 *
 * Ajouter un avatar : l'ajouter ici **et** à la contrainte `check` de la
 * colonne (migrations `profiles_avatar`, `profiles_avatar_chat`).
 */
export const PROFILE_AVATARS = [
  {
    key: 'ourson',
    image: require('@/assets/images/avatars/Avatar_ourson.png'),
    label: 'profile.avatars.ourson',
    bg: '#F7E2CA',
  },
  {
    key: 'lapin',
    image: require('@/assets/images/avatars/Avatar_lapin.png'),
    label: 'profile.avatars.lapin',
    bg: '#F7CFDC',
  },
  {
    key: 'renard',
    image: require('@/assets/images/avatars/Avatar_renard.png'),
    label: 'profile.avatars.renard',
    bg: '#FBDDC7',
  },
  {
    key: 'panda',
    image: require('@/assets/images/avatars/Avatar_panda.png'),
    label: 'profile.avatars.panda',
    bg: '#D7E6E1',
  },
  {
    key: 'koala',
    image: require('@/assets/images/avatars/Avatar_koala.png'),
    label: 'profile.avatars.koala',
    bg: '#E6D3F2',
  },
  {
    key: 'lion',
    image: require('@/assets/images/avatars/Avatar_lion.png'),
    label: 'profile.avatars.lion',
    bg: '#FAE4B8',
  },
  {
    key: 'chat',
    image: require('@/assets/images/avatars/Avatar_chat.png'),
    label: 'profile.avatars.chat',
    bg: '#CED7E7',
  },
] as const satisfies readonly {
  key: string;
  image: ImageSourcePropType;
  label: string;
  bg: string;
}[];

export type ProfileAvatarKey = (typeof PROFILE_AVATARS)[number]['key'];

export function getProfileAvatar(key: string | null | undefined) {
  return PROFILE_AVATARS.find((avatar) => avatar.key === key) ?? null;
}
