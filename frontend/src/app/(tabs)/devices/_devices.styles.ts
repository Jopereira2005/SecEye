import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: CustomColors.light,
    fontSize: moderateScale(16),
    fontFamily: CustomFonts.inter,
  }
});

export default function StylesRoute() { return null; }

