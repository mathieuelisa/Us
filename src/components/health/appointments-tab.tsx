import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppointmentFormModal } from '@/components/health/appointment-form-modal';
import { MonthCalendar } from '@/components/health/month-calendar';
import { PillButton } from '@/components/ui/pill-button';
import { formatAppointmentSummary } from '@/features/health/constants';
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { sessionAtom } from '@/lib/atoms/session';
import { todayIso } from '@/lib/date';

/**
 * Écrans 4b et 4g — calendrier du mois et prochains rendez-vous.
 *
 * Les **deux** parents créent des rendez-vous (décision du 2026-11-11). La
 * RLS (`appointments_select_own_or_shared`) ne renvoie que ses propres
 * rendez-vous et ceux que l'autre a partagés : aucun filtrage côté client.
 * Seul le créateur peut supprimer — on n'affiche donc la croix et le badge
 * « Partagé / Non partagé » que sur ses propres rendez-vous ; ceux de
 * l'autre parent sont signalés comme tels.
 */
export function AppointmentsTab({
  household,
}: {
  household: Household | null | undefined;
}) {
  const currentUserId = useAtomValue(sessionAtom)?.user.id ?? null;
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
        // Cliquer une date ouvre directement le formulaire pré-rempli.
        onSelectDate={openFormFor}
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
          upcoming.map((appointment) => {
            const isMine = appointment.created_by === currentUserId;
            return (
              <View
                key={appointment.id}
                className="gap-1.5 rounded-2xl bg-white px-4 py-3.5"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="flex-1 text-[15px] font-medium text-[#1a1a1a]">
                    {appointment.title}
                  </Text>

                  {/* Partagé / non partagé n'a de sens que pour ses propres
                    rendez-vous : ceux de l'autre parent sont forcément
                    partagés, sans quoi la RLS ne les renverrait pas. */}
                  {isMine ? (
                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        appointment.is_shared ? 'bg-accent/10' : 'bg-[#f0f0f0]'
                      }`}
                    >
                      <Text
                        className={`text-[10.5px] font-medium ${
                          appointment.is_shared
                            ? 'text-accent'
                            : 'text-[#6b6b6b]'
                        }`}
                      >
                        {appointment.is_shared ? 'Partagé' : 'Non partagé'}
                      </Text>
                    </View>
                  ) : (
                    <View className="rounded-full bg-accent/10 px-2 py-0.5">
                      <Text className="text-[10.5px] font-medium text-accent">
                        De votre co-parent
                      </Text>
                    </View>
                  )}

                  {isMine ? (
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
            );
          })
        )}

        <View className="mt-2">
          <PillButton
            label="Ajouter un rendez-vous"
            icon="add-circle-outline"
            onPress={() => openFormFor(null)}
          />
        </View>
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
