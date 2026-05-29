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
import { Power, Calendar, RefreshCcw, Search } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from "./routine-filter-modal.styles";
import { CustomColors } from "@/constants/theme";
import { Button } from "../Button/button";
import { Input } from "../Input/input";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface IRoutineFilterState {
  searchQuery: string;
  status: 'all' | 'active' | 'inactive';
  repeatType: 'all' | 'once' | 'everyday' | 'weekly';
  days: number[];
}

export const INITIAL_ROUTINE_FILTER_STATE: IRoutineFilterState = {
  searchQuery: '',
  status: 'all',
  repeatType: 'all',
  days: [],
};

const ALL_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface RoutineFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: IRoutineFilterState) => void;
  initialFilters: IRoutineFilterState;
}

export function RoutineFilterModal({ 
  visible, 
  onClose, 
  onApply, 
  initialFilters 
}: RoutineFilterModalProps) {
  const [isModalMounted, setIsModalMounted] = useState(false);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const [localFilters, setLocalFilters] = useState<IRoutineFilterState>(initialFilters);

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
    setLocalFilters(INITIAL_ROUTINE_FILTER_STATE);
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

  const toggleDay = (dayIndex: number) => {
    setLocalFilters(prev => ({
      ...prev,
      days: prev.days.includes(dayIndex) 
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex]
    }));
  };

  const setStatus = (status: 'all' | 'active' | 'inactive') => {
    setLocalFilters(prev => ({ ...prev, status }));
  };

  const setRepeatType = (type: 'all' | 'once' | 'everyday' | 'weekly') => {
    setLocalFilters(prev => ({ ...prev, repeatType: type }));
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
            {/* Pesquisa por Nome */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nome da Rotina</Text>
              <Input
                placeholder="Ex: Modo Noturno"
                value={localFilters.searchQuery}
                onChangeText={(text) => setLocalFilters(prev => ({ ...prev, searchQuery: text }))}
                borderRadius={12}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
                <TouchableOpacity 
                  style={[styles.pill, localFilters.status === 'all' && styles.pillActive]}
                  onPress={() => setStatus('all')}
                >
                  <Power size={14} color={localFilters.status === 'all' ? CustomColors.primary : CustomColors.grayScale} />
                  <Text style={[styles.pillText, localFilters.status === 'all' && styles.pillTextActive]}>Todas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.status === 'active' && [styles.pillActive, { borderColor: CustomColors.success, backgroundColor: CustomColors.applyOpacity(CustomColors.success, 0.1) }]]}
                  onPress={() => setStatus('active')}
                >
                  <Text style={[styles.pillText, localFilters.status === 'active' && { color: CustomColors.success, fontWeight: 'bold' }]}>Ativas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.status === 'inactive' && styles.pillActive]}
                  onPress={() => setStatus('inactive')}
                >
                  <Text style={[styles.pillText, localFilters.status === 'inactive' && styles.pillTextActive]}>Inativas</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Tipo de Repetição */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Repetição</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
                <TouchableOpacity 
                  style={[styles.pill, localFilters.repeatType === 'all' && styles.pillActive]}
                  onPress={() => setRepeatType('all')}
                >
                  <RefreshCcw size={14} color={localFilters.repeatType === 'all' ? CustomColors.primary : CustomColors.grayScale} />
                  <Text style={[styles.pillText, localFilters.repeatType === 'all' && styles.pillTextActive]}>Todos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.repeatType === 'everyday' && styles.pillActive]}
                  onPress={() => setRepeatType('everyday')}
                >
                  <Text style={[styles.pillText, localFilters.repeatType === 'everyday' && styles.pillTextActive]}>Diariamente</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.pill, localFilters.repeatType === 'weekly' && styles.pillActive]}
                  onPress={() => setRepeatType('weekly')}
                >
                  <Text style={[styles.pillText, localFilters.repeatType === 'weekly' && styles.pillTextActive]}>Semanal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.pill, localFilters.repeatType === 'once' && styles.pillActive]}
                  onPress={() => setRepeatType('once')}
                >
                  <Text style={[styles.pillText, localFilters.repeatType === 'once' && styles.pillTextActive]}>Uma vez</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Dias da Semana */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dias da Semana</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
                {ALL_DAYS.map((day, index) => {
                  const isActive = localFilters.days.includes(index);
                  return (
                    <TouchableOpacity 
                      key={day} 
                      style={[styles.pill, isActive && styles.pillActive]}
                      onPress={() => toggleDay(index)}
                    >
                      <Calendar size={14} color={isActive ? CustomColors.primary : CustomColors.grayScale} />
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
