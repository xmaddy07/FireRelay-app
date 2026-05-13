import {StyleSheet} from 'react-native';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    backgroundColor: '#0f1324',
    borderRadius: wp(5),
    padding: wp(5),
    marginBottom: hp(2),
  },
  cardTitle: {
    fontSize: responsiveSize(18),
    fontWeight: '700',
    color: '#fff',
    marginBottom: hp(0.5),
  },
  cardText: {
    fontSize: responsiveSize(14),
    color: '#cbd5e1',
  },
});
