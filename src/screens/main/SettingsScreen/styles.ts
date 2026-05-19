import { StyleSheet } from 'react-native';
import { colors } from '../../../constants';
import { hp, wp, responsiveSize } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subtitle: {
    fontSize: responsiveSize(15),
    color: colors.textSecondary,
    marginBottom: hp(2),
    lineHeight: responsiveSize(22),
    paddingHorizontal: wp(4),
  },
  // Menu styles
  menuList: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    fontSize: responsiveSize(17),
    color: colors.text,
    fontWeight: '600',
  },
  // Tab/Page Content styles
  contentContainer: {
    paddingHorizontal: wp(4),
    flex: 1,
    paddingBottom: hp(4),
  },
  logoutButton: {
    marginTop: hp(2),
    marginBottom: hp(4),
    paddingVertical: hp(2),
    marginHorizontal: wp(4),
    borderRadius: wp(2),
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(3),
    marginTop: hp(2),
    marginBottom: hp(4),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoutIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: colors.primary,
    marginRight: wp(4),
  },
  logoutText: {
    color: colors.primary,
    fontSize: responsiveSize(16),
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: responsiveSize(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: hp(1),
    marginTop: hp(1),
  },
  sectionSubtitle: {
    fontSize: responsiveSize(14),
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
    marginBottom: hp(0.5),
  },
  infoValue: {
    color: colors.text,
    fontSize: responsiveSize(15),
    fontWeight: '500',
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: responsiveSize(12),
    marginTop: hp(0.5),
    marginBottom: hp(2),
  },
  requestButton: {
    // alignSelf: 'flex-end',
    // width: wp(60),
    marginTop: hp(1),
  },
  subscriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    padding: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  subscriptionContent: {
    flex: 1,
    marginRight: wp(4),
  },
  subscriptionTitle: {
    color: colors.text,
    fontSize: responsiveSize(16),
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  subscriptionDesc: {
    color: colors.textSecondary,
    fontSize: responsiveSize(13),
    lineHeight: responsiveSize(18),
  },
});
