import type { Messages } from '../fr';

export const birth: Messages['birth'] = {
  birthDate: 'Fecha de nacimiento',
  whatChanges: 'Qué cambia',
  otherProcedures: 'Tus otros trámites',
  realigned:
    'Referencias y recordatorios ajustados a la fecha elegida, para los dos.',
  allUpdated:
    'Todas las fechas y plazos de tus trámites se actualizarán automáticamente según esta fecha.',
  correctDate: 'Corregir la fecha',
  confirmBirth: 'Confirmar el nacimiento',
  saveFailed:
    'No se ha podido guardar. Revisa tu conexión e inténtalo de nuevo.',
  chooseDate: 'Elige la fecha para continuar',
  reviewBeforeSave: 'Revisarás la fecha antes de guardarla',
  editBirthDate: 'Editar la fecha de nacimiento',
  declared: 'Nacimiento declarado',
  gaveBirth: 'Ya he dado a luz',
  congrats: 'Enhorabuena — todo está al día por tu parte.',
  bigDay: '¡Ha llegado el gran día!',
  legalDeadline: 'Plazo legal',
  birthDateCaps: 'FECHA DE NACIMIENTO',
  doNow: 'PARA HACER AHORA',
  confirm: {
    title: '¿Confirmar esta fecha?',
    body: 'Los plazos de tus trámites se recalcularán a partir de ella.',
    canCorrect: 'Podrás corregirla desde esta pantalla si te equivocas.',
    yes: 'Sí, el bebé ha llegado',
    edit: 'Cambiar la fecha',
  },
  saving: 'Guardando…',
  issues: {
    future:
      'Esta fecha es futura — el nacimiento se declara cuando el bebé ya ha llegado.',
    tooOld: 'Esta fecha es de hace más de un año, revisa el año elegido.',
  },
  since: {
    today: 'Desde hoy',
    yesterday: 'Desde ayer',
    days: 'Hace {{count}} días',
    weeks: 'Hace {{count}} semanas',
    months_one: 'Hace {{count}} mes',
    months_other: 'Hace {{count}} meses',
  },
};
