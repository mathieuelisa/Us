/**
 * Avatars du profil (demande explicite : « de simples avatars, 5 ou 6 dans
 * un premier temps ») : un animal en émoji sur un rond pastel, l'ourson en
 * tête (mascotte de l'app). Le profil n'en stocke que la clé
 * (`profiles.avatar`, valeurs limitées en base) ; `null` = l'initiale.
 *
 * Ajouter un avatar : l'ajouter ici **et** à la contrainte `check` de la
 * colonne (migration `profiles_avatar`).
 */
export const PROFILE_AVATARS = [
  { key: 'ourson', emoji: '🐻', label: 'Ourson', bg: '#F6E3D3' },
  { key: 'lapin', emoji: '🐰', label: 'Lapin', bg: '#FBE1EA' },
  { key: 'renard', emoji: '🦊', label: 'Renard', bg: '#FDE7D2' },
  { key: 'panda', emoji: '🐼', label: 'Panda', bg: '#E4EEF2' },
  { key: 'koala', emoji: '🐨', label: 'Koala', bg: '#E5E8F6' },
  { key: 'lion', emoji: '🦁', label: 'Lion', bg: '#FCF0C9' },
] as const;

export type ProfileAvatarKey = (typeof PROFILE_AVATARS)[number]['key'];

export function getProfileAvatar(key: string | null | undefined) {
  return PROFILE_AVATARS.find((avatar) => avatar.key === key) ?? null;
}
