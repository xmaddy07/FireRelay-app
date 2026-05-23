import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from '@react-navigation/native';
import type {AppColors} from './types';

export const createNavigationTheme = (
  colors: AppColors,
  isDark: boolean,
): Theme => {
  const base = isDark ? DarkTheme : DefaultTheme;

  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };
};
