import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
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

  switchContainer: {
    flexDirection: 'row',
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(24),
    padding: moderateScale(4),
    marginBottom: moderateScale(24),
  },

  switchButton: {
    flex: 1,
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    borderRadius: moderateScale(24),
  },

  activeButton: {
    backgroundColor: CustomColors.grayScaleDark,
  },

  activeText: {
    color: CustomColors.primary,
    fontWeight: '700',
    fontFamily: CustomFonts.inter,
  },

  inactiveText: {
    color: CustomColors.grayScale,
    fontWeight: '600',
    fontFamily: CustomFonts.inter,
  },

  forgotPassword: {
    color: CustomColors.tertiary,
    fontSize: moderateScale(12),
    textAlign: 'right',
    marginTop: moderateScale(10),
    fontFamily: CustomFonts.inter,
  },

  loginButton: {
    marginTop: moderateScale(24),
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

