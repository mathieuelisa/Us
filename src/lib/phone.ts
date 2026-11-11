/**
 * Met en forme un numéro de téléphone pendant la saisie (demande explicite :
 * « 01 89 87 72 89 » plutôt que « 0189877289 »). Ne valide rien : on
 * regroupe seulement les chiffres pour les rendre lisibles.
 *
 * - Numéro français (commence par 0) : paires de chiffres, 10 au plus —
 *   « 01 89 87 72 89 ».
 * - Format international `+33` : indicatif, puis le premier chiffre seul,
 *   puis des paires — « +33 6 12 34 56 78 ».
 * - Autre indicatif (`+` suivi d'autres chiffres) : indicatif à deux chiffres,
 *   puis des paires.
 * - Numéro court de 4 chiffres ou moins (15, 112, 3114) : laissé tel quel,
 *   des paires n'y aideraient pas la lecture.
 *
 * Tout autre caractère (lettres, tirets, points, espaces) est ignoré, ce qui
 * rend aussi l'effacement naturel : supprimer un espace ne fait que
 * reformer les mêmes paires.
 */
export function formatPhoneNumber(input: string): string {
  const hasPlus = input.trim().startsWith('+');
  const digits = input.replace(/\D/g, '');

  if (!hasPlus) {
    if (digits.length <= 4) return digits;
    return groupInPairs(digits.slice(0, 10));
  }

  if (digits.startsWith('33')) {
    const national = digits.slice(2, 11);
    if (national.length === 0) return '+33';
    return `+33 ${national.slice(0, 1)} ${groupInPairs(national.slice(1))}`.trim();
  }

  const countryCode = digits.slice(0, 2);
  const rest = digits.slice(2, 14);
  return rest ? `+${countryCode} ${groupInPairs(rest)}` : `+${countryCode}`;
}

function groupInPairs(digits: string): string {
  return digits.match(/.{1,2}/g)?.join(' ') ?? '';
}
