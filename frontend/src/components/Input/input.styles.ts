import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
  },
  label: {
    color: CustomColors.grayScale,
    fontSize: moderateScale(12),
    marginBottom: moderateScale(8),
    fontFamily: CustomFonts.inter,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CustomColors.quartenary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputWrapperFocused: {
    borderColor: CustomColors.primary,
  },
  inputWrapperError: {
    borderColor: CustomColors.tertiary,
  },
  iconContainer: {
    marginRight: moderateScale(8),
  },
  input: {
    flex: 1,
    color: CustomColors.light,
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    paddingVertical: 0, // Text input padding handled by wrapper usually
    minHeight: moderateScale(28), // Ensures password and text inputs have identical heights
  },
  eyeButton: {
    padding: moderateScale(4),
    marginLeft: moderateScale(8),
  },
  errorText: {
    color: CustomColors.tertiary,
    fontSize: moderateScale(10),
    marginTop: moderateScale(4),
    fontFamily: CustomFonts.inter,
  }
});
