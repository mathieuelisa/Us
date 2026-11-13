import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
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
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useReorderContacts,
  useUpdateContact,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';
import { formatPhoneNumber } from '@/lib/phone';

const EMERGENCY_RED = '#d64545';
const DELETE_RED = '#d14b3a';

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
 * ressort anime la montée / descente d'un contact.
 *
 * Modification (demande explicite) : toucher un contact le remplace sur
 * place par le même formulaire, prérempli (`ContactForm`).
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
  const accent = useThemeAccent();
  const { data: contacts = [] } = useContacts(household);
  const createContact = useCreateContact(household);
  const deleteContact = useDeleteContact(household);
  const reorderContacts = useReorderContacts(household);
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
        onSuccess: () => onFeedback?.('success', `${name} supprimé`),
        onError: () => {
          setHiddenIds((current) => current.filter((hidden) => hidden !== id));
          onFeedback?.(
            'error',
            'Impossible de supprimer ce contact. Réessayez.',
          );
        },
      });
    }, DELETE_FLASH_MS);
  };

  const visibleContacts = contacts.filter(
    (contact) => !hiddenIds.includes(contact.id),
  );

  const moveContact = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= contacts.length) return;

    const reordered = [...contacts];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    reorderContacts.mutate(
      reordered.map((contact, sortOrder) => ({
        id: contact.id,
        sort_order: sortOrder,
      })),
    );
  };

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
            Aucun contact pour l’instant. Ajoutez vos numéros utiles avec le
            bouton en bas à droite.
          </Text>
        </View>
      ) : null}

      {visibleContacts.map((contact) => {
        const index = contacts.findIndex((item) => item.id === contact.id);
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
                        onFeedback?.('success', `${values.name} modifié`);
                      },
                      onError: () =>
                        onFeedback?.(
                          'error',
                          'Impossible de modifier ce contact. Réessayez.',
                        ),
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
              accessibilityLabel={`Modifier ${contact.name}`}
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
                        Urgence
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

            <RowAction
              icon="chevron-up"
              label="Monter"
              isDisabled={index === 0}
              onPress={() => moveContact(index, -1)}
            />
            <RowAction
              icon="chevron-down"
              label="Descendre"
              isDisabled={index === contacts.length - 1}
              onPress={() => moveContact(index, 1)}
            />
            <RowAction
              icon="close"
              label={`Supprimer ${contact.name}`}
              onPress={() => removeContact(contact.id, contact.name)}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

/** Petit bouton rond d'action sur une ligne de contact. */
function RowAction({
  icon,
  label,
  isDisabled = false,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  isDisabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={6}
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-full bg-[#f4f3f7]"
      style={{ opacity: isDisabled ? 0.35 : 1 }}
    >
      <Ionicons name={icon} size={16} color={GLASS_BODY_COLOR} />
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
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [isEmergency, setIsEmergency] = useState(initial?.isEmergency ?? false);
  const canSubmit = name.trim() !== '' && !isPending;

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
            {isEditing ? 'Modifier le contact' : 'Nouveau contact'}
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
            {isEditing
              ? 'Les changements sont partagés avec votre partenaire.'
              : 'Un numéro utile, partagé avec votre partenaire.'}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Fermer"
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
        placeholder="Nom — ex. Dr Martin"
        value={name}
        onChangeText={setName}
        accent={accent}
        autoCapitalize="words"
      />
      {/* Plus de champ « Rôle » (demande explicite : il débordait de
          sa gélule) — nom, téléphone et urgence suffisent. */}
      <IconInput
        icon="call-outline"
        placeholder="Téléphone"
        value={phone}
        // Espaces ajoutés pendant la saisie : « 01 89 87 72 89 ».
        onChangeText={(text) => setPhone(formatPhoneNumber(text))}
        accent={accent}
        keyboardType="phone-pad"
      />

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
          Numéro d’urgence
        </Text>
        <Switch
          accessibilityLabel="Numéro d’urgence"
          value={isEmergency}
          onValueChange={setIsEmergency}
          trackColor={{ true: EMERGENCY_RED }}
        />
      </View>

      <PillButton
        label={
          isEditing
            ? isPending
              ? 'Enregistrement…'
              : 'Enregistrer'
            : isPending
              ? 'Ajout en cours…'
              : 'Ajouter le contact'
        }
        icon={isEditing ? 'save-outline' : 'person-add-outline'}
        size="compact"
        isDisabled={!canSubmit}
        onPress={() =>
          onSubmit({
            name: name.trim(),
            phone: phone.trim() || null,
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
          Annuler
        </Text>
      </Pressable>
    </View>
  );
}
