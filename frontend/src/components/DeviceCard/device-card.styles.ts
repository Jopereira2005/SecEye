import { StyleSheet } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: CustomColors.quartenary,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardInactive: {
    borderColor: 'rgba(255, 255, 255, 0.03)',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  previewContainer: {
    marginBottom: 12,
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: CustomColors.dark,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  titleTextContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  deviceName: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    color: CustomColors.light,
    marginBottom: 2,
  },
  deviceDescription: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
  },
  toggleButton: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '50%',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  infoBadgeText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(11),
    color: CustomColors.grayScale,
    fontWeight: 'bold',
  },
});
