import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: CustomColors.dark,
    fontFamily: CustomFonts.inter,
  },

  scrollView: {
    flex: 1,
  },

  scrollViewContent: {
    paddingTop: moderateScale(60),
    paddingBottom: moderateScale(40),
  },

  forgotPassword: {
    color: CustomColors.tertiary,
    fontSize: moderateScale(12),
    textAlign: 'right',
    fontFamily: CustomFonts.inter,
  },

  loginButton: {
    marginTop: Spacing.lg,
    borderRadius: moderateScale(24),
    paddingVertical: moderateScale(20),
    alignItems: 'center',
  },

  loginButtonText: {
    color: CustomColors.light,
    fontSize: moderateScale(16),
    fontWeight: '700',
    fontFamily: CustomFonts.inter,
  },
});

export default function StylesRoute() { return null; }

