import {Platform, StyleSheet} from 'react-native';
import {fonts} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize, TAB_BAR_HEIGHT} from '../../../utils/responsive';

export {TAB_BAR_HEIGHT};
export const TOOLBAR_BUTTON_SIZE = wp(10.5);

const monoFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

export const createPremium = (colors: AppColors) => ({
  bg: colors.background,
  surface: colors.surface,
  surfaceRaised: colors.surfaceElevated,
  searchBg: colors.inputBackground,
  border: colors.menuItemBorder,
  borderStrong: colors.borderMuted,
  textMuted: colors.textMuted,
});

export const createStyles = (colors: AppColors) => {
  const premium = createPremium(colors);
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: premium.bg,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: wp(4),
      paddingTop: Platform.OS === 'ios' ? hp(0.5) : hp(1),
      gap: hp(1.4),
      flexGrow: 1,
    },
    listHeader: {
      paddingBottom: hp(1),
      gap: hp(1.4),
    },
    screenHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: wp(3),
    },
    screenHeaderLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: wp(3),
    },
    headerIconWrap: {
      width: wp(11),
      height: wp(11),
      borderRadius: wp(2.8),
      backgroundColor: colors.primaryTint,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    screenHeaderText: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.35),
    },
    screenTitle: {
      fontSize: responsiveSize(22),
      fontFamily: fonts.bold,
      color: colors.text,
      letterSpacing: responsiveSize(-0.2),
    },
    screenSubtitle: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.regular,
      color: premium.textMuted,
      lineHeight: responsiveSize(17),
    },
    headerNotificationButton: {
      width: TOOLBAR_BUTTON_SIZE,
      height: TOOLBAR_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      borderRadius: TOOLBAR_BUTTON_SIZE / 2,
      backgroundColor: colors.primaryTint,
      flexShrink: 0,
    },
    notificationIcon: {
      width: wp(5),
      height: wp(5),
      tintColor: colors.primary,
    },
    addSenderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp(1.5),
      backgroundColor: colors.primary,
      borderRadius: wp(2.5),
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(4),
      alignSelf: 'flex-start',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.35,
          shadowRadius: 8,
        },
        android: {elevation: 4},
      }),
    },
    addSenderButtonText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.semibold,
      color: colors.textOnPrimary,
    },
    statsScroll: {
      marginHorizontal: -wp(4),
    },
    statsScrollContent: {
      paddingHorizontal: wp(4),
      gap: wp(2.5),
    },
    statCard: {
      width: wp(38),
      backgroundColor: premium.surface,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: premium.border,
      paddingVertical: hp(1.4),
      paddingHorizontal: wp(3.2),
      gap: hp(0.6),
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {elevation: 2},
      }),
    },
    statCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    statIconWrap: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    statIconBlue: {
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
    },
    statIconGreen: {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
    },
    statIconOrange: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    statIconRed: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    statLabel: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.medium,
      color: premium.textMuted,
    },
    statValue: {
      fontSize: responsiveSize(24),
      fontFamily: fonts.bold,
      color: colors.text,
    },
    statSubLabel: {
      fontSize: responsiveSize(10),
      fontFamily: fonts.regular,
      color: premium.textMuted,
    },
    filtersSection: {
      gap: hp(1),
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      backgroundColor: premium.searchBg,
      borderRadius: wp(3.5),
      borderWidth: 1,
      borderColor: premium.borderStrong,
      paddingHorizontal: wp(3.5),
      minHeight: TOOLBAR_BUTTON_SIZE,
    },
    searchIcon: {
      flexShrink: 0,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      fontSize: responsiveSize(14),
      fontFamily: fonts.regular,
      color: colors.text,
      paddingVertical: Platform.OS === 'ios' ? hp(1.1) : hp(0.9),
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    statusChipsScroll: {
      flex: 1,
    },
    statusChipsContent: {
      gap: wp(2),
      paddingRight: wp(2),
    },
    statusChip: {
      paddingHorizontal: wp(3.2),
      paddingVertical: hp(0.7),
      borderRadius: wp(5),
      borderWidth: 1,
      borderColor: premium.borderStrong,
      backgroundColor: premium.surfaceRaised,
    },
    statusChipActive: {
      backgroundColor: colors.primaryTintStrong,
      borderColor: colors.primaryBorder,
    },
    statusChipText: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.medium,
      color: premium.textMuted,
    },
    statusChipTextActive: {
      color: colors.primary,
      fontFamily: fonts.semibold,
    },
    clearFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.5),
      alignSelf: 'flex-start',
      paddingVertical: hp(0.6),
      paddingHorizontal: wp(2.5),
    },
    clearFiltersText: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.medium,
      color: colors.primary,
    },
    senderCard: {
      backgroundColor: premium.surface,
      borderRadius: wp(3.5),
      borderWidth: 1,
      borderColor: premium.border,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        android: {elevation: 3},
      }),
    },
    senderCardBody: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(3.5),
      gap: hp(1.1),
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: wp(2),
    },
    senderName: {
      flex: 1,
      fontSize: responsiveSize(16),
      fontFamily: fonts.bold,
      color: colors.text,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.5),
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.35),
      borderRadius: wp(5),
      borderWidth: 1,
      flexShrink: 0,
    },
    statusBadgeActive: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.25)',
    },
    statusBadgeInactive: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    statusBadgeDisabled: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    statusBadgeDot: {
      width: wp(1.8),
      height: wp(1.8),
      borderRadius: wp(0.9),
    },
    statusBadgeDotActive: {
      backgroundColor: colors.success,
    },
    statusBadgeDotInactive: {
      backgroundColor: colors.warning,
    },
    statusBadgeDotDisabled: {
      backgroundColor: '#EF4444',
    },
    statusBadgeText: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.semibold,
    },
    statusBadgeTextActive: {
      color: colors.success,
    },
    statusBadgeTextInactive: {
      color: colors.warning,
    },
    statusBadgeTextDisabled: {
      color: '#EF4444',
    },
    metaRow: {
      flexDirection: 'row',
      gap: wp(3),
    },
    metaColumn: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.3),
    },
    metaLabel: {
      fontSize: responsiveSize(9),
      fontFamily: fonts.semibold,
      color: premium.textMuted,
      letterSpacing: responsiveSize(0.8),
      textTransform: 'uppercase',
    },
    metaValue: {
      fontSize: responsiveSize(13),
      fontFamily: fonts.medium,
      color: colors.text,
    },
    metaValueMono: {
      fontFamily: monoFont,
      fontSize: responsiveSize(12),
      letterSpacing: responsiveSize(0.2),
    },
    tokenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    copyButton: {
      width: wp(7.5),
      height: wp(7.5),
      borderRadius: wp(1.8),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: premium.surfaceRaised,
      borderWidth: 1,
      borderColor: premium.borderStrong,
      flexShrink: 0,
    },
    cardActionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
      paddingTop: hp(0.4),
    },
    cardActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.2),
      paddingHorizontal: wp(2.8),
      paddingVertical: hp(0.7),
      borderRadius: wp(2),
      borderWidth: 1,
      backgroundColor: premium.surfaceRaised,
    },
    cardActionRegenerate: {
      borderColor: 'rgba(245, 158, 11, 0.35)',
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
    },
    cardActionEdit: {
      borderColor: 'rgba(34, 197, 94, 0.35)',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
    },
    cardActionDelete: {
      borderColor: 'rgba(239, 68, 68, 0.35)',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    cardActionText: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.semibold,
    },
    cardActionTextRegenerate: {
      color: colors.warning,
    },
    cardActionTextEdit: {
      color: colors.success,
    },
    cardActionTextDelete: {
      color: '#EF4444',
    },
    loadMoreFooter: {
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    emptyState: {
      paddingVertical: hp(8),
      alignItems: 'center',
      paddingHorizontal: wp(6),
    },
    emptyStateText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.regular,
      color: premium.textMuted,
      textAlign: 'center',
    },
    listFooter: {
      width: '100%',
    },
  });
};
