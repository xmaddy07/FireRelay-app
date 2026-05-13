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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp(2),
  },
  chip: {
    backgroundColor: '#0f1324',
    borderRadius: wp(4),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginRight: wp(3),
    marginBottom: hp(1.2),
  },
  chipText: {
    color: '#e2e8f0',
    fontSize: responsiveSize(14),
  },
});
