import { StyleSheet } from 'react-native';
import { CustomColors, Spacing, CustomFonts } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
  },

  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },

  /* Avatar Section */

  avatarSection: {
    alignItems: 'center',
  },

  avatarContainer: {
    width: 125,
    height: 125,
    position: 'relative',
    borderRadius: 62.5,
    borderWidth: 2,
    borderColor: CustomColors.primary,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 62.5,
  },

  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CustomColors.quartenary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CustomColors.dark,
  },

  userNameContainer: {
    paddingTop: Spacing.md,
  },

  userName: {
    fontFamily: CustomFonts.inter,
    fontWeight: '800',
    fontSize: moderateScale(28),
    color: CustomColors.light,
  },

  /* Form */

  formSection: {
    gap: Spacing.xl,
  },

  /* Buttons */

  buttonsContainer: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },

  dangerButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: CustomColors.applyOpacity(CustomColors.danger, 0.1),
    borderWidth: 1,
    borderColor: CustomColors.applyOpacity(CustomColors.danger, 0.2),
  },

  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.danger,
  },

  saveButton: {
    height: 56,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.dark,
  },
});

export default function StylesRoute() { return null; }