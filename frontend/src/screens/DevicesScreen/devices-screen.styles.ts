import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  pageTitle: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(28),
    color: CustomColors.light,
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: CustomColors.quartenary,
  },
  tabButtonActive: {
    borderBottomColor: CustomColors.primary,
  },
  tabText: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
  },
  tabTextActive: {
    color: CustomColors.primary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl * 2,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: CustomColors.light,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: CustomColors.grayScale,
    fontSize: moderateScale(14),
    fontFamily: CustomFonts.inter,
    textAlign: 'center',
    lineHeight: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  createButton: {
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(24),
  },
  createButtonText: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    color: CustomColors.light,
    fontSize: moderateScale(16),
  },
});

export default function StylesRoute() { return null; }

