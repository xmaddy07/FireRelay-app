import type {AppColors} from './types';
import type {ThemeMode} from './types';

const primaryRgb = '255, 84, 81';

export const createGlass = (colors: AppColors, mode: ThemeMode) => {
  const isDark = mode === 'dark';

  return {
    screenGradient: colors.screenGradient,
    cardUnreadTint: `rgba(${primaryRgb}, ${isDark ? '0.06' : '0.05'})`,
    cardReadTint: isDark
      ? 'rgba(16, 20, 26, 0.4)'
      : 'rgba(255, 255, 255, 0.92)',
    badgeTint: `rgba(${primaryRgb}, ${isDark ? '0.12' : '0.08'})`,
    iconTint: `rgba(${primaryRgb}, ${isDark ? '0.08' : '0.06'})`,
    settingsCardTint: `rgba(${primaryRgb}, ${isDark ? '0.05' : '0.04'})`,
    loginCardTint: isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(255, 255, 255, 0.94)',
    fallback: {
      loginCard: {
        backgroundColor: isDark
          ? 'rgba(20, 25, 32, 0.45)'
          : 'rgba(255, 255, 255, 0.96)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.18)'
          : colors.menuItemBorder,
      },
      cardUnread: {
        backgroundColor: isDark
          ? 'rgba(20, 25, 32, 0.92)'
          : 'rgba(255, 255, 255, 0.98)',
      },
      cardRead: {
        backgroundColor: isDark
          ? 'rgba(16, 20, 26, 0.88)'
          : 'rgba(250, 250, 248, 0.98)',
      },
      badge: {
        backgroundColor: `rgba(${primaryRgb}, ${isDark ? '0.15' : '0.1'})`,
      },
      icon: {
        backgroundColor: isDark
          ? 'rgba(20, 25, 32, 0.9)'
          : 'rgba(255, 255, 255, 0.98)',
      },
      iconRead: {
        backgroundColor: isDark
          ? 'rgba(16, 20, 26, 0.9)'
          : 'rgba(247, 246, 243, 0.98)',
      },
      settingsCard: {
        backgroundColor: isDark
          ? 'rgba(20, 25, 32, 0.78)'
          : 'rgba(255, 255, 255, 0.98)',
        borderWidth: 1,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : colors.menuItemBorder,
      },
      settingsIconBox: {
        backgroundColor: `rgba(${primaryRgb}, ${isDark ? '0.12' : '0.08'})`,
        borderColor: `rgba(${primaryRgb}, ${isDark ? '0.22' : '0.18'})`,
      },
      settingsIconBoxNeutral: {
        backgroundColor: isDark
          ? 'rgba(16, 20, 26, 0.85)'
          : colors.surfaceInset,
        borderColor: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : colors.menuItemBorder,
      },
    },
  } as const;
};
