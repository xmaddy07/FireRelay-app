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
      paddingTop: hp(0.6),
      gap: hp(1.6),
      flexGrow: 1,
    },
    listHeader: {
      paddingHorizontal: wp(4),
      paddingTop: Platform.OS === 'ios' ? hp(0.5) : hp(1),
      paddingBottom: hp(1.4),
      gap: hp(1.6),
    },
    screenHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: wp(3),
    },
    screenHeaderText: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.4),
    },
    screenTitle: {
      fontSize: responsiveSize(26),
      fontFamily: fonts.bold,
      color: colors.text,
      letterSpacing: responsiveSize(-0.3),
    },
    screenSubtitle: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.semibold,
      color: premium.textMuted,
      letterSpacing: responsiveSize(1.2),
      textTransform: 'uppercase',
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
    addButtonWrap: {
      width: TOOLBAR_BUTTON_SIZE,
      height: TOOLBAR_BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    addButtonRing: {
      ...StyleSheet.absoluteFill,
      borderRadius: TOOLBAR_BUTTON_SIZE / 2,
      backgroundColor: colors.primaryTint,
    },
    addButton: {
      width: TOOLBAR_BUTTON_SIZE,
      height: TOOLBAR_BUTTON_SIZE,
      borderRadius: TOOLBAR_BUTTON_SIZE / 2,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.45,
          shadowRadius: 8,
        },
        android: {elevation: 6},
      }),
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2.5),
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      backgroundColor: premium.searchBg,
      borderRadius: wp(3.5),
      borderWidth: 1,
      borderColor: premium.borderStrong,
      paddingLeft: wp(3.5),
      paddingRight: wp(1.2),
      minHeight: TOOLBAR_BUTTON_SIZE,
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
      paddingRight: 0,
    },
    filterButton: {
      width: wp(9),
      height: wp(9),
      borderRadius: wp(2.2),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: premium.surfaceRaised,
      borderWidth: 1,
      borderColor: premium.borderStrong,
      flexShrink: 0,
    },
    filterButtonActive: {
      backgroundColor: colors.primaryTintStrong,
      borderColor: colors.primaryBorder,
    },
    filterIcon: {
      width: wp(5.3),
      height: wp(5.3),
      tintColor: premium.textMuted,
    },
    filterIconActive: {
      tintColor: colors.primary,
    },
    notificationIcon: {
      width: wp(5),
      height: wp(5),
      tintColor: colors.primary,
    },
    keywordCard: {
      flexDirection: 'row',
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
    keywordCardCritical: {
      borderColor: colors.primaryBorder,
    },
    criticalAccent: {
      width: wp(1),
      backgroundColor: colors.primary,
      flexShrink: 0,
    },
    keywordCardBody: {
      flex: 1,
      minWidth: 0,
      paddingVertical: hp(1.6),
      paddingHorizontal: wp(3.5),
      gap: hp(1),
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: wp(2),
    },
    keywordName: {
      flex: 1,
      fontSize: responsiveSize(16),
      fontFamily: fonts.semibold,
      color: colors.accent,
      letterSpacing: responsiveSize(0.1),
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.2),
      flexShrink: 0,
    },
    actionButton: {
      width: wp(9.2),
      height: wp(9.2),
      borderRadius: wp(2.4),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: premium.surfaceRaised,
      borderWidth: 1,
      borderColor: premium.borderStrong,
    },
    actionButtonDanger: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.8),
    },
    statusDot: {
      width: wp(2),
      height: wp(2),
      borderRadius: wp(1),
    },
    statusDotActive: {
      backgroundColor: colors.live,
    },
    statusDotInactive: {
      backgroundColor: premium.textMuted,
    },
    statusText: {
      fontSize: responsiveSize(10),
      fontFamily: fonts.bold,
      letterSpacing: responsiveSize(0.8),
    },
    statusTextActive: {
      color: colors.live,
    },
    statusTextInactive: {
      color: premium.textMuted,
    },
    statusDivider: {
      width: 1,
      height: hp(1.2),
      backgroundColor: premium.borderStrong,
    },
    severityBadge: {
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.25),
      borderRadius: wp(1.5),
      borderWidth: 1,
    },
    severityBadgeHigh: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.35)',
    },
    severityBadgeMedium: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
    },
    severityBadgeLow: {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      borderColor: 'rgba(34, 197, 94, 0.35)',
    },
    severityBadgeDefault: {
      backgroundColor: premium.surfaceRaised,
      borderColor: premium.borderStrong,
    },
    severityText: {
      fontSize: responsiveSize(9),
      fontFamily: fonts.bold,
      letterSpacing: responsiveSize(0.6),
    },
    severityTextHigh: {
      color: '#EF4444',
    },
    severityTextMedium: {
      color: '#D97706',
    },
    severityTextLow: {
      color: '#16A34A',
    },
    severityTextDefault: {
      color: premium.textMuted,
    },
    metaRow: {
      flexDirection: 'row',
      gap: wp(4),
    },
    metaColumn: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.35),
    },
    metaLabel: {
      fontSize: responsiveSize(9),
      fontFamily: fonts.semibold,
      color: premium.textMuted,
      letterSpacing: responsiveSize(0.9),
      textTransform: 'uppercase',

    },
    metaValue: {
      fontSize: responsiveSize(13),
      fontFamily: fonts.medium,
      color: colors.text,
      textTransform: 'capitalize',
    },
    metaValueCritical: {
      color: colors.primary,
      fontFamily: fonts.bold,
      textTransform: 'uppercase',
      letterSpacing: responsiveSize(0.4),
    },
    metaValueMono: {
      fontFamily: monoFont,
      fontSize: responsiveSize(12),
      letterSpacing: responsiveSize(0.2),
      textTransform: 'none',
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
    loadMoreFooter: {
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    totalCountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(0.6),
      paddingHorizontal: wp(1),
    },
    totalCountLabel: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.semibold,
      color: premium.textMuted,
      letterSpacing: responsiveSize(0.8),
      textTransform: 'uppercase',
    },
    totalCountValue: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.bold,
      color: colors.text,
    },
    paginationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: wp(2),
      paddingTop: hp(1.2),
      paddingBottom: hp(0.4),
    },
    paginationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.2),
      paddingVertical: hp(1),
      paddingHorizontal: wp(3.5),
      borderRadius: wp(2.5),
      backgroundColor: premium.surface,
      borderWidth: 1,
      borderColor: premium.borderStrong,
    },
    paginationButtonDisabled: {
      opacity: 0.45,
    },
    paginationButtonText: {
      fontSize: responsiveSize(13),
      fontFamily: fonts.semibold,
      color: colors.text,
    },
    paginationButtonTextDisabled: {
      color: premium.textMuted,
    },
    paginationInfo: {
      flex: 1,
      alignItems: 'center',
      minWidth: 0,
    },
    paginationInfoText: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.medium,
      color: premium.textMuted,
      textAlign: 'center',
    },
    paginationInfoPage: {
      fontFamily: fonts.bold,
      color: colors.text,
    },
  });
};
