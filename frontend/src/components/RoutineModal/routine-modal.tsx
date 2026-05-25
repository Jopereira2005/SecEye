import React, { useState, useEffect } from "react";
import { 
  Modal,
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions
} from "react-native";
import { Trash2, Clock } from "lucide-react-native";
import { TimePickerModal } from "../ui/time-picker";
import { IRoutine } from "@/interfaces/routine.interface";
import { styles } from "./routine-modal.styles";
import { CustomColors } from "@/constants/theme";
import { Button } from "../Button/button";
import { Input } from "../Input/input";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

interface RoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (routine: Partial<IRoutine>) => void;
  onDelete?: (id: number) => void;
  routine?: IRoutine | null;
}

const ALL_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function RoutineModal({ visible, onClose, onSave, onDelete, routine }: RoutineModalProps) {
  const isEditing = !!routine;
  const { height: WINDOW_HEIGHT } = Dimensions.get('window');
  
  const panY = useSharedValue(WINDOW_HEIGHT);
  
  const [description, setDescription] = useState("");
  const [repeatType, setRepeatType] = useState<'once' | 'everyday' | 'weekly'>('once');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Local state to delay Modal unmount until exit animation finishes
  const [isModalMounted, setIsModalMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      if (routine) {
        setDescription(routine.description || "");
        setRepeatType(routine.repeat_type || 'once');
        setSelectedDays(routine.days_week || []);
        setStartTime(parseTimeString(routine.hora_inicio));
        setEndTime(parseTimeString(routine.hora_fim));
      } else {
        setDescription("");
        setRepeatType('once');
        setSelectedDays([]);
        setStartTime(new Date());
        
        const defaultEnd = new Date();
        defaultEnd.setHours(defaultEnd.getHours() + 1);
        setEndTime(defaultEnd);
      }
      
      setIsModalMounted(true);
      panY.value = WINDOW_HEIGHT;
      // Note: We don't animate here anymore! 
      // We animate inside the `onShow` prop of the Modal to ensure it runs only after the native window is ready.
    } else if (isModalMounted) {
      // Exit animation before unmounting
      panY.value = withTiming(WINDOW_HEIGHT, { duration: 200 }, (finished) => {
        if (finished) {
          scheduleOnRN(setIsModalMounted, false);
        }
      });
    }
  }, [visible, routine]);

  const parseTimeString = (timeStr?: string) => {
    const date = new Date();
    if (!timeStr) return date;
    const [hours, minutes] = timeStr.split(':');
    date.setHours(parseInt(hours, 10) || 0);
    date.setMinutes(parseInt(minutes, 10) || 0);
    return date;
  };

  const formatTimeString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const toggleDay = (dayIndex: number) => {
    let newDays = [...selectedDays];
    
    if (newDays.includes(dayIndex)) {
      newDays = newDays.filter(d => d !== dayIndex);
    } else {
      newDays.push(dayIndex);
    }

    if (newDays.length === 0) {
       setRepeatType('once');
    } else if (newDays.length === 7) {
       setRepeatType('everyday');
    } else {
       setRepeatType('weekly');
    }
    
    setSelectedDays(newDays);
  };

  const handleSetOnce = () => {
    setRepeatType('once');
    setSelectedDays([]);
  };

  const handleSetEveryday = () => {
    setRepeatType('everyday');
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSave = () => {
    onSave({
      id: routine?.id,
      description,
      days_week: selectedDays,
      repeat_type: repeatType,
      hora_inicio: formatTimeString(startTime),
      hora_fim: formatTimeString(endTime),
    });
  };

  const animateClose = () => {
    // Triggers the useEffect false branch by calling parent onClose
    onClose();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        panY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        // Use withTiming for smooth exit, then call onClose
        panY.value = withTiming(WINDOW_HEIGHT, { duration: 200 }, (finished) => {
          if (finished) {
            scheduleOnRN(onClose);
          }
        });
      } else {
        panY.value = withSpring(0, { damping: 20, stiffness: 250 });
      }
    });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      panY.value,
      [0, WINDOW_HEIGHT * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      pointerEvents: 'auto'
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panY.value }],
  }));

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
        // Only trigger the animation after the native OS window has actually appeared
        panY.value = withSpring(0, {
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
          
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardAvoidingView, { pointerEvents: 'box-none' as any }]}
        >
        <Animated.View style={[styles.modalContainer, animatedContainerStyle]}>
          <GestureDetector gesture={panGesture}>
            <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10, marginTop: -10 }}>
              <View style={styles.dragIndicator} />
            </View>
          </GestureDetector>

          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Editar Rotina" : "Nova Rotina"}
            </Text>
            
            {isEditing && (
              <Button 
                variant="ghost"
                paddingVertical={8}
                paddingHorizontal={8}
                onPress={() => onDelete?.(routine.id)}
              >
                <Trash2 color={CustomColors.danger} size={24} />
              </Button>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Input
                label="Nome da Rotina"
                placeholder="Ex: Modo Noturno"
                value={description}
                onChangeText={setDescription}
                borderRadius={12}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Dias da Semana</Text>
              <View style={styles.daysContainer}>
                <TouchableOpacity
                  style={[styles.dayPill, repeatType === 'once' && styles.dayPillSelected]}
                  onPress={handleSetOnce}
                >
                  <Text style={[styles.dayPillText, repeatType === 'once' && styles.dayPillTextSelected]}>
                    Uma vez
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dayPill, repeatType === 'everyday' && styles.dayPillSelected]}
                  onPress={handleSetEveryday}
                >
                  <Text style={[styles.dayPillText, repeatType === 'everyday' && styles.dayPillTextSelected]}>
                    Diariamente
                  </Text>
                </TouchableOpacity>
                {ALL_DAYS.map((day, index) => {
                  const isSelected = selectedDays.includes(index) && repeatType !== 'once';
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayPill, isSelected && styles.dayPillSelected]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[styles.dayPillText, isSelected && styles.dayPillTextSelected]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.timesRow}>
              <View style={styles.timePickerContainer}>
                <Text style={styles.label}>Hora de Início</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Clock size={18} color={CustomColors.grayScale} />
                  <Text style={styles.timeButtonText}>{formatTimeString(startTime)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timePickerContainer}>
                <Text style={styles.label}>Hora de Fim</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Clock size={18} color={CustomColors.grayScale} />
                  <Text style={styles.timeButtonText}>{formatTimeString(endTime)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <Button 
                variant="secondary" 
                containerStyle={styles.actionButton}
                onPress={animateClose}
              >
                <Text style={{ color: CustomColors.light, fontWeight: 'bold' }}>Cancelar</Text>
              </Button>
              <Button 
                variant="gradient" 
                containerStyle={styles.actionButton}
                onPress={handleSave}
              >
                <Text style={{ color: CustomColors.light, fontWeight: 'bold' }}>Salvar</Text>
              </Button>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <TimePickerModal
        title="Hora de Início"
        visible={showStartPicker}
        value={startTime}
        onClose={() => setShowStartPicker(false)}
        onConfirm={(date) => {
          setStartTime(date);
          setShowStartPicker(false);
        }}
      />

      <TimePickerModal
        title="Hora de Fim"
        visible={showEndPicker}
        value={endTime}
        onClose={() => setShowEndPicker(false)}
        onConfirm={(date) => {
          setEndTime(date);
          setShowEndPicker(false);
        }}
      />
      </GestureHandlerRootView>
    </Modal>
  );
}
