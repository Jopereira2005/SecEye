import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, FlatList, Pressable, Dimensions, Platform } from 'react-native';
import { CustomColors, CustomFonts, Spacing, Shadows } from '@/constants/theme';
import { Button } from '../Button/button';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  interpolate, 
  Extrapolation
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;

interface WheelPickerProps {
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
}

function WheelPicker({ items, selectedValue, onValueChange, label }: WheelPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  
  const N = items.length;
  const cyclicItems = [...items, ...items, ...items, ...items, ...items];
  
  const baseIndex = Math.max(0, items.findIndex(i => i === selectedValue));
  const centerIndex = 2 * N + baseIndex;
  const initialOffsetIndex = centerIndex - 2;

  const [scrollY, setScrollY] = useState(initialOffsetIndex * ITEM_HEIGHT);
  const [isScrolling, setIsScrolling] = useState(false);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!isScrolling) {
      const idx = Math.max(0, items.findIndex(i => i === selectedValue));
      const targetCenter = 2 * N + idx;
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: (targetCenter - 2) * ITEM_HEIGHT,
          animated: true,
        });
      }
    }
  }, [selectedValue]);

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScrollEnd = useCallback((y: number) => {
    setIsScrolling(false);
    const topIndex = Math.round(y / ITEM_HEIGHT);
    const currentCenterIdx = topIndex + 2;
    
    const valueIndex = currentCenterIdx % N;
    if (items[valueIndex] && items[valueIndex] !== selectedValue) {
      onValueChange(items[valueIndex]);
    }

    if (currentCenterIdx < 2 * N || currentCenterIdx >= 3 * N) {
      const resetCenterIdx = 2 * N + valueIndex;
      const resetY = (resetCenterIdx - 2) * ITEM_HEIGHT;
      
      flatListRef.current?.scrollToOffset({
        offset: resetY,
        animated: false,
      });
      setScrollY(resetY);
    }
  }, [N, items, selectedValue, onValueChange]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrollY(y);

    if (Platform.OS === 'web') {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        handleScrollEnd(y);
      }, 150);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScrollEnd(event.nativeEvent.contentOffset.y);
  };

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const renderItem = ({ item, index }: { item: string, index: number }) => {
    const targetY = (index - 2) * ITEM_HEIGHT;
    const distance = Math.abs(scrollY - targetY);
    
    let scale = 0.57;
    let opacity = 0.3;
    
    if (distance <= ITEM_HEIGHT * 1.5) {
      const factor = Math.max(0, 1 - (distance / (ITEM_HEIGHT * 1.5)));
      const smoothFactor = factor * factor * (3 - 2 * factor);
      
      scale = 0.57 + (0.43 * smoothFactor);
      opacity = 0.3 + (0.7 * smoothFactor);
    }

    return (
      <Pressable 
        style={[styles.itemContainer, { height: ITEM_HEIGHT }]}
        onPress={() => onValueChange(item)}
      >
        <Text style={[styles.itemText, { 
          fontSize: 42, 
          color: CustomColors.light,
          opacity,
          transform: [{ scale }]
        }]}>
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wheelContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <FlatList
        ref={flatListRef}
        data={cyclicItems}
        keyExtractor={(_, index) => `item-${index}`}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialOffsetIndex}
        getItemLayout={(_, index) => (
          {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
        )}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        renderItem={renderItem}
        windowSize={5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
      />
    </View>
  );
}

interface CustomTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const selectedHour = value.getHours().toString().padStart(2, '0');
  const selectedMinute = value.getMinutes().toString().padStart(2, '0');

  const handleHourChange = (h: string) => {
    const newDate = new Date(value);
    newDate.setHours(parseInt(h, 10));
    onChange(newDate);
  };

  const handleMinuteChange = (m: string) => {
    const newDate = new Date(value);
    newDate.setMinutes(parseInt(m, 10));
    onChange(newDate);
  };

  return (
    <View style={styles.container}>
      <WheelPicker 
        items={hours} 
        selectedValue={selectedHour} 
        onValueChange={handleHourChange} 
        label="H"
      />
      <WheelPicker 
        items={minutes} 
        selectedValue={selectedMinute} 
        onValueChange={handleMinuteChange} 
        label="M"
      />
    </View>
  );
}

interface TimePickerModalProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  title?: string;
}

export function TimePickerModal({ visible, value, onClose, onConfirm, title = "Selecionar Horário" }: TimePickerModalProps) {
  const [tempValue, setTempValue] = useState(value);
  const panY = useSharedValue(WINDOW_HEIGHT);

  const handleClose = useCallback(() => {
    panY.value = withTiming(WINDOW_HEIGHT, { duration: 250 }, (finished) => {
      if (finished) {
        scheduleOnRN(onClose);
      }
    });
  }, [panY, onClose]);

  const callOnConfirm = useCallback((timestamp: number) => {
    onConfirm(new Date(timestamp));
  }, [onConfirm]);

  const handleConfirm = useCallback(() => {
    // We cannot pass a Date object into the Reanimated worklet because it cannot be cloned to the UI thread.
    // Instead, we extract the primitive timestamp number, which is shareable, and reconstruct the Date on the JS thread.
    const timestamp = tempValue.getTime();
    panY.value = withTiming(WINDOW_HEIGHT, { duration: 250 }, (finished) => {
      if (finished) {
        scheduleOnRN(callOnConfirm, timestamp);
      }
    });
  }, [panY, tempValue, callOnConfirm]);

  useEffect(() => {
    if (visible) {
      setTempValue(value);
      panY.value = WINDOW_HEIGHT; // instant reset before animating
      panY.value = withSpring(0, {
        damping: 20,
        stiffness: 250,
        mass: 0.5,
      });
    } else {
      panY.value = withTiming(WINDOW_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        panY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
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
      pointerEvents: visible ? 'auto' : 'none',
    };
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panY.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999, pointerEvents: visible ? 'box-none' : 'none' as any }]}>
      <Animated.View style={[styles.modalOverlay, animatedOverlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      
      <Animated.View style={[styles.modalSheet, { position: 'absolute', bottom: 0, left: 0, right: 0 }, animatedSheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10, marginTop: -10 }}>
             <View style={styles.dragIndicator} />
          </View>
        </GestureDetector>

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
        </View>
        
        <CustomTimePicker value={tempValue} onChange={setTempValue} />
        
        <View style={styles.modalActions}>
          <Button variant="secondary" containerStyle={{ flex: 1 }} onPress={handleClose}>
            <Text style={{ color: CustomColors.light, fontWeight: 'bold' }}>Cancelar</Text>
          </Button>
          <Button variant="gradient" containerStyle={{ flex: 1 }} onPress={handleConfirm}>
            <Text style={{ color: CustomColors.light, fontWeight: 'bold' }}>Confirmar</Text>
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CustomColors.dark,
    paddingVertical: Spacing.xl,
    gap: Spacing.xl * 2,
    borderRadius: 24,
    marginVertical: Spacing.md,
  },
  wheelContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    fontFamily: CustomFonts.inter,
    color: CustomColors.light,
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    top: -30,
    zIndex: 10,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: CustomFonts.inter,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalSheet: {
    backgroundColor: CustomColors.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadows.card,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: CustomFonts.inter,
    fontSize: 18,
    color: CustomColors.light,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: CustomColors.grayScale,
    borderRadius: 2,
    marginBottom: Spacing.md,
  }
});
