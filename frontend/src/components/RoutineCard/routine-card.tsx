import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { Clock, Power } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./routine-card.styles";
import { CustomColors } from "@/constants/theme";

import { IRoutine } from "@/interfaces/routine.interface";

export interface RoutineCardProps {
  routine: IRoutine;
  isActive: boolean;
  isExpanded?: boolean;
  onPress?: () => void;
  onToggle: () => void;
}

export function RoutineCard({
  routine,
  isActive,
  isExpanded = false,
  onPress,
  onToggle,
}: RoutineCardProps) {
  const timeRange = routine.hora_inicio && routine.hora_fim ? `${routine.hora_inicio} - ${routine.hora_fim}` : '';
  const activeDays = routine.days_week;

  const [expandedHeight, setExpandedHeight] = useState(0);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const expandedAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  useEffect(() => {
    Animated.timing(expandedAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (expandedHeight > 0) {
      Animated.timing(heightAnim, {
        toValue: isExpanded ? expandedHeight : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isExpanded, expandedHeight]);

  const badgeBackgroundColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CustomColors.applyOpacity(CustomColors.grayScale, 0.15), CustomColors.applyOpacity(CustomColors.primary, 0.15)]
  });

  const badgeTextColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CustomColors.grayScale, CustomColors.primary]
  });

  const inactiveOpacity = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  });

  const expandedContent = (
    <>
      {timeRange && (
        <View style={styles.timeContainer}>
          <Clock size={16} color={CustomColors.grayScale} />
          <Text style={styles.timeText}>{timeRange}</Text>
        </View>
      )}

      {activeDays && activeDays.length > 0 && (
        <View style={styles.daysContainer}>
          {activeDays.map((day, idx) => (
            <View key={idx} style={styles.dayPill}>
              <Text style={styles.dayPillText}>{day}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.leftContent}>
          <Animated.View
            style={[
              styles.badgeContainer,
              { backgroundColor: badgeBackgroundColor }
            ]}
          >
            <Animated.Text
              style={[
                styles.badgeText,
                { color: badgeTextColor }
              ]}
            >
              {isActive ? "ATIVO AGORA" : "DESATIVO"}
            </Animated.Text>
          </Animated.View>

          <Text style={styles.title}>{routine.description}</Text>
        </View>

        <Pressable onPress={onToggle}>
          <View style={styles.powerButtonContainer}>
            <Animated.View style={[styles.powerButton, styles.powerButtonInactive, { opacity: inactiveOpacity, position: 'absolute' }]}>
              <Power size={30} strokeWidth={ 3 } color={CustomColors.quartenary} />
            </Animated.View>

            <Animated.View style={[styles.powerButton, { opacity: activeAnim, position: 'absolute' }]}>
              <LinearGradient
                colors={[CustomColors.secondary, CustomColors.tertiary]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.powerButton}
              >
                <Power size={30} strokeWidth={ 3 } color={CustomColors.light} />
              </LinearGradient>
            </Animated.View>
          </View>
        </Pressable>
      </View>

      <View style={{ position: 'absolute', opacity: 0, zIndex: -1, width: '100%' }} pointerEvents="none">
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
      <Animated.View style={{ height: heightAnim, overflow: 'hidden', opacity: expandedAnim }}>
        <View style={styles.expandedContent}>
          {expandedContent}
        </View>
      </Animated.View>
    </Pressable>
  );
}
