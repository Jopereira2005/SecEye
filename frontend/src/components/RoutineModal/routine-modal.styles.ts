import { StyleSheet, Dimensions } from "react-native";
import { CustomColors, CustomFonts, Spacing, Shadows } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  keyboardAvoidingView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: CustomColors.dark,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
    maxHeight: height * 0.9,
    ...Shadows.card,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: CustomColors.light,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    marginBottom: Spacing.sm,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dayPill: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: moderateScale(20),
    backgroundColor: CustomColors.quartenary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayPillSelected: {
    backgroundColor: CustomColors.primary,
    borderColor: CustomColors.primary,
  },
  dayPillText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
  },
  dayPillTextSelected: {
    color: CustomColors.dark,
    fontWeight: 'bold',
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  timePickerContainer: {
    flex: 1,
  },
  timeButton: {
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(12),
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  timeButtonText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(16),
    color: CustomColors.light,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
