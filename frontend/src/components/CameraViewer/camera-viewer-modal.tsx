import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { X, Maximize, BellDot, History } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { CustomColors, Spacing } from '@/constants/theme';
import { styles } from './camera-viewer-modal.styles';
import { ICamera } from '@/interfaces/camera.interface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MjpegPlayer } from '../MjpegPlayer/mjpeg-player';

interface CameraViewerModalProps {
  visible: boolean;
  onClose: () => void;
  camera: Partial<ICamera> | null;
}

export function CameraViewerModal({ visible, onClose, camera }: CameraViewerModalProps) {
  const insets = useSafeAreaInsets();
  const pulseAnim = useSharedValue(1);

  const BACKEND_URL = process.env.EXPO_PUBLIC_CV_BACKEND_URL || 'http://127.0.0.1:5000';
  const streamUrl = camera?.id ? `${BACKEND_URL}/feed/${camera.id}` : undefined;

  useEffect(() => {
    if (visible) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedLiveDot = useAnimatedStyle(() => ({
    opacity: pulseAnim.value
  }));

  if (!visible || !camera) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        
        {/* Header Overlay */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.liveBadge}>
              <Animated.View style={[styles.liveDot, animatedLiveDot]} />
              <Text style={styles.liveText}>AO VIVO</Text>
            </View>
            <Text style={styles.title}>{camera.name}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={CustomColors.light} size={20} />
          </TouchableOpacity>
        </View>

        {/* Video Player com MJPEG nativo */}
        <View style={styles.videoContainer}>
          {streamUrl ? (
            <MjpegPlayer
              url={streamUrl}
              style={styles.videoPlayer}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: 'white' }}>Carregando feed de vídeo...</Text>
          )}
        </View>

        {/* Footer Controls */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <TouchableOpacity style={styles.footerAction}>
            <BellDot color={CustomColors.light} size={24} />
            <Text style={styles.footerActionText}>Siren / Alarme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.footerAction}>
            <History color={CustomColors.light} size={24} />
            <Text style={styles.footerActionText}>Ocorrências</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerAction}>
            <Maximize color={CustomColors.light} size={24} />
            <Text style={styles.footerActionText}>Tela Cheia</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}
