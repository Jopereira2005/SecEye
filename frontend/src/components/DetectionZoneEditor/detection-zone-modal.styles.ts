import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: CustomColors.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl, // Espaço extra pra baixo
    maxHeight: '90%',
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    marginTop: -Spacing.md,
  },
  dragIndicator: {
    width: moderateScale(40),
    height: moderateScale(4),
    backgroundColor: CustomColors.grayScale,
    borderRadius: moderateScale(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: CustomColors.light,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  instruction: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  editorWrapper: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginTop: 'auto',
  },
  confirmButton: {
    width: '100%',
    height: 56,
  },
  confirmButtonText: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: CustomColors.light,
  }
});
