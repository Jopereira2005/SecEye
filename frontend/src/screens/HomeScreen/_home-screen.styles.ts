import { StyleSheet } from 'react-native';
import { CustomColors, Spacing, Shadows, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },

  avatar: {
    width: moderateScale(75),
    height: moderateScale(75),
    borderRadius: moderateScale(37.5),
    marginRight: Spacing.md,
    backgroundColor: CustomColors.quartenary,
  },

  profileTextContainer: {
    flex: 1,
  },

  greetingText: {
    fontSize: moderateScale(30),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: Spacing.xs,
    fontFamily: CustomFonts.inter,
  },

  nameText: {
    color: CustomColors.primary,
    fontWeight: 'bold',
    fontFamily: CustomFonts.inter,
  },

  statusText: {
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    lineHeight: moderateScale(20),
    fontFamily: CustomFonts.inter,
  },

  mainCard: {
    borderRadius: moderateScale(24),
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.primaryButton,
  },

  shieldIconContainer: {
    marginBottom: Spacing.md,
  },

  mainCardTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: Spacing.md,
    fontFamily: CustomFonts.inter,
    letterSpacing: 1,
  },

  badge: {
    backgroundColor: CustomColors.applyOpacity(CustomColors.primary, 0.6),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: moderateScale(16),
  },

  badgeText: {
    color: CustomColors.light,
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: CustomFonts.inter,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  statCard: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(20),
    padding: Spacing.lg,
    ...Shadows.card,
  },

  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },

  statLabelSmall: {
    color: CustomColors.tertiary,
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: CustomFonts.inter,
  },

  statTextContainer: {
    gap: Spacing.sm,
    justifyContent: 'center',
  },

  statCount: {
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: CustomColors.light,
    fontFamily: CustomFonts.inter,
  },

  statRoutine: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: CustomColors.light,
    fontFamily: CustomFonts.inter,
  },

  statSubtitle: {
    fontSize: moderateScale(10),
    color: CustomColors.grayScale,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: CustomFonts.inter,
  },

  recentActivitySection: {
    marginTop: Spacing.sm,
  },

  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: Spacing.md,
    fontFamily: CustomFonts.inter,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CustomColors.dark,
    borderColor: CustomColors.applyOpacity(CustomColors.quartenary, 0.2),
    borderWidth: 1,
    borderRadius: moderateScale(16),
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },

  activityIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    backgroundColor: CustomColors.grayScaleDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityTextContainer: {
    flex: 1,
  },

  activityTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: Spacing.xs,
    fontFamily: CustomFonts.inter,
  },

  activitySubtitle: {
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: CustomFonts.inter,
  }
});

export default function StylesRoute() {
  return null;
}