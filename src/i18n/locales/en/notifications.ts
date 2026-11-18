import type { Messages } from '../fr';

export const notifications: Messages['notifications'] = {
  channels: {
    reminders: 'Reminders',
    remindersHint: 'Appointments and paperwork',
    partner: 'Your partner',
    partnerHint: 'What the other parent shares',
  },
  appointmentTomorrow: 'Appointment tomorrow',
  appointmentInHour: 'Appointment in 1 hour',
  andOthers_one: '{{first}} and {{count}} other',
  andOthers_other: '{{first}} and {{count}} others',
  procedureEve: 'One day left',
  procedureEveBody: 'Remember: {{title}}',
  procedureDay: 'Last day',
  procedureDayBody: 'Today is the deadline: {{title}}',
  monthProcedures_one: 'One piece of paperwork to plan this month',
  monthProcedures_other: '{{count}} pieces of paperwork to plan this month',
  pendingProcedures_one: 'One piece of paperwork left to do',
  pendingProcedures_other: '{{count}} pieces of paperwork left to do',
  vaccineBooster: '{{name}} booster',
  vaccineIn7Days: 'Baby’s vaccine in 7 days',
  vaccineIn7DaysBody: '{{what}}, on {{date}}. Remember to book an appointment.',
  vaccineToday: 'Baby’s vaccine today',
  vaccineTodayBody: '{{what}} is due today.',
};
