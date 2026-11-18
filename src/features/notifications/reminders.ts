import * as Notifications from 'expo-notifications';
import type { TFunction } from 'i18next';
import { type BabyEntry, getVaccinesDue } from '@/features/baby/constants';
import type { Appointment } from '@/features/health/api';
import type { Household } from '@/features/household/api';
import { formatAppointmentTime } from '@/features/hub/constants';
import type { ProcedureWithStatus } from '@/features/procedures/api';
import { formatDayMonth } from '@/i18n/format';
import { daysBetween, shiftIsoDate, todayIso } from '@/lib/date';

import { NOTIFICATION_CHANNELS } from './setup';

/** Rappel programmé sur le téléphone (notification locale). */
export type LocalReminder = {
  id: string;
  date: Date;
  title: string;
  body: string;
  url: string;
};

/** Préfixe des rappels de l'app, pour ne jamais toucher à d'autres notifications. */
const REMINDER_PREFIX = 'us-reminder:';

/** iOS refuse au-delà de 64 notifications programmées ; marge de sécurité. */
const MAX_SCHEDULED = 50;

const PREGNANCY_DAYS = 280;
const PROCEDURE_REMINDER_HOUR = 9;
const APPOINTMENT_EVE_HOUR = 19;
const VACCINE_REMINDER_HOUR = 9;
const VACCINE_EARLY_DAYS = 7;

function atLocalTime(iso: string, hours: number, minutes = 0): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Rendez-vous (demande explicite) : la veille à 19h, puis 1h avant quand
 * l'heure est connue. Ceux partagés par l'autre parent sont inclus (la RLS
 * ne renvoie que ceux qu'on a le droit de voir).
 */
export function buildAppointmentReminders(
  appointments: Appointment[],
  t: TFunction,
  locale: string,
  now: Date = new Date(),
): LocalReminder[] {
  const reminders: LocalReminder[] = [];
  const url = '/sante?tab=appointments';

  for (const appointment of appointments) {
    const time = formatAppointmentTime(appointment.appointment_time, locale);

    const eve = atLocalTime(
      shiftIsoDate(appointment.appointment_date, -1),
      APPOINTMENT_EVE_HOUR,
    );
    if (eve > now) {
      reminders.push({
        id: `appointment-eve:${appointment.id}`,
        date: eve,
        title: t('notifications.appointmentTomorrow'),
        body: time ? `${time} · ${appointment.title}` : appointment.title,
        url,
      });
    }

    if (appointment.appointment_time) {
      const [hours, minutes] = appointment.appointment_time
        .split(':')
        .map(Number);
      const start = atLocalTime(appointment.appointment_date, hours, minutes);
      const hourBefore = new Date(start.getTime() - 60 * 60 * 1000);
      if (hourBefore > now) {
        reminders.push({
          id: `appointment-hour:${appointment.id}`,
          date: hourBefore,
          title: t('notifications.appointmentInHour'),
          body: appointment.address
            ? `${appointment.title} · ${appointment.address}`
            : appointment.title,
          url,
        });
      }
    }
  }

  return reminders;
}

/**
 * Premier jour du mois de grossesse `month`, réciproque de
 * `getPregnancyMonth` (features/health/constants) : ce mois commence à
 * 2 + (mois − 1) × 4,345 semaines d'aménorrhée, arrondi à la semaine
 * entière suivante.
 */
export function getPregnancyMonthStart(dueDate: string, month: number): string {
  const weeks = Math.ceil(2 + (month - 1) * 4.345);
  return shiftIsoDate(dueDate, -PREGNANCY_DAYS + weeks * 7);
}

/** Prochain lundi à 9h (aujourd'hui si on est lundi avant 9h). */
function nextMondayMorning(now: Date): Date {
  const date = new Date(now);
  date.setHours(PROCEDURE_REMINDER_HOUR, 0, 0, 0);
  const daysUntilMonday = (8 - date.getDay()) % 7;
  date.setDate(date.getDate() + daysUntilMonday);
  if (date <= now) date.setDate(date.getDate() + 7);
  return date;
}

function describeProcedures(titles: string[], t: TFunction): string {
  if (titles.length === 1) return titles[0];
  return t('notifications.andOthers', {
    first: titles[0],
    count: titles.length - 1,
  });
}

/**
 * Démarches dont « Me rappeler » est activé et qui ne sont pas faites
 * (demande explicite) :
 *  - échéance après la naissance (déclaration de naissance) : la veille et
 *    le jour de l'échéance à 9h, une fois la naissance déclarée ;
 *  - démarche d'un mois de grossesse à venir : le premier jour de ce mois
 *    à 9h, regroupées par mois ;
 *  - le reste (mois en cours ou passé, sans date) : un rappel groupé le
 *    lundi à 9h, chaque semaine tant qu'elles ne sont pas faites.
 */
export function buildProcedureReminders(
  procedures: ProcedureWithStatus[],
  household: Pick<Household, 'due_date' | 'birth_date'>,
  t: TFunction,
  now: Date = new Date(),
): LocalReminder[] {
  const reminders: LocalReminder[] = [];
  const url = '/demarches';
  const today = todayIso();
  const byMonthStart = new Map<string, string[]>();
  const pending: string[] = [];

  for (const procedure of procedures) {
    if (!procedure.reminderEnabled || procedure.status === 'fait') continue;

    if (procedure.deadline_days_after_birth !== null) {
      if (!household.birth_date) continue;
      const deadline = shiftIsoDate(
        household.birth_date,
        procedure.deadline_days_after_birth,
      );
      const dayBefore = atLocalTime(
        shiftIsoDate(deadline, -1),
        PROCEDURE_REMINDER_HOUR,
      );
      const deadlineDay = atLocalTime(deadline, PROCEDURE_REMINDER_HOUR);
      if (dayBefore > now) {
        reminders.push({
          id: `procedure-eve:${procedure.householdProcedureId}`,
          date: dayBefore,
          title: t('notifications.procedureEve'),
          body: t('notifications.procedureEveBody', { title: procedure.title }),
          url,
        });
      }
      if (deadlineDay > now) {
        reminders.push({
          id: `procedure-deadline:${procedure.householdProcedureId}`,
          date: deadlineDay,
          title: t('notifications.procedureDay'),
          body: t('notifications.procedureDayBody', { title: procedure.title }),
          url,
        });
      } else if (daysBetween(today, deadline) < 0) {
        pending.push(procedure.title);
      }
      continue;
    }

    if (procedure.pregnancy_month !== null && household.due_date) {
      const start = getPregnancyMonthStart(
        household.due_date,
        procedure.pregnancy_month,
      );
      if (atLocalTime(start, PROCEDURE_REMINDER_HOUR) > now) {
        byMonthStart.set(start, [
          ...(byMonthStart.get(start) ?? []),
          procedure.title,
        ]);
        continue;
      }
    }

    pending.push(procedure.title);
  }

  for (const [start, titles] of byMonthStart) {
    reminders.push({
      id: `procedure-month:${start}`,
      date: atLocalTime(start, PROCEDURE_REMINDER_HOUR),
      title: t('notifications.monthProcedures', { count: titles.length }),
      body: describeProcedures(titles, t),
      url,
    });
  }

  if (pending.length > 0) {
    reminders.push({
      id: 'procedure-weekly',
      date: nextMondayMorning(now),
      title:
        pending.length === 1
          ? t('notifications.pendingProcedures', { count: 1 })
          : t('notifications.pendingProcedures', { count: pending.length }),
      body: describeProcedures(pending, t),
      url,
    });
  }

  return reminders;
}

/**
 * Vaccins de bébé (demande explicite du 2026-11-15) : pour chaque vaccin
 * « À faire » et chaque prochain rappel encore attendu, une notification
 * 7 jours avant (le temps de prendre rendez-vous) puis le jour J, à 9h.
 * Rien pour une échéance déjà passée : elle s'affiche « en retard » dans
 * l'app. Pour les deux parents (chacun programme sur son téléphone).
 */
export function buildVaccineReminders(
  entries: BabyEntry[],
  t: TFunction,
  locale: string,
  now: Date = new Date(),
): LocalReminder[] {
  const reminders: LocalReminder[] = [];
  const url = '/bebe-vaccin';

  for (const due of getVaccinesDue(entries, todayIso())) {
    const what =
      due.kind === 'booster'
        ? t('notifications.vaccineBooster', { name: due.name })
        : due.name;
    const dueDay = atLocalTime(due.date, VACCINE_REMINDER_HOUR);
    const earlyDay = atLocalTime(
      shiftIsoDate(due.date, -VACCINE_EARLY_DAYS),
      VACCINE_REMINDER_HOUR,
    );
    const id = `vaccine-${due.entry.id}-${due.kind}`;

    if (earlyDay > now) {
      reminders.push({
        id: `${id}-early`,
        date: earlyDay,
        title: t('notifications.vaccineIn7Days'),
        body: t('notifications.vaccineIn7DaysBody', {
          what,
          date: formatDayMonth(due.date, locale),
        }),
        url,
      });
    }
    if (dueDay > now) {
      reminders.push({
        id: `${id}-day`,
        date: dueDay,
        title: t('notifications.vaccineToday'),
        body: t('notifications.vaccineTodayBody', { what }),
        url,
      });
    }
  }
  return reminders;
}

/**
 * Remplace tous les rappels programmés de l'app par `reminders` (les plus
 * proches d'abord, dans la limite d'iOS). Recalculer et tout reprogrammer
 * reste simple et sûr : un rendez-vous déplacé ou supprimé, une démarche
 * faite, un réglage coupé… disparaissent d'eux-mêmes.
 */
export async function syncLocalReminders(
  reminders: LocalReminder[],
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) =>
        notification.identifier.startsWith(REMINDER_PREFIX),
      )
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
  );

  const upcoming = [...reminders]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SCHEDULED);

  for (const reminder of upcoming) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_PREFIX}${reminder.id}`,
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { url: reminder.url },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: NOTIFICATION_CHANNELS.reminders,
      },
    });
  }
}
