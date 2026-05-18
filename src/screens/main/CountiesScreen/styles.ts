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
  // Top Counties Horizontal Scroll Section Styles
  countiesHorizontalContainer: {
    marginBottom: hp(3),
    marginTop: hp(1),
  },
  horizontalScrollContent: {
    paddingLeft: wp(0.5),
    paddingRight: wp(4),
    paddingVertical: hp(0.5),
  },
  horizontalCard: {
    width: wp(38),
    height: hp(14),
    backgroundColor: '#0b1424',
    borderRadius: wp(4),
    padding: wp(3.5),
    marginRight: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  horizontalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horizontalCardIconWrapper: {
    width: wp(8.5),
    height: wp(8.5),
    borderRadius: wp(2.5),
    backgroundColor: '#1d2537',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalCardIconImage: {
    width: wp(4),
    height: wp(4),
    tintColor: '#a8b9e8',
  },
  horizontalCardContent: {
    marginTop: 'auto',
  },
  horizontalCardTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: hp(0.2),
  },
  horizontalCardMeta: {
    fontSize: responsiveSize(11),
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  // Feed Section Header Styles
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
    marginTop: hp(1),
  },
  feedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(999),
    backgroundColor: '#ef4444',
    marginRight: wp(2.2),
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  feedTitle: {
    fontSize: responsiveSize(20),
    fontWeight: '800',
    color: '#f8fafc',
  },
  feedSubtitle: {
    fontSize: responsiveSize(11),
    color: '#38bdf8',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  // Filtering chips styles
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: hp(2.5),
    paddingVertical: hp(0.2),
  },
  chip: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4.5),
    borderRadius: wp(999),
    backgroundColor: '#111827',
    marginRight: wp(2.2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: {
    backgroundColor: '#2F5597',
    borderColor: 'rgba(47, 85, 151, 0.4)',
  },
  chipText: {
    fontSize: responsiveSize(11),
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  // Feed Item Card Styles
  feedItemCard: {
    backgroundColor: '#0b1424',
    borderRadius: wp(4.5),
    padding: wp(4),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  feedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.2),
  },
  feedItemBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedBadge: {
    borderRadius: wp(3),
    paddingVertical: hp(0.4),
    paddingHorizontal: wp(2.2),
    marginRight: wp(2.2),
  },
  feedBadgeText: {
    fontSize: responsiveSize(9.5),
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  feedBadgeFire: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  feedBadgeFireText: {
    color: '#ef4444',
  },
  feedBadgeMedical: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  feedBadgeMedicalText: {
    color: '#3b82f6',
  },
  feedBadgePolice: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  feedBadgePoliceText: {
    color: '#f59e0b',
  },
  feedBadgeGeneral: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
  },
  feedBadgeGeneralText: {
    color: '#9ca3af',
  },
  feedCountyText: {
    fontSize: responsiveSize(11.5),
    color: '#38bdf8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  feedTimeText: {
    fontSize: responsiveSize(11.5),
    color: '#64748b',
    fontWeight: '500',
  },
  feedTalkgroupText: {
    fontSize: responsiveSize(14.5),
    fontWeight: '800',
    color: '#a8b9e8',
    marginBottom: hp(0.6),
  },
  feedSnippetText: {
    fontSize: responsiveSize(13),
    color: '#cbd5e1',
    lineHeight: responsiveSize(18),
  },
  feedItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(1.2),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  feedStarButton: {
    padding: wp(1),
  },
  feedStarIcon: {
    fontSize: responsiveSize(16),
  },
  feedStarIconActive: {
    color: '#fbbf24',
  },
  feedStarIconInactive: {
    color: '#475569',
  },
  feedMetaText: {
    fontSize: responsiveSize(10.5),
    color: '#475569',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
