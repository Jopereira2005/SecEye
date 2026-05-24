import { Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const CustomColors = {
  primary: '#b3c7ff',
  secondary: '#0052cc',
  tertiary: '#48d7f9',
  quartenary: '#2b2e3a',
  dark: '#111318',
  light: '#f3fffb',
  grayScale: '#a5adab',
  grayScaleLight: '#e6e6e6',
  grayScaleDark: '#282a2e',
  danger: '#ff5252',
  alert: '#ffab00',
  success: '#00c853',
  applyOpacity: (hexColor: string, opacity: number) => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${hexColor}${alpha}`;
  },
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    ...CustomColors,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    ...CustomColors,
  },
};

export const CustomFonts = {
  inter: 'Inter',
  daysOne: 'Days One',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
};

export const Shadows = {
  card: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
  },
  primaryButton: {
    boxShadow: `0px 4px 12px ${CustomColors.applyOpacity(CustomColors.primary, 0.25)}`,
  },
};