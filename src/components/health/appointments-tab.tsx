import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppointmentFormModal } from '@/components/health/appointment-form-modal';
import { MonthCalendar } from '@/components/health/month-calendar';
import { formatAppointmentSummary } from '@/features/health/constants';
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { todayIso } from '@/lib/date';

/** Écrans 4b et 4g — calendrier du mois et prochains rendez-vous. */
export function AppointmentsTab({
  household,
  isPregnant,
}: {
  household: Household | null | undefined;
  isPregnant: boolean;
}) {
  const { data: appointments = [] } = useAppointments(household);
  const createAppointment = useCreateAppointment(household);
  const deleteAppointment = useDeleteAppointment(household);

  const today = todayIso();
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [month, setMonth] = useState(Number(today.slice(5, 7)));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState<string | null>(null);

  const openFormFor = (isoDate: string | null) => {
    setPickedDate(isoDate);
    setIsFormOpen(true);
  };

  const changeMonth = (delta: -1 | 1) => {
    const next = month + delta;
    if (next < 1) {
      setMonth(12);
      setYear(year - 1);
    } else if (next > 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(next);
    }
  };

  const upcoming = appointments.filter(
    (appointment) => appointment.appointment_date >= today,
  );

  return (
    <View className="gap-5">
      <MonthCalendar
        year={year}
        month={month}
        markedDates={appointments.map((item) => item.appointment_date)}
        onChangeMonth={changeMonth}
        // Cliquer une date ouvre directement le formulaire pré-rempli — le
        // co-parent n'a de toute façon pas le bouton d'ajout, la sélection
        // reste donc désactivée pour lui (cf. `disabled={!onSelectDate}`
        // dans MonthCalendar).
        onSelectDate={isPregnant ? openFormFor : undefined}
      />

      <View className="gap-2.5">
        <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
          VOS PROCHAINS RENDEZ-VOUS
        </Text>

        {upcoming.length === 0 ? (
          <Text className="text-[13px] text-[#9a9a9a]">
            Aucun rendez-vous à venir.
          </Text>
        ) : (
          upcoming.map((appointment) => (
            <View
              key={appointment.id}
              className="gap-1.5 rounded-[16px] bg-white px-4 py-3.5"
            >
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-[15px] font-medium text-[#1a1a1a]">
                  {appointment.title}
                </Text>

                {/* Le badge n'a de sens que pour la personne enceinte : le
                    co-parent ne voit de toute façon que les partagés. */}
                {isPregnant ? (
                  <View
                    className={`rounded-full px-2 py-0.5 ${
                      appointment.is_shared ? 'bg-accent/10' : 'bg-[#f0f0f0]'
                    }`}
                  >
                    <Text
                      className={`text-[10.5px] font-medium ${
                        appointment.is_shared ? 'text-accent' : 'text-[#6b6b6b]'
                      }`}
                    >
                      {appointment.is_shared ? 'Partagé' : 'Non partagé'}
                    </Text>
                  </View>
                ) : null}

                {isPregnant ? (
                  <Pressable
                    accessibilityLabel={`Supprimer ${appointment.title}`}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => deleteAppointment.mutate(appointment.id)}
                  >
                    <Text className="text-[15px] text-[#9a9a9a]">✕</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text className="text-[13px] text-[#6b6b6b]">
                {formatAppointmentSummary(
                  appointment.appointment_date,
                  appointment.appointment_time,
                )}
                {appointment.address ? ` — ${appointment.address}` : ''}
              </Text>
            </View>
          ))
        )}

        {isPregnant ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openFormFor(null)}
            className="items-center rounded-full bg-accent py-3"
          >
            <Text className="text-[15px] font-medium text-accent-foreground">
              + Ajouter un rendez-vous
            </Text>
          </Pressable>
        ) : null}
      </View>

      <AppointmentFormModal
        visible={isFormOpen}
        isSaving={createAppointment.isPending}
        initialDate={pickedDate}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={(input) =>
          createAppointment.mutate(input, {
            onSuccess: () => setIsFormOpen(false),
          })
        }
      />
    </View>
  );
}
