import { StyleSheet } from 'react-native';
import { CustomColors, Spacing, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: CustomColors.dark,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoImage: {
    width: moderateScale(24),
    height: moderateScale(24),
    marginRight: Spacing.sm,
  },

  logoText: {
    color: CustomColors.light,
    fontSize: moderateScale(30),
    fontFamily: CustomFonts.daysOne,
  },

  logoHighlight: {
    color: CustomColors.tertiary,
  },

  notificationButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: CustomColors.quartenary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
