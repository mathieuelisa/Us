import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { PlainInput } from '@/components/plain-input';
import { BlobIllustration } from '@/components/ui/blob-illustration';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { IconInput } from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import type { HouseholdInfoItem } from '@/features/household/api';
import {
  type AddressParts,
  formatAddress,
  formatSocialSecurityNumber,
  INFO_CATEGORY_META,
  INFO_CATEGORY_ORDER,
  type InfoCategory,
  isInfoCategory,
  parseAddress,
} from '@/features/household/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';
import { todayIso } from '@/lib/date';
import { formatPhoneNumber } from '@/lib/phone';

/**
 * Modale à deux temps : choix de la catégorie (grille), puis formulaire
 * dédié à cette catégorie — plutôt qu'un unique champ libellé/valeur, pour
 * que chaque type d'info ait l'icône, le clavier et le format qui lui
 * correspondent (demande explicite : "design original et pro").
 *
 * Sert aussi bien à la création (`editingItem` absent, démarre sur la
 * grille) qu'à l'édition (`editingItem` fourni, démarre directement sur son
 * formulaire, catégorie verrouillée).
 *
 * `animationType="none"` sur `Modal` : même parti pris que
 * `AppointmentFormModal`/`HowItWorksModal`, le fond opaque apparaît
 * instantanément, seule la carte glisse.
 *
 * Habillage d'après une capture de référence (demande explicite) :
 * illustration, titre souligné et sous-titre, bouton de fermeture, grille de
 * catégories en cartes horizontales (pastille d'icône, libellé, chevron,
 * contour d'accent à l'appui). Le formulaire reprend la même feuille et
 * `PillButton`.
 */
export function InfoItemFormModal({
  visible,
  isSaving,
  editingItem,
  initialCategory = null,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  isSaving: boolean;
  editingItem?: HouseholdInfoItem | null;
  /**
   * Création ouverte depuis une suggestion de l'état vide : la modale
   * démarre directement sur le formulaire de cette catégorie (la grille
   * reste accessible par le retour).
   */
  initialCategory?: InfoCategory | null;
  onCancel: () => void;
  /**
   * `values` : une valeur en modification ; en création, une par exemple
   * coché, plus le texte saisi s'il y en a un.
   */
  onSubmit: (input: {
    category: InfoCategory;
    label: string;
    values: string[];
  }) => void;
}) {
  const accent = useThemeAccent();
  const [category, setCategory] = useState<InfoCategory | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  // Exemples cochés (création seulement) : plusieurs à la fois.
  const [pickedSuggestions, setPickedSuggestions] = useState<string[]>([]);
  // Adresse en trois champs (demande explicite), recomposée à l'envoi.
  const [address, setAddress] = useState<AddressParts>(EMPTY_ADDRESS);

  useEffect(() => {
    if (!visible) return;
    setPickedSuggestions([]);
    setAddress(
      editingItem?.category === 'address'
        ? parseAddress(editingItem.value ?? '')
        : EMPTY_ADDRESS,
    );

    if (editingItem && isInfoCategory(editingItem.category)) {
      setCategory(editingItem.category);
      setLabel(editingItem.label);
      setValue(
        editingItem.category === 'phone'
          ? formatPhoneNumber(editingItem.value ?? '')
          : (editingItem.value ?? ''),
      );
    } else if (!editingItem && initialCategory) {
      setCategory(initialCategory);
      setLabel('');
      setValue(INFO_CATEGORY_META[initialCategory].isDate ? todayIso() : '');
    } else {
      setCategory(null);
      setLabel('');
      setValue(editingItem ? '' : todayIso());
    }
  }, [visible, editingItem, initialCategory]);

  const meta = category ? INFO_CATEGORY_META[category] : null;
  const isEditing = Boolean(editingItem);

  const selectCategory = (next: InfoCategory) => {
    setCategory(next);
    setLabel('');
    setValue(INFO_CATEGORY_META[next].isDate ? todayIso() : '');
    setPickedSuggestions([]);
    setAddress(EMPTY_ADDRESS);
  };

  const togglePickedSuggestion = (suggestion: string) =>
    setPickedSuggestions((current) =>
      current.includes(suggestion)
        ? current.filter((item) => item !== suggestion)
        : [...current, suggestion],
    );

  // En création, chaque exemple coché + le texte saisi donnent un élément ;
  // doublons retirés (même texte, casse ignorée).
  const submittedValues = (() => {
    if (meta?.isDate) return value ? [value] : [];
    if (category === 'address') {
      const composed = formatAddress(address);
      return composed ? [composed] : [];
    }
    const all = isEditing
      ? [value.trim()]
      : [...pickedSuggestions, value.trim()];
    const seen = new Set<string>();
    return all.filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  const canSubmit =
    category !== null &&
    !isSaving &&
    (meta?.needsLabel ? label.trim() !== '' : true) &&
    submittedValues.length > 0;

  const submit = () => {
    if (!category || !meta || !canSubmit) return;
    onSubmit({
      category,
      label: meta.needsLabel ? label.trim() : meta.defaultLabel,
      values: submittedValues,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="max-h-[92%] overflow-hidden rounded-t-[32px] bg-white"
        >
          <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
          >
            <View
              style={{
                position: 'absolute',
                top: -70,
                right: -60,
                width: 220,
                height: 200,
                borderRadius: 110,
                backgroundColor: lightenHex(accent, 0.55),
                opacity: 0.35,
              }}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-4 px-5 pb-8 pt-2.5"
          >
            <View className="h-1.5 w-11 self-center rounded-full bg-[#e6e6ea]" />

            {category === null ? (
              <>
                <View className="flex-row items-center gap-3.5">
                  <BlobIllustration accent={accent}>
                    <Ionicons
                      name="clipboard-outline"
                      size={36}
                      color={hexToRgba(accent, 0.85)}
                    />
                  </BlobIllustration>
                  <View className="flex-1 gap-1.5">
                    <Text
                      className="text-[22px] font-extrabold leading-7"
                      style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                    >
                      Que voulez-vous ajouter ?
                    </Text>
                    <Svg width={96} height={10} viewBox="0 0 96 10">
                      <Path
                        d="M3 7 C 28 2, 64 1.5, 93 4"
                        stroke={hexToRgba(accent, 0.5)}
                        strokeWidth={3}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </Svg>
                  </View>
                  <CloseButton accent={accent} onPress={onCancel} />
                </View>

                <Text
                  className="text-[13.5px] leading-[19px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  Sélectionnez la catégorie à laquelle vous souhaitez ajouter
                  une information.
                </Text>

                <View className="flex-row flex-wrap justify-between gap-y-2.5">
                  {INFO_CATEGORY_ORDER.map((option) => {
                    const optionMeta = INFO_CATEGORY_META[option];
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityLabel={optionMeta.pickerLabel}
                        onPress={() => selectCategory(option)}
                        className="w-[48.5%] flex-row items-center gap-2.5 rounded-[22px] py-2.5 pl-2.5 pr-2"
                        style={({ pressed }) => ({
                          backgroundColor: pressed
                            ? hexToRgba(accent, 0.06)
                            : 'rgba(255, 255, 255, 0.95)',
                          borderWidth: 1.5,
                          borderColor: pressed
                            ? hexToRgba(accent, 0.5)
                            : 'rgba(0, 0, 0, 0.05)',
                          shadowColor: accent,
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.08,
                          shadowRadius: 12,
                          elevation: 2,
                        })}
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: optionMeta.tint }}
                        >
                          <Ionicons
                            name={optionMeta.icon}
                            size={19}
                            color={optionMeta.color}
                          />
                        </View>
                        <Text
                          numberOfLines={2}
                          className="flex-1 text-[13.5px] font-semibold leading-[17px]"
                          style={{ color: GLASS_TITLE_COLOR }}
                        >
                          {optionMeta.pickerLabel}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color="#a8a8b3"
                        />
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="mt-1 items-center"
                  onPress={onCancel}
                >
                  <Text
                    className="text-[14.5px] font-semibold"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    Annuler
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View className="flex-row items-center gap-3">
                  {isEditing ? null : (
                    <Pressable
                      accessibilityLabel="Changer de catégorie"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setCategory(null)}
                      className="h-9 w-9 items-center justify-center rounded-full bg-[#f4f3f7]"
                    >
                      <Ionicons
                        name="chevron-back"
                        size={18}
                        color={GLASS_TITLE_COLOR}
                      />
                    </Pressable>
                  )}
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: meta?.tint }}
                  >
                    <Ionicons name={meta?.icon} size={19} color={meta?.color} />
                  </View>
                  <Text
                    className="flex-1 text-[18px] font-extrabold"
                    style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
                  >
                    {isEditing ? 'Modifier' : 'Ajouter'} — {meta?.pickerLabel}
                  </Text>
                  <CloseButton accent={accent} onPress={onCancel} />
                </View>

                {meta?.needsLabel ? (
                  <View className="gap-2">
                    <PlainInput
                      placeholder={meta.labelPlaceholder}
                      value={label}
                      onChangeText={setLabel}
                    />
                    {meta.labelSuggestions.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1.5">
                        {meta.labelSuggestions.map((suggestion) => (
                          <Pressable
                            key={suggestion}
                            accessibilityRole="button"
                            onPress={() => setLabel(suggestion)}
                            className={`rounded-full border px-3 py-1.5 ${
                              label === suggestion
                                ? 'border-accent bg-accent/10'
                                : 'border-[#e0e0e0] bg-white'
                            }`}
                          >
                            <Text
                              className={`text-[12.5px] ${
                                label === suggestion
                                  ? 'font-medium text-accent'
                                  : 'text-[#6b6b6b]'
                              }`}
                            >
                              {suggestion}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {category === 'address' ? (
                  <View className="gap-2.5">
                    <IconInput
                      icon="home-outline"
                      placeholder="Rue et numéro"
                      value={address.street}
                      onChangeText={(street) =>
                        setAddress((current) => ({ ...current, street }))
                      }
                      accent={accent}
                      autoComplete="street-address"
                      textContentType="fullStreetAddress"
                    />
                    <View className="flex-row gap-2.5">
                      <View style={{ flex: 1.6 }}>
                        <IconInput
                          icon="business-outline"
                          placeholder="Ville"
                          value={address.city}
                          onChangeText={(city) =>
                            setAddress((current) => ({ ...current, city }))
                          }
                          accent={accent}
                          textContentType="addressCity"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <IconInput
                          icon="mail-outline"
                          placeholder="Code postal"
                          value={address.postalCode}
                          // Chiffres seulement, 5 au plus.
                          onChangeText={(text) =>
                            setAddress((current) => ({
                              ...current,
                              postalCode: text.replace(/\D/g, '').slice(0, 5),
                            }))
                          }
                          accent={accent}
                          keyboardType="number-pad"
                          autoComplete="postal-code"
                          textContentType="postalCode"
                        />
                      </View>
                    </View>
                  </View>
                ) : meta?.isDate ? (
                  <WheelDatePicker value={value} onChange={setValue} />
                ) : meta?.valueOptions ? (
                  <View className="flex-row flex-wrap gap-2">
                    {meta.valueOptions.map((option) => (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        onPress={() => setValue(option)}
                        className={`min-w-[22%] items-center rounded-xl border px-3.5 py-2.5 ${
                          value === option
                            ? 'border-accent bg-accent/10'
                            : 'border-[#e0e0e0] bg-white'
                        }`}
                      >
                        <Text
                          className={`text-[14px] ${
                            value === option
                              ? 'font-semibold text-accent'
                              : 'text-[#1a1a1a]'
                          }`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <PlainInput
                    placeholder={meta?.valuePlaceholder}
                    value={value}
                    onChangeText={(text) =>
                      setValue(
                        category === 'social_security'
                          ? formatSocialSecurityNumber(text)
                          : category === 'phone'
                            ? // Espaces ajoutés pendant la saisie, comme
                              // pour les contacts : « 01 89 87 72 89 ».
                              formatPhoneNumber(text)
                            : text,
                      )
                    }
                    keyboardType={meta?.valueKeyboardType ?? 'default'}
                    multiline={meta?.multilineValue}
                    numberOfLines={meta?.multilineValue ? 3 : 1}
                  />
                )}

                {meta?.valueSuggestions ? (
                  <View className="flex-row flex-wrap gap-1.5">
                    {meta.valueSuggestions.map((suggestion) => {
                      // Création : cases à cocher, plusieurs à la fois.
                      // Modification d'un seul élément : l'exemple remplace
                      // la valeur.
                      const isPicked = isEditing
                        ? value === suggestion
                        : pickedSuggestions.includes(suggestion);
                      return (
                        <Pressable
                          key={suggestion}
                          accessibilityRole={isEditing ? 'button' : 'checkbox'}
                          accessibilityLabel={suggestion}
                          accessibilityState={
                            isEditing
                              ? { selected: isPicked }
                              : { checked: isPicked }
                          }
                          onPress={() =>
                            isEditing
                              ? setValue(suggestion)
                              : togglePickedSuggestion(suggestion)
                          }
                          className="rounded-full px-3 py-1.5"
                          style={{
                            borderWidth: 1,
                            borderColor: isPicked
                              ? meta.color
                              : 'rgba(0, 0, 0, 0.08)',
                            backgroundColor: isPicked ? meta.tint : '#ffffff',
                          }}
                        >
                          <Text
                            className="text-[12.5px]"
                            style={{
                              color: isPicked ? meta.color : '#6b6b6b',
                              fontWeight: isPicked ? '600' : '400',
                            }}
                          >
                            {isPicked && !isEditing ? '✓ ' : ''}
                            {suggestion}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                <PillButton
                  label={
                    isSaving
                      ? 'Enregistrement…'
                      : isEditing
                        ? 'Enregistrer'
                        : submittedValues.length > 1
                          ? `Ajouter ${submittedValues.length} ${
                              category === 'allergy'
                                ? 'allergies'
                                : category === 'vigilance'
                                  ? 'points'
                                  : 'éléments'
                            }`
                          : 'Ajouter'
                  }
                  icon={isEditing ? 'save-outline' : 'add-circle-outline'}
                  size="compact"
                  isDisabled={!canSubmit}
                  onPress={submit}
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
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Bouton de fermeture rond, en haut à droite de la feuille. */
function CloseButton({
  accent,
  onPress,
}: {
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Fermer"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      className="h-9 w-9 items-center justify-center self-start rounded-full bg-white"
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
  );
}

const EMPTY_ADDRESS: AddressParts = { street: '', postalCode: '', city: '' };
