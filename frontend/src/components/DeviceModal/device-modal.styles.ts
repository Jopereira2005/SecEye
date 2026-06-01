import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  keyboardAvoidingView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
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
  modalContainer: {
    backgroundColor: CustomColors.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: Spacing.sm,
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
  formContainer: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    marginTop: Spacing.sm,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  severityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: CustomColors.quartenary,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  severityText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CustomColors.quartenary,
  },
  saveButton: {
    flex: 1,
  },
  saveButtonText: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: CustomColors.light,
  },
  deleteButton: {
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.md,
  },
});
