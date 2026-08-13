import { Button } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { OutlineButton } from '@/components/outline-button';
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useReorderContacts,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';

/**
 * Écran 4c — carnet de contacts partagé, modifiable par les deux parents.
 *
 * Réordonnancement par boutons haut/bas plutôt qu'un vrai glisser-déposer,
 * comme dans l'onglet Information : même choix, même dette
 * (DOCS/05-DETTE-ET-POINTS-OUVERTS.md n° 12). La persistance, elle, est
 * bien réelle.
 */
export function ContactsTab({
  household,
  isAdding,
  onIsAddingChange,
}: {
  household: Household | null | undefined;
  isAdding: boolean;
  onIsAddingChange: (isAdding: boolean) => void;
}) {
  const { data: contacts = [] } = useContacts(household);
  const createContact = useCreateContact(household);
  const deleteContact = useDeleteContact(household);
  const reorderContacts = useReorderContacts(household);

  const [name, setName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const [phone, setPhone] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const resetForm = () => {
    setName('');
    setRoleLabel('');
    setPhone('');
    setIsEmergency(false);
    onIsAddingChange(false);
  };

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
    <View className="gap-2.5">
      {contacts.length === 0 ? (
        <Text className="text-[13px] text-[#9a9a9a]">
          Aucun contact pour l’instant.
        </Text>
      ) : (
        contacts.map((contact, index) => (
          <View
            key={contact.id}
            className="flex-row items-center gap-2 rounded-[16px] bg-white px-4 py-3.5"
          >
            <View className="flex-1 gap-0.5">
              <Text
                className={`text-[15px] font-medium ${
                  contact.is_emergency ? 'text-red-600' : 'text-[#1a1a1a]'
                }`}
              >
                {contact.name}
              </Text>
              {contact.role_label || contact.phone ? (
                <Text className="text-[13px] text-[#6b6b6b]">
                  {[contact.role_label, contact.phone]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
            </View>

            <Pressable
              accessibilityLabel="Monter"
              accessibilityRole="button"
              disabled={index === 0}
              hitSlop={8}
              onPress={() => moveContact(index, -1)}
            >
              <Text
                className={
                  index === 0
                    ? 'text-[16px] text-[#d0d0d0]'
                    : 'text-[16px] text-[#6b6b6b]'
                }
              >
                ▲
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Descendre"
              accessibilityRole="button"
              disabled={index === contacts.length - 1}
              hitSlop={8}
              onPress={() => moveContact(index, 1)}
            >
              <Text
                className={
                  index === contacts.length - 1
                    ? 'text-[16px] text-[#d0d0d0]'
                    : 'text-[16px] text-[#6b6b6b]'
                }
              >
                ▼
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Supprimer ${contact.name}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => deleteContact.mutate(contact.id)}
            >
              <Text className="text-[15px] text-[#9a9a9a]">✕</Text>
            </Pressable>
          </View>
        ))
      )}

      {isAdding ? (
        <View className="gap-2.5 rounded-[16px] bg-white px-4 py-4">
          <ContactInput
            placeholder="Nom — ex. Dr Martin"
            value={name}
            onChangeText={setName}
          />
          <ContactInput
            placeholder="Rôle — ex. Gynécologue"
            value={roleLabel}
            onChangeText={setRoleLabel}
          />
          <ContactInput
            placeholder="Téléphone"
            value={phone}
            onChangeText={setPhone}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isEmergency }}
            onPress={() => setIsEmergency((current) => !current)}
            className={`rounded-[12px] border px-3.5 py-2.5 ${
              isEmergency
                ? 'border-red-500 bg-red-50'
                : 'border-[#e0e0e0] bg-white'
            }`}
          >
            <Text
              className={`text-[13px] ${
                isEmergency ? 'font-medium text-red-600' : 'text-[#1a1a1a]'
              }`}
            >
              Numéro d’urgence
            </Text>
          </Pressable>

          <View className="flex-row gap-2">
            <OutlineButton
              className="flex-1"
              label="Annuler"
              onPress={resetForm}
            />
            <Button
              className="flex-1"
              isDisabled={name.trim() === '' || createContact.isPending}
              onPress={() =>
                createContact.mutate(
                  {
                    name: name.trim(),
                    roleLabel: roleLabel.trim() || null,
                    address: null,
                    phone: phone.trim() || null,
                    isEmergency,
                    sortOrder: contacts.length,
                  },
                  { onSuccess: resetForm },
                )
              }
            >
              <Button.Label>Ajouter</Button.Label>
            </Button>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ContactInput(props: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      placeholder={props.placeholder}
      placeholderTextColor="#9a9a9a"
      value={props.value}
      onChangeText={props.onChangeText}
      className="rounded-[12px] border border-[#e0e0e0] px-3.5 py-3 text-[14px] text-[#1a1a1a]"
    />
  );
}
