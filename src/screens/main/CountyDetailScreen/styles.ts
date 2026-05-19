import { StyleSheet } from 'react-native';
import { hp, wp, responsiveSize } from '../../../utils/responsive';
import { colors, fonts } from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    backgroundColor: '#050709',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  backIconImage: {
    width: wp(6),
    height: wp(6),
    tintColor: '#cbd5e1',
  },
  topTitle: {
    textAlign: 'center',
    fontSize: responsiveSize(18),
    fontFamily: fonts.semibold,
    color: '#f8fafc',
    paddingLeft: wp(3),
  },
  topRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  filterHeaderButton: {
    width: wp(10),
    height: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterHeaderIcon: {
    fontSize: responsiveSize(18),
    color: '#94a3b8',
    fontWeight: '700',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(3),
  },
  liveDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#73CF9F',
  },
  liveBadgeText: {
    fontSize: responsiveSize(10),
    fontWeight: '700',
    color: '#73CF9F',
    letterSpacing: 0.5,
  },
  filterIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: '#cbd5e1',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(4),
    backgroundColor: '#05070a',
  },
  breadcrumbHomeIcon: {
    width: wp(4),
    height: wp(4),
    tintColor: '#94a3b8',
    marginRight: wp(1.5),
  },
  breadcrumbSeparator: {
    fontSize: responsiveSize(14),
    color: '#475569',
    marginHorizontal: wp(1),
  },
  breadcrumbText: {
    fontSize: responsiveSize(12),
    color: '#94a3b8',
  },
  breadcrumbActive: {
    fontSize: responsiveSize(12),
    color: '#cbd5e1',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  statsContainer: {
    marginBottom: hp(2.5),
  },
  statCard: {
    backgroundColor: '#0b1426',
    borderRadius: wp(5),
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.2),
  },
  statLabel: {
    fontSize: responsiveSize(11),
    color: '#7b8aa6',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  statIconImage: {
    width: wp(6),
    height: wp(6),
    resizeMode: 'contain',
    alignSelf: 'flex-end'
  },
  statValue: {
    fontSize: responsiveSize(36),
    fontWeight: '800',
    color: '#D09D97',
  },
  statValueGreen: {
    fontSize: responsiveSize(32),
    fontWeight: '800',
    color: '#73CF9F',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(2.5),
    marginBottom: hp(2),
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    backgroundColor: colors.primary,
    borderRadius: wp(3),
    paddingVertical: hp(1.6),
  },
  resumeButtonIcon: {
    fontSize: responsiveSize(14),
    color: '#ffffff',
    fontWeight: '700',
  },
  resumeButtonText: {
    fontSize: responsiveSize(12),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  favoritesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: wp(3),
    paddingVertical: hp(1.6),
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  favoritesButtonIcon: {
    fontSize: responsiveSize(14),
    color: '#cbd5e1',
    fontWeight: '700',
  },
  favoritesButtonText: {
    fontSize: responsiveSize(12),
    fontWeight: '700',
    color: '#cbd5e1',
    letterSpacing: 0.5,
  },
  recordsInfo: {
    marginBottom: hp(2),
  },
  recordsText: {
    fontSize: responsiveSize(12),
    color: '#94a3b8',
  },
  recordsBold: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  resetLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: hp(1),
    backgroundColor: '#07090f',
  },
  headerText: {
    fontSize: responsiveSize(10),
    color: '#7b8aa6',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    backgroundColor: '#0b1424',
    marginBottom: hp(0.5),
    borderRadius: wp(3),
  },
  starColumn: {
    width: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    fontSize: responsiveSize(16),
    color: '#cbd5e1',
  },
  timestampColumn: {
    width: wp(22),
    paddingLeft: wp(2),
  },
  talkgroupColumn: {
    flex: 1,
    paddingHorizontal: wp(2),
  },
  snippetColumn: {
    flex: 1,
    paddingHorizontal: wp(2),
  },
  cellText: {
    fontSize: responsiveSize(12),
    color: '#f8fafc',
    fontWeight: '600',
  },
  cellTime: {
    fontSize: responsiveSize(10),
    color: '#94a3b8',
    marginTop: hp(0.3),
  },
  cellMeta: {
    fontSize: responsiveSize(10),
    color: '#7b8aa6',
    marginTop: hp(0.3),
  },
});
