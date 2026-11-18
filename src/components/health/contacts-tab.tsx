import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { FeedbackBannerTone } from '@/components/ui/feedback-banner';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import {
  IconBubble,
  IconInput,
  type IoniconName,
} from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { useIsSoloHousehold } from '@/features/household/hooks';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';
import { formatPhoneNumber } from '@/lib/phone';

const EMERGENCY_RED = '#d64545';
const DELETE_RED = '#d14b3a';

/** Chiffres minimum d'un numéro : les numéros d'urgence en ont 2 (« 15 »). */
const MIN_PHONE_DIGITS = 2;

/** Durée de la ligne « en rouge » avant qu'elle ne parte. */
const DELETE_FLASH_MS = 220;

/** Les contacts restants remontent avec un ressort doux. */
const ROW_LAYOUT = LinearTransition.springify().damping(18).stiffness(170);

/**
 * Écran 4c — carnet de contacts partagé, modifiable par les deux parents.
 *
 * Réordonnancement par boutons haut/bas plutôt qu'un vrai glisser-déposer,
 * comme dans l'onglet Information : même choix, même dette
 * (DOCS/05-DETTE-ET-POINTS-OUVERTS.md n° 12). La persistance, elle, est
 * bien réelle.
 *
 * Habillage repris de la modale « Nouveau rendez-vous » (demande explicite),
 * mais sans modale : le formulaire d'ajout reste une carte en tête de
 * liste — titre souligné, champs en gélule à icône, urgence en bande à
 * interrupteur, « Ajouter le contact » en `PillButton`. Les contacts sont
 * des cartes translucides à pastille d'icône (rouge et badge « Urgence »
 * pour un numéro d'urgence).
 *
 * Suppression animée (demande explicite) : la ligne passe un instant en
 * rouge, corbeille à la place de l'icône, puis glisse vers la gauche en
 * s'effaçant ; les contacts suivants remontent avec un ressort. Le retrait
 * est **optimiste** — la ligne part sans attendre le serveur — et la ligne
 * revient avec un bandeau d'erreur si la suppression échoue. Le même
 * ressort anime la place d'un contact ajouté ou renommé.
 *
 * Modification (demande explicite) : toucher un contact le remplace sur
 * place par le même formulaire, prérempli (`ContactForm`).
 *
 * Ordre alphabétique **toujours** (demande explicite : plus logique qu'un
 * bouton « Trier A→Z ») : la liste est triée à l'affichage, donc un contact
 * ajouté ou renommé prend tout de suite sa place. Les numéros d'urgence
 * restent en tête (choix validé), triés entre eux. Plus de flèches
 * monter / descendre : l'ordre ne se règle plus à la main.
 */
export function ContactsTab({
  household,
  isAdding,
  onIsAddingChange,
  onFeedback,
}: {
  household: Household | null | undefined;
  isAdding: boolean;
  onIsAddingChange: (isAdding: boolean) => void;
  /** Bandeau de l'écran (`useFeedbackBanner` de `sante.tsx`). */
  onFeedback?: (tone: FeedbackBannerTone, message: string) => void;
}) {
  const { t } = useTranslation();
  const accent = useThemeAccent();
  const { data: contacts = [] } = useContacts(household);
  const createContact = useCreateContact(household);
  const deleteContact = useDeleteContact(household);
  const updateContact = useUpdateContact(household);

  // Contact en cours de modification, affiché sous forme de formulaire à sa
  // place dans la liste. L'ajout (bouton + de l'écran) le referme.
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => {
    if (isAdding) setEditingId(null);
  }, [isAdding]);

  const startEditing = (id: string) => {
    if (flashingId) return;
    onIsAddingChange(false);
    setEditingId(id);
  };

  // Suppression animée : `flashingId` = ligne en rouge pendant
  // `DELETE_FLASH_MS`, `hiddenIds` = lignes déjà retirées de l'écran en
  // attendant la réponse du serveur.
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    },
    [],
  );

  const removeContact = (id: string, name: string) => {
    if (flashingId) return;
    setFlashingId(id);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashingId(null);
      setHiddenIds((current) => [...current, id]);
      deleteContact.mutate(id, {
        onSuccess: () =>
          onFeedback?.('success', t('health.contacts.deleted', { name })),
        onError: () => {
          setHiddenIds((current) => current.filter((hidden) => hidden !== id));
          onFeedback?.('error', t('health.contacts.deleteError'));
        },
      });
    }, DELETE_FLASH_MS);
  };

  const visibleContacts = sortContactsAlphabetically(contacts).filter(
    (contact) => !hiddenIds.includes(contact.id),
  );

  return (
    <View className="gap-3">
      {isAdding ? (
        <ContactForm
          accent={accent}
          isEditing={false}
          isPending={createContact.isPending}
          onCancel={() => onIsAddingChange(false)}
          onSubmit={(values) =>
            createContact.mutate(
              {
                ...values,
                roleLabel: null,
                address: null,
                sortOrder: contacts.length,
              },
              { onSuccess: () => onIsAddingChange(false) },
            )
          }
        />
      ) : null}

      {visibleContacts.length === 0 && !isAdding ? (
        <View
          className="items-center gap-2 rounded-[28px] px-5 py-6"
          style={{ backgroundColor: hexToRgba(accent, 0.07) }}
        >
          <Ionicons name="call-outline" size={26} color={accent} />
          <Text
            className="text-center text-[14px] leading-5"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {t('health.contacts.empty')}
          </Text>
        </View>
      ) : null}

      {visibleContacts.map((contact) => {
        if (contact.id === editingId) {
          return (
            <Animated.View
              key={contact.id}
              entering={FadeInDown.duration(220)}
              layout={ROW_LAYOUT}
            >
              <ContactForm
                accent={accent}
                isEditing
                initial={{
                  name: contact.name,
                  phone: contact.phone ? formatPhoneNumber(contact.phone) : '',
                  isEmergency: contact.is_emergency,
                }}
                isPending={updateContact.isPending}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) =>
                  updateContact.mutate(
                    { id: contact.id, ...values },
                    {
                      onSuccess: () => {
                        setEditingId(null);
                        onFeedback?.(
                          'success',
                          t('health.contacts.updated', { name: values.name }),
                        );
                      },
                      onError: () =>
                        onFeedback?.('error', t('health.contacts.updateError')),
                    },
                  )
                }
              />
            </Animated.View>
          );
        }
        const isFlashing = flashingId === contact.id;
        const color = isFlashing
          ? DELETE_RED
          : contact.is_emergency
            ? EMERGENCY_RED
            : accent;
        return (
          <Animated.View
            key={contact.id}
            entering={FadeInDown.duration(260)}
            exiting={FadeOutLeft.duration(320)}
            layout={ROW_LAYOUT}
            className="flex-row items-center gap-3 rounded-[24px] py-3 pl-3 pr-2.5"
            style={{
              backgroundColor: isFlashing
                ? hexToRgba(DELETE_RED, 0.08)
                : 'rgba(255, 255, 255, 0.9)',
              borderWidth: 1,
              borderColor: isFlashing
                ? hexToRgba(DELETE_RED, 0.35)
                : 'rgba(255, 255, 255, 0.95)',
              shadowColor: isFlashing ? DELETE_RED : accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 3,
              transform: [{ scale: isFlashing ? 0.98 : 1 }],
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('health.contacts.editNamed', {
                name: contact.name,
              })}
              onPress={() => startEditing(contact.id)}
              className="flex-1 flex-row items-center gap-3 active:opacity-70"
            >
              <IconBubble
                icon={
                  isFlashing
                    ? 'trash'
                    : contact.is_emergency
                      ? 'alert-circle'
                      : 'person'
                }
                color={color}
                size={42}
              />
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-1.5">
                  <Text
                    className="shrink text-[15.5px] font-bold"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    {contact.name}
                  </Text>
                  {contact.is_emergency ? (
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: hexToRgba(EMERGENCY_RED, 0.1) }}
                    >
                      <Text
                        className="text-[10.5px] font-bold"
                        style={{ color: EMERGENCY_RED }}
                      >
                        {t('health.contacts.emergency')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {contact.role_label || contact.phone ? (
                  <Text
                    className="text-[13px]"
                    style={{ color: GLASS_BODY_COLOR }}
                  >
                    {[
                      contact.role_label,
                      contact.phone ? formatPhoneNumber(contact.phone) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
              </View>
            </Pressable>

            {/* Corbeille plutôt qu'une croix (demande explicite : plus
                clair que « fermer »), en rouge doux. */}
            <RowAction
              icon="trash-outline"
              tone="danger"
              label={`Supprimer ${contact.name}`}
              onPress={() => removeContact(contact.id, contact.name)}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * Ordre alphabétique (français, sans tenir compte de la casse ni des
 * accents), numéros d'urgence d'abord.
 */
function sortContactsAlphabetically<
  T extends { name: string; is_emergency: boolean },
>(contacts: T[]): T[] {
  return [...contacts].sort((a, b) => {
    if (a.is_emergency !== b.is_emergency) return a.is_emergency ? -1 : 1;
    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
  });
}

/** Petit bouton rond d'action sur une ligne de contact. */
function RowAction({
  icon,
  label,
  tone = 'neutral',
  isDisabled = false,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  tone?: 'neutral' | 'danger';
  isDisabled?: boolean;
  onPress: () => void;
}) {
  const isDanger = tone === 'danger';
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={6}
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-full"
      style={{
        opacity: isDisabled ? 0.35 : 1,
        backgroundColor: isDanger ? hexToRgba(DELETE_RED, 0.08) : '#f4f3f7',
      }}
    >
      <Ionicons
        name={icon}
        size={isDanger ? 15 : 16}
        color={isDanger ? DELETE_RED : GLASS_BODY_COLOR}
      />
    </Pressable>
  );
}

type ContactFormValues = {
  name: string;
  phone: string | null;
  isEmergency: boolean;
};

/**
 * Formulaire de contact, en carte : ajout en tête de liste, ou
 * modification à la place du contact touché (préremplie avec `initial`).
 */
function ContactForm({
  accent,
  isEditing,
  initial,
  isPending,
  onCancel,
  onSubmit,
}: {
  accent: string;
  isEditing: boolean;
  initial?: { name: string; phone: string; isEmergency: boolean };
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: ContactFormValues) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [isEmergency, setIsEmergency] = useState(initial?.isEmergency ?? false);
  const isSolo = useIsSoloHousehold();
  // Téléphone obligatoire (demande explicite : un contact sans numéro n'a
  // pas de sens ici). Deux chiffres suffisent : les numéros d'urgence sont
  // courts (15, 112, 3114). Un ancien contact sans numéro en reçoit un à sa
  // prochaine modification.
  const phoneDigitCount = phone.replace(/\D/g, '').length;
  const isPhoneValid = phoneDigitCount >= MIN_PHONE_DIGITS;
  const canSubmit = name.trim() !== '' && isPhoneValid && !isPending;
  // Aide affichée seulement quand c'est le numéro qui bloque.
  const showPhoneHint = name.trim() !== '' && !isPhoneValid;

  return (
    <View
      className="gap-3.5 overflow-hidden rounded-[28px] bg-white px-5 pb-5 pt-4"
      style={{
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      {/* Tache pâle en haut à droite, comme sur la modale de rendez-vous. */}
      <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -70,
            right: -60,
            width: 200,
            height: 180,
            borderRadius: 100,
            backgroundColor: lightenHex(accent, 0.55),
            opacity: 0.35,
          }}
        />
      </View>

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1.5">
          <Text
            className="text-[20px] font-extrabold leading-[26px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
          >
            {isEditing ? t('health.contacts.edit') : t('health.contacts.new')}
          </Text>
          <Svg width={80} height={10} viewBox="0 0 80 10">
            <Path
              d="M3 7 C 24 2, 54 1.5, 77 4"
              stroke={hexToRgba(accent, 0.5)}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <Text
            className="text-[13px] leading-[18px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {isSolo
              ? isEditing
                ? t('health.contacts.savedHint')
                : t('health.contacts.newHint')
              : isEditing
                ? t('health.contacts.sharedSavedHint')
                : t('health.contacts.sharedNewHint')}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onCancel}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.14,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Ionicons name="close" size={19} color={GLASS_TITLE_COLOR} />
        </Pressable>
      </View>

      <IconInput
        icon="person-outline"
        placeholder={t('health.contacts.namePlaceholder')}
        value={name}
        onChangeText={setName}
        accent={accent}
        autoCapitalize="words"
      />
      {/* Plus de champ « Rôle » (demande explicite : il débordait de
          sa gélule) — nom, téléphone et urgence suffisent. */}
      <View className="gap-1.5">
        <IconInput
          icon="call-outline"
          placeholder={t('health.contacts.phone')}
          value={phone}
          // Espaces ajoutés pendant la saisie : « 01 89 87 72 89 ».
          onChangeText={(text) => setPhone(formatPhoneNumber(text))}
          accent={accent}
          keyboardType="phone-pad"
        />
        {showPhoneHint ? (
          <Text className="px-4 text-[12.5px] text-[#c9553d]">
            {phoneDigitCount === 0
              ? t('health.contacts.phoneRequired')
              : t('health.contacts.phoneTooShort')}
          </Text>
        ) : null}
      </View>

      <View
        className="flex-row items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3"
        style={{
          backgroundColor: isEmergency
            ? hexToRgba(EMERGENCY_RED, 0.08)
            : hexToRgba(accent, 0.07),
        }}
      >
        <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-white">
          <Ionicons name="alert-circle" size={18} color={EMERGENCY_RED} />
        </View>
        <Text
          className="flex-1 text-[14px]"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {t('health.contacts.emergencyNumber')}
        </Text>
        <ToggleSwitch
          accessibilityLabel={t('health.contacts.emergencyNumber')}
          value={isEmergency}
          onValueChange={setIsEmergency}
          onColor={EMERGENCY_RED}
        />
      </View>

      <PillButton
        label={
          isEditing
            ? isPending
              ? t('common.saving')
              : t('common.save')
            : isPending
              ? t('health.appointment.adding')
              : t('health.contacts.add')
        }
        icon={isEditing ? 'save-outline' : 'person-add-outline'}
        size="compact"
        isDisabled={!canSubmit}
        onPress={() =>
          onSubmit({
            name: name.trim(),
            phone: phone.trim(),
            isEmergency,
          })
        }
      />

      <Pressable
        accessibilityRole="button"
        className="items-center"
        onPress={onCancel}
      >
        <Text
          className="text-[14.5px] font-semibold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {t('common.cancel')}
        </Text>
      </Pressable>
    </View>
  );
}
