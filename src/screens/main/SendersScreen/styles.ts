import {StyleSheet} from 'react-native';
import {colors} from '../../../constants';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
  },
  title: {
    fontSize: responsiveSize(34),
    fontWeight: '800',
    color: colors.text,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: responsiveSize(15),
    color: colors.textSecondary,
    marginBottom: hp(3),
    lineHeight: responsiveSize(22),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: wp(5),
    padding: wp(5),
    marginBottom: hp(2),
  },
  cardTitle: {
    fontSize: responsiveSize(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: hp(0.5),
  },
  cardText: {
    fontSize: responsiveSize(14),
    color: '#cbd5e1',
  },
});
