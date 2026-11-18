import type { Messages } from '../fr';

export const notifications: Messages['notifications'] = {
  channels: {
    reminders: 'Recordatorios',
    remindersHint: 'Citas y trámites',
    partner: 'Tu pareja',
    partnerHint: 'Lo que comparte el otro progenitor',
  },
  appointmentTomorrow: 'Cita mañana',
  appointmentInHour: 'Cita dentro de 1 hora',
  andOthers_one: '{{first}} y {{count}} más',
  andOthers_other: '{{first}} y {{count}} más',
  procedureEve: 'Solo queda un día',
  procedureEveBody: 'Recuerda: {{title}}',
  procedureDay: 'Último día',
  procedureDayBody: 'Hoy vence el plazo: {{title}}',
  monthProcedures_one: 'Un trámite que prever este mes',
  monthProcedures_other: '{{count}} trámites que prever este mes',
  pendingProcedures_one: 'Queda un trámite por hacer',
  pendingProcedures_other: 'Quedan {{count}} trámites por hacer',
  vaccineBooster: 'Refuerzo de {{name}}',
  vaccineIn7Days: 'Vacuna del bebé dentro de 7 días',
  vaccineIn7DaysBody: '{{what}}, el {{date}}. Recuerda pedir cita.',
  vaccineToday: 'Vacuna del bebé hoy',
  vaccineTodayBody: '{{what}} está prevista para hoy.',
};
