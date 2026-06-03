import { StyleSheet } from 'react-native';
import { CustomColors, Spacing, CustomFonts, Shadows } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: CustomColors.dark,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoImage: {
    width: moderateScale(30),
    height: moderateScale(30),
    marginRight: Spacing.sm,
  },

  logoText: {
    color: CustomColors.light,
    fontSize: moderateScale(30),
    fontFamily: CustomFonts.daysOne,
  },

  logoHighlight: {
    color: CustomColors.tertiary,
  },

  notificationButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: CustomColors.quartenary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CustomColors.danger,
    zIndex: 2,
  },

  dropdownContainer: {
    position: 'absolute',
    top: moderateScale(70),
    right: Spacing.lg,
    width: moderateScale(300),
    maxHeight: moderateScale(400),
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(16),
    padding: Spacing.md,
    zIndex: 1000,
    ...Shadows.card,
  },

  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  dropdownTitle: {
    color: CustomColors.light,
    fontSize: 16,
    fontFamily: CustomFonts.inter,
  },

  markAllReadText: {
    color: CustomColors.primary,
    fontSize: 12,
    fontFamily: CustomFonts.inter,
  },

  notificationItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CustomColors.grayScaleDark,
    marginBottom: Spacing.sm,
  },

  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  notificationTitle: {
    color: CustomColors.light,
    fontSize: 14,
    fontFamily: CustomFonts.inter,
    flex: 1,
  },

  notificationTime: {
    color: CustomColors.grayScale,
    fontSize: 10,
    fontFamily: CustomFonts.inter,
    marginLeft: 8,
  },

  notificationMessage: {
    color: CustomColors.grayScaleLight,
    fontSize: 12,
    fontFamily: CustomFonts.inter,
  },

  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CustomColors.primary,
    marginTop: 4,
    marginRight: 8,
  },

  emptyText: {
    color: CustomColors.grayScale,
    fontSize: 14,
    fontFamily: CustomFonts.inter,
    textAlign: 'center',
    marginTop: Spacing.md,
  }
});
