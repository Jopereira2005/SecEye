import { StyleSheet, Dimensions } from 'react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl + Spacing.md, // Accounting for status bar
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: CustomFonts.inter,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: CustomColors.light,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CustomColors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    color: CustomColors.light,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CustomColors.light,
  },
  closeButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: width,
    height: width * (9/16), // 16:9 Aspect Ratio by default
  },
  fallbackContainer: {
    width: '100%',
    aspectRatio: 16/9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CustomColors.grayScaleDark,
  },
  fallbackText: {
    fontFamily: CustomFonts.inter,
    color: CustomColors.grayScale,
    marginTop: Spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  footerAction: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerActionText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.light,
  }
});
