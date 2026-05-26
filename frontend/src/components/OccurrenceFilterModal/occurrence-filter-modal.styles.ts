import { StyleSheet, Dimensions } from "react-native";
import { CustomColors, CustomFonts, Spacing, Shadows } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: CustomColors.dark,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingBottom: Spacing.xl,
    maxHeight: height * 0.9,
    ...Shadows.card,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
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
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: CustomColors.light,
  },
  clearText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    fontWeight: '600',
  },

  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: Spacing.sm,
  },

  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: moderateScale(20),
    backgroundColor: CustomColors.quartenary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  pillActive: {
    backgroundColor: CustomColors.applyOpacity(CustomColors.primary, 0.15),
    borderColor: CustomColors.primary,
  },
  pillText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    fontWeight: '500',
  },
  pillTextActive: {
    color: CustomColors.primary,
    fontWeight: 'bold',
  },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  }
});
