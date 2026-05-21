import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
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
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: moderateScale(8),
  },
});
