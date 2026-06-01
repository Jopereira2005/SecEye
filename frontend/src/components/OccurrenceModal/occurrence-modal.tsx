import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  Modal,
  Platform
} from "react-native";
import { Image } from "expo-image";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import { Video, Clock, ShieldAlert, CheckCircle, AlertTriangle, Share2, Eye } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { styles } from "./occurrence-modal.styles";
import { CustomColors, Spacing } from "@/constants/theme";
import { Button } from "../Button/button";
import { IOcurrence } from "@/interfaces/ocurrence.interface";
import { ICamera } from "@/interfaces/camera.interface";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OccurrenceModalProps {
  visible: boolean;
  onClose: () => void;
  occurrence?: IOcurrence | null;
}

const formatDateTime = (isoString: string) => {
  try {
    let safeStr = isoString.replace('+00:00', '').replace('Z', '');
    if (safeStr.includes('.')) safeStr = safeStr.split('.')[0];
    
    const [datePart, timePart] = safeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, min, sec] = timePart.split(':').map(Number);
    
    const d = new Date(year, month - 1, day, hour, min, sec || 0);
    if (isNaN(d.getTime())) return "--/--/---- 00:00";
    
    const dDay = d.getDate().toString().padStart(2, '0');
    const dMonth = (d.getMonth() + 1).toString().padStart(2, '0');
    const dYear = d.getFullYear();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${dDay}/${dMonth}/${dYear} às ${h}:${m}`;
  } catch (e) {
    return "--/--/---- 00:00";
  }
};

export function OccurrenceModal({ visible, onClose, occurrence }: OccurrenceModalProps) {
  const [isModalMounted, setIsModalMounted] = useState(false);
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsModalMounted(true);
      translateY.value = SCREEN_HEIGHT;
      opacity.value = 0;
    } else if (isModalMounted) {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setIsModalMounted)(false);
        }
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animateClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SCREEN_HEIGHT * 0.2 || event.velocityY > 1000) {
        runOnJS(animateClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 250,
          mass: 0.5,
        });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleShare = async () => {
    if (!occurrence) return;
    try {
      const message = `Ocorrência SecEye: Detectada uma atividade na câmera ${camera?.name || 'Desconhecida'} em ${formatDateTime(occurrence.timestamp)}. ID da Ocorrência: #${occurrence.id}`;

      if (occurrence.event_image) {
        try {
          const fileUri = `${FileSystem.cacheDirectory}ocorrencia_${occurrence.id}.jpg`;
          const downloadedFile = await FileSystem.downloadAsync(occurrence.event_image, fileUri);
          
          if (Platform.OS === 'ios') {
            // No iOS, o Share nativo suporta imagem e texto na mesma ação perfeitamente!
            await Share.share({
              message,
              url: downloadedFile.uri,
            });
            return;
          } else {
            // No Android, o módulo padrão do Expo tem limitações técnicas nativas (as Intents de imagem falham se mandarmos texto junto).
            // A solução padrão de mercado p/ Expo Go no Android é copiar o texto e compartilhar o arquivo.
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await Clipboard.setStringAsync(message);
              Alert.alert(
                "Texto Copiado!", 
                "As informações da ocorrência foram copiadas.\nCole-as na legenda do WhatsApp ao enviar a imagem.",
                [{ text: "Entendi e Compartilhar", style: "default" }]
              );

              await Sharing.shareAsync(downloadedFile.uri, {
                dialogTitle: 'Compartilhar Ocorrência',
                mimeType: 'image/jpeg',
              });
              return;
            }
          }
        } catch (downloadError) {
          console.log('Erro ao baixar imagem para compartilhar:', downloadError);
          // Se falhar o download, cai no fallback de texto abaixo
        }
      }

      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar.");
    }
  };

  if (!isModalMounted) return null;
  if (!occurrence) return null;

  const camera: ICamera | undefined = occurrence.camera;
  const severity = camera?.severity || 'medium';
  
  const severityConfig = {
    high: { color: CustomColors.danger, icon: ShieldAlert, label: 'ALTA' },
    medium: { color: CustomColors.tertiary, icon: AlertTriangle, label: 'MÉDIA' },
    low: { color: CustomColors.success, icon: CheckCircle, label: 'BAIXA' },
  };

  const currentSeverity = severityConfig[severity] || severityConfig.medium;
  const SeverityIcon = currentSeverity.icon;

  const hasImage = !!occurrence.event_image;

  return (
    <Modal
      visible={isModalMounted}
      transparent
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      onShow={() => {
        opacity.value = withTiming(1, { duration: 200 });
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 250,
          mass: 0.5,
        });
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={animateClose} />
        </Animated.View>

        <Animated.View style={[styles.modalContainer, { position: 'absolute', bottom: 0, left: 0, right: 0 }, animatedSheetStyle]}>
          
          <GestureDetector gesture={panGesture}>
            <View style={styles.dragIndicatorContainer}>
              <View style={styles.dragIndicator} />
            </View>
          </GestureDetector>

          {/* Imagem em Destaque (Moldura) */}
          <View style={[styles.contentContainer, { paddingTop: Spacing.lg }]}>
            <View style={[
              styles.imageContainer,
              {
                borderWidth: 2,
                borderColor: currentSeverity.color,
                backgroundColor: currentSeverity.color,
                height: 'auto',
                aspectRatio: undefined,
              }
            ]}>
              <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: CustomColors.grayScaleDark, justifyContent: 'center', alignItems: 'center' }}>
                {hasImage ? (
                  <Image 
                    source={{ uri: occurrence.event_image! }}
                    style={styles.image}
                    contentFit="cover"
                  />
                ) : (
                  <Video color={CustomColors.grayScale} size={48} opacity={0.5} />
                )}
              </View>

              {/* Banner da Severidade na base da moldura */}
              <View style={[styles.severityBanner, { backgroundColor: currentSeverity.color }]}>
                <SeverityIcon size={14} color={CustomColors.light} />
                <Text style={styles.severityText}>
                  {currentSeverity.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.contentContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
            
            <View style={styles.headerRow}>
              <Video size={24} color={CustomColors.grayScale} />
              <Text style={styles.title} numberOfLines={2}>
                {camera?.name || 'Câmera Desconhecida'}
              </Text>
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Clock size={25} color={CustomColors.grayScale} />
                <View>
                  <Text style={styles.infoLabel}>Horário do Evento</Text>
                  <Text style={styles.infoText}>
                    {formatDateTime(occurrence.timestamp)}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', marginTop: Spacing.sm, paddingTop: Spacing.md }]}>
                <ShieldAlert size={25} color={CustomColors.grayScale} />
                <View>
                  <Text style={styles.infoLabel}>ID da Ocorrência</Text>
                  <Text style={styles.infoText}>
                    #{occurrence.id.slice(0, 8)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Button 
                variant="secondary" 
                containerStyle={styles.actionButton}
                onPress={animateClose}
              >
                <Text style={styles.actionText}>Fechar</Text>
              </Button>

              <Button 
                variant="gradient" 
                containerStyle={styles.actionButton}
                onPress={handleShare}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Share2 size={16} color={CustomColors.light} />
                  <Text style={styles.actionText}>Compartilhar</Text>
                </View>
              </Button>

            </View>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
