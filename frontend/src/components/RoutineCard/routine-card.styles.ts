import { StyleSheet } from "react-native";
import { CustomColors, CustomFonts, Spacing, Shadows } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(24),
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: "column",
    overflow: "hidden",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftContent: {
    flex: 1,
    marginRight: Spacing.sm,
    justifyContent: "center",
  },

  expandedContent: {
    paddingTop: Spacing.md,
  },

  badgeContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: moderateScale(12),
    marginBottom: Spacing.sm,
  },

  badgeText: {
    fontSize: moderateScale(10),
    fontFamily: CustomFonts.inter,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  badgeTextActive: {
    color: CustomColors.primary,
  },

  badgeTextInactive: {
    color: CustomColors.grayScale,
  },

  title: {
    color: CustomColors.light,
    fontSize: moderateScale(18),
    fontFamily: CustomFonts.inter,
    fontWeight: "bold",
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  timeText: {
    color: CustomColors.grayScale,
    fontSize: moderateScale(14),
    fontFamily: CustomFonts.inter,
    marginLeft: Spacing.xs,
  },

  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },

  dayPill: {
    backgroundColor: CustomColors.applyOpacity(CustomColors.tertiary, 0.2),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: moderateScale(12),
  },

  dayPillText: {
    color: CustomColors.tertiary,
    fontSize: moderateScale(12),
    fontFamily: CustomFonts.inter,
    fontWeight: "700",
  },

  powerButtonContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    position: 'relative',
  },

  powerButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
  },

  powerButtonInactive: {
    backgroundColor: CustomColors.applyOpacity(CustomColors.primary, 0.4),
    ...Shadows.card,
  },
});
