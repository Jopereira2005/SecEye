import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Clock, Power } from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor
} from "react-native-reanimated";
import { styles } from "./routine-card.styles";
import { CustomColors } from "@/constants/theme";
import { Button } from "../Button/button";

import { IRoutine } from "@/interfaces/routine.interface";

export interface RoutineCardProps {
  routine: IRoutine;
  isActive: boolean;
  isExpanded?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onToggle: () => void;
}

const ALL_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function RoutineCard({
  routine,
  isActive,
  isExpanded = false,
  onPress,
  onLongPress,
  onToggle,
}: RoutineCardProps) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  const timeRange = routine.hora_inicio && routine.hora_fim 
    ? `${formatTime(routine.hora_inicio)} - ${formatTime(routine.hora_fim)}` 
    : '';
  
  let displayDays: string[] = [];
  if (routine.repeat_type === 'once') {
    displayDays = ['Uma vez'];
  } else if (routine.repeat_type === 'everyday') {
    displayDays = ['Diariamente'];
  } else if (routine.repeat_type === 'weekly' && routine.days_week) {
    displayDays = routine.days_week.map((d: number) => ALL_DAYS[d]);
  }

  const [expandedHeight, setExpandedHeight] = useState(0);
  
  // Reanimated Shared Values
  const activeAnim = useSharedValue(isActive ? 1 : 0);
  const expandedAnim = useSharedValue(isExpanded ? 1 : 0);
  const heightAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  // Loading state simulation test
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWithLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onToggle();
    }, 1000); // Simulando 1 segundo de requisição
  };

  useEffect(() => {
    activeAnim.value = withTiming(isActive ? 1 : 0, { duration: 300 });
  }, [isActive]);

  useEffect(() => {
    expandedAnim.value = withTiming(isExpanded ? 1 : 0, { duration: 150 });

    if (expandedHeight > 0) {
      heightAnim.value = withTiming(isExpanded ? expandedHeight : 0, { duration: 150 });
    }
  }, [isExpanded, expandedHeight]);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Reanimated Styles
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // Pre-calculate colors outside of the worklet to avoid JS thread dependency on mobile
  const badgeBgColor = CustomColors.applyOpacity(CustomColors.primary, 0.2);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeAnim.value,
      [0, 1],
      [badgeBgColor, badgeBgColor]
    ),
  }));

  const animatedBadgeTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeAnim.value,
      [0, 1],
      [CustomColors.grayScale, CustomColors.primary]
    ),
  }));

  const animatedInactivePowerStyle = useAnimatedStyle(() => ({
    opacity: 1 - activeAnim.value,
  }));

  const animatedActivePowerStyle = useAnimatedStyle(() => ({
    opacity: activeAnim.value,
  }));

  const animatedExpandableContainerStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    opacity: expandedAnim.value,
  }));

  const expandedContent = (
    <>
      {timeRange && (
        <View style={styles.timeContainer}>
          <Clock size={16} color={CustomColors.grayScale} />
          <Text style={styles.timeText}>{timeRange}</Text>
        </View>
      )}

      {displayDays && displayDays.length > 0 && (
        <View style={styles.daysContainer}>
          {displayDays.map((day, idx) => (
            <View key={idx} style={styles.dayPill}>
              <Text style={styles.dayPillText}>{day}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  return (
    <Pressable 
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <View style={styles.topRow}>
          <View style={styles.leftContent}>
            <Animated.View style={[styles.badgeContainer, animatedBadgeStyle]}>
              <Animated.Text style={[styles.badgeText, animatedBadgeTextStyle]}>
                {isActive ? "ATIVO AGORA" : "DESATIVO"}
              </Animated.Text>
            </Animated.View>

            <Text style={styles.title}>{routine.description}</Text>
          </View>

          <Button
            variant={isActive ? "gradient" : "secondary"}
            width={48}
            height={48}
            borderRadius={16}
            paddingHorizontal={0}
            paddingVertical={0}
            loading={isLoading}
            onPress={handleToggleWithLoading}
            style={{
              backgroundColor: isActive ? undefined : CustomColors.applyOpacity(CustomColors.primary, 0.4),
            }}
          >
            <Power size={30} strokeWidth={3} color={isActive ? CustomColors.light : CustomColors.quartenary} />
          </Button>
        </View>

        {/* Dummy view for measuring height */}
        <View style={{ position: 'absolute', opacity: 0, zIndex: -1, left: 0, right: 0, pointerEvents: 'none' }}>
          <View 
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && h !== expandedHeight) setExpandedHeight(h);
            }} 
            style={styles.expandedContent}
          >
            {expandedContent}
          </View>
        </View>

        {/* Actual Animated Container */}
        <Animated.View style={[{ overflow: 'hidden' }, animatedExpandableContainerStyle]}>
          <View style={styles.expandedContent}>
            {expandedContent}
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
