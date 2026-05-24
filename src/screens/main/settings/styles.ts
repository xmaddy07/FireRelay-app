import {Platform, StyleSheet} from 'react-native';
import {fonts} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const TOOLBAR_BUTTON_SIZE = wp(10.5);

export const createStyles = (colors: AppColors) => {
  const cardShadow = Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {elevation: 4},
    default: {},
  });

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: wp(3),
    marginBottom: hp(2),
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
    color: colors.textMuted,
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
  notificationIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.primary,
  },
  sectionLabel: {
    fontSize: responsiveSize(11),
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 1.4,
    marginBottom: hp(1.2),
    marginTop: hp(2.5),
  },
  sectionLabelFirst: {
    marginTop: 0,
  },
  glassCard: {
    borderRadius: wp(5),
    overflow: 'hidden',
    ...cardShadow,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
  },
  iconBox: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(2.8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3.5),
    borderWidth: 1,
  },
  iconBoxAccent: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryBorder,
  },
  settingTextBlock: {
    flex: 1,
    marginRight: wp(2),
  },
  settingTitle: {
    fontSize: responsiveSize(16),
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  settingTitleFlex: {
    flex: 1,
  },
  settingSubtitle: {
    fontSize: responsiveSize(13),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: hp(0.3),
  },
  settingSubtitleActive: {
    color: colors.primary,
  },
  preferenceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.menuItemBorder,
    marginHorizontal: wp(4),
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.menuItemBorder,
    marginLeft: wp(4) + wp(11) + wp(3.5),
    marginRight: wp(4),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(4),
    paddingVertical: hp(2.2),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  logoutIconVector: {
    marginRight: wp(2.5),
  },
  subtitle: {
    fontSize: responsiveSize(15),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: hp(2),
    lineHeight: responsiveSize(22),
    paddingHorizontal: wp(4),
  },
  // Tab/Page Content styles
  contentContainer: {
    paddingHorizontal: wp(4),
    flex: 1,
    paddingBottom: hp(4),
  },
  logoutText: {
    color: colors.primary,
    fontSize: responsiveSize(16),
    fontFamily: fonts.semibold,
  },
  sectionTitle: {
    fontSize: responsiveSize(18),
    fontFamily: fonts.semibold,
    color: colors.text,
    marginBottom: hp(1),
    marginTop: hp(1),
  },
  sectionSubtitle: {
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: hp(3),
  },
  inputGap: {
    marginBottom: hp(1),
  },
  saveButton: {
    marginTop: hp(3),
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
  },
  infoColumn: {
    marginBottom: hp(2),
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: responsiveSize(13),
    fontFamily: fonts.medium,
    marginBottom: hp(0.5),
  },
  infoValue: {
    color: colors.text,
    fontSize: responsiveSize(15),
    fontFamily: fonts.medium,
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: responsiveSize(12),
    fontFamily: fonts.regular,
    marginTop: hp(0.5),
    marginBottom: hp(2),
  },
  requestButton: {
    // alignSelf: 'flex-end',
    // width: wp(60),
    marginTop: hp(1),
  },
  subscriptionIntro: {
    gap: hp(1),
    marginBottom: hp(2.2),
  },
  subscriptionHeroTitle: {
    fontSize: responsiveSize(22),
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: responsiveSize(-0.2),
  },
  subscriptionHeroDesc: {
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: responsiveSize(21),
    maxWidth: '92%',
  },
  subscriptionSummaryChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(0.6),
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(0.85),
    borderRadius: wp(5),
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  subscriptionSummaryDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: colors.live,
  },
  subscriptionSummaryText: {
    fontSize: responsiveSize(11),
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: responsiveSize(0.8),
    textTransform: 'uppercase',
  },
  subscriptionGlassCard: {
    borderRadius: wp(5),
    overflow: 'hidden',
    ...cardShadow,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2.1),
    paddingHorizontal: wp(4),
    gap: wp(3),
  },
  severityIconBox: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(2.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  subscriptionTextBlock: {
    flex: 1,
    minWidth: 0,
    marginRight: wp(1),
  },
  subscriptionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp(2),
    marginBottom: hp(0.45),
  },
  severityBadge: {
    paddingHorizontal: wp(2.2),
    paddingVertical: hp(0.35),
    borderRadius: wp(1.2),
    borderWidth: StyleSheet.hairlineWidth,
  },
  severityBadgeText: {
    fontSize: responsiveSize(10),
    fontFamily: fonts.bold,
    letterSpacing: responsiveSize(0.6),
    textTransform: 'uppercase',
  },
  subscriptionTitle: {
    color: colors.text,
    fontSize: responsiveSize(16),
    fontFamily: fonts.semibold,
    flexShrink: 1,
  },
  subscriptionDesc: {
    color: colors.textSecondary,
    fontSize: responsiveSize(13),
    fontFamily: fonts.regular,
    lineHeight: responsiveSize(19),
  },
  subscriptionStatus: {
    marginTop: hp(0.55),
    fontSize: responsiveSize(10),
    fontFamily: fonts.bold,
    color: colors.live,
    letterSpacing: responsiveSize(0.7),
    textTransform: 'uppercase',
  },
  subscriptionStatusOff: {
    color: colors.textMuted,
  },
  saveButtonRow: {
    marginTop: hp(3.2),
  },
  savePreferencesButton: {
    marginTop: 0,
    marginVertical: 0,
    width: '100%',
  },
  errorText: {
    marginTop: hp(1),
    color: '#F87171',
    fontSize: responsiveSize(13),
    fontFamily: fonts.regular,
  },
});
};
