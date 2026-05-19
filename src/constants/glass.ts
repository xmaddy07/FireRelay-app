import {colors} from './colors';

const primaryRgb = '255, 84, 81';

export const glass = {
  screenGradient: colors.screenGradient,
  cardUnreadTint: `rgba(${primaryRgb}, 0.06)`,
  cardReadTint: 'rgba(16, 20, 26, 0.4)',
  badgeTint: `rgba(${primaryRgb}, 0.12)`,
  iconTint: `rgba(${primaryRgb}, 0.08)`,
  loginCardTint: 'rgba(255, 255, 255, 0.08)',
  fallback: {
    loginCard: {
      backgroundColor: 'rgba(20, 25, 32, 0.45)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    cardUnread: {
      backgroundColor: 'rgba(20, 25, 32, 0.92)',
    },
    cardRead: {
      backgroundColor: 'rgba(16, 20, 26, 0.88)',
    },
    badge: {
      backgroundColor: `rgba(${primaryRgb}, 0.15)`,
    },
    icon: {
      backgroundColor: 'rgba(20, 25, 32, 0.9)',
    },
    iconRead: {
      backgroundColor: 'rgba(16, 20, 26, 0.9)',
    },
  },
} as const;
