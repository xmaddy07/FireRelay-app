import { StyleSheet } from 'react-native';
import { hp, wp, responsiveSize } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },
  statusCard: {
    backgroundColor: '#0c1224',
    borderRadius: wp(6),
    padding: wp(5),
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statusTitle: {
    fontSize: responsiveSize(28),
    fontWeight: '800',
    color: '#A8B9E8',
    marginBottom: hp(1.2),
  },
  statusSubtitle: {
    fontSize: responsiveSize(14),
    color: '#94a3b8',
    lineHeight: responsiveSize(20),
  },
  statusLive: {
    color: '#4cd89f',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  sectionTitle: {
    fontSize: responsiveSize(24),
    fontWeight: '800',
    color: '#f8fafc',
  },
  countBadge: {
    backgroundColor: '#111826',
    borderRadius: wp(6),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
  },
  countBadgeText: {
    color: '#cbd5e1',
    fontSize: responsiveSize(12),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionCaption: {
    color: '#7b8aa6',
    fontSize: responsiveSize(11),
    letterSpacing: 1.4,
    marginBottom: hp(2.4),
  },
  card: {
    backgroundColor: '#0b1424',
    borderRadius: wp(5),
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(4),
    backgroundColor: '#1d2537',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  cardIconImage: {
    width: wp(5),
    height: wp(5),
  },
  cardText: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  cardTitle: {
    fontSize: responsiveSize(18),
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: hp(0.5),
  },
  cardMeta: {
    fontSize: responsiveSize(12),
    color: '#94a3b8',
    letterSpacing: 0.7,
    marginTop: hp(0.4),
  },
  cardEnd: {
    alignItems: 'flex-end',
  },
  dotWrapper: {
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(999),
    backgroundColor: 'rgba(49, 212, 146, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },

  dot: {
    width: wp(2.2),
    height: wp(2.2),
    borderRadius: wp(999),
    backgroundColor: '#4cd89f',

    shadowColor: '#4cd89f',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  chevron: {
    fontSize: responsiveSize(18),
    color: '#94a3b8',
    lineHeight: responsiveSize(18),
  },
  featureCard: {
    marginTop: hp(2.5),
    borderRadius: wp(6),
    padding: wp(5),
    marginBottom: hp(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  featureTitle: {
    fontSize: responsiveSize(22),
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: hp(1),
  },
  featureSubtitle: {
    fontSize: responsiveSize(12),
    color: '#4cd89f',
    letterSpacing: 1.2,
  },
});
