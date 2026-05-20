export type ThemeMode = 'light' | 'dark';

export type AppColors = {
  background: string;
  primary: string;
  primaryDark: string;
  surface: string;
  surfaceElevated: string;
  inputBackground: string;
  inputBorder: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textOnSecondary: string;
  border: string;
  borderMuted: string;
  borderSubtle: string;
  caption: string;
  success: string;
  warning: string;
  secure: string;
  white: string;
  black: string;
  shadow: string;
  buttonGradient: readonly [string, string];
  screenGradient: readonly [string, string, string];
  menuItemBorder: string;
  iconTint: string;
};

export type GlassTheme = ReturnType<typeof import('./createGlass').createGlass>;
