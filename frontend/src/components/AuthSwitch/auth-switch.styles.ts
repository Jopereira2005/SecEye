import { StyleSheet } from "react-native";
import { CustomColors, CustomFonts, Spacing } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(24),
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    width: "100%",
  },

  innerContainer: {
    flexDirection: "row",
    position: "relative",
    width: "100%",
  },

  slider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: CustomColors.grayScaleDark,
    borderRadius: moderateScale(24),
  },

  button: {
    flex: 1,
    paddingVertical: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  activeText: {
    color: CustomColors.primary,
    fontFamily: CustomFonts.inter,
    fontWeight: "bold",
  },

  inactiveText: {
    color: CustomColors.grayScale,
    fontFamily: CustomFonts.inter,
  },
});
