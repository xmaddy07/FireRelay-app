import { StyleSheet } from 'react-native';
import { hp, wp, responsiveSize } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080e',
  },
  subtitle: {
    fontSize: responsiveSize(15),
    color: '#9ca3af',
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
    backgroundColor: '#0f1324',
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    fontSize: responsiveSize(17),
    color: '#fff',
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
  logoutText: {
    color: '#f97316',
    fontSize: responsiveSize(16),
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: responsiveSize(18),
    fontWeight: '700',
    color: '#fff',
    marginBottom: hp(1),
    marginTop: hp(1),
  },
  sectionSubtitle: {
    fontSize: responsiveSize(14),
    color: '#94a3b8',
    marginBottom: hp(3),
  },
  inputGap: {
    marginBottom: hp(1),
  },
  saveButton: {
    marginTop: hp(3),
  },
  infoCard: {
    backgroundColor: '#0f1324',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
  },
  infoColumn: {
    marginBottom: hp(2),
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: responsiveSize(13),
    marginBottom: hp(0.5),
  },
  infoValue: {
    color: '#fff',
    fontSize: responsiveSize(15),
    fontWeight: '500',
  },
  subtext: {
    color: '#94a3b8',
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
    backgroundColor: '#0f1324',
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
    color: '#fff',
    fontSize: responsiveSize(16),
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  subscriptionDesc: {
    color: '#94a3b8',
    fontSize: responsiveSize(13),
    lineHeight: responsiveSize(18),
  },
});
