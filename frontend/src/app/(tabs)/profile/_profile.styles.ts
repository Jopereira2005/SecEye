import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111318',
  },

  scrollContent: {
    paddingTop: 90,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 32,
  },

  /* Avatar Section */

  avatarSection: {
    alignItems: 'center',
  },

  avatarContainer: {
    width: 125,
    height: 125,
    position: 'relative',
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  editAvatarButton: {
    position: 'absolute',
    right: -12,
    bottom: -12,

    width: 40,
    height: 40,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',
  },

  userNameContainer: {
    paddingTop: 20,
  },

  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B3C7FF',
  },

  /* Form */

  formSection: {
    gap: 40,
  },

  inputsContainer: {
    gap: 18,
  },

  inputWrapper: {
    gap: 10,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#A5ADAB',
  },

  inputBackground: {
    backgroundColor: '#282A2E',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  input: {
    fontSize: 16,
    color: '#F3FFFB',
  },

  /* Buttons */

  buttonsContainer: {
    gap: 15,
  },

  dangerButton: {
    height: 56,
    borderRadius: 14,

    backgroundColor: 'rgba(51, 53, 57, 0.5)',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },

  saveButton: {
    height: 60,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#0052CC',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.7,
    shadowRadius: 20,

    elevation: 10,
  },

  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F3FFFB',
  },
});