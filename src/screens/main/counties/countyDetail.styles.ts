import {Platform, StyleSheet} from 'react-native';
import {fonts} from '../../../config/constants';
import {lightColors} from '../../../config/theme/colors';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize, TAB_BAR_HEIGHT} from '../../../utils/responsive';

export const createStyles = (colors: AppColors) => {
  const isLight = colors.background === lightColors.background;

  return StyleSheet.create({
    gradient: {
      flex: 1,
    },
    screen: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(4),
      paddingBottom: TAB_BAR_HEIGHT + hp(2.5),
      gap: hp(1.6),
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingBottom: hp(1),
      gap: wp(2.5),
    },
    backButton: {
      width: wp(10.5),
      height: wp(10.5),
      borderRadius: wp(3.2),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isLight ? colors.surface : colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {elevation: 2},
      }),
    },
    topBarTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    topBarTitle: {
      fontSize: responsiveSize(20),
      fontFamily: fonts.bold,
      color: colors.text,
      letterSpacing: responsiveSize(-0.2),
    },
    topBarSubtitle: {
      marginTop: hp(0.15),
      fontSize: responsiveSize(12),
      fontFamily: fonts.medium,
      color: colors.textMuted,
      letterSpacing: responsiveSize(0.3),
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: wp(4.5),
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.8),
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 6},
          shadowOpacity: isLight ? 0.08 : 0.22,
          shadowRadius: 16,
        },
        android: {elevation: 3},
      }),
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: wp(3),
    },
    shield: {
      width: wp(14),
      height: wp(14),
      borderRadius: wp(3.5),
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shieldText: {
      fontSize: responsiveSize(16),
      fontFamily: fonts.bold,
      letterSpacing: responsiveSize(0.4),
    },
    heroMain: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.45),
    },
    heroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    heroName: {
      flex: 1,
      fontSize: responsiveSize(18),
      fontFamily: fonts.bold,
      color: colors.text,
      letterSpacing: responsiveSize(-0.15),
    },
    statusDot: {
      width: wp(2.6),
      height: wp(2.6),
      borderRadius: wp(999),
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
    statusDotOnline: {
      backgroundColor: colors.live,
    },
    statusDotOffline: {
      backgroundColor: colors.primary,
    },
    heroLocation: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.medium,
      color: colors.textMuted,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      borderRadius: wp(999),
      paddingHorizontal: wp(2.6),
      paddingVertical: hp(0.35),
      borderWidth: 1,
      marginTop: hp(0.2),
    },
    statusBadgeLive: {
      backgroundColor: isLight ? 'rgba(5, 150, 105, 0.1)' : 'rgba(16, 185, 129, 0.14)',
      borderColor: isLight ? 'rgba(5, 150, 105, 0.28)' : 'rgba(52, 211, 153, 0.4)',
    },
    statusBadgeActive: {
      backgroundColor: isLight ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.14)',
      borderColor: isLight ? 'rgba(217, 119, 6, 0.28)' : 'rgba(251, 191, 36, 0.38)',
    },
    statusBadgeOffline: {
      backgroundColor: colors.surfaceInset,
      borderColor: colors.menuItemBorder,
    },
    statusBadgeText: {
      fontSize: responsiveSize(10),
      fontFamily: fonts.semibold,
      letterSpacing: responsiveSize(0.25),
    },
    statusBadgeTextLive: {
      color: colors.live,
    },
    statusBadgeTextActive: {
      color: colors.warning,
    },
    statusBadgeTextOffline: {
      color: colors.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      gap: wp(2.5),
      marginTop: hp(1.4),
      paddingTop: hp(1.2),
      borderTopWidth: 1,
      borderTopColor: colors.menuItemBorder,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceInset,
      borderRadius: wp(3),
      paddingVertical: hp(1),
      paddingHorizontal: wp(2.8),
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
      gap: hp(0.25),
    },
    statLabel: {
      fontSize: responsiveSize(9.5),
      fontFamily: fonts.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: responsiveSize(0.45),
    },
    statValue: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.bold,
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(0.5),
      marginTop: hp(0.4),
    },
    sectionTitle: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.bold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: responsiveSize(0.55),
    },
    sectionCountPill: {
      minWidth: wp(7),
      paddingHorizontal: wp(2.2),
      paddingVertical: hp(0.25),
      borderRadius: wp(999),
      backgroundColor: colors.primaryTint,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      alignItems: 'center',
    },
    sectionCountText: {
      fontSize: responsiveSize(10),
      fontFamily: fonts.bold,
      color: colors.primary,
    },
    usersCard: {
      backgroundColor: colors.surface,
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: isLight ? 0.06 : 0.18,
          shadowRadius: 12,
        },
        android: {elevation: 2},
      }),
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
      paddingHorizontal: wp(3.5),
      paddingVertical: hp(1.35),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.menuItemBorder,
    },
    userRowLast: {
      borderBottomWidth: 0,
    },
    avatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(3),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    avatarText: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.bold,
      letterSpacing: responsiveSize(0.2),
    },
    userTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.15),
    },
    userEmail: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.semibold,
      color: colors.text,
    },
    userMeta: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.regular,
      color: colors.textMuted,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
      paddingHorizontal: wp(5),
      paddingVertical: hp(3),
      alignItems: 'center',
      gap: hp(1),
    },
    emptyIconWrap: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      backgroundColor: colors.surfaceInset,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
    },
    emptyTitle: {
      fontSize: responsiveSize(15),
      fontFamily: fonts.bold,
      color: colors.text,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.regular,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: responsiveSize(18),
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: wp(8),
      gap: hp(1.2),
    },
    errorText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.medium,
      color: colors.primary,
      textAlign: 'center',
    },
    skeletonHero: {
      height: hp(16),
      borderRadius: wp(4.5),
      backgroundColor: colors.surfaceInset,
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
    },
    skeletonUsers: {
      height: hp(22),
      borderRadius: wp(4),
      backgroundColor: colors.surfaceInset,
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
    },
  });
};
