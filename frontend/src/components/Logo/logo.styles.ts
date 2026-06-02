import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: moderateScale(24),
  },
  logoImage: {
    width: moderateScale(64),
    height: moderateScale(64),
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
    fontFamily: CustomFonts.inter,
  },
});
