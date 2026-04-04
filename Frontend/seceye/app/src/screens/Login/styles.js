import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#111318',
  },

  scrollView: {
    flex: 1,
  },

  scrollViewContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: 'rgba(10,18,35,0.95)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,180,255,0.2)',
    shadowColor: '#00BFFF',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0E1B33',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#00BFFF',
  },

  logoImage: {
    width: 58,
    height: 64,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },

  logoText: {
    color: '#00D4FF',
    fontSize: 30,
    fontWeight: '700',
  },

  title: {
    color: '#F3FFFB',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },

  titleBlue: {
    color: '#00D4FF',
  },

  titleBlue: {
    color: '#48D7F9',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#7D8A9A',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },

  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#2B2E3A',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },

  switchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 24,
  },

  activeButton: {
    backgroundColor: '#282A2E',
  },

  activeText: {
    color: '#B2C5FF',
    fontWeight: '700',
  },

  inactiveText: {
    color: '#A5ADAB',
    fontWeight: '600',
  },

  label: {
    color: '#A5ADAB',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: 14,
    color: '#FFFFFF',
    borderWidth: 0,
    borderColor: 'transparent',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2E3A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    paddingRight: 8,
  },

  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  forgotPassword: {
    color: '#48D7F9',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
  },

  loginButton: {
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },

  loginButtonText: {
    color: '#F3FFFB',
    fontSize: 16,
    fontWeight: '700',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E2B42',
  },

  dividerText: {
    color: '#6D7A8B',
    marginHorizontal: 10,
    fontSize: 11,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  socialButton: {
    flex: 1,
    backgroundColor: '#2B2E3A',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 4,
  },

  socialText: {
    color: '#F3FFFB',
    fontWeight: '600',
  },
});