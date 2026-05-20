import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View, ViewStyle, StyleSheet, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomColors } from '@/constants/theme';
import { styles } from './button.styles';

export interface ButtonProps extends TouchableOpacityProps {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  width?: number | string;
  height?: number | string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  containerStyle?: ViewStyle;
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

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.buttonBase,
        styles[size],
        !isGradient && styles[variant],
        isGradient && styles.gradient,
        isDisabled && styles.disabled,
        customDimensions,
        containerStyle,
        style,
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
    </TouchableOpacity>
  );
};

