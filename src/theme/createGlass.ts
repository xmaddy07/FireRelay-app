import type {AppColors} from './types';
import type {ThemeMode} from './types';

const primaryRgb = '255, 84, 81';

export const createGlass = (colors: AppColors, mode: ThemeMode) => {
  const isDark = mode === 'dark';

  return {
    screenGradient: colors.screenGradient,
    cardUnreadTint: `rgba(${primaryRgb}, 0.06)`,
    cardReadTint: isDark ? 'rgba(16, 20, 26, 0.4)' : 'rgba(255, 255, 255, 0.65)',
    badgeTint: `rgba(${primaryRgb}, 0.12)`,
    iconTint: `rgba(${primaryRgb}, 0.08)`,
    settingsCardTint: `rgba(${primaryRgb}, 0.05)`,
    loginCardTint: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
    fallback: {
      loginCard: {
        backgroundColor: isDark ? 'rgba(20, 25, 32, 0.45)' : 'rgba(255, 255, 255, 0.75)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.08)',
      },
      cardUnread: {
        backgroundColor: isDark ? 'rgba(20, 25, 32, 0.92)' : 'rgba(255, 255, 255, 0.95)',
      },
      cardRead: {
        backgroundColor: isDark ? 'rgba(16, 20, 26, 0.88)' : 'rgba(249, 250, 251, 0.95)',
      },
      badge: {
        backgroundColor: `rgba(${primaryRgb}, 0.15)`,
      },
      icon: {
        backgroundColor: isDark ? 'rgba(20, 25, 32, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      },
      iconRead: {
        backgroundColor: isDark ? 'rgba(16, 20, 26, 0.9)' : 'rgba(243, 244, 246, 0.95)',
      },
      settingsCard: {
        backgroundColor: isDark ? 'rgba(20, 25, 32, 0.78)' : 'rgba(255, 255, 255, 0.94)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      },
      settingsIconBox: {
        backgroundColor: `rgba(${primaryRgb}, 0.12)`,
        borderColor: `rgba(${primaryRgb}, 0.22)`,
      },
      settingsIconBoxNeutral: {
        backgroundColor: isDark ? 'rgba(16, 20, 26, 0.85)' : 'rgba(243, 244, 246, 0.95)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      },
    },
  } as const;
};
