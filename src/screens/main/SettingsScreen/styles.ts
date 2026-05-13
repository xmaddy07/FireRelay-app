import {StyleSheet} from 'react-native';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080e',
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
  option: {
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    backgroundColor: '#0f1324',
    marginBottom: hp(1.2),
  },
  optionText: {
    fontSize: responsiveSize(16),
    color: '#e2e8f0',
  },
  logout: {
    color: '#f97316',
  },
});
