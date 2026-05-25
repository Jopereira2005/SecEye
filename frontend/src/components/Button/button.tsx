import React from 'react';
import { Pressable, PressableProps, ActivityIndicator, View, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CustomColors } from '@/constants/theme';
import { styles } from './button.styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  width?: number | string;
  height?: number | string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'danger' | 'success' | 'ghost' | 'glass';
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Button({
  loading = false,
  size = 'medium',
  width,
  height,
  paddingVertical,
  paddingHorizontal,
  borderRadius,
  variant = 'primary',
  gradientColors = [CustomColors.secondary, CustomColors.tertiary],
  gradientStart = { x: 1, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  containerStyle,
  children,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const isGradient = variant === 'gradient';
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      )}
      <View style={[styles.gradientBase, loading && styles.contentHidden]}>
        {children}
      </View>
    </>
  );

  const customDimensions: any = {};
  if (width !== undefined) customDimensions.width = width;
  if (height !== undefined) customDimensions.height = height;
  if (paddingVertical !== undefined) customDimensions.paddingVertical = paddingVertical;
  if (paddingHorizontal !== undefined) customDimensions.paddingHorizontal = paddingHorizontal;
  if (borderRadius !== undefined) customDimensions.borderRadius = borderRadius;

  // Determine final border radius for the gradient background
  const finalBorderRadius = borderRadius !== undefined 
    ? borderRadius 
    : (styles[size] as ViewStyle).borderRadius;

  // Animation for scale on press
  const scale = useSharedValue(1);

  const handlePressIn = (e: any) => {
    scale.value = withTiming(0.95, { duration: 100 });
    if (rest.onPressIn) rest.onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withTiming(1, { duration: 150 });
    if (rest.onPressOut) rest.onPressOut(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.buttonBase,
        styles[size],
        !isGradient && styles[variant],
        isGradient && styles.gradient,
        isDisabled && styles.disabled,
        customDimensions,
        containerStyle,
        style,
        animatedStyle,
      ]}
      {...rest}
    >
      {isGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          style={[StyleSheet.absoluteFill, { borderRadius: finalBorderRadius }]}
        />
      ) : null}
      {content}
    </AnimatedPressable>
  );
}

