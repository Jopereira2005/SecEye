import React, { useState, useEffect } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Keyboard, StyleSheet, Dimensions, Pressable, Image } from 'react-native';
import { Camera, X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react-native';
import { Button } from '@/components/Button/button';
import { Input } from '@/components/Input/input';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { styles } from './device-modal.styles';
import { ICamera } from '@/interfaces/camera.interface';
import { DetectionZoneModal } from '../DetectionZoneEditor/detection-zone-modal';
import { DetectionZoneEditor } from '../DetectionZoneEditor/detection-zone-editor';
import { MjpegPlayer } from '../MjpegPlayer/mjpeg-player';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface DeviceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (device: Partial<ICamera>) => Promise<void> | void;
  onDelete?: (id: string) => void;
  device?: ICamera | null;
}

export function DeviceModal({ visible, onClose, onSave, onDelete, device }: DeviceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');

  // Connection & Zones State
  const [currentZonePoints, setCurrentZonePoints] = useState<any[]>([]);
  const [isZoneModalVisible, setIsZoneModalVisible] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const BACKEND_URL = process.env.EXPO_PUBLIC_CV_BACKEND_URL || 'http://127.0.0.1:5000';
  const videoUrl = device?.id ? `${BACKEND_URL}/feed/${device.id}` : undefined;
  
  const insets = useSafeAreaInsets();
  const panY = useSharedValue(WINDOW_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (device) {
        setName(device.name || '');
        setDescription(device.description || '');
        setRtspUrl(device.rtsp_url || '');
        setSeverity(device.severity || 'low');
        setCurrentZonePoints(device.roi_points || []);
      } else {
        setName('');
        setDescription('');
        setRtspUrl('');
        setSeverity('low');
        setCurrentZonePoints([]);
      }
      setIsModalMounted(true);
      panY.value = WINDOW_HEIGHT;
      opacity.value = 0;
    } else if (isModalMounted) {
      panY.value = withTiming(WINDOW_HEIGHT, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setIsModalMounted)(false);
        }
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, device]);

  const handleClose = () => {
    Keyboard.dismiss();
    panY.value = withTiming(WINDOW_HEIGHT, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        panY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > WINDOW_HEIGHT * 0.2 || event.velocityY > 1000) {
        runOnJS(handleClose)();
      } else {
        panY.value = withSpring(0, {
          damping: 20,
          stiffness: 250,
          mass: 0.5,
        });
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSave = async () => {
    if (!name.trim() || !rtspUrl.trim()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Nome e Link RTSP são obrigatórios.' });
      return;
    }
    
    Keyboard.dismiss();
    setIsSaving(true);
    
    try {
      await onSave({
        id: device?.id,
        name: name.trim(),
        description: description.trim(),
        rtsp_url: rtspUrl.trim(),
        severity,
        is_active: device ? device.is_active : true,
        status: device ? device.status : 'offline',
        roi_points: currentZonePoints,
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Erro ao salvar a câmera.' });
    } finally {
      setIsSaving(false);
    }
  };

  const isEditing = !!device;

  if (!isModalMounted && !visible) return null;

  return (
    <Modal
      visible={isModalMounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      navigationBarTranslucent
      onShow={() => {
        opacity.value = withTiming(1, { duration: 200 });
        panY.value = withSpring(0, {
          damping: 20,
          stiffness: 250,
          mass: 0.5,
        });
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <KeyboardAvoidingView 
          style={[styles.keyboardAvoidingView, { pointerEvents: 'box-none' as any }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View style={[styles.modalContainer, animatedContainerStyle]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.dragIndicatorContainer}>
                <View style={styles.dragIndicator} />
              </View>
            </GestureDetector>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Camera color={CustomColors.primary} size={24} style={styles.titleIcon} />
                <Text style={styles.title}>{isEditing ? 'Editar Câmera' : 'Nova Câmera'}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color={CustomColors.grayScale} size={24} />
              </TouchableOpacity>
            </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Input
              label="Nome da Câmera"
              placeholder="Ex: Câmera da Garagem"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Descrição (Opcional)"
              placeholder="Ex: Fica apontada para o portão"
              value={description}
              onChangeText={setDescription}
            />

            <View style={{ marginBottom: 16 }}>
              <Input
                label="Link RTSP / IP"
                placeholder="rtsp://usuario:senha@192.168.1.100:554/stream"
                value={rtspUrl}
                onChangeText={setRtspUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {device?.id ? (
              <View style={{ marginTop: 16, marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={styles.sectionLabel}>Zona de Detecção (IA)</Text>
                  {currentZonePoints && currentZonePoints.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CheckCircle color={CustomColors.success} size={14} style={{ marginRight: 4 }} />
                      <Text style={{ color: CustomColors.success, fontFamily: CustomFonts.inter, fontSize: 12 }}>Configurada</Text>
                    </View>
                  )}
                </View>
                
                {/* Visualização da Zona Salva */}
                <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.md }}>
                  <DetectionZoneEditor 
                    imageSource={require('../../../assets/images/mock-camera.png')}
                    videoUrl={videoUrl}
                    initialPoints={currentZonePoints}
                    readOnly={true}
                  />
                </View>

                <Button 
                  variant="secondary" 
                  onPress={() => setIsZoneModalVisible(true)}
                >
                  <Text style={[styles.saveButtonText, { color: CustomColors.primary, fontSize: 14 }]}>
                    Ajustar Zona da Câmera
                  </Text>
                </Button>
              </View>
            ) : (
              <View style={{ marginTop: 16, marginBottom: 24, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <Text style={{ color: CustomColors.grayScale, fontSize: 13, textAlign: 'center' }}>
                  Salve a câmera primeiro para configurar a Zona de Detecção.
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>Nível de Severidade</Text>
            <View style={styles.severityContainer}>
              {(['low', 'medium', 'high'] as const).map((level) => {
                const isSelected = severity === level;
                let color = CustomColors.grayScale;
                let label = '';
                let Icon = AlertTriangle;
                
                if (level === 'low') { color = CustomColors.success; label = 'BAIXA'; Icon = CheckCircle; }
                else if (level === 'medium') { color = CustomColors.tertiary; label = 'MÉDIA'; Icon = AlertTriangle; }
                else if (level === 'high') { color = CustomColors.danger; label = 'ALTA'; Icon = ShieldAlert; }

                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.severityOption,
                      isSelected && { 
                        backgroundColor: CustomColors.applyOpacity(color, 0.2),
                        borderColor: color
                      }
                    ]}
                    onPress={() => setSeverity(level)}
                  >
                    <Icon size={16} color={isSelected ? color : CustomColors.grayScale} style={{ marginRight: 6 }} />
                    <Text style={[styles.severityText, isSelected && { color: color }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            {isEditing && onDelete ? (
              <Button 
                variant="danger" 
                style={styles.deleteButton}
                onPress={() => onDelete(device.id)}
              >
                <AlertTriangle color="#FFF" size={20} />
              </Button>
            ) : null}
            
            <Button 
              variant="gradient" 
              style={styles.saveButton}
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar Câmera'}</Text>
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>

      {/* Modal Dedicado de Zona de Detecção */}
      <DetectionZoneModal
        visible={isZoneModalVisible}
        onClose={() => setIsZoneModalVisible(false)}
        imageSource={require('../../../assets/images/mock-camera.png')}
        videoUrl={videoUrl}
        initialPoints={currentZonePoints}
        onConfirm={(points) => {
          setCurrentZonePoints(points);
          Toast.show({ type: 'success', text1: 'Zona Salva', text2: 'Área de interesse configurada com sucesso!' });
        }}
      />
    </Modal>
  );
}
