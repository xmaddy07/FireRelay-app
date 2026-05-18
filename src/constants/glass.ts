export const glass = {
  screenGradient: ['#05070A', '#0B1220', '#1A0F08'] as const,
  cardUnreadTint: 'rgba(239, 68, 68, 0.06)',
  cardReadTint: 'rgba(15, 23, 42, 0.4)',
  badgeTint: 'rgba(239, 68, 68, 0.12)',
  iconTint: 'rgba(56, 189, 248, 0.08)',
  fallback: {
    cardUnread: {
      backgroundColor: 'rgba(14, 24, 38, 0.92)',
    },
    cardRead: {
      backgroundColor: 'rgba(9, 14, 24, 0.88)',
    },
    badge: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    icon: {
      backgroundColor: 'rgba(29, 44, 69, 0.9)',
    },
    iconRead: {
      backgroundColor: 'rgba(19, 28, 44, 0.9)',
    },
  },
} as const;
