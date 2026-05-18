import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: CustomColors.dark,
    fontFamily: CustomFonts.inter,
  },

  scrollView: {
    flex: 1,
  },

  scrollViewContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: 'rgba(10,18,35,0.95)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,180,255,0.2)',
    boxShadow: `0px 0px 20px ${CustomColors.tertiary}59`,
    elevation: 12,
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0E1B33',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: CustomColors.tertiary,
  },

  logoImage: {
    width: 58,
    height: 64,
    alignSelf: 'center',
    marginBottom: 10,
  },

  logoText: {
    color: CustomColors.tertiary,
    fontSize: 30,
    fontWeight: '700',
    fontFamily: CustomFonts.daysOne,
  },

  title: {
    color: CustomColors.light,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: CustomFonts.daysOne,
  },

  titleBlue: {
    color: CustomColors.tertiary,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: CustomFonts.daysOne,
  },

  subtitle: {
    color: CustomColors.grayScale,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    fontFamily: CustomFonts.inter,
  },

  switchContainer: {
    flexDirection: 'row',
    backgroundColor: CustomColors.quartenary,
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },

  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 24,
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

  label: {
    color: CustomColors.grayScale,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 10,
    fontFamily: CustomFonts.inter,
  },

  input: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: 14,
    color: CustomColors.light,
    borderWidth: 0,
    borderColor: 'transparent',
    fontFamily: CustomFonts.inter,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CustomColors.quartenary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    paddingRight: 8,
  },

  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  forgotPassword: {
    color: CustomColors.tertiary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
    fontFamily: CustomFonts.inter,
  },

  loginButton: {
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },

  loginButtonText: {
    color: CustomColors.light,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: CustomFonts.inter,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E2B42',
  },

  dividerText: {
    color: CustomColors.grayScale,
    marginHorizontal: 10,
    fontSize: 11,
    fontFamily: CustomFonts.inter,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  socialButton: {
    flex: 1,
    backgroundColor: CustomColors.quartenary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 4,
  },

  socialText: {
    color: CustomColors.light,
    fontWeight: '600',
    fontFamily: CustomFonts.inter,
  },
});

export default function StylesRoute() {
  return null;
}