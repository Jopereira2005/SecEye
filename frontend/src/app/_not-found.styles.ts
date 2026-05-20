import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
    backgroundColor: CustomColors.dark,
    alignItems: 'center',
  },
  errorCode: {
    color: CustomColors.primary,
    fontSize: moderateScale(60),
    fontFamily: CustomFonts.daysOne,
    marginTop: moderateScale(20),
  },
  title: {
    color: CustomColors.light,
    fontSize: moderateScale(24),
    fontFamily: CustomFonts.daysOne,
    textAlign: 'center',
    marginBottom: moderateScale(10),
    marginTop: moderateScale(10),
  },
  subtitle: {
    color: CustomColors.grayScale,
    fontSize: moderateScale(14),
    fontFamily: CustomFonts.inter,
    textAlign: 'center',
    marginBottom: moderateScale(40),
  },
  buttonContainer: {
    width: '100%',
    borderRadius: moderateScale(24),
    paddingVertical: moderateScale(20),
    alignItems: 'center',
  },
});

export default function StylesRoute() { return null; }

