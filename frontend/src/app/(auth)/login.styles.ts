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


  logoImage: {
    width: moderateScale(64),
    height: moderateScale(64),
    alignSelf: 'center',
    marginBottom: moderateScale(10),
  },

  title: {
    color: CustomColors.light,
    fontSize: moderateScale(30),
    fontFamily: CustomFonts.daysOne,
    textAlign: 'center',
  },

  titleBlue: {
    color: CustomColors.tertiary,
    fontSize: moderateScale(30),
    fontFamily: CustomFonts.daysOne,
    textAlign: 'center',
  },

  subtitle: {
    color: CustomColors.grayScale,
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginTop: moderateScale(6),
    marginBottom: moderateScale(24),
    fontFamily: CustomFonts.inter,
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

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: moderateScale(24),
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: CustomColors.applyOpacity(CustomColors.grayScale, 0.3),
  },

  dividerText: {
    color: CustomColors.grayScale,
    marginHorizontal: moderateScale(10),
    fontSize: moderateScale(11),
    fontFamily: CustomFonts.inter,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  socialButton: {
    flex: 1,
    backgroundColor: CustomColors.quartenary,
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: moderateScale(4),
  },

  socialText: {
    color: CustomColors.light,
    fontWeight: '600',
    fontFamily: CustomFonts.inter,
  },

  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
});

export default function StylesRoute() {
  return null;
}