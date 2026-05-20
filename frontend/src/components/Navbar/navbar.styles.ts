import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: CustomColors.quartenary,
    paddingTop: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: CustomColors.grayScaleDark,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    marginBottom: moderateScale(4),
  },
  label: {
    fontSize: moderateScale(8),
    fontWeight: '600',
    fontFamily: CustomFonts.inter,
  }
});
