import { StyleSheet } from "react-native";
import { CustomColors, CustomFonts, Spacing } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: moderateScale(100),
  },

  header: {
    marginBottom: Spacing.xl,
  },

  pageTitle: {
    fontSize: moderateScale(28),
    fontFamily: CustomFonts.inter,
    fontWeight: "bold",
    color: CustomColors.light,
    marginBottom: Spacing.sm,
    letterSpacing: moderateScale(1),
  },

  pageSubtitle: {
    fontSize: moderateScale(14),
    fontFamily: CustomFonts.inter,
    color: CustomColors.grayScale,
  },

  listContainer: {
    flex: 1,
  },

  floatingButtonContainer: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
  },

  createButton: {
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(24),
  },

  createButtonText: {
    color: CustomColors.light,
    fontFamily: CustomFonts.inter,
    fontWeight: "bold",
    fontSize: moderateScale(16),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CustomColors.dark,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: moderateScale(60),
  },

  emptyText: {
    fontSize: moderateScale(16),
    fontFamily: CustomFonts.inter,
    color: CustomColors.grayScale,
    textAlign: "center",
  },
});

export default function StylesRoute() {
  return null;
}
