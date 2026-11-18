import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PillButton } from '@/components/ui/pill-button';
import { parseJoinCode } from '@/features/household/api';

const FRAME_SIZE = 240;

/**
 * Scanner du QR code d'invitation (demande explicite) : caméra plein écran,
 * cadre de visée, et le code d'espace remonté dès qu'un QR lisible passe
 * dans le champ. Demande l'accès à l'appareil photo à la première ouverture ;
 * refusé, un message renvoie vers la saisie du code à la main.
 */
export function QrScannerModal({
  visible,
  onScanned,
  onClose,
}: {
  visible: boolean;
  onScanned: (code: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  // Un QR reste dans le champ plusieurs images de suite : on ne remonte que
  // le premier code lu.
  const hasScannedRef = useRef(false);

  const handleScan = ({ data }: { data: string }) => {
    if (hasScannedRef.current) return;
    const code = parseJoinCode(data);
    if (!code) return;
    hasScannedRef.current = true;
    onScanned(code);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={() => {
        hasScannedRef.current = false;
      }}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScan}
          />
        ) : null}

        <SafeAreaView
          pointerEvents="box-none"
          className="absolute inset-0 items-center justify-between px-6 py-4"
        >
          <View className="w-full flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-white">
              {t('onboarding.qr.title')}
            </Text>
            <Pressable
              accessibilityLabel={t('onboarding.qr.close')}
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </Pressable>
          </View>

          {permission?.granted ? (
            <View pointerEvents="none" className="items-center gap-5">
              <View
                style={{
                  width: FRAME_SIZE,
                  height: FRAME_SIZE,
                  borderRadius: 28,
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.9)',
                }}
              />
              <Text className="text-center text-[14.5px] leading-5 text-white">
                {t('onboarding.qr.aim')}
              </Text>
            </View>
          ) : (
            <View className="w-full items-center gap-4 rounded-[28px] bg-white px-6 py-7">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#f1eff5]">
                <Ionicons name="camera-outline" size={28} color="#1c1a2e" />
              </View>
              <Text className="text-center text-[17px] font-extrabold text-[#1c1a2e]">
                {t('onboarding.qr.cameraAccess')}
              </Text>
              <Text className="text-center text-[14px] leading-5 text-[#6b6b78]">
                {permission && !permission.canAskAgain
                  ? t('onboarding.qr.denied')
                  : t('onboarding.qr.why')}
              </Text>
              {permission && !permission.canAskAgain ? null : (
                <View className="w-full">
                  <PillButton
                    label={t('onboarding.qr.allow')}
                    icon="camera-outline"
                    size="compact"
                    onPress={requestPermission}
                  />
                </View>
              )}
            </View>
          )}

          <View />
        </SafeAreaView>
      </View>
    </Modal>
  );
}
