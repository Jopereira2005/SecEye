import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet, Dimensions } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Button } from '@/components/Button/button';
import { CustomColors } from '@/constants/theme';
import { DetectionZoneEditor } from './detection-zone-editor';
import { styles } from './detection-zone-modal.styles';
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

interface DetectionZoneModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (points: any[]) => void;
  initialPoints?: any[];
  imageSource?: any;
  videoUrl?: string;
}

export function DetectionZoneModal({ visible, onClose, onConfirm, initialPoints, imageSource, videoUrl }: DetectionZoneModalProps) {
  const [points, setPoints] = useState(initialPoints);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const insets = useSafeAreaInsets();
  
  const panY = useSharedValue(WINDOW_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (initialPoints) {
        setPoints(initialPoints);
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
  }, [visible, initialPoints]);

  const handleClose = () => {
    panY.value = withTiming(WINDOW_HEIGHT, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const handleConfirm = () => {
    onConfirm(points || []);
    handleClose();
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

  if (!isModalMounted && !visible) return null;

  return (
    <Modal
      visible={isModalMounted}
      animationType="none"
      transparent={true}
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
        <Animated.View style={[styles.modalOverlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[styles.modalContainer, { position: 'absolute', bottom: 0, left: 0, right: 0 }, animatedContainerStyle]}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.dragIndicatorContainer}>
              <View style={styles.dragIndicator} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Ajustar Zona (ROI)</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color={CustomColors.grayScale} size={28} />
            </TouchableOpacity>
          </View>

          <Text style={styles.instruction}>
            Use os 4 pontos para desenhar o polígono onde a Inteligência Artificial deve procurar por pessoas.
          </Text>

          {/* Editor em destaque */}
          <View style={styles.editorWrapper}>
            <DetectionZoneEditor 
              imageSource={imageSource}
              videoUrl={videoUrl}
              initialPoints={initialPoints}
              onChange={setPoints}
            />
          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Button variant="gradient" onPress={handleConfirm} style={styles.confirmButton}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Check color={CustomColors.light} size={20} style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Confirmar Zona</Text>
              </View>
            </Button>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}


