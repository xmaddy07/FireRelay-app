import {StyleSheet, Platform} from 'react-native';
import {fonts} from '../../../constants';
import type { AppColors } from "../../../theme/types";
import {
  hp,
  wp,
  responsiveSize,
  TAB_BAR_HEIGHT,
} from '../../../utils/responsive';

export {TAB_BAR_HEIGHT};
export const ADD_BUTTON_SIZE = wp(12.3);

export const createPremium = (colors: AppColors) => ({
  bg: colors.background,
  surface: colors.surface,
  surfaceRaised: colors.surfaceElevated,
  searchBg: colors.inputBackground,
  accent: colors.primary,
  accentSoft: 'rgba(255, 77, 77, 0.18)',
  border: colors.menuItemBorder,
  borderStrong: colors.borderMuted,
  textMuted: colors.textMuted,
  adminBadge: '#6B2222',
  userBadge: '#107C41',
  dispatcherBadge: '#5C4A1F',
});

export const createStyles = (colors: AppColors) => {
  const premium = createPremium(colors);
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premium.bg,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? hp(0.5) : hp(1),
    paddingBottom: hp(1.8),
    paddingHorizontal: wp(4),
    minHeight: hp(6.5),
  },
  premiumHeaderTitle: {
    fontSize: responsiveSize(20),
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: responsiveSize(0.2),
  },
  premiumHeaderBell: {
    position: 'absolute',
    right: wp(2),
    width: wp(11),
    height: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    marginBottom: hp(1.8),
    gap: wp(2.5),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premium.searchBg,
    borderRadius: wp(8),
    borderWidth: 1,
    borderColor: premium.border,
    paddingHorizontal: wp(4),
    minHeight: ADD_BUTTON_SIZE,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {elevation: 2},
    }),
  },
  searchIcon: {
    marginRight: wp(2.5),
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? hp(1.2) : hp(0.9),
  },
  roleChipsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: wp(4),
    marginBottom: hp(2.2),
    gap: wp(2),
  },
  roleChip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: premium.borderStrong,
    backgroundColor: premium.surfaceRaised,
  },
  roleChipActive: {
    backgroundColor: premium.accent,
    borderColor: premium.accent,
    ...Platform.select({
      ios: {
        shadowColor: premium.accent,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {elevation: 4},
    }),
  },
  roleChipText: {
    fontSize: responsiveSize(12),
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: responsiveSize(0.2),
    textAlign: 'center',
  },
  roleChipTextActive: {
    color: colors.textOnPrimary,
    fontFamily: fonts.semibold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp(4),
    gap: hp(1.6),
    flexGrow: 1,
  },
  listFooter: {
    width: '100%',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: premium.surface,
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: premium.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: {elevation: 3},
    }),
  },
  userCardBody: {
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
  emailRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    minWidth: 0,
  },
  emailTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.2),
    flexShrink: 0,
  },
  actionButton: {
    width: wp(9.6),
    height: wp(9.6),
    borderRadius: wp(2.7),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.28)',
  },
  actionButtonDisabled: {
    opacity: 0.35,
  },
  emailText: {
    fontSize: responsiveSize(14),
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: responsiveSize(0.1),
  },
  youBadge: {
    backgroundColor: premium.accentSoft,
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.35)',
    paddingHorizontal: wp(1.8),
    paddingVertical: hp(0.25),
    flexShrink: 0,
  },
  youBadgeText: {
    fontSize: responsiveSize(9),
    fontFamily: fonts.bold,
    color: premium.accent,
    letterSpacing: responsiveSize(0.8),
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: wp(4),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
  },
  roleBadgeAdmin: {
    backgroundColor: premium.adminBadge,
  },
  roleBadgeUser: {
    backgroundColor: premium.userBadge,
  },
  roleBadgeDispatcher: {
    backgroundColor: premium.dispatcherBadge,
  },
  roleBadgeText: {
    fontSize: responsiveSize(10),
    fontFamily: fonts.semibold,
    letterSpacing: responsiveSize(0.6),
    color: colors.white,
  },
  roleBadgeTextAdmin: {
    color: colors.white,
  },
  roleBadgeTextUser: {
    color: colors.white,
  },
  roleBadgeTextDispatcher: {
    color: colors.white,
  },
  userCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.8),
    flex: 1,
  },
  createdText: {
    flex: 1,
    fontSize: responsiveSize(12),
    color: premium.textMuted,
    fontFamily: fonts.medium,
  },
  addButtonWrap: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyState: {
    paddingVertical: hp(8),
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
    color: premium.textMuted,
  },
  addButtonRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: ADD_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
  },
  addButton: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    backgroundColor: premium.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: premium.accent,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: {elevation: 6},
    }),
  },
  });
};
