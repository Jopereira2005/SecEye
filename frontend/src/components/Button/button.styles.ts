import { StyleSheet } from 'react-native';
import { CustomColors, Spacing, Shadows } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBase: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Tamanhos (Sizes)
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: moderateScale(12),
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: moderateScale(16),
  },
  large: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderRadius: moderateScale(24),
  },
  // Variantes (Variants)
  primary: {
    backgroundColor: CustomColors.primary,
    ...Shadows.primaryButton,
  },
  secondary: {
    backgroundColor: CustomColors.quartenary,
    ...Shadows.card,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: CustomColors.primary,
  },
  gradient: {
    backgroundColor: 'transparent',
    ...Shadows.primaryButton,
  },
  // Estados
  disabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  contentHidden: {
    opacity: 0,
  }
});
