import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

/**
 * `TextInput` brut plutôt que `Input`/`TextField` de Hero UI Native : la
 * librairie n'a jamais reçu les variables `--field-background` /
 * `--field-border` pour nos 4 thèmes custom (sauge/corail/lavande/ocre,
 * Phase 1.7) — seuls `light`/`dark` les ont, via son propre stylesheet.
 * Résultat, le champ n'a aucun fond visible dès qu'un de nos thèmes est
 * actif. Même contournement que celui déjà en place dans
 * `AppointmentFormModal`, généralisé ici pour tous les formulaires.
 *
 * Bordure teintée de l'accent actif (`border-accent`, lui bien défini pour
 * les 4 thèmes) plutôt que grise, sur demande explicite.
 */
export const PlainInput = forwardRef<
  TextInput,
  TextInputProps & { isInvalid?: boolean }
>(function PlainInput({ isInvalid, className, ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#9a9a9a"
      className={`rounded-[12px] border bg-white px-3.5 py-3 text-[14px] text-[#1a1a1a] ${
        isInvalid ? 'border-red-500' : 'border-accent'
      } ${className ?? ''}`}
      {...props}
    />
  );
});
