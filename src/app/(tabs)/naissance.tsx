import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { ConfirmBirthModal } from '@/components/birth/confirm-birth-modal';
import { DeclareBirthButton } from '@/components/birth/declare-birth-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import {
  BIRTH_DATE_ISSUE_MESSAGE,
  formatBirthDateLong,
  formatSinceBirth,
  getBirthDateIssue,
} from '@/features/birth/constants';
import { useDeclareBirth } from '@/features/birth/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import { CARD_SHADOW } from '@/features/hub/constants';
import {
  formatDeadlineLabel,
  getProcedureIconStyle,
} from '@/features/procedures/constants';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { DEV_PROCEDURES_FIXTURE } from '@/features/procedures/dev-fixture';
import { useProcedures } from '@/features/procedures/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassAtom } from '@/lib/atoms/dev-bypass';

const SafeAreaView = withUniwind(RNSafeAreaView);

const BIRTH_DECLARATION_SLUG = 'declaration-naissance';

/**
 * Écran 7a — « J'ai accouché », ouvert depuis le bouton du hub (visible de
 * la seule femme enceinte, cf. CONCEPT.md et le point ouvert n°19).
 *
 * C'est l'**événement pivot** du MVP : renseigner `households.birth_date`
 * fait passer la déclaration de naissance à la mairie d'un repère
 * informatif (« 5 jours à partir de la naissance ») à une échéance datée,
 * partagée avec le co-parent. L'écran est donc construit autour de trois
 * moments plutôt qu'autour du seul formulaire :
 *
 * 1. **choisir** la date (molette, `WheelDatePicker` — le sélecteur unique
 *    de l'app) ;
 * 2. **voir la conséquence** avant de valider — l'échéance légale se
 *    recalcule en direct sous la molette, ce que la maquette ne montrait
 *    pas mais que « recalcule toutes les échéances » (01-DESIGN-OVERVIEW)
 *    rend indispensable pour ne pas valider à l'aveugle ;
 * 3. **confirmer** dans une pop-up qui relit la date en toutes lettres.
 *
 * Une fois déclarée, l'écran ne redevient pas un formulaire : il affiche
 * l'état « naissance déclarée » avec un accès direct à la démarche
 * concernée, et la correction reste possible d'un tap.
 *
 * ⚠️ Hors périmètre ici : la bascule de navigation grossesse → bébé
 * (déblocage du module premium, changement de contenu du hub) que
 * 01-DESIGN-OVERVIEW rattache à ce même événement — elle appartient à la
 * Phase 3 (module « Votre bébé » + paiement). Cet écran ne fait donc
 * qu'écrire la date et recalculer les échéances.
 */
export default function BirthScreen() {
  const router = useRouter();
  const backgroundColor = useThemeBackground();

  const { data: household } = useMyHousehold();
  const declareBirth = useDeclareBirth(household);

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Sans foyer réel,
  // l'écriture Supabase échouerait et l'écran resterait bloqué sur son
  // formulaire : la date déclarée est alors gardée en mémoire, comme les
  // statuts de démarches le sont déjà dans `demarches.tsx`.
  const isDevBypass = useAtomValue(devBypassAtom) !== 'off';
  const [devBirthDate, setDevBirthDate] = useState<string | null>(null);

  const { data: remoteProcedures = [] } = useProcedures(household);
  const procedures = isDevBypass ? DEV_PROCEDURES_FIXTURE : remoteProcedures;
  // Le délai légal n'est pas codé en dur ici : il vient du référentiel
  // (`procedure_templates.deadline_days_after_birth`), seule source de
  // vérité de cette valeur — la même que celle lue par l'écran Démarches.
  const birthDeclaration = procedures.find(
    (procedure) => procedure.slug === BIRTH_DECLARATION_SLUG,
  );

  const declaredBirthDate = isDevBypass
    ? devBirthDate
    : (household?.birth_date ?? null);

  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isFormVisible = declaredBirthDate === null || isCorrecting;
  const dateIssue = getBirthDateIssue(draftDate);
  const canConfirm = draftDate !== null && dateIssue === null;

  const startCorrecting = () => {
    setDraftDate(declaredBirthDate);
    setIsCorrecting(true);
  };

  const confirm = () => {
    if (!draftDate) return;

    if (isDevBypass) {
      setDevBirthDate(draftDate);
      setIsConfirmOpen(false);
      setIsCorrecting(false);
      return;
    }

    declareBirth.mutate(draftDate, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        setIsCorrecting(false);
      },
    });
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Revenir en arrière"
          accessibilityRole="button"
          hitSlop={12}
          style={CARD_SHADOW}
          onPress={() =>
            isCorrecting ? setIsCorrecting(false) : router.back()
          }
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
        </Pressable>

        <BirthHeader isDeclared={declaredBirthDate !== null && !isCorrecting} />

        {isFormVisible ? (
          <>
            <View className="gap-2">
              <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
                DATE DE NAISSANCE
              </Text>
              <WheelDatePicker value={draftDate} onChange={setDraftDate} />
              {dateIssue ? (
                <View className="flex-row items-start gap-2 px-1">
                  <Ionicons name="alert-circle" size={15} color="#c9553d" />
                  <Text className="flex-1 text-[12.5px] leading-[18px] text-[#c9553d]">
                    {BIRTH_DATE_ISSUE_MESSAGE[dateIssue]}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
                CE QUE ÇA CHANGE
              </Text>

              {birthDeclaration ? (
                <DeadlinePreviewCard
                  title={birthDeclaration.title}
                  deadlineDaysAfterBirth={
                    birthDeclaration.deadline_days_after_birth
                  }
                  birthDate={canConfirm ? draftDate : null}
                />
              ) : null}

              <View
                style={CARD_SHADOW}
                className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5"
              >
                <View className="h-11 w-11 items-center justify-center rounded-full bg-accent/10">
                  <Ionicons name="sync-outline" size={19} color="#6b6b6b" />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[15px] font-medium text-[#1a1a1a]">
                    Vos autres démarches
                  </Text>
                  <Text className="text-[13px] leading-[18px] text-[#6b6b6b]">
                    Repères et rappels réalignés sur la date choisie, pour vous
                    deux.
                  </Text>
                </View>
              </View>
            </View>

            {/* Encadré pointillé de la maquette 7a, repris tel quel : c'est
                le seul endroit où l'app annonce qu'une saisie modifie des
                données ailleurs. */}
            <View className="flex-row items-start gap-2.5 rounded-[14px] border border-dashed border-accent bg-white/70 px-3.5 py-3.5">
              <Ionicons name="information-circle" size={17} color="#6b6b6b" />
              <Text className="flex-1 text-[13px] leading-[19px] text-[#3d3d3d]">
                Toutes les dates et échéances de vos démarches seront
                automatiquement mises à jour en fonction de cette date.
              </Text>
            </View>
          </>
        ) : (
          <DeclaredBirthSummary
            birthDate={declaredBirthDate as string}
            procedureTitle={birthDeclaration?.title ?? null}
            deadlineDaysAfterBirth={
              birthDeclaration?.deadline_days_after_birth ?? null
            }
            onOpenProcedures={() => router.push('/demarches')}
          />
        )}
      </ScrollView>

      {/* Hors du `ScrollView` : l'action reste atteignable sans faire
          défiler jusqu'en bas, comme dans la maquette 7a. Repeint du fond
          d'écran — sans quoi le contenu défilerait visiblement derrière le
          bouton, dont le halo n'est pas opaque. */}
      {isFormVisible ? (
        <View className="gap-2 px-6 pb-3 pt-3" style={{ backgroundColor }}>
          <DeclareBirthButton
            label={isCorrecting ? 'Corriger la date' : 'Confirmer la naissance'}
            isDisabled={!canConfirm}
            isLoading={declareBirth.isPending}
            onPress={() => setIsConfirmOpen(true)}
          />
          {/* Une seule ligne sous le bouton, et jamais deux messages
              concurrents : quand la date est refusée, l'explication est déjà
              affichée sous la molette. */}
          {declareBirth.isError ? (
            <Text className="px-2 text-center text-[12.5px] text-[#c9553d]">
              L’enregistrement a échoué. Vérifiez votre connexion et réessayez.
            </Text>
          ) : dateIssue !== null ? null : (
            <Text className="px-2 text-center text-[12px] text-[#8a8a8a]">
              {draftDate === null
                ? 'Choisissez la date pour continuer'
                : 'Vous relirez la date avant qu’elle soit enregistrée'}
            </Text>
          )}
        </View>
      ) : (
        /* Même emplacement que le bouton principal une fois la naissance
           déclarée : la correction est une action mineure, mais laisser ce
           pied d'écran vide déséquilibrait l'état final. */
        <View className="px-6 pb-3 pt-3" style={{ backgroundColor }}>
          <Pressable
            accessibilityRole="button"
            onPress={startCorrecting}
            className="items-center py-2"
          >
            <Text className="text-[14px] font-medium text-accent">
              Modifier la date de naissance
            </Text>
          </Pressable>
        </View>
      )}

      <ConfirmBirthModal
        visible={isConfirmOpen}
        birthDate={draftDate}
        isSubmitting={declareBirth.isPending}
        onConfirm={confirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </SafeAreaView>
  );
}

/**
 * Illustration + titre. L'image est celle de l'écran de réassurance de
 * l'onboarding (parents et bébé qui fêtent) — c'est le seul visuel de l'app
 * qui montre l'après-naissance, et le réutiliser ici referme la boucle
 * ouverte pendant l'onboarding.
 */
function BirthHeader({ isDeclared }: { isDeclared: boolean }) {
  const accent = useThemeAccent();

  return (
    <View className="items-center gap-1.5">
      <Image
        source={require('@/assets/images/Father_mother_baby_party.png')}
        className="h-44 w-72"
        resizeMode="contain"
      />

      <View className="flex-row items-center gap-2">
        {/* Cœur rose avant, coche à l'accent après : le premier reprend
            l'icône du bouton du hub, la seconde parle le langage des états
            validés du reste de l'app. */}
        <Ionicons
          name={isDeclared ? 'checkmark-circle' : 'heart'}
          size={21}
          color={isDeclared ? accent : '#c9647f'}
        />
        <Text className="text-[26px] font-bold text-[#1a1a1a]">
          {isDeclared ? 'Naissance déclarée' : 'J’ai accouché'}
        </Text>
      </View>

      <Text className="text-center text-[14px] text-[#8a8a8a]">
        {isDeclared
          ? 'Félicitations — tout est à jour de votre côté.'
          : 'Le grand jour est arrivé !'}
      </Text>
    </View>
  );
}

/**
 * Aperçu de l'échéance légale telle qu'elle apparaîtra dans Démarches, mise
 * à jour à chaque cran de la molette. `birthDate` à `null` (aucune date
 * choisie, ou date refusée) fait retomber `formatDeadlineLabel()` sur son
 * libellé informatif — jamais sur une date inventée.
 */
function DeadlinePreviewCard({
  title,
  deadlineDaysAfterBirth,
  birthDate,
}: {
  title: string;
  deadlineDaysAfterBirth: number | null;
  birthDate: string | null;
}) {
  const iconStyle = getProcedureIconStyle(BIRTH_DECLARATION_SLUG);
  const deadline = formatDeadlineLabel(deadlineDaysAfterBirth, birthDate);

  return (
    <View
      style={CARD_SHADOW}
      className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5"
    >
      <View
        style={{ backgroundColor: iconStyle.bg }}
        className="h-11 w-11 items-center justify-center rounded-full"
      >
        <Ionicons name={iconStyle.icon} size={20} color={iconStyle.color} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-medium text-[#1a1a1a]">{title}</Text>
        <Text
          className="text-[13px] font-medium"
          style={{ color: birthDate ? iconStyle.color : '#6b6b6b' }}
        >
          {deadline}
        </Text>
      </View>

      {deadlineDaysAfterBirth === null ? null : (
        <View
          style={{ backgroundColor: iconStyle.bg }}
          className="rounded-full px-2.5 py-1"
        >
          <Text
            className="text-[11px] font-semibold"
            style={{ color: iconStyle.color }}
          >
            Délai légal
          </Text>
        </View>
      )}
    </View>
  );
}

/** État après déclaration : la date retenue, et la suite immédiate. */
function DeclaredBirthSummary({
  birthDate,
  procedureTitle,
  deadlineDaysAfterBirth,
  onOpenProcedures,
}: {
  birthDate: string;
  procedureTitle: string | null;
  deadlineDaysAfterBirth: number | null;
  onOpenProcedures: () => void;
}) {
  const iconStyle = getProcedureIconStyle(BIRTH_DECLARATION_SLUG);

  return (
    <View className="gap-5">
      <View
        style={CARD_SHADOW}
        className="items-center gap-1 rounded-2xl bg-white px-4 py-5"
      >
        <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
          DATE DE NAISSANCE
        </Text>
        <Text className="text-center text-[19px] font-semibold text-accent">
          {formatBirthDateLong(birthDate)}
        </Text>
        <Text className="text-[13px] text-[#8a8a8a]">
          {formatSinceBirth(birthDate)}
        </Text>
      </View>

      {procedureTitle ? (
        <View className="gap-2">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            À FAIRE MAINTENANT
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onOpenProcedures}
            style={CARD_SHADOW}
            className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5"
          >
            <View
              style={{ backgroundColor: iconStyle.bg }}
              className="h-11 w-11 items-center justify-center rounded-full"
            >
              <Ionicons
                name={iconStyle.icon}
                size={20}
                color={iconStyle.color}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[15px] font-medium text-[#1a1a1a]">
                {procedureTitle}
              </Text>
              <Text
                className="text-[13px] font-medium"
                style={{ color: iconStyle.color }}
              >
                {formatDeadlineLabel(deadlineDaysAfterBirth, birthDate)}
              </Text>
            </View>
            <Text className="text-[20px] text-[#c4c4c4]">›</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
