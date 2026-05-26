import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal
} from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Camera, ShieldAlert, Calendar, Check, AlertTriangle, CheckCircle } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from "./occurrence-filter-modal.styles";
import { CustomColors } from "@/constants/theme";
import { Button } from "../Button/button";
import { ICamera } from "@/interfaces/camera.interface";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface IFilterState {
  cameras: string[];
  severities: ('low' | 'medium' | 'high')[];
  dateRange: 'all' | 'today' | 'yesterday' | 'week';
}

export const INITIAL_FILTER_STATE: IFilterState = {
  cameras: [],
  severities: [],
  dateRange: 'all',
};

interface OccurrenceFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: IFilterState) => void;
  initialFilters: IFilterState;
  cameras: ICamera[];
}

export function OccurrenceFilterModal({ 
  visible, 
  onClose, 
  onApply, 
  initialFilters,
  cameras
}: OccurrenceFilterModalProps) {
  const [isModalMounted, setIsModalMounted] = useState(false);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const [localFilters, setLocalFilters] = useState<IFilterState>(initialFilters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(initialFilters);
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
  }, [visible, initialFilters]);

  const animateClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const handleApply = () => {
    onApply(localFilters);
    animateClose();
  };

  const handleClear = () => {
    setLocalFilters(INITIAL_FILTER_STATE);
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

  const toggleCamera = (cameraId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      cameras: prev.cameras.includes(cameraId) 
        ? prev.cameras.filter(id => id !== cameraId)
        : [...prev.cameras, cameraId]
    }));
  };

  const toggleSeverity = (severity: 'low' | 'medium' | 'high') => {
    setLocalFilters(prev => ({
      ...prev,
      severities: prev.severities.includes(severity)
        ? prev.severities.filter(s => s !== severity)
        : [...prev.severities, severity]
    }));
  };

  const setDateRange = (range: 'all' | 'today' | 'yesterday' | 'week') => {
    setLocalFilters(prev => ({ ...prev, dateRange: range }));
  };

  if (!isModalMounted) return null;

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

          <View style={styles.header}>
            <Text style={styles.title}>Filtros Avançados</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Câmeras */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Câmeras</Text>
              <View style={styles.pillsContainer}>
                {cameras.map(cam => {
                  const isActive = localFilters.cameras.includes(cam.id);
                  return (
                    <TouchableOpacity 
                      key={cam.id} 
                      style={[styles.pill, isActive && styles.pillActive]}
                      onPress={() => toggleCamera(cam.id)}
                    >
                      <Camera size={14} color={isActive ? CustomColors.primary : CustomColors.grayScale} />
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{cam.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Severidade */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nível de Severidade</Text>
              <View style={styles.pillsContainer}>
                <TouchableOpacity 
                  style={[styles.pill, localFilters.severities.includes('high') && [styles.pillActive, { borderColor: CustomColors.danger, backgroundColor: CustomColors.applyOpacity(CustomColors.danger, 0.1) }]]}
                  onPress={() => toggleSeverity('high')}
                >
                  <ShieldAlert size={14} color={localFilters.severities.includes('high') ? CustomColors.danger : CustomColors.grayScale} />
                  <Text style={[styles.pillText, localFilters.severities.includes('high') && { color: CustomColors.danger, fontWeight: 'bold' }]}>Alta</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.severities.includes('medium') && [styles.pillActive, { borderColor: CustomColors.tertiary, backgroundColor: CustomColors.applyOpacity(CustomColors.tertiary, 0.1) }]]}
                  onPress={() => toggleSeverity('medium')}
                >
                  <AlertTriangle size={14} color={localFilters.severities.includes('medium') ? CustomColors.tertiary : CustomColors.grayScale} />
                  <Text style={[styles.pillText, localFilters.severities.includes('medium') && { color: CustomColors.tertiary, fontWeight: 'bold' }]}>Média</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.severities.includes('low') && [styles.pillActive, { borderColor: CustomColors.success, backgroundColor: CustomColors.applyOpacity(CustomColors.success, 0.1) }]]}
                  onPress={() => toggleSeverity('low')}
                >
                  <CheckCircle size={14} color={localFilters.severities.includes('low') ? CustomColors.success : CustomColors.grayScale} />
                  <Text style={[styles.pillText, localFilters.severities.includes('low') && { color: CustomColors.success, fontWeight: 'bold' }]}>Baixa</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Data */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Período</Text>
              <View style={styles.pillsContainer}>
                <TouchableOpacity 
                  style={[styles.pill, localFilters.dateRange === 'all' && styles.pillActive]}
                  onPress={() => setDateRange('all')}
                >
                  <Calendar size={14} color={localFilters.dateRange === 'all' ? CustomColors.primary : CustomColors.grayScale} />
                  <Text style={[styles.pillText, localFilters.dateRange === 'all' && styles.pillTextActive]}>Qualquer data</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.dateRange === 'today' && styles.pillActive]}
                  onPress={() => setDateRange('today')}
                >
                  <Text style={[styles.pillText, localFilters.dateRange === 'today' && styles.pillTextActive]}>Hoje</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.dateRange === 'yesterday' && styles.pillActive]}
                  onPress={() => setDateRange('yesterday')}
                >
                  <Text style={[styles.pillText, localFilters.dateRange === 'yesterday' && styles.pillTextActive]}>Ontem</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.dateRange === 'week' && styles.pillActive]}
                  onPress={() => setDateRange('week')}
                >
                  <Text style={[styles.pillText, localFilters.dateRange === 'week' && styles.pillTextActive]}>Últimos 7 dias</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom}]}>
            <Button variant="gradient" onPress={handleApply}>
              <Text style={{ color: CustomColors.light, fontWeight: 'bold', fontSize: 16 }}>Aplicar Filtros</Text>
            </Button>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
