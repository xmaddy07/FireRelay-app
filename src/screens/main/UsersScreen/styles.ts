import {StyleSheet} from 'react-native';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080e',
  },
  content: {
  },
  title: {
    fontSize: responsiveSize(34),
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: responsiveSize(15),
    color: '#9ca3af',
    marginBottom: hp(3),
    lineHeight: responsiveSize(22),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1324',
    borderRadius: wp(5),
    padding: wp(4),
    marginBottom: hp(2),
  },
  badge: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: '#151b2c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(4),
  },
  badgeText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: responsiveSize(16),
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    fontSize: responsiveSize(16),
    color: '#fff',
    fontWeight: '700',
    marginBottom: hp(0.4),
  },
  itemRole: {
    fontSize: responsiveSize(13),
    color: '#94a3b8',
  },
});
